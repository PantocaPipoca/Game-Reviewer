import { Routes, Route } from "react-router-dom";
import LoginPage from "./Pages/LoginPage";
import MainPage from "./Pages/MainPage";
import RegisterPage from "./Pages/RegisterPage";
import ValidationPage from "./Pages/ValidationPage";
import SearchResultsPage from "./Pages/SearchResultsPage";
import SearchUsersPage from "./Pages/SearchUsersPage";
import UserPage from "./Pages/UserPage";
import EditProfilePage from "./Pages/EditProfilePage";
import GameInfoPage from "./Pages/GameInfoPage";
import CreateReviewPage from "./Pages/CreateReviewPage";
import EditReviewPage from "./Pages/EditReviewPage";
import ReviewPage from "./Pages/ReviewPage";
import ProtectedRoute from "./Components/ProtectedRoute";

function App() {
    return (
        <div className="App">
            <Routes>
                <Route path="/" element={<MainPage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
                <Route path="validation" element={<ValidationPage />} />
                <Route path="search/games" element={<SearchResultsPage />} />
                <Route path="search/users" element={<SearchUsersPage />} />
                <Route path="/user/:username" element={<UserPage />} />
                <Route path="/user/:username/edit" element={<EditProfilePage />} />
                <Route path="/game/:gameID" element={<GameInfoPage />} />
                <Route
                    path="/game/:gameID/review/create"
                    element={
                        <ProtectedRoute>
                            <CreateReviewPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/game/:gameID/review/edit"
                    element={
                        <ProtectedRoute>
                            <EditReviewPage />
                        </ProtectedRoute>
                    }
                />
                <Route path="/review/:reviewer/:reviewed" element={<ReviewPage />} />
            </Routes>
        </div>
    );
}

export default App;
