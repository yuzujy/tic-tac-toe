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

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpSession;

@RestController
@Slf4j
@AllArgsConstructor
@RequestMapping("/game")
public class GameController {

    private final GameService gameService;
    private final SimpMessagingTemplate simpMessagingTemplate;

    @PostMapping("/start")
    public ResponseEntity<Game> start(@RequestBody Player player, HttpSession session) {
        log.info("start game request: {}", player);
        Game game = gameService.createGame(player);
        updateGameHistoryInSession(game.getGameId(), session);
        return ResponseEntity.ok(game);
    }

    @PostMapping("/connect")
    public ResponseEntity<Game> connect(@RequestBody ConnectRequest request, HttpSession session) throws InvalidParamException, InvalidGameException {
        log.info("connect request: {}", request);
        Game game = gameService.connectToGame(request.getPlayer(), request.getGameId());
        updateGameHistoryInSession(game.getGameId(), session);
        return ResponseEntity.ok(game);
    }

    @PostMapping("/connect/random")
    public ResponseEntity<Game> connectRandom(@RequestBody Player player) throws NotFoundException {
        log.info("connect random {}", player);
        return ResponseEntity.ok(gameService.connectToRandomGame(player));
    }

    @PostMapping("/gameplay")
    public ResponseEntity<Game> gamePlay(@RequestBody GamePlay request, HttpSession session) throws NotFoundException, InvalidGameException {
        log.info("gameplay: {}", request);
        Game game = gameService.gamePlay(request);
        simpMessagingTemplate.convertAndSend("/topic/game-progress/" + game.getGameId(), game);
        return ResponseEntity.ok(game);
    }

    // @PostMapping("/history/{gameId}")
    // public ResponseEntity<List<String>> getGameHistory(@PathVariable String gameId, HttpSession session) throws NotFoundException {
    //     Game game = GameStorage.getInstance().getGames().get(gameId);
    //     if (game == null) {
    //         throw new NotFoundException("Game not found");
    //     }
    //     return ResponseEntity.ok(game.getMoveHistoryDescriptions());
    // }

    @GetMapping("/history")
    public ResponseEntity<List<Game>> getGameHistory(HttpSession session) {
        List<String> gameIds = (List<String>) session.getAttribute("gameHistory");
        if (gameIds == null) {
            gameIds = new ArrayList<>();
        }
        List<Game> games = gameIds.stream()
                                  .map(gameId -> GameStorage.getInstance().getGames().get(gameId))
                                  .collect(Collectors.toList());
        return ResponseEntity.ok(games);
    }


    private void updateGameHistoryInSession(String gameId, HttpSession session) {
        List<String> gameHistory = (List<String>) session.getAttribute("gameHistory");
        if (gameHistory == null) {
            gameHistory = new ArrayList<>();
        }
        gameHistory.add(gameId);
        session.setAttribute("gameHistory", gameHistory);
    }

    @PostMapping("/newSession")
    public ResponseEntity<?> startNewSession(HttpSession session) {
        session.removeAttribute("gameHistory"); // Clear the game history from the session
        return ResponseEntity.ok().build();
    }


    
}