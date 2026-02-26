import style from "./Card.module.css";
import Panel from "../Panel/Panel";
import Text from "../Text/Text";

export type GameCardProps = {
    name?: string;
    rating?: number;
    cover?: string;
};

function GameCard({
    name = "$$$$$$$$$$$$",
    rating = 0.0,
    cover = "https://vglist.co/assets/no-cover-5b40e3b1.png",
}: GameCardProps) {
    return (
        <Panel type="secondary" interactive>
            <img className={style.Cover} src={cover} />
            <div className={style.Name}>
                <Text variant="body">{name}</Text>
            </div>
            <div className={style.Rating}>
                <img className={style.Star} src="https://cdn-icons-png.flaticon.com/512/541/541415.png" />
                <Text variant="small">{rating}</Text>
            </div>
        </Panel>
    );
}

export default GameCard;
