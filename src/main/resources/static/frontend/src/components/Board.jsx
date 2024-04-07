// Board.jsx
import React from 'react';
import './Board.css';

const Board = ({ squares, onMove }) => {
  // Function to determine the class based on square value
  const getSquareClass = (value) => {
    switch (value) {
      case 1: return "square player-X"; // If player X
      case 2: return "square player-O"; // If player O
      default: return "square"; // Default, empty square
    }
  };

  return (
    <div className="tic-tac-toe">
      {squares.map((row, rowIndex) => (
        <div key={rowIndex} className="board-row">
          {row.map((cell, cellIndex) => (
            <button
              key={`${rowIndex}-${cellIndex}`}
              className={getSquareClass(cell)}
              onClick={() => onMove(rowIndex, cellIndex)}
              disabled={cell !== 0}
            >
              {cell === 1 ? 'X' : cell === 2 ? 'O' : ''}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Board;
