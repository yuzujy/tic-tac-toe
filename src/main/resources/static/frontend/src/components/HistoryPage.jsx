import React, {useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './Button';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import './HistoryPage.css'

function HistoryPage() {
  const navigate = useNavigate();

  const [gameHistory, setGameHistory] = useState([]);

  useEffect(() => {
    // Replace with your actual API endpoint
    axios.get('/game/history')
      .then(response => setGameHistory(response.data))
      .catch(error => console.error('Error fetching game history:', error));
  }, []);
  
  // Fetch game history from the backend when the component loads
  // and update the state accordingly.

  return (
    <div aria-labelledby="history-title">
      <h1 id="history-title">Game History</h1>
      <div className='game-history-container'>
        {gameHistory.map((game, index) => (
            <div key={index} className="history-item">
              <p className="history-subheader">{`Game against Player ${game.player2.login}`}</p>
              {game.moveHistoryDescriptions.map((move, moveIndex) => (
                <p key={moveIndex}>{move}</p>
              ))}
            </div>
          ))}
      </div>
      <div className='button-container'>
      <Button onClick={() => navigate('/game')} fontIcon={<FontAwesomeIcon icon={faArrowLeft} />} label="Back to Game" />
      </div>
    </div>
  );
}

export default HistoryPage;
