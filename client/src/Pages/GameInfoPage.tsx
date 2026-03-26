import style from "./GameInfoPage.module.css";
import Panel from "../Components/Panel/Panel";
import Navbar from "../Components/Navbar/Navbar";
import Text from "../Components/Text/Text";
import Star from "../Components/Star/Star";
import type { CssVar } from "../Types/Types";

type RatingType = "user" | "your" | "friends";

function getRatingColor(type: RatingType): CssVar {
    if (type === "user") return "var(--cyan)";
    if (type === "your") return "var(--pink)";
    return "var(--green)";
}

function RatingRow({ type }: { type: RatingType }) {
    const color: CssVar = getRatingColor(type);
    const isYourRating: boolean = type === "your";
    const value: number = 8.8;

    const titleMap: Record<RatingType, string> = {
        user: "User Ratings",
        your: "Your Rating",
        friends: "Friends Rating",
    };

    return (
        <div className={style.ratingRow}>
            <Text variant="h2">{titleMap[type]}</Text>

            <div className={style.ratingContent}>
                <Star type="full" size={46} color={color} />
                {isYourRating ? <button>+</button> : <Text variant="h1">{value.toFixed(1)}</Text>}
            </div>
        </div>
    );
}

function GameInfoPage() {
    return (
        <div>
            <Navbar />
            <div className={style.mainPanel}>
                <Panel type="main">
                    <div className={style.content}>
                        <div className={style.leftColumn}>
                            <Panel type="secondary" className={style.coverPanel}>
                                <img
                                    src="https://upload.wikimedia.org/wikipedia/en/6/6e/Sekiro_art.jpg"
                                    className={style.cover}
                                />
                                <hr />
                                <Text className={style.gameName}>Sekiro</Text>
                            </Panel>
                            <Panel type="secondary" className={style.bottomLeftRow}>
                                <RatingRow type="user" />
                                <hr />
                                <RatingRow type="your" />
                                <hr />
                                <RatingRow type="friends" />
                                <hr />
                            </Panel>
                        </div>

                        <div className={style.rightColumn}>
                            <Panel type="secondary">
                                <img src="https://i.redd.it/x56mt3i8k5o21.jpg" className={style.media} />
                            </Panel>
                            <Panel type="secondary">
                                <div className={style.description}>
                                    <div>
                                        <Text variant="body">Genre: </Text>
                                        <Text variant="body" color="var(--cyan)">
                                            Shooter, Adventure
                                        </Text>
                                    </div>

                                    <div>
                                        <Text variant="body">Platforms: </Text>
                                        <Text variant="body" color="var(--cyan)">
                                            iOS, Mac, PC (Microsoft Windows), PlayStation 4, PlayStation 5, Xbox One,
                                            Xbox Series X|S
                                        </Text>
                                    </div>

                                    <div>
                                        <Text variant="body">Editions: </Text>
                                        <Text variant="body" color="var(--cyan)">
                                            See 8 more editions of this game
                                        </Text>
                                    </div>

                                    <Text variant="body">
                                        Resident Evil 2 is a remake of 1998's Resident Evil 2. The game was not
                                        developed with the intent of improving the original, but rather a reimagining of
                                        the original story with redesigned maps, characters and story elements. Gameplay
                                        mechanics are more similar to Resident Evil 7: Biohazard though with the use of
                                        an over-the-shoulder camera.
                                    </Text>
                                </div>
                            </Panel>
                        </div>
                    </div>
                </Panel>
            </div>
        </div>
    );
}

export default GameInfoPage;
