import Panel from "../Panel/Panel";
import style from "./BigGameCard.module.css";

function BigGameCard() {
    return (
        <Panel direction="row">
            <img
                src="https://www.gamespot.com/a/uploads/screen_kubrick/1556/15568848/3344763-7693939071-da3dd1bae53674882038f46b61fbf726"
                className={style.KeyArt}
            />
            <div className={style.Details}>
                <div className={style.Name}>Celeste</div>
                <div>
                    <span className={style.Label}>Genre:</span>
                    <span className={style.Value}>
                        Platform, Adventure, Indie
                    </span>
                </div>

                <div>
                    <span className={style.Label}>Developer:</span>
                    <span className={style.Value}>Extremely OK Games</span>
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
    );
}

export default BigGameCard;
