import style from "./ReviewCard.module.css";
import Panel from "../Panel/Panel";
import Text from "../Text/Text";
import Star from "../SVGs/Star";
import Upvote from "../SVGs/Upvote";
import Downvote from "../SVGs/Downvote";
import { Link, useNavigate } from "react-router-dom";

const MAX_STARS = 5;

export type ReviewCardProps = {
    cover?: string;
    description?: string;
    upvotes?: number;
    downvotes?: number;
    rating?: number;
    showUser?: boolean;
    userName?: string;
    userAvatar?: string;
    hoursPlayed?: number | null;
    platforms?: string[];
    reviewer: string;
    reviewed: number;
};

function normalizeRating(rating: number) {
    const clamped = Math.max(0, Math.min(10, rating));
    return clamped / 2;
}

function getStars(rating: number): ("full" | "half" | "empty")[] {
    const stars: ("full" | "half" | "empty")[] = [];

    for (let i = 1; i <= MAX_STARS; i++) {
        if (rating >= i) {
            stars.push("full");
        } else if (rating >= i - 0.5) {
            stars.push("half");
        } else {
            stars.push("empty");
        }
    }

    return stars;
}

function ReviewCard({
    cover = "https://vglist.co/assets/no-cover-5b40e3b1.png",
    description = "###",
    upvotes = 0,
    downvotes = 0,
    rating = 0,
    showUser = false,
    userName = "######",
    userAvatar = "https://i.pinimg.com/736x/2f/15/f2/2f15f2e8c688b3120d3d26467b06330c.jpg",
    hoursPlayed = null,
    platforms = [],
    reviewer,
    reviewed,
}: ReviewCardProps) {
    const normalizedRating = normalizeRating(rating);
    const stars = getStars(normalizedRating);
    const navigate = useNavigate();

    function handleUserClick() {
        navigate(`/user/${reviewer}`);
    }

    return (
        <div className={style.panel}>
            <Panel type="secondary" direction="row" className={style.fullWidth}>
                {showUser ? (
                    <div className={style.userBlock} onClick={handleUserClick} role="button" tabIndex={0}>
                        <img src={userAvatar} className={style.avatar} />
                        <Text variant="h3">{userName}</Text>
                    </div>
                ) : (
                    <img src={cover} className={style.cover} />
                )}

                <div className={style.infoColumn}>
                    <div className={style.stars}>
                        {stars.map((type, index) => (
                            <Star key={index} type={type} size={32} />
                        ))}
                    </div>

                    <Text variant="body" className={style.description} multiline>
                        {description}
                    </Text>
                    <Text variant="body" color="var(--mutedText)">
                        {`Hours Played: ${hoursPlayed ?? 0} | Platform: ${platforms.length > 0 ? platforms.join(", ") : "N/A"}`}
                    </Text>

                    <div className={style.bottomRow}>
                        <Link to={`/review/${reviewer}/${reviewed}`} className={style.seeMore}>
                            <Text variant="h3" color="var(--pink)">
                                {`> `}See More
                            </Text>
                        </Link>
                        <div className={style.voteActions}>
                            <Upvote className={style.upVote} color="var(--mainText)" />
                            <Text variant="h3">{upvotes}</Text>
                            <Downvote className={style.upVote} color="var(--mainText)" />
                            <Text variant="h3">{downvotes}</Text>
                        </div>
                    </div>
                </div>
            </Panel>
        </div>
    );
}

export default ReviewCard;
