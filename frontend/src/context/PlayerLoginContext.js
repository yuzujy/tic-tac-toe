import React from 'react';

const PlayerLoginContext = React.createContext({
  playerLogin: '',
  setPlayerLogin: () => {}
});

export default PlayerLoginContext;
