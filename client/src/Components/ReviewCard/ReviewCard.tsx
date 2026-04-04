import style from "./ReviewCard.module.css";
import Panel from "../Panel/Panel";
import Text from "../Text/Text";
import Star from "../Star/Star";

const MAX_STARS = 5;

export type ReviewCardProps = {
    cover?: string;
    title?: string;
    description?: string;
    upvotes?: number;
    downvotes?: number;
    rating?: number;

    showUser?: boolean;
    userName?: string;
    userAvatar?: string;
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
    title = "###",
    description = "###",
    upvotes = 0,
    downvotes = 0,
    rating = 0,
    showUser = false,
    userName = "######",
    userAvatar = "https://i.pinimg.com/736x/2f/15/f2/2f15f2e8c688b3120d3d26467b06330c.jpg",
}: ReviewCardProps) {
    const normalizedRating = normalizeRating(rating);
    const stars = getStars(normalizedRating);

    return (
        <div className={style.panel}>
            <Panel type="secondary" direction="row" className={style.fullWidth}>
                {showUser ? (
                    <div className={style.userBlock}>
                        <img src={userAvatar} className={style.avatar} />
                        <Text variant="body">{userName}</Text>
                    </div>
                ) : (
                    <img src={cover} className={style.cover} />
                )}

                <div className={style.infoColumn}>
                    <div className={style.topRow}>
                        <Text variant="h2">{title}</Text>

                        <div className={style.stars}>
                            {stars.map((type, index) => (
                                <Star key={index} type={type} size={18} />
                            ))}
                        </div>
                    </div>

                    <Text variant="body">{description}</Text>

                    <div className={style.bottomRow}>
                        <a href="/review/yah" className={style.seeMore}>
                            <Text color="var(--pink)">{`> `}See More</Text>
                        </a>

                        <img src="https://cdn-icons-png.flaticon.com/512/889/889140.png" className={style.upVote} />
                        <Text variant="h3">{upvotes}</Text>
                        <img src="https://cdn-icons-png.flaticon.com/512/8255/8255194.png" className={style.upVote} />
                        <Text variant="h3">{downvotes}</Text>
                    </div>
                </div>
            </Panel>
        </div>
    );
}

export default ReviewCard;
