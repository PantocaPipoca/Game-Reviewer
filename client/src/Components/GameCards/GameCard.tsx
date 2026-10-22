import { useNavigate } from "react-router-dom";
import style from "./Card.module.css";
import Panel from "../Panel/Panel";
import Text from "../Text/Text";

export type GameCardProps = {
    name?: string;
    cover?: string;
    gameID: number;
};

function GameCard({
    name = "$$$$$$$$$$$$",
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
            <img className={style.cover} src={cover} />
            <div className={style.name}>
                <Text variant="body" title={name}>
                    {displayedName}
                </Text>
            </div>
        </Panel>
    );
}

export default GameCard;
