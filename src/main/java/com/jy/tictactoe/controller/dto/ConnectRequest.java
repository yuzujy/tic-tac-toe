package com.jy.tictactoe.controller.dto;

import com.jy.tictactoe.model.Player;
import lombok.Data;

@Data
public class ConnectRequest {
    private Player player;
    private String gameId;
}