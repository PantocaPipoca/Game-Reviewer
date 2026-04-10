import style from "./GameExpo.module.css";

export type GameExpoProps = {
    url: string;
    isVideo: boolean;
};

function GameExpo({ isVideo, url }: GameExpoProps) {
    if (isVideo) {
        // Handles videos
        return (
            <div className={style.video}>
                <iframe className={style.video} width="640" height="220%" src={url}></iframe>
            </div>
        );
    } else {
        // Handles static promotional images
        return <img src={url} className={style.media} />;
    }
}

export default GameExpo;
