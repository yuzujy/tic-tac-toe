package com.jy.tictactoe.service;


import com.jy.tictactoe.exception.InvalidGameException;
import com.jy.tictactoe.exception.InvalidParamException;
import com.jy.tictactoe.exception.NotFoundException;
import com.jy.tictactoe.model.Game;
import com.jy.tictactoe.model.GamePlay;
import com.jy.tictactoe.model.Player;
import com.jy.tictactoe.model.TicTacToe;
import com.jy.tictactoe.storage.GameStorage;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

import static com.jy.tictactoe.model.GameStatus.*;

@Service
@AllArgsConstructor
public class GameService {

    public Game createGame(Player player) {
        Game game = new Game();
        game.setBoard(new int[3][3]);
        game.setGameId(UUID.randomUUID().toString());
        game.setPlayer1(player);
        game.setStatus(NEW);
        GameStorage.getInstance().setGame(game);
        return game;
    }

    public Game connectToGame(Player player2, String gameId) throws InvalidParamException, InvalidGameException {
        if (!GameStorage.getInstance().getGames().containsKey(gameId)) {
            throw new InvalidParamException("Game with provided id doesn't exist");
        }
        Game game = GameStorage.getInstance().getGames().get(gameId);

        if (game.getPlayer2() != null) {
            throw new InvalidGameException("Game is not valid anymore");
        }

        game.setPlayer2(player2);
        game.setStatus(IN_PROGRESS);
        GameStorage.getInstance().setGame(game);
        return game;
    }
    
    public Game connectToRandomGame(Player player) {
        Optional<Game> availableGame = GameStorage.getInstance().getGames().values().stream()
                .filter(game -> game.getStatus().equals(NEW))
                .findFirst();
    
        if (availableGame.isPresent()) {
            Game game = availableGame.get();
            game.setPlayer2(player);
            game.setStatus(IN_PROGRESS);
            GameStorage.getInstance().setGame(game);
            return game;
        } else {
            // No available games, so create a new one
            return createGame(player);
        }
    }
    

    public Game gamePlay(GamePlay gamePlay) throws NotFoundException, InvalidGameException {
        if (!GameStorage.getInstance().getGames().containsKey(gamePlay.getGameId())) {
            throw new NotFoundException("Game not found");
        }

        Game game = GameStorage.getInstance().getGames().get(gamePlay.getGameId());
        if (game.getStatus().equals(FINISHED)) {
            throw new InvalidGameException("Game is already finished");
        }

        Player currentPlayer = gamePlay.getType() == TicTacToe.X ? game.getPlayer1() : game.getPlayer2();

        int[][] board = game.getBoard();
        board[gamePlay.getCoordinateX()][gamePlay.getCoordinateY()] = gamePlay.getType().getValue();

        game.addMoveDescription(gamePlay.getCoordinateX(), gamePlay.getCoordinateY(), currentPlayer, false);

        Boolean xWinner = checkWinner(game.getBoard(), TicTacToe.X);
        Boolean oWinner = checkWinner(game.getBoard(), TicTacToe.O);

        if (xWinner) {
            game.setWinner(TicTacToe.X);
            game.addMoveDescription(-1, -1, game.getPlayer1(), true);
            game.setStatus(FINISHED);
        } else if (oWinner) {
            game.setWinner(TicTacToe.O);
            game.addMoveDescription(-1, -1, game.getPlayer2(), true);
            game.setStatus(FINISHED);
        } else if (isDraw(game.getBoard())) {
            game.addMoveDescription(-1, -1, null, true);
            game.setStatus(FINISHED);
        }

        GameStorage.getInstance().setGame(game);
        return game;
    }

    private boolean isDraw(int[][] board) {
        for (int[] row : board) {
            for (int cell : row) {
                if (cell == 0) { 
                    return false; 
                }
            }
        }
        return true; 
    }    

    private Boolean checkWinner(int[][] board, TicTacToe TicTacToe) {
        int[] boardArray = new int[9];
        int counterIndex = 0;
        for (int i = 0; i < board.length; i++) {
            for (int j = 0; j < board[i].length; j++) {
                boardArray[counterIndex] = board[i][j];
                counterIndex++;
            }
        }

        int[][] winCombinations = {{0, 1, 2}, {3, 4, 5}, {6, 7, 8}, {0, 3, 6}, {1, 4, 7}, {2, 5, 8}, {0, 4, 8}, {2, 4, 6}};
        for (int i = 0; i < winCombinations.length; i++) {
            int counter = 0;
            for (int j = 0; j < winCombinations[i].length; j++) {
                if (boardArray[winCombinations[i][j]] == TicTacToe.getValue()) {
                    counter++;
                    if (counter == 3) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
}