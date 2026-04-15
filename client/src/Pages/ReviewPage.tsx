import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { GameAPI } from "../API/Games";
import { ReviewAPI } from "../API/Reviews";
import { UserAPI } from "../API/User";
import type { CommentFull, ReviewFull, UserMe } from "../API/Types";
import style from "./ReviewPage.module.css";
import Panel from "../Components/Panel/Panel";
import Navbar from "../Components/Navbar/Navbar";
import Text from "../Components/Text/Text";
import Star from "../Components/SVGs/Star";
import CreateReviewButton from "../Components/Buttons/CreateReviewButton";
import EditButton from "../Components/Buttons/EditButton";
import Upvote from "../Components/SVGs/Upvote";
import Downvote from "../Components/SVGs/Downvote";
import { CommentAPI } from "../API/Comments";
import CommentCard, { type CommentCardProps } from "../Components/CommentCard/CommentCard";
import InputField from "../Components/InputField/InputField";
import Button from "../Components/Buttons/Button";
import buttonStyle from "../Components/Buttons/Buttons.module.css";

const MAX_STARS: number = 5;
const COMMENT_LENGTH_LIMIT: number = 1000;

function normalizeRating(rating: number): number {
    return Math.max(0, Math.min(10, rating)) / 2;
}

function getStars(rating: number): ("full" | "half" | "empty")[] {
    const stars: ("full" | "half" | "empty")[] = [];
    for (let i = 1; i <= MAX_STARS; i++) {
        if (rating >= i) stars.push("full");
        else if (rating >= i - 0.5) stars.push("half");
        else stars.push("empty");
    }
    return stars;
}

function getCoverUrl(game: any): string {
    const url: string | undefined = game?.cover?.url;
    if (!url) return "https://vglist.co/assets/no-cover-5b40e3b1.png";
    const full = url.startsWith("//") ? `https:${url}` : url;
    return full.replace("t_thumb", "t_cover_big");
}

function ReviewPage() {
    const { reviewer, reviewed } = useParams<{ reviewer: string; reviewed: string }>();
    const navigate = useNavigate();

    const [game, setGame] = useState<any>(null);
    const [review, setReview] = useState<ReviewFull | null>(null);
    const [myReview, setMyReview] = useState<ReviewFull | null>(null);
    const [isOwnReview, setIsOwnReview] = useState(false);
    const [comments, setComments] = useState<CommentCardProps[]>([]);
    const [isReplying, setIsReplying] = useState(false);
    const [yourReply, setYourReply] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!reviewer || !reviewed) return;
        async function load() {
            setLoading(true);
            setError(false);
            setMyReview(null);
            setIsOwnReview(false);
            try {
                const reviewedNum: number = parseInt(reviewed!);
                if (Number.isNaN(reviewedNum)) {
                    setError(true);
                    return;
                }

                const [gameResult, reviewResult, commentResult] = await Promise.allSettled([
                    GameAPI.getById(reviewedNum),
                    ReviewAPI.get(reviewer!, reviewedNum),
                    CommentAPI.getAll(reviewer!, reviewedNum),
                ]);
                if (gameResult.status === "fulfilled") setGame(gameResult.value);
                else setError(true);
                if (reviewResult.status === "fulfilled") setReview(reviewResult.value);
                else setError(true);
                if (commentResult.status !== "fulfilled") setError(true);

                try {
                    const me: UserMe = await UserAPI.getMe();
                    if (me.accountName === reviewer) {
                        setIsOwnReview(true);
                        setMyReview(reviewResult.status === "fulfilled" ? reviewResult.value : null);
                    } else {
                        const ownReview = await ReviewAPI.get(me.accountName, reviewedNum);
                        setMyReview(ownReview);
                    }
                    if (commentResult.status === "fulfilled") {
                        setComments(
                            commentResult.value.map((comment) => {
                                return {
                                    showUser: comment.commentator === me.accountName,
                                    userName: comment.commentator,
                                    description: comment.text,
                                    canModify: comment.commentator === me.accountName,
                                    isModifying: false,
                                };
                            })
                        );
                    }
                } catch {
                    setMyReview(null);
                }
            } catch {
                setError(true);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [reviewer, reviewed]);

    if (loading) {
        return (
            <div>
                <Navbar />
                <div className={style.mainPanel}>
                    <Panel type="main">
                        <Text color="var(--mutedText)">Loading...</Text>
                    </Panel>
                </div>
            </div>
        );
    }

    if (error || !review) {
        return (
            <div>
                <Navbar />
                <div className={style.mainPanel}>
                    <Panel type="main">
                        <Text color="var(--pink)">Failed to load review.</Text>
                    </Panel>
                </div>
            </div>
        );
    }

    const coverUrl: string = getCoverUrl(game);
    const gameName: string = game?.name ?? (reviewed ? `GAME #${reviewed}` : "GAME TITLE");
    const reviewerName: string = review?.reviewer ?? reviewer ?? "Name";
    const reviewText: string = review?.text ?? "no review found.";
    const score: number = review?.score ?? 0;

    const upvotes: number = 0;
    const downvotes: number = 0;
    const played: string = "?";
    const hoursPlayed: number = 0;
    const platform: string = "?";

    const stars: ("full" | "half" | "empty")[] = getStars(normalizeRating(score));

    function yourReplySection() {
        if (isReplying)
            return (
                <div className={style.yourReplyRow}>
                    <div className={style.yourReplyRow2}>
                        <div className={style.replyInput}>
                            <Text variant="h2">YOUR REPLY</Text>
                            <Text color={yourReply.length < COMMENT_LENGTH_LIMIT ? "var(--mutedText)" : "var(--pink)"}>
                                characters left: {COMMENT_LENGTH_LIMIT - yourReply.length}
                            </Text>
                            <Button
                                className={buttonStyle.createComment}
                                onClick={async () => {
                                    if (reviewer !== undefined && game.id !== undefined) {
                                        await CommentAPI.add(reviewer, game.id, yourReply);
                                        comments.push({
                                            showUser: true,
                                            userName: "",
                                            description: yourReply,
                                            canModify: true,
                                            isModifying: false,
                                        });
                                        setComments(comments);
                                        setIsReplying(false);
                                    }
                                }}
                                disabled={yourReply.length === 0}
                            >
                                <Text>POST</Text>
                            </Button>
                        </div>
                    </div>
                    <InputField
                        placeholder="comment this review ..."
                        multiline
                        value={yourReply}
                        onChange={(e) => {
                            if (e.target.value.length <= COMMENT_LENGTH_LIMIT) setYourReply(e.target.value);
                        }}
                    ></InputField>
                </div>
            );
        return (
            <div className={style.yourReplyRow}>
                <Button
                    className={`${buttonStyle.createReview} ${buttonStyle.createReviewFull}`}
                    color="var(--transparent)"
                    onClick={() => setIsReplying(true)}
                    aria-label="Create Reply"
                >
                    <Text variant="h2">Reply</Text>
                </Button>
            </div>
        );
    }

    return (
        <div>
            <Navbar />
            <div className={style.mainPanel}>
                <Panel type="main">
                    <div className={style.topRow}>
                        <div className={style.leftColumn}>
                            <Panel type="secondary" className={style.coverPanel}>
                                <img src={coverUrl} className={style.cover} />
                                <hr />
                                <Text className={style.gameName}>{gameName}</Text>
                            </Panel>
                            <Panel type="secondary" className={style.yourRatingPanel}>
                                <Text variant="h2">Your Rating</Text>
                                <div className={style.yourRatingContent}>
                                    <Star type="full" size={46} color="var(--pink)" />
                                    {myReview ? (
                                        <Text variant="h1">{normalizeRating(myReview.score).toFixed(1)}</Text>
                                    ) : (
                                        <CreateReviewButton gameID={reviewed} />
                                    )}
                                </div>
                            </Panel>
                        </div>

                        <div className={style.reviewPanelWrapper}>
                            <Panel type="secondary" className={style.reviewPanel}>
                                <div className={style.reviewHeader}>
                                    <div className={style.avatarCol}>
                                        <img
                                            src="https://i.pinimg.com/736x/2f/15/f2/2f15f2e8c688b3120d3d26467b06330c.jpg"
                                            className={style.avatar}
                                        />
                                        <Text variant="h3">{reviewerName}</Text>
                                    </div>
                                    <div className={style.metaCol}>
                                        <div className={style.stars}>
                                            {stars.map((type, i) => (
                                                <Star key={i} type={type} size={48} color="var(--green)" />
                                            ))}
                                        </div>
                                        <Text variant="body">
                                            Played:{" "}
                                            <Text variant="body" color="var(--cyan)">
                                                {played}
                                            </Text>
                                        </Text>
                                        <Text variant="body">
                                            Hours Played:{" "}
                                            <Text variant="body" color="var(--cyan)">
                                                {hoursPlayed}
                                            </Text>
                                        </Text>
                                        <Text variant="body">
                                            Platform:{" "}
                                            <Text variant="body" color="var(--cyan)">
                                                {platform}
                                            </Text>
                                        </Text>
                                    </div>
                                </div>
                                <Text variant="body" className={style.reviewText}>
                                    {reviewText}
                                </Text>
                                <div className={style.voteRow}>
                                    {isOwnReview && (
                                        <EditButton onClick={() => navigate(`/game/${reviewed}/review/edit`)} />
                                    )}
                                    <div className={style.voteActions}>
                                        <Upvote className={style.voteIcon} color="var(--mainText)" />
                                        <Text variant="h3">{upvotes}</Text>
                                        <Downvote className={style.voteIcon} color="var(--mainText)" />
                                        <Text variant="h3">{downvotes}</Text>
                                    </div>
                                </div>
                            </Panel>
                        </div>
                    </div>

                    {yourReplySection()}

                    <Panel type="secondary" className={style.repliesPanel}>
                        <Text variant="h2">REPLIES:</Text>
                        {comments.length === 0 ? (
                            <Text color="var(--mutedText)">No replies yet.</Text>
                        ) : (
                            comments.map((c) => (
                                <CommentCard
                                    showUser={c.showUser}
                                    userName={c.userName}
                                    description={c.description}
                                    canModify={c.canModify}
                                    isModifying={c.isModifying}
                                />
                            ))
                        )}
                    </Panel>
                </Panel>
            </div>
        </div>
    );
}

export default ReviewPage;
