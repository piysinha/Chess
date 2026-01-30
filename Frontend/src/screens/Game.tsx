
export const Game = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-green-100">
            <h1 className="text-4xl font-bold mb-8">Welcome to the Game Page</h1>
            <button className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition">
                Start Game
            </button>
        </div>
    );
}