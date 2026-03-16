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
};

function BigGameCard({
    name = "###",
    cover = NOT_FOUND_IMAGE,
    genres = ["###", "###"],
    developer = "###",
    collage = [NOT_FOUND_IMAGE, NOT_FOUND_IMAGE, NOT_FOUND_IMAGE, NOT_FOUND_IMAGE],
}: BigGameCardProps) {
    return (
        <div className={style.Frame}>
            <Panel type="secondary" direction="row" interactive>
                <img src={cover} className={style.KeyArt} />
                <div className={style.Details}>
                    <Text variant="h2">{name}</Text>
                    <div>
                        <Text variant="body">Genre: </Text>
                        <Text variant="body" className={style.Value}>
                            {genres.join(", ")}
                        </Text>
                    </div>

                    <div>
                        <Text variant="body">Developer: </Text>
                        <Text variant="body" className={style.Value}>
                            {developer}
                        </Text>
                    </div>
                    <div className={style.Collage}>
                        {collage.map((image) => (
                            <img src={image} className={style.Image} />
                        ))}
                    </div>
                </div>
            </Panel>
        </div>
    );
}

export default BigGameCard;
