package com.jy.tictactoe.controller;

import com.jy.tictactoe.controller.dto.ConnectRequest;
import com.jy.tictactoe.exception.InvalidGameException;
import com.jy.tictactoe.exception.InvalidParamException;
import com.jy.tictactoe.exception.NotFoundException;
import com.jy.tictactoe.model.Game;
import com.jy.tictactoe.model.GamePlay;
import com.jy.tictactoe.model.Player;
import com.jy.tictactoe.service.GameService;
import com.jy.tictactoe.storage.GameStorage;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpSession;

@RestController
@Slf4j
@AllArgsConstructor
@RequestMapping("/game")
public class GameController {

    private final GameService gameService;
    private final SimpMessagingTemplate simpMessagingTemplate;

    @PostMapping("/start")
    public ResponseEntity<Game> start(@RequestBody Player player) {
        log.info("start game request: {}", player);
        return ResponseEntity.ok(gameService.createGame(player));
    }

    @PostMapping("/connect")
    public ResponseEntity<Game> connect(@RequestBody ConnectRequest request) throws InvalidParamException, InvalidGameException {
        log.info("connect request: {}", request);
        return ResponseEntity.ok(gameService.connectToGame(request.getPlayer(), request.getGameId()));
    }

    @PostMapping("/connect/random")
    public ResponseEntity<Game> connectRandom(@RequestBody Player player) throws NotFoundException {
        log.info("connect random {}", player);
        return ResponseEntity.ok(gameService.connectToRandomGame(player));
    }

    @PostMapping("/gameplay")
    public ResponseEntity<Game> gamePlay(@RequestBody GamePlay request) throws NotFoundException, InvalidGameException {
        log.info("gameplay: {}", request);
        Game game = gameService.gamePlay(request);
        simpMessagingTemplate.convertAndSend("/topic/game-progress/" + game.getGameId(), game);
        return ResponseEntity.ok(game);
    }

    @PostMapping("/history/{gameId}")
    public ResponseEntity<List<String>> getGameHistory(@PathVariable String gameId) throws NotFoundException {
        Game game = GameStorage.getInstance().getGames().get(gameId);
        if (game == null) {
            throw new NotFoundException("Game not found");
        }
        return ResponseEntity.ok(game.getMoveHistoryDescriptions());
    }

    
}