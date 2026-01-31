import type { Color, PieceSymbol, Square } from "chess.js";
import { useState } from "react";
import { MOVE } from "../screens/Game";
import { Chess } from "chess.js";

interface ChessBoardProps {
    board: ({
        square: Square;
        type: PieceSymbol;
        color: Color;
    } | null)[][];
    socket: WebSocket;
    gameBoard: Chess;
}

const getPieceSymbol = (piece: { type: PieceSymbol; color: Color } | null): string => {
    if (!piece) return "";
    const symbols: { [key: string]: { w: string; b: string } } = {
        p: { w: "♙", b: "♟" },
        r: { w: "♖", b: "♜" },
        n: { w: "♘", b: "♞" },
        b: { w: "♗", b: "♝" },
        q: { w: "♕", b: "♛" },
        k: { w: "♔", b: "♚" },
    };
    return symbols[piece.type][piece.color];
};

export const ChessBoard = ({ board, socket, gameBoard }: ChessBoardProps) => {
    const [from, setFrom] = useState<Square | null>(null);
    const [validMoves, setValidMoves] = useState<Square[]>([]);

    const getValidMoves = (square: Square): Square[] => {
        const moves = gameBoard.moves({ square, verbose: true });
        return moves.map((move) => move.to as Square);
    };

    const handleSquareClick = (square: Square) => {
        // If a piece is already selected
        if (from) {
            // Check if this is a valid move destination
            if (validMoves.includes(square)) {
                // Send the move to backend
                socket.send(
                    JSON.stringify({
                        type: MOVE,
                        payload: { from, to: square },
                    })
                );
                console.log(`Move sent to backend: ${from} to ${square}`);
                setFrom(null);
                setValidMoves([]);
            } else {
                // Try to select a different piece
                const piece = gameBoard.get(square);
                if (piece && piece.color === gameBoard.turn()) {
                    setFrom(square);
                    setValidMoves(getValidMoves(square));
                } else {
                    setFrom(null);
                    setValidMoves([]);
                }
            }
        } else {
            // Select a piece
            const piece = gameBoard.get(square);
            if (piece && piece.color === gameBoard.turn()) {
                setFrom(square);
                setValidMoves(getValidMoves(square));
            }
        }
    };

    return (
        <div className="flex flex-col items-center justify-center gap-4 w-full h-full">
            <div className="bg-gray-900 p-4 rounded-lg shadow-2xl">
                <div className="grid grid-cols-8 gap-0 w-[500px] h-[500px] border-4 border-gray-700">
                    {board.map((row, rowIndex) =>
                        row.map((piece, colIndex) => {
                            const square = (String.fromCharCode(97 + colIndex) +
                                (8 - rowIndex)) as Square;
                            const isDark = (rowIndex + colIndex) % 2 === 1;
                            const isFileLabel = rowIndex === 7;
                            const isRankLabel = colIndex === 0;
                            const isSelected = from === square;
                            const isValidMove = validMoves.includes(square);
                            const isFromSquare = from === square;

                            return (
                                <div
                                    onClick={() => handleSquareClick(square)}
                                    key={`${rowIndex}-${colIndex}`}
                                    className={`w-16 h-16 flex items-center justify-center text-5xl font-bold relative cursor-pointer transition ${
                                        isDark ? "bg-green-600" : "bg-amber-100"
                                    } ${isSelected ? "ring-4 ring-yellow-400 ring-inset" : ""} ${
                                        isValidMove ? "ring-4 ring-blue-400 ring-inset" : ""
                                    }`}
                                >
                                    {/* File labels (a-h) */}
                                    {isFileLabel && (
                                        <span className="absolute bottom-0.5 right-1 text-xs font-bold text-gray-700">
                                            {String.fromCharCode(97 + colIndex)}
                                        </span>
                                    )}
                                    {/* Rank labels (1-8) */}
                                    {isRankLabel && (
                                        <span className="absolute top-0.5 left-1 text-xs font-bold text-gray-700">
                                            {8 - rowIndex}
                                        </span>
                                    )}
                                    {/* Valid move indicator */}
                                    {isValidMove && !isFromSquare && (
                                        <div className="absolute w-4 h-4 bg-blue-400 rounded-full"></div>
                                    )}
                                    {/* Piece */}
                                    <span
                                        className={`${
                                            piece?.color === "w"
                                                ? "text-white drop-shadow-lg"
                                                : "text-gray-700"
                                        }`}
                                    >
                                        {getPieceSymbol(piece)}
                                    </span>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
            {from && (
                <div className="text-white text-sm">
                    Selected: {from} | Valid moves: {validMoves.join(", ")}
                </div>
            )}
        </div>
    );
};