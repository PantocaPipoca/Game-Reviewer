import { Routes, Route } from "react-router-dom";
import LoginPage from "./Pages/LoginPage";
import MainPage from "./Pages/MainPage";
import RegisterPage from "./Pages/RegisterPage";
import SearchResultsPage from "./Pages/SearchResultsPage";
import ReviewCard from "./Components/ReviewCard/ReviewCard";

function App() {
    return (
        <div>
            <ReviewCard
                cover="https://static-cdn.jtvnw.net/ttv-boxart/32982-285x380.jpg"
                title="The Witcher 3: Wild Hunt"
                description="An absolutely breathtaking RPG with a rich story, memorable characters, and a vast open world. Highly recommended for any fan of the genre!"
                upvotes={67}
                downvotes={12}
                rating={5}
                showUser={true}
            />
        </div>
    );
}

export default App;
