import style from "./Card.module.css";
import Panel from "../Panel/Panel";

function GameCard() {
    return (
        <Panel>
            <img
                className={style.Cover}
                src="https://upload.wikimedia.org/wikipedia/en/3/35/ObsCureII_cover.jpg"
            />
            <div className={style.Name}>Obscure II</div>
            <div className={style.Rating}>
                <img
                    className={style.Star}
                    src="https://cdn-icons-png.flaticon.com/512/541/541415.png"
                />
                <div>4.2</div>
            </div>
        </Panel>
    );
}

export default GameCard;
