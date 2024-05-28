const express = require('express');
const axios = require('axios');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = ['http://localhost:3000', 'https://airbus-challenge-fronted.vercel.app'];

app.use(cors({
  origin: ['http://localhost:3000', 'https://airbus-challenge-fronted.vercel.app'], // List allowed origins
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow specific HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow specific headers
}));


// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected...'))
    .catch(err => console.log(err));
    
app.use(express.json());

const API_KEY = process.env.API_KEY;

const encodeBase64 = (username, password = '') => {
    return Buffer.from(`${username}:${password}`).toString('base64');
};

const axiosInstance = axios.create({
    headers: {
        Authorization: `Basic ${encodeBase64(API_KEY)}`,
    },
});

const MAX_RETRIES = 5;
const RETRY_DELAY = 1000; // Initial delay of 1 second

const fetchWithRetry = async (url, retries = 0) => {
    try {
        return await axiosInstance.get(url);
    } catch (error) {
        if (error.response && error.response.status === 429 && retries < MAX_RETRIES) {
            const delay = RETRY_DELAY * Math.pow(2, retries);
            console.log(`Rate limit exceeded, retrying in ${delay} ms...`);
            await new Promise((resolve) => setTimeout(resolve, delay));
            return fetchWithRetry(url, retries + 1);
        }
        throw error;
    }
};

app.get('/api/fuel-data', async (req, res) => {
    console.log('Request received at /api/fuel-data with query:', req.query);
    const { aircraft, distance } = req.query;
    const url = `https://despouy.ca/flight-fuel-api/q/?aircraft=${aircraft}&distance=${distance}`;
    try {
        const response = await axiosInstance.get(url);
        console.log('Response from external API:', response.data);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching fuel data:', error);
        res.status(500).json({ error: 'Failed to fetch fuel data' });
    }
});

app.get('/api/flightplans', async (req, res) => {
    console.log('Request received at /api/flightplans with query:', req.query);
    const { fromICAO, toICAO } = req.query;
    try {
        const response = await fetchWithRetry(
            `https://api.flightplandatabase.com/search/plans?fromICAO=${fromICAO}&toICAO=${toICAO}`
        );
        console.log('Response from external API:', response.data);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching flight plans:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to fetch flight plans. Please try again later.' });
    }
});

app.get('/api/flightplan/:id', async (req, res) => {
    console.log('Request received at /api/flightplan/:id with param:', req.params.id);
    const { id } = req.params;
    try {
        const response = await fetchWithRetry(`https://api.flightplandatabase.com/plan/${id}`);
        console.log('Response from external API:', response.data);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching flight details:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to fetch flight details. Please try again later.' });
    }
});

app.get('/', (req, res) => {
    console.log('Root route accessed.');
    res.send("Server is running.");
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
