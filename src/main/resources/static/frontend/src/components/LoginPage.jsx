import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css'; // Assuming you have a CSS file for styling
import PlayerLoginContext from '../context/PlayerLoginContext';
import Button from './Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGamepad } from '@fortawesome/free-solid-svg-icons';

function LoginPage() {
  const [playerName, setPlayerName] = useState('');
  const navigate = useNavigate();
  const { setPlayerLogin } = useContext(PlayerLoginContext);

  const handleSubmit = (event) => {
    event.preventDefault();
    // Here you would add the functionality to post to the backend
    setPlayerLogin(playerName);
    navigate('/game'); // Navigate to the game route
  };

  return (
    <main role="main" className="login-container">
      <div className="header-container">
        <img src={`${process.env.PUBLIC_URL}/tictactoe.jpg`} alt="Tic Tac Toe logo" className="logo" />
        <h1 id="login-title" tabIndex="0">Play Tic-Tac-Toe</h1>
      </div>
      <form onSubmit={handleSubmit} aria-labelledby="login-title">
        <div className="input-group">
          <input
            id="player-name"
            type="text"
            placeholder="Enter Player Name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            required
          />
        </div>
        <Button type="submit" fontIcon={<FontAwesomeIcon icon={faGamepad} />} label="Play" />
        {/* <button type="submit" className="play-button">Play</button> */}
      </form>
      <footer className='footer'>
        <img src={`${process.env.PUBLIC_URL}/accessibility.jpg`} alt="Accessibility" />
      </footer>
    </main>
  );
}

export default LoginPage;
