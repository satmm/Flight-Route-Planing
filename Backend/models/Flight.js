// backend/models/Airport.js
const mongoose = require('mongoose');

const airportSchema = new mongoose.Schema({
    country_code: String,
    region_name: String,
    iata: String,
    icao: String,
    airport: String,
    latitude: String,
    longitude: String
});

const Airport = mongoose.model('Airport', airportSchema);

module.exports = Airport;
