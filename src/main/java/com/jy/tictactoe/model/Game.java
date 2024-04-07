package com.jy.tictactoe.model;

import java.util.ArrayList;
import java.util.List;

import lombok.Data;

@Data
public class Game {

    private String gameId;
    private Player player1;
    private Player player2;
    private GameStatus status;
    private int[][] board;
    private TicTacToe winner;
    private List<String> moveHistoryDescriptions = new ArrayList<>();

    public void addMoveDescription(int x, int y, Player player, boolean outcome) {
        String moveDescription;
        if (!outcome) {
            moveDescription = String.format("Move %d: Player %s to (%d, %d)",
                                                moveHistoryDescriptions.size() + 1, 
                                                player.getLogin(), x, y);
        } else { 
            if (player != null) {
                moveDescription = "Player " + player.getLogin() + " won the game";
            } else {
                moveDescription = "Draw";
            }
        }
        moveHistoryDescriptions.add(moveDescription);
    }

}