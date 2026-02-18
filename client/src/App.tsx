import GameCard from "./components/GameCards/GameCard";
import BigGameCard from "./components/GameCards/BigGameCard";
import Navbar from "./components/Navbar/Navbar";

function App() {
    return (
        <>
            <Navbar />
            <BigGameCard />
            <hr />
            <GameCard />
        </>
    );
}

export default App;
