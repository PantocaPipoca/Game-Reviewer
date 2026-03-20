import { Routes, Route } from "react-router-dom";
import LoginPage from "./Pages/LoginPage";
import MainPage from "./Pages/MainPage";
import RegisterPage from "./Pages/RegisterPage";
import SearchResultsPage from "./Pages/SearchResultsPage";

function App() {
    return (
        <div className="App">
            <Routes>
                <Route path="/" element={<MainPage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
                <Route path="search" element={<SearchResultsPage />} />
            </Routes>
        </div>
    );
}

export default App;
