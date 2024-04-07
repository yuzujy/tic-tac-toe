import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import GamePage from './components/GamePage';
import HistoryPage from './components/HistoryPage';
import PlayerLoginContext from './context/PlayerLoginContext';

const App = () => {
  const [playerLogin, setPlayerLogin] = useState('');

  return (
    <PlayerLoginContext.Provider value={{ playerLogin, setPlayerLogin }}>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/game" element={<GamePage />} />
          <Route path="/history" element={<HistoryPage />} />
        </Routes>
      </Router>
    </PlayerLoginContext.Provider>
  );
};

export default App;



