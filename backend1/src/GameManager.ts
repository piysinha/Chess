import type WebSocket from "ws";
import { Game } from "./Game.js";
import { INIT_GAME, MOVE } from "./Messages.js";


export class GameManager {
    private games: Game[];
    private pendingUser: WebSocket | null;
    private users: WebSocket[];

    constructor() {
        this.games = [];
        this.pendingUser = null;
        this.users = [];
    }
    addUser(socket: WebSocket) {
        // Logic to add user to a game
        this.users.push(socket);
        this.addHandler(socket);
    }
    removeUser(socket: WebSocket) {
        // Logic to remove user from a game
        this.users = this.users.filter(user => user !== socket);
        // Stop the game if user left
    }

    private addHandler(socket: WebSocket) {
        // Logic to handle incoming messages from users

        socket.on("message", (data) => {
            const message = JSON.parse(data.toString());
            if (message.type === INIT_GAME) {
                if (this.pendingUser) {
                    //start a game
                    const game = new Game(this.pendingUser, socket);
                    this.games.push(game);
                    this.pendingUser = null;
                } else {
                    this.pendingUser = socket;
                }
            }

            if (message.type === MOVE) {
                console.log("📍 MOVE message received:", JSON.stringify(message.payload));
                const game = this.games.find(g => g.player1 === socket || g.player2 === socket);
                if (game) {
                    console.log(`✅ Game found - Making move: ${message.payload.from} to ${message.payload.to}`);
                    game.makeMove(socket, message.payload);
                    console.log("🎯 Move executed successfully");
                } else {
                    console.error("❌ No game found for this player");
                }
            }
        })
    }
}