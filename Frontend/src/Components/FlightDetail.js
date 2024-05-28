import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import airplane from "../assets/airplane.png";
import airport from "../assets/airport.png";
import aeroplane from "../assets/airplane1.png";
import './FlightDetail.css';
import FuelData from './FuelData';

// Define kelvinToCelsius function
const kelvinToCelsius = (kelvin) => {
  return kelvin - 273.15; // Conversion formula from Kelvin to Celsius
};

const FlightDetail = () => {
  const { id } = useParams();
  const [flight, setFlight] = useState(null);
  const [weatherData, setWeatherData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state
  const [currentPosition, setCurrentPosition] = useState(null);
  const [routeWeight, setRouteWeight] = useState(null);

  const requestRef = useRef();
  const API_BASE_URL = 'https://api.flightplandatabase.com';





  useEffect(() => {
    const fetchFlightDetails = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/plan/${id}`);
        const flightData = response.data;

        const weatherPromises = flightData.route.nodes.map(node =>
          axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${node.lat}&lon=${node.lon}&appid=4c9c36bb42745e8c0226baf21bf2a583`)
        );

        const weatherResponses = await Promise.all(weatherPromises);
        const weatherData = weatherResponses.map(res => res.data);

        setFlight(flightData);
        setWeatherData(weatherData);
        setLoading(false); // Set loading to false after data is fetched
      } catch (error) {
        if (error.response && error.response.status === 404) {
          setError('Flight details not found. Please check the ID and try again.');
        } else {
          setError('Error fetching flight details: ' + error.message);
        }
        console.error('Error fetching flight details:', error);
        setLoading(false); // Set loading to false on error
      }
    };

    fetchFlightDetails();
  }, [id]);




  const interpolatePosition = (start, end, factor) => {
    return {
      lat: start[0] + (end[0] - start[0]) * factor,
      lon: start[1] + (end[1] - start[1]) * factor,
    };
  };

  const animateFlight = () => {
    if (!flight) return;

    const pathCoordinates = flight.route.nodes.map(node => [node.lat, node.lon]);
    const totalSteps = 1000; // Total number of steps for the animation
    let currentStep = 0;

    const animate = () => {
      if (currentStep >= totalSteps * (pathCoordinates.length - 1)) {
        cancelAnimationFrame(requestRef.current);
        return;
      }

      const segmentIndex = Math.floor(currentStep / totalSteps);
      const start = pathCoordinates[segmentIndex];
      const end = pathCoordinates[segmentIndex + 1];
      const segmentStep = currentStep % totalSteps;
      const factor = segmentStep / totalSteps;

      setCurrentPosition(interpolatePosition(start, end, factor));

      currentStep += 1;
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (flight) {
      setCurrentPosition({ lat: flight.route.nodes[0].lat, lon: flight.route.nodes[0].lon });
      animateFlight();
    }

    return () => cancelAnimationFrame(requestRef.current);
  }, [flight]);

  const getWeatherWeight = (weather) => {
    switch (weather) {
      case 'clear sky':
        return 1;
      case 'few clouds':
        return 2;
      case 'scattered clouds':
        return 3;
      case 'broken clouds':
        return 4;
      case 'shower rain':
        return 5;
      case 'rain':
        return 6;
      case 'thunderstorm':
        return 7;
      case 'snow':
        return 8;
      case 'mist':
        return 9;
      default:
        return 10;
    }
  };

  const calculateRouteWeight = (flight, weatherData) => {
    const totalWeatherWeight = flight.route.nodes.reduce((totalWeight, node, index) => {
      const weather = weatherData[index]?.weather[0]?.description;
      const visibility = weatherData[index]?.visibility;
      const windSpeed = weatherData[index]?.wind?.speed;

      // Get weather weight based on description
      let weatherWeight = getWeatherWeight(weather);

      // Adjust weight based on visibility
      if (visibility < 5000) {
        weatherWeight += 2; // Increase weight if visibility is less than 5000 meters
      }

      // Adjust weight based on wind speed
      if (windSpeed > 10) {
        weatherWeight += 3; // Increase weight if wind speed is greater than 10 m/s
      }

      return totalWeight + weatherWeight;
    }, 0);

    // Normalize total weight to fall within range of 10
    const normalizedWeight = Math.min(10, totalWeatherWeight / flight.route.nodes.length);

    // Round the normalized weight to 3 decimal places
    const roundedWeight = parseFloat(normalizedWeight.toFixed(3));

    return roundedWeight;
  };

  useEffect(() => {
    if (flight && weatherData.length === flight.route.nodes.length) {
      const weight = calculateRouteWeight(flight, weatherData);
      setRouteWeight(weight);
    }
  }, [flight, weatherData, setRouteWeight]);

  if (error) {
    return <div>{error}</div>;
  }

  if (loading || !flight) { // Display loading spinner while loading
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p>Loading flight details...</p>
      </div>
    );
  }

  const pathCoordinates = flight.route.nodes.map(node => [node.lat, node.lon]);

  // Blue airplane icon for departure
  const departureIcon = new L.Icon({
    iconUrl: airplane, // Use airplane icon
    iconSize: [25, 25],
  });

  // Red airplane icon for arrival
  const arrivalIcon = new L.Icon({
    iconUrl: airplane, // Use airplane icon
    iconSize: [25, 25],
    iconAnchor: [12.5, 12.5], // Center the icon
  });

  const aeroplaneIcon = new L.Icon({
    iconUrl: aeroplane,
    iconSize: [25, 25],
    iconAnchor: [12.5, 12.5],
  });

  const waypointIcon = new L.Icon({
    iconUrl: airport, // Use airplane icon
    iconSize: [10, 10],
    iconAnchor: [6, 6], // Center the icon
  });

  return (
    <div className="flight-detail-container">
      <div className='flight-info'>
        <div className="cards flight-detail-card">
          <h1>Flight Planner</h1>
        </div>
        <div className="card flight-detail-card">
          <h1>Flight Details</h1>
          <p><strong>Path ID:</strong> {flight.id}</p>
          <p><strong>Departure Airport:</strong> {flight.fromName}</p>
          <p><strong>Arrival Airport:</strong> {flight.toName}</p>
          <p><strong>Distance:</strong> {flight.distance.toFixed(2)} km</p>
          {routeWeight && (
            <div>
              <h2>Route Weight: {routeWeight}</h2>
              <p>The route weight is a normalized value that reflects the cumulative impact of weather conditions, visibility, and wind speed along a flight path.</p>
            </div>
          )}
        </div>

          <FuelData aircraft="60006b" distance={flight.distance} />
      </div>

      <div className="map-container">
        <MapContainer center={pathCoordinates[0]} zoom={7} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          <Marker position={pathCoordinates[0]} icon={departureIcon}>
            <Popup>{flight.fromName} ({flight.fromICAO})</Popup>
          </Marker>

          <Marker position={pathCoordinates[pathCoordinates.length - 1]} icon={arrivalIcon}>
            <Popup>{flight.toName} ({flight.toICAO})</Popup>
          </Marker>

          {currentPosition && (
            <Marker position={[currentPosition.lat, currentPosition.lon]} icon={aeroplaneIcon}>
              <Popup>Flying...</Popup>
            </Marker>
          )}

          {flight.route.nodes.map((node, index) => (
            <Marker key={index} position={[node.lat, node.lon]} icon={waypointIcon}>
              <Popup>
                <span style={{ color: 'blue', fontWeight: 'bold' }}>{node.ident}: {node.name}</span><br />
                <b>Weather: </b> {weatherData[index]?.weather[0]?.description}<br />
                <b>Temperature:</b> {kelvinToCelsius(weatherData[index]?.main?.temp).toFixed(2)} °C<br />
                <b>Humidity:</b> {weatherData[index]?.main?.humidity}%<br />
                <b>Visibility:</b> {weatherData[index]?.visibility} meters<br />
                <b>Wind Speed:</b> {weatherData[index]?.wind?.speed} m/s<br />
                <b>Sunrise:</b> {new Date(weatherData[index]?.sys?.sunrise * 1000).toLocaleTimeString()}<br />
                <b>Sunset:</b> {new Date(weatherData[index]?.sys?.sunset * 1000).toLocaleTimeString()}<br />
              </Popup>
            </Marker>
          ))}

          <Polyline positions={pathCoordinates} color="blue" weight={3} />
        </MapContainer>
      </div>
    </div>
  );
};

export default FlightDetail;
