import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './FlightSelection.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlaneDeparture, faPlaneArrival } from '@fortawesome/free-solid-svg-icons';
import { GoArrowSwitch } from 'react-icons/go';
import Background from '../assets/Background.mp4';
import Papa from 'papaparse';

const FlightSearch = () => {
  const [fromAirport, setFromAirport] = useState('');
  const [toAirport, setToAirport] = useState('');
  const [fromICAO, setFromICAO] = useState('');
  const [toICAO, setToICAO] = useState('');
  const [airports, setAirports] = useState([]);
  const [filteredFromAirports, setFilteredFromAirports] = useState([]);
  const [filteredToAirports, setFilteredToAirports] = useState([]);
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false); // Loading state
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAirports = async () => {
      try {
        const response = await fetch('/iata-icao.csv');
        if (!response.ok) {
          throw new Error(`Failed to fetch CSV: ${response.statusText}`);
        }

        const blob = await response.blob();
        const text = await blob.text();
        const results = Papa.parse(text, { header: true });

        console.log('Parsed airport data:', results.data); // Debugging: Check the parsed data
        setAirports(results.data);
      } catch (error) {
        console.error('Error fetching airport data:', error);
      }
    };

    fetchAirports();
  }, []);


  

  const fetchFlights = async () => {
    if (!fromICAO || !toICAO) {
      console.error('Invalid ICAO codes:', { fromICAO, toICAO });
      return;
    }

    setLoading(true); // Set loading state to true when fetching flights

    const url = `https://api.flightplandatabase.com/search/plans?fromICAO=${fromICAO}&toICAO=${toICAO}`;
    console.log('Fetching flights with URL:', url);  // Debugging: Log the request URL

    try {
      const response = await axios.get(url);
      const uniqueFlights = removeDuplicates(response.data);
      setFlights(uniqueFlights);
    } catch (error) {
      console.error('Error fetching flight plans:', error);
    } finally {
      setLoading(false); // Set loading state back to false when fetching is done
    }
  };

  const removeDuplicates = (flights) => {
    const seen = new Set();
    return flights.filter(flight => {
      const duplicate = seen.has(flight.distance + flight.waypoints);
      seen.add(flight.distance + flight.waypoints);
      return !duplicate;
    });
  };

  const handleFlightClick = (flightId) => {
    navigate(`/flight/${flightId}`);
  };

  const handleFromAirportChange = (event) => {
    const value = event.target.value;
    setFromAirport(value);
    const filtered = airports.filter(airport => airport.airport && airport.airport.toLowerCase().startsWith(value.toLowerCase()));
    console.log('Filtered from airports:', filtered);  // Debugging: Check the filtered results
    setFilteredFromAirports(filtered);
  };

  const handleToAirportChange = (event) => {
    const value = event.target.value;
    setToAirport(value);
    const filtered = airports.filter(airport => airport.airport && airport.airport.toLowerCase().startsWith(value.toLowerCase()));
    console.log('Filtered to airports:', filtered);  // Debugging: Check the filtered results
    setFilteredToAirports(filtered);
  };

  const handleFromAirportSelect = (airport) => {
    setFromAirport(airport.airport);
    setFromICAO(airport.icao);
    setFilteredFromAirports([]);
    console.log('Selected from airport:', airport);  // Debugging: Check the selected airport
  };

  const handleToAirportSelect = (airport) => {
    setToAirport(airport.airport);
    setToICAO(airport.icao);
    setFilteredToAirports([]);
    console.log('Selected to airport:', airport);  // Debugging: Check the selected airport
  };

  const switchICAOs = () => {
    const tempFromAirport = fromAirport;
    const tempFromICAO = fromICAO;

    setFromAirport(toAirport);
    setFromICAO(toICAO);

    setToAirport(tempFromAirport);
    setToICAO(tempFromICAO);
  };

  

  return (
    <div className="flight-search-container">
      <video autoPlay loop muted className="background-video">
        <source src={Background} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="content">

        <h1>Flight Plan Search</h1>
        <div className="search-form">
          <div className="input-group">
            <FontAwesomeIcon icon={faPlaneDeparture} className="input-icon" />
            <input
              type="text"
              placeholder="Departure Airport(Ex:IndiraGandhi intl)"
              value={fromAirport}
              onChange={handleFromAirportChange}
            />
            {filteredFromAirports.length > 0 && (
              <ul className="dropdown">
                {filteredFromAirports.map((airport, index) => (
                  <li key={index} onClick={() => handleFromAirportSelect(airport)}>
                    {airport.airport} ({airport.icao})
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="switch-button" onClick={switchICAOs}>
            <GoArrowSwitch size={30} />
          </div>
          <div className="input-group">
            <FontAwesomeIcon icon={faPlaneArrival} className="input-icon" />
            <input
              type="text"
              placeholder="Arrival Airport (Ex: Kempegowda Intl)"
              value={toAirport}
              onChange={handleToAirportChange}
            />
            {filteredToAirports.length > 0 && (
              <ul className="dropdown">
                {filteredToAirports.map((airport, index) => (
                  <li key={index} onClick={() => handleToAirportSelect(airport)}>
                    {airport.airport} ({airport.icao})
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button className="search-button" onClick={fetchFlights}>
            {loading ? 'Loading...' : 'Search'} {/* Display loading state */}
          </button>

        </div>
      </div>
      <div className="flights-list">
        {flights.map(flight => (
          <div
            key={flight.id}
            className="flight-box"
            onClick={() => handleFlightClick(flight.id)}
          >
            <p><strong>Path ID:</strong> {flight.id}</p>
            <p><strong>Departure Airport:</strong> {flight.fromName}</p>
            <p><strong>Arrival Airport:</strong> {flight.toName}</p>
            <p><strong>Total Distance:</strong> {flight.distance.toFixed(2)} km</p>
            <p><strong>From ICAO:</strong> {flight.fromICAO}</p>
            <p><strong>To ICAO:</strong> {flight.toICAO}</p>
            <p><strong>Waypoint :</strong>{flight.waypoints}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FlightSearch;
