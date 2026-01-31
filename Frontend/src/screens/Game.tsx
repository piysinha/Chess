import { useEffect, useState } from "react";
import { ChessBoard } from "../components/ChessBoard";
import { useSocket } from "../hooks/UseSocket";
import { Chess } from "chess.js";

export const INIT_GAME = "init_game";
export const MOVE = "move";
export const GAME_OVER = "game_over";

export const Game = () => {
    const { socket, error, isConnected } = useSocket();
    const [gameStarted, setGameStarted] = useState(false);
    const [chess, setChess] = useState(new Chess());

    useEffect(() => {
        if (!socket) return;

        socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            console.log("Received message:", message);
            
            switch (message.type) {
                case INIT_GAME:
                    const newChess = new Chess();
                    setChess(newChess);
                    setGameStarted(true);
                    console.log("Game initialized");
                    break;

                case MOVE:
                    setChess((prevChess) => {
                        const updatedChess = new Chess(prevChess.fen());
                        const move = message.payload;
                        
                        // Try to make the move
                        const result = updatedChess.move({
                            from: move.from,
                            to: move.to,
                            promotion: "q", // Auto-promote to queen
                        });
                        
                        if (result) {
                            console.log(`Move applied: ${move.from} to ${move.to}`);
                        } else {
                            console.error(`Invalid move: ${move.from} to ${move.to}`);
                        }
                        
                        return updatedChess;
                    });
                    break;

                case GAME_OVER:
                    alert("Game Over: " + message.payload.result);
                    setGameStarted(false);
                    break;

                default:
                    break;
            }
        };
    }, [socket]);

    const handleStartGame = () => {
        if (isConnected && socket) {
            socket.send(JSON.stringify({ type: INIT_GAME }));
        } else {
            alert("Not connected to server. Please check your connection.");
        }
    };

    const boardArray = chess.board();

    return (
        <div className="min-h-screen bg-gray-900 p-8">
            {/* Connection Status */}
            {error && (
                <div className="mb-4 p-4 bg-red-600 text-white rounded-lg text-center">
                    {error} - Make sure your backend server is running on port 8080
                </div>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
                {/* Chessboard Section */}
                <div className="lg:col-span-2 flex justify-center">
                    {socket && gameStarted && (
                        <ChessBoard board={boardArray} socket={socket} gameBoard={chess} />
                    )}
                </div>

                {/* Right Sidebar */}
                <div className="lg:col-span-2 flex flex-col gap-6 justify-center">
                    {/* Game Controls */}
                    <div className="flex flex-col gap-4">
                        {!gameStarted ? (
                            <button
                                onClick={handleStartGame}
                                disabled={!isConnected}
                                className={`w-full text-white text-2xl font-bold py-7 px-7 rounded-xl transition duration-300 ease-in-out ${
                                    isConnected
                                        ? "bg-green-500 hover:bg-green-600 cursor-pointer shadow-lg"
                                        : "bg-gray-400 cursor-not-allowed opacity-50"
                                }`}
                            >
                                {isConnected ? "Start Game" : "Connecting..."}
                            </button>
                        ) : (
                            <button
                                disabled
                                className="w-full bg-green-500 text-white text-2xl font-bold py-6 px-6 rounded-xl opacity-50 cursor-not-allowed"
                            >
                                Game in Progress
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};