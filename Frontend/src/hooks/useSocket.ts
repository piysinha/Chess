import { useEffect, useState } from "react";

const URL_LINK = "ws://localhost:8080";

export const useSocket = () => {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        try {
            const ws = new WebSocket(URL_LINK);

            ws.onopen = () => {
                console.log("✅ WebSocket connected");
                setSocket(ws);
                setError(null);
            };

            ws.onerror = (event) => {
                console.error("❌ WebSocket error:", event);
                setError("Failed to connect to server");
            };

            ws.onclose = () => {
                console.log("⚠️ WebSocket disconnected");
                setSocket(null);
            };

            return () => {
                ws.close();
            };
        } catch (err) {
            console.error("❌ WebSocket connection failed:", err);
            setError("Unable to establish connection");
        }
    }, []);

    return { socket, error, isConnected: socket !== null };
};