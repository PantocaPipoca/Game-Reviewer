import style from "./Card.module.css";
import Panel from "../Panel/Panel";
import Text from "../Text/Text";

function GameCard() {
    return (
        <Panel type="secondary">
            <img
                className={style.Cover}
                src="https://upload.wikimedia.org/wikipedia/en/3/35/ObsCureII_cover.jpg"
            />
            <div className={style.Name}>
                <Text variant="body">Obscure II</Text>
            </div>
            <div className={style.Rating}>
                <img
                    className={style.Star}
                    src="https://cdn-icons-png.flaticon.com/512/541/541415.png"
                />
                <Text variant="small">4.2</Text>
            </div>
        </Panel>
    );
}

export default GameCard;
