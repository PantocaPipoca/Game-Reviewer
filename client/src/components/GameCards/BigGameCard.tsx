import Panel from "../Panel/Panel";
import Text from "../Text/Text";
import style from "./BigGameCard.module.css";
import Button from "../Buttons/Button";

function BigGameCard() {
    return (
        <div className={style.Frame}>
            <div className={style.NavButtonLeft}>
                <Button>{"<"}</Button>
            </div>
            <Panel type="secondary" direction="row" interactive>
                <img
                    src="https://www.gamespot.com/a/uploads/screen_kubrick/1556/15568848/3344763-7693939071-da3dd1bae53674882038f46b61fbf726"
                    className={style.KeyArt}
                />
                <div className={style.Details}>
                    <Text variant="h2">Celeste</Text>
                    <div>
                        <Text variant="body">Genre: </Text>
                        <Text variant="body" className={style.Value}>
                            Platform, Adventure, Indie
                        </Text>
                    </div>

                    <div>
                        <Text variant="body">Developer: </Text>
                        <Text variant="body" className={style.Value}>
                            Extremely OK Games
                        </Text>
                    </div>
                    <div className={style.Collage}>
                        <img
                            src="https://www.gamespot.com/a/uploads/screen_kubrick/1556/15568848/3344763-7693939071-da3dd1bae53674882038f46b61fbf726"
                            className={style.Image}
                        />
                        <img
                            src="https://www.gamespot.com/a/uploads/screen_kubrick/1556/15568848/3344763-7693939071-da3dd1bae53674882038f46b61fbf726"
                            className={style.Image}
                        />
                        <img
                            src="https://www.gamespot.com/a/uploads/screen_kubrick/1556/15568848/3344763-7693939071-da3dd1bae53674882038f46b61fbf726"
                            className={style.Image}
                        />
                        <img
                            src="https://www.gamespot.com/a/uploads/screen_kubrick/1556/15568848/3344763-7693939071-da3dd1bae53674882038f46b61fbf726"
                            className={style.Image}
                        />
                    </div>
                </div>
            </Panel>
            <div className={style.NavButtonRight}>
                <Button>{">"}</Button>
            </div>
        </div>
    );
}

export default BigGameCard;
