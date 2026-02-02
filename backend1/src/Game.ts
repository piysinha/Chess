import { Chess } from 'chess.js'
import type WebSocket from "ws";
import { GAME_OVER, INIT_GAME, MOVE } from './Messages.js';

export class Game {
    // Game logic here
    public player1: WebSocket;
    public player2: WebSocket;
    private board: Chess
    private startTime: Date;

    constructor(player1: WebSocket, player2: WebSocket) {
        this.player1 = player1;
        this.player2 = player2;
        this.board = new Chess();
        this.startTime = new Date();

        this.player1.send(JSON.stringify({
            type: INIT_GAME,
            payload: {
                color: 'white',
                playerNumber: 1
            }
        }));
        this.player2.send(JSON.stringify({
            type: INIT_GAME,
            payload: {
                color: 'black',
                playerNumber: 2
            }
        }));
    }

    makeMove(player: WebSocket, move: { from: string, to: string }) {
        // Logic to make a move
        //validate the type of move using zod
        const movesLength = this.board.history();
        const movesCount = movesLength.length;
        const isPlayer1 = player === this.player1;

        console.log(`Player ${isPlayer1 ? '1' : '2'} attempting move. Moves count: ${movesLength}`);

        // Player 1 plays on even moves (0, 2, 4...)
        if (movesCount % 2 === 0 && !isPlayer1) {
            console.log("Invalid: Not player 1's turn");
            return;
        }

        // Player 2 plays on odd moves (1, 3, 5...)
        if (movesCount % 2 === 1 && isPlayer1) {
            console.log("Invalid: Not player 2's turn");
            return;
        }

        try {
            this.board.move(move);
            console.log(`Move successful: ${move.from} -> ${move.to}`);
        } catch (e) {
            console.log("Move error:", e);
            return;
        }

        const payload = {
            from: move.from,
            to: move.to,
            board: this.board.fen()
        };
        this.player1.send(JSON.stringify({ type: MOVE, payload }));
        this.player2.send(JSON.stringify({ type: MOVE, payload }));

        if (this.board.isGameOver()) {
            // Handle game over
            this.player1.send(JSON.stringify({
                type: GAME_OVER,
                payload: {
                    winner: this.board.turn() === 'w' ? 'black' : 'white'
                }
            }));
            this.player2.send(JSON.stringify({
                type: GAME_OVER,
                payload: {
                    winner: this.board.turn() === 'w' ? 'black' : 'white'
                }
            }));
            return;
        }
    }
}