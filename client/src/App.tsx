import { Routes, Route } from "react-router-dom";
import LoginPage from "./Pages/LoginPage";
import MainPage from "./Pages/MainPage";
import RegisterPage from "./Pages/RegisterPage";
import SearchResultsPage from "./Pages/SearchResultsPage";
import GameInfoPage from "./Pages/GameInfoPage";

function App() {
    return (
        <div>
            <GameInfoPage />
        </div>
    );
}

export default App;
