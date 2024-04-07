import React, { useState, useEffect, useContext } from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import axios from 'axios'; 
import { useNavigate } from 'react-router-dom';
import PlayerLoginContext from '../context/PlayerLoginContext';
import Board from './Board';
import './styles/GamePage.css';
import Button from './Button';
import { faClockRotateLeft, faRightFromBracket, faLink, faDice } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';




const GamePage = () => {
  const [stompClient, setStompClient] = useState(null);
  const [gameId, setGameId] = useState(null);
  const [playerType, setPlayerType] = useState("");
  const [gameOn, setGameOn] = useState(false);
  const { playerLogin } = useContext(PlayerLoginContext);
  const [squares, setSquares] = useState(Array(3).fill(Array(3).fill(0)));
  const [caption, setCaption] = useState("");
  const [connected, setConnected] = useState(false);
  const [inputGameId, setInputGameId] = useState("");
  const [starter,  setStarter] = useState(false);
  const [shouldConnect, setShouldConnect] = useState(false);  //this was due to a bug that caused useState to not work inside the connectToSocket function for only the first game after refresh.


  const navigate = useNavigate();
  //const url = 'http://localhost:8080';


  const handleEndSession = (event) => {
    event.preventDefault();
    axios.post("/game/newSession")
    navigate('/'); // Navigate to the login route
  };

  const handleHistory = (event) => {
    event.preventDefault();
    navigate('/history'); // Navigate to the login route
  };
  
  const connectToSocket = (gameId) => {
    console.log("connecting to the game");
    let socket = new SockJS("/gameplay");
    let client = Stomp.over(socket);
    setStompClient(client);
    client.connect({}, function (frame) {
        console.log("connected to the frame: " + frame);
        client.subscribe("/topic/game-progress/" + gameId, function (response) {
          const data = JSON.parse(response.body);
          console.log(data);
          setSquares(data.board); 
          if (data.status === "FINISHED") {
            alert(`Game ended`);
            setGameOn(false);
            setCaption(data.moveHistoryDescriptions[data.moveHistoryDescriptions.length - 1]);
          } else {
            let myFreq;
            let otherFreq;

            if (playerType === 'X') {
              myFreq = countFrequency(1, data.board);
              otherFreq = countFrequency(2, data.board);
            } else if (playerType === 'O') {
              myFreq = countFrequency(2, data.board);
              otherFreq = countFrequency(1, data.board);
            }
            console.log("Game on?", gameOn);
            console.log("starter?", starter);
            console.log(playerType);
            console.log(myFreq);
            console.log(otherFreq);
            if (starter && myFreq === otherFreq) {
              setGameOn(true);
              console.log("here");
              } else if (!starter && (otherFreq === myFreq + 1)) {
                setGameOn(true);
                console.log("there");
              }
              let caption = data.moveHistoryDescriptions[data.moveHistoryDescriptions.length - 1]; 
              //alert(caption);
              setCaption(caption)
          }
        });
      setConnected(true);
    }, function (error) {
        console.log('Connection error' + error);
        setConnected(false);
    });
  };


  function countFrequency(value, board) {
    let count = 0;
    for (let row of board) {
        for (let cell of row) {
            if (cell === value) {
                count++;
            }
        }
    }
    return count;
  }

  const createGame = () => {
    axios.post("/game/start", { login: playerLogin })
      .then(response => {
        const { data } = response;
        resetGame();
        setGameId(data.gameId);
        setPlayerType("X");
        alert("Your created a game. Game id is: " + data.gameId);
        setCaption("You have created a game, game id is " + data.gameId +", waiting for opponent");
        setShouldConnect(true);
      })
      .catch(error => {
        console.error(error);
      });
  };

  const connectToRandomGame = () => {
    axios.post("/game/connect/random", { login: playerLogin })
      .then(response => {
        resetGame();
        const { data } = response;
        setGameId(data.gameId);
        console.log(data);
  
        if (data.status === "NEW") {
          setCaption("No available players. Waiting for an opponent...");
          setPlayerType("X");
          alert("No available players. Waiting for an opponent");
        } else {
          setCaption(`You are playing with ${data.player1.login} with game id ${data.gameId}. Start by making a move!`);
          alert("Connected, start playing");
          setPlayerType("O");
          console.log("im here", playerType);
          setGameOn(true);
          setStarter(true);
        }
        setShouldConnect(true);
      })
      .catch(error => {
        console.error(error);
      });
  };
  
  const connectToSpecificGame = () => {
    if (!inputGameId) {
      alert("Please enter game id");
      return;
    }
    axios.post("/game/connect", {
      player: { login: playerLogin },
      gameId: inputGameId
    })
      .then(response => {
        resetGame();
        setInputGameId("");
        const { data } = response;
        setGameId(data.gameId);
        setPlayerType("O");
        alert("Congrats you're playing with: " + data.player1.login);
        setGameOn(true);
        setStarter(true);
        setCaption("You have connected with player" + data.player1.login + ", start playing by making a move!");
        setShouldConnect(true);
      })
      .catch(error => {
        console.error(error);
      });
  };

  const handleInputChange = (event) => {
    setInputGameId(event.target.value);
  };

  useEffect(() => {
    if (gameId && playerType && shouldConnect) {
      connectToSocket(gameId);
      
      // Reset shouldConnect to prevent re-connecting on subsequent unrelated renders
      setShouldConnect(false);
    }
  }, [gameId, playerType, shouldConnect]);

//For future development to clean up the disconnection
//   const disconnectSocket = () => {
//     if (stompClient && stompClient.connected) {
//       stompClient.disconnect(() => {
//         console.log("Disconnected");
//       });
//     }
//   };

//   // Cleanup effect
//     useEffect(() => {
//         return () => {
//         disconnectSocket(); // Ensure we disconnect when the component unmounts
//         setConnected(false);
//         setGameId(null);
//         setGameOn(false);
//         setPlayerType(null);
//         setBoard(Array(3).fill(Array(3).fill("#")));
//         };
//     },[]);

  // Cleanup on component unmount
//   useEffect(() => {
//     return () => {
//       if (stompClient) {
//         stompClient.disconnect();
//         console.log("Disconnected");
//         setGameId(null);
//         setGameOn(false);
//         setPlayerType(null);
//         setBoard(Array(3).fill(Array(3).fill("#")));

//       }
//     };
//   }, [stompClient]);


  const makeAMove = (type, xCoordinate, yCoordinate) => {
    if (!gameOn) {
      alert("The game has not started or has ended or it's not your turn yet"); 
      return;
    }

    axios.post("/game/gameplay", {
       type,
       coordinateX: xCoordinate,
       coordinateY: yCoordinate,
       gameId
     })
     .then(({ data }) => {
       setSquares(data.board);
       setGameOn(false);
     })
     .catch(error => console.error(error));
  };

  // Handler for when a player clicks a square on the board
  const playerTurn = (x, y) => {
    console.log("heyyy", playerType);
    console.log("heyy starter", starter);
    makeAMove(playerType, x, y);
  };

  const resetGame = () => {
    setSquares(Array(3).fill(Array(3).fill(0))); // Reset the board
    setGameOn(false); 
    setStarter(false);
  };
  

  return (
    <div className="game-container">
        <div className="game-header">
            <Button onClick={createGame} fontIcon={<FontAwesomeIcon icon={faClockRotateLeft} />} label="Create New Game"/>
            <span id="special">OR</span>
            <input type="text" placeholder="Enter Game ID" value={inputGameId} onChange={handleInputChange} />
            <Button onClick={connectToSpecificGame} fontIcon={<FontAwesomeIcon icon={faLink} />} label="Connect"/>
            <span id="special">OR</span>
            <Button onClick={connectToRandomGame} fontIcon={<FontAwesomeIcon icon={faDice} />} label="Connect to random game"/>
        </div>
        <div className='board-container'>
            <Board squares={squares} onMove={playerTurn} />
        </div>
        <div className="game-caption">{caption}</div>
        <div className="game-footer">
            <Button onClick={handleEndSession} fontIcon={<FontAwesomeIcon icon={faRightFromBracket} />} label="End Session"/>
            <Button onClick={handleHistory} fontIcon={<FontAwesomeIcon icon={faClockRotateLeft} />} label="Game History"/>
        </div>
    </div>
  );
};

export default GamePage;
