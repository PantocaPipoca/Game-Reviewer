import { useNavigate } from "react-router-dom";
import style from "./Card.module.css";
import Panel from "../Panel/Panel";
import Text from "../Text/Text";

export type GameCardProps = {
    name?: string;
    rating?: number;
    cover?: string;
    gameID: number;
};

function GameCard({
    name = "$$$$$$$$$$$$",
    rating = 0.0,
    cover = "https://vglist.co/assets/no-cover-5b40e3b1.png",
    gameID,
}: GameCardProps) {
    const navigate = useNavigate();
    const displayedName = name.length > 14 ? `${name.slice(0, 11)}...` : name;

    const handleClick = () => {
        navigate(`/game/${gameID}`);
    };

    return (
        <Panel type="secondary" interactive onClick={handleClick}>
            <img className={style.Cover} src={cover} />
            <div className={style.Name}>
                <Text variant="body">{displayedName}</Text>
            </div>
            <div className={style.Rating}>
                <img className={style.Star} src="https://cdn-icons-png.flaticon.com/512/541/541415.png" />
                <Text variant="small">{rating}</Text>
            </div>
        </Panel>
    );
}

export default GameCard;
