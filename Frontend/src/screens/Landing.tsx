import { useNavigate } from "react-router";

export const Landing = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-7xl w-full">
                {/* Chess Board Section */}
                <div className="flex items-center justify-center">
                    <div className="relative">
                        <img
                            src="/OriginalChess.gif"
                            alt="Chessboard"
                            className="w-120 h-120 rounded-3xl shadow-2xl object-cover"
                        />
                    </div>e
                </div>

                {/* Content Section */}
                <div className="flex flex-col justify-center space-y-8">
                    <div>
                        <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 leading-tight">
                            Play Chess Online
                        </h1>
                        <h2 className="text-5xl md:text-6xl font-bold text-white leading-tight">
                            on the #2 Site!
                        </h2>
                    </div>

                    <button
                        onClick={() => navigate("/game")}
                        className="bg-green-500 hover:bg-green-600 text-white text-xl font-bold py-4 px-12 rounded-full transition duration-300 ease-in-out transform hover:scale-105 w-fit shadow-lg"
                    >
                        Get Started
                    </button>
                </div>
            </div>
        </div>
    );
};