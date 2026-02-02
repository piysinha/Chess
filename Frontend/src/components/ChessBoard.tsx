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
    size?: number; // px
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

export const ChessBoard = ({ board, socket, gameBoard, size = 500 }: ChessBoardProps) => {
    const [from, setFrom] = useState<Square | null>(null);
    const [validMoves, setValidMoves] = useState<Square[]>([]);

    const getValidMoves = (square: Square): Square[] => {
        const moves = gameBoard.moves({ square, verbose: true });
        return moves.map((move) => move.to as Square);
    };

    const handleSquareClick = (square: Square) => {
        if (from) {
            if (validMoves.includes(square)) {
                socket.send(
                    JSON.stringify({
                        type: MOVE,
                        payload: { from, to: square },
                    })
                );
                setFrom(null);
                setValidMoves([]);
            } else {
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
            const piece = gameBoard.get(square);
            if (piece && piece.color === gameBoard.turn()) {
                setFrom(square);
                setValidMoves(getValidMoves(square));
            }
        }
    };

    // Responsive measurements
    const boardSize = Math.max(200, size); // ensure a minimum
    const cellSize = Math.floor(boardSize / 8);
    const pieceFontSize = Math.floor(cellSize * 0.6);

    return (
        <div className="flex flex-col items-center justify-center gap-4">
            <div className="bg-gray-900 p-4 rounded-lg shadow-2xl">
                <div
                    className="grid grid-cols-8 gap-0 border-4 border-gray-700"
                    style={{ width: boardSize, height: boardSize }}
                >
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
                                    className={`flex items-center justify-center font-bold relative cursor-pointer transition`}
                                    style={{
                                        width: cellSize,
                                        height: cellSize,
                                        backgroundColor: isDark ? "#166534" : "#FEF3C7",
                                        boxSizing: "border-box",
                                        ...(isSelected
                                            ? { outline: "4px solid #FBBF24", outlineOffset: "-4px" }
                                            : {}),
                                        ...(isValidMove ? { boxShadow: "inset 0 0 0 4px rgba(59,130,246,0.35)" } : {}),
                                    }}
                                >
                                    {isFileLabel && (
                                        <span className="absolute bottom-0.5 right-1 text-xs font-bold text-gray-700">
                                            {String.fromCharCode(97 + colIndex)}
                                        </span>
                                    )}
                                    {isRankLabel && (
                                        <span className="absolute top-0.5 left-1 text-xs font-bold text-gray-700">
                                            {8 - rowIndex}
                                        </span>
                                    )}
                                    {isValidMove && !isFromSquare && (
                                        <div className="absolute rounded-full" style={{ width: cellSize * 0.25, height: cellSize * 0.25, backgroundColor: "#60A5FA" }}></div>
                                    )}
                                    <span
                                        style={{
                                            fontSize: pieceFontSize,
                                            color: piece?.color === "w" ? "#ffffff" : "#374151",
                                            filter: piece?.color === "w" ? "drop-shadow(0 2px 2px rgba(0,0,0,0.6))" : undefined,
                                        }}
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