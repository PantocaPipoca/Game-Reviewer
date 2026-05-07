import { useNavigate } from "react-router-dom";
import Panel from "../Panel/Panel";
import Text from "../Text/Text";
import style from "./BigGameCard.module.css";

const NOT_FOUND_IMAGE: string =
    "https://media.istockphoto.com/id/2260160502/video/404-not-found-error-message-4k-alpha-channel.jpg?s=640x640&k=20&c=DYsUfqWQTdfrV--wLq6BSnu97A6UaL8-RtGDQwNWw2Q=";

export type BigGameCardProps = {
    name?: string;
    cover?: string;
    genres?: string[];
    developer?: string;
    collage?: string[];
    gameID: number;
};

function BigGameCard({
    name = "###",
    cover = NOT_FOUND_IMAGE,
    genres = ["###", "###"],
    developer = "###",
    collage = [NOT_FOUND_IMAGE, NOT_FOUND_IMAGE, NOT_FOUND_IMAGE, NOT_FOUND_IMAGE],
    gameID,
}: BigGameCardProps) {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/game/${gameID}`);
    };
    return (
        <div className={style.frame}>
            <Panel type="secondary" direction="row" interactive onClick={handleClick}>
                <img src={cover} className={style.keyArt} />
                <div className={style.details}>
                    <Text variant="h2" className={style.name} title={name}>
                        {name}
                    </Text>
                    <Text variant="body" className={style.genreLine} title={`Genre: ${genres.join(", ")}`}>
                        Genre: <span className={style.value}>{genres.join(", ")}</span>
                    </Text>

                    <Text variant="body" className={style.developerLine} title={`Developer: ${developer}`}>
                        Developer: <span className={style.value}>{developer}</span>
                    </Text>
                    <div className={style.collage}>
                        {collage.map((image) => (
                            <img src={image} className={style.image} />
                        ))}
                    </div>
                </div>
            </Panel>
        </div>
    );
}

export default BigGameCard;
