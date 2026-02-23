import Navbar from "../Components/Navbar/Navbar";
import BigGameCard from "../Components/GameCards/BigGameCard";
import GameCard from "../Components/GameCards/GameCard";
import Panel from "../Components/Panel/Panel";
import style from "./MainPage.module.css";
import Text from "../Components/Text/Text";

function MainPage() {
    return (
        <div>
            <Navbar />
            <div className={style.mainPanel}>
                <Panel type="main">
                    <div>
                        <div className={style.header}>
                            <Text>Popular Games</Text>
                            <Text>{`> `}See More</Text>
                        </div>
                        <BigGameCard />
                    </div>
                    <hr />
                    <div>
                        <div className={style.header}>
                            <Text>Popular Games</Text>
                            <Text>{`> `}See More</Text>
                        </div>
                        <GameCard />
                    </div>
                    <hr />
                    <div>
                        <div className={style.header}>
                            <Text>Popular Games</Text>
                            <Text>{`> `}See More</Text>
                        </div>
                        <GameCard />
                    </div>
                </Panel>
            </div>
        </div>
    );
}

export default MainPage;
