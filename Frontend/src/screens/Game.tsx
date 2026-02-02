import { useEffect, useState } from "react";
import { ChessBoard } from "../components/ChessBoard";
import { useSocket } from "../hooks/useSocket";
import { Chess } from "chess.js";

export const INIT_GAME = "init_game";
export const MOVE = "move";
export const GAME_OVER = "game_over";

export const Game = () => {
    const { socket, error, isConnected } = useSocket();
    const [gameStarted, setGameStarted] = useState(false);
    const [chess, setChess] = useState(new Chess());
    const [myColor, setMyColor] = useState<string | null>(null);
    const [myPlayerNumber, setMyPlayerNumber] = useState<number | null>(null);
    const [boardSize, setBoardSize] = useState<number>(520);

    useEffect(() => {
        // responsive board size calculation that respects viewport width and height
        const updateSize = () => {
            const w = window.innerWidth;
            const h = window.innerHeight;
            // prefer width-based size, but don't exceed ~720px and don't exceed a portion of height
            const candidate = Math.floor(Math.min(Math.max(320, w * 0.72), 720));
            const heightCap = Math.floor(h * 0.62);
            const finalSize = Math.min(candidate, Math.max(320, heightCap));
            setBoardSize(finalSize);
        };
        updateSize();
        window.addEventListener("resize", updateSize);
        return () => window.removeEventListener("resize", updateSize);
    }, []);

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
                    if (message.payload?.color) {
                        setMyColor(message.payload.color);
                    }
                    if (message.payload?.playerNumber) {
                        setMyPlayerNumber(Number(message.payload.playerNumber));
                    }
                    console.log("Game initialized");
                    break;

                case MOVE:
                    setChess((prevChess) => {
                        if (message.payload && message.payload.board) {
                            return new Chess(message.payload.board);
                        }

                        const updatedChess = new Chess(prevChess.fen());
                        const moveData = message.payload?.move ?? message.payload;
                        if (!moveData?.from || !moveData?.to) {
                            console.warn("Skipping malformed MOVE payload", message.payload);
                            return updatedChess;
                        }

                        const result = updatedChess.move({
                            from: moveData.from,
                            to: moveData.to,
                            promotion: "q",
                        });
                        if (result) {
                            console.log(`Move applied: \${moveData.from} to \${moveData.to}`);
                        } else {
                            console.error(`Invalid move: \${moveData.from} to \${moveData.to}`);
                        }
                        return updatedChess;
                    });
                    break;

                case GAME_OVER:
                    alert("Game Over: " + message.payload.result);
                    setGameStarted(false);
                    setMyColor(null);
                    setMyPlayerNumber(null);
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
        <div className="min-h-screen bg-gray-900 p-6">
            {error && (
                <div className="mb-4 p-4 bg-red-600 text-white rounded-lg text-center">
                    {error} - Make sure your backend server is running on port 8080
                </div>
            )}

            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                {/* Left column: board centered and responsive */}
                <div className="flex flex-col items-center gap-6 w-full">
                    <div className="w-full flex justify-center">
                        <div className="w-full" style={{ maxWidth: boardSize }}>
                            {socket && gameStarted ? (
                                <ChessBoard board={boardArray} socket={socket} gameBoard={chess} size={boardSize} />
                            ) : (
                                <div className="w-full flex justify-center">
                                    <img
                                        src="/OriginalChess.gif"
                                        alt="Chessboard"
                                        className="w-full max-w-md h-auto rounded-3xl shadow-2xl object-cover"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right column: controls / explicit Player 1 & Player 2 */}
                <div className="flex flex-col items-center justify-start w-full">
                    <div className="w-full max-w-sm text-center">
                        {!gameStarted ? (
                            <div className="flex flex-col gap-4">
                                <button
                                    onClick={handleStartGame}
                                    disabled={!isConnected}
                                    className={`w-full text-white text-2xl font-bold py-6 px-6 rounded-xl transition duration-300 ease-in-out ${
                                        isConnected
                                            ? "bg-green-500 hover:bg-green-600 cursor-pointer shadow-lg"
                                            : "bg-gray-400 cursor-not-allowed opacity-50"
                                    }`}
                                >
                                    {isConnected ? "Start Game" : "Connecting..."}
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                <div className="text-white text-lg font-semibold mb-2">Players</div>
                                <div className="flex flex-col gap-3">
                                    <div className={`p-3 rounded flex justify-between items-center ${
                                        myPlayerNumber === 1 ? "bg-green-600" : "bg-gray-700"
                                    } text-white`}>
                                        <div>
                                            <div className="font-semibold">Player 1</div>
                                            <div className="text-sm">White</div>
                                        </div>
                                        <div className="text-sm">
                                            {myPlayerNumber === 1 ? "You" : "Opponent"}
                                        </div>
                                    </div>

                                    <div className={`p-3 rounded flex justify-between items-center ${
                                        myPlayerNumber === 2 ? "bg-green-600" : "bg-gray-700"
                                    } text-white`}>
                                        <div>
                                            <div className="font-semibold">Player 2</div>
                                            <div className="text-sm">Black</div>
                                        </div>
                                        <div className="text-sm">
                                            {myPlayerNumber === 2 ? "You" : "Opponent"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
