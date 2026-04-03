import { Routes, Route } from "react-router-dom";
import LoginPage from "./Pages/LoginPage";
import MainPage from "./Pages/MainPage";
import RegisterPage from "./Pages/RegisterPage";
import SearchResultsPage from "./Pages/SearchResultsPage";
import UserPage from "./Pages/UserPage";
import EditProfilePage from "./Pages/EditProfilePage";
import GameInfoPage from "./Pages/GameInfoPage";

function App() {
    return (
        <div className="App">
            <Routes>
                <Route path="/" element={<MainPage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
                <Route path="search" element={<SearchResultsPage />} />
                <Route path="/user/:username" element={<UserPage />} />
                <Route path="/user/:username/edit" element={<EditProfilePage />} />
                <Route path="/game/:gameID" element={<GameInfoPage />} />
            </Routes>
        </div>
    );
}

export default App;
