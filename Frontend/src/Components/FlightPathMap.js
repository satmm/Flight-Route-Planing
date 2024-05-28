import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './FlightSelection.css';

const FlightSearch = ({ fromICAO, toICAO, flights, setFromICAO, setToICAO, setFlights }) => {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const fetchFlights = async () => {
    try {
      const response = await axios.get(`/api/flightplans?fromICAO=${fromICAO}&toICAO=${toICAO}`);
      const uniqueFlights = removeDuplicates(response.data);
      setFlights(uniqueFlights);
    } catch (error) {
      console.error('Error fetching flight plans:', error);
      setError('Failed to fetch flight plans. Please try again later.');
    }
  };

  const handleFlightClick = (flightId) => {
    navigate(`/flight/${flightId}`);
  };

  const removeDuplicates = (flights) => {
    const seen = new Set();
    return flights.filter(flight => {
      const duplicate = seen.has(flight.distance + flight.waypoints);
      seen.add(flight.distance + flight.waypoints);
      return !duplicate;
    });
  };

  return (
    <div className="flight-search-container">
      <h1>Flight Plan Search</h1>
      <div className="search-form">
        <input
          type="text"
          placeholder="Enter From ICAO"
          value={fromICAO}
          onChange={(e) => setFromICAO(e.target.value)}
        />
        <input
          type="text"
          placeholder="Enter To ICAO"
          value={toICAO}
          onChange={(e) => setToICAO(e.target.value)}
        />
        <button onClick={fetchFlights}>Search</button>
      </div>
      {error && <p className="error">{error}</p>}
      <div className="flights-list">
        {flights.map(flight => (
          <div
            key={flight.id}
            className="flight-box"
            onClick={() => handleFlightClick(flight.id)}
          >
            <p><strong>Flight ID:</strong> {flight.id}</p>
            <p><strong>Departure Airport:</strong> {flight.fromName}</p>
            <p><strong>Arrival Airport:</strong> {flight.toName}</p>
            <p><strong>Total Distance:</strong> {flight.distance.toFixed(2)} km</p>
            <p><strong>From ICAO:</strong> {flight.fromICAO}</p>
            <p><strong>To ICAO:</strong> {flight.toICAO}</p>
            <p><strong>Way Points:</strong> {flight.waypoints}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FlightSearch;