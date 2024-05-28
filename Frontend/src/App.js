import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import FlightSearch from './Components/FlightSelection';
import FlightDetail from './Components/FlightDetail';
import './App.css';

const App = () => {
  const [fromICAO, setFromICAO] = useState('');
  const [toICAO, setToICAO] = useState('');
  const [flights, setFlights] = useState([]);

  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route
            path="/"
            element={
              <FlightSearch
                fromICAO={fromICAO}
                toICAO={toICAO}
                flights={flights}
                setFromICAO={setFromICAO}
                setToICAO={setToICAO}
                setFlights={setFlights}
              />
            }
          />
          <Route path="/flight/:id" element={<FlightDetail />} />
          
        </Routes>
      </div>
    </Router>
  );
};

export default App;
