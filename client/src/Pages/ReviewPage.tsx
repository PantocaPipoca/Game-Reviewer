import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { GameAPI } from "../API/Games";
import { ReviewAPI } from "../API/Reviews";
import { UserAPI } from "../API/User";
import type { CommentFull, ReviewFull, UserMe, UserPublic } from "../API/Types";
import style from "./ReviewPage.module.css";
import Panel from "../Components/Panel/Panel";
import Navbar from "../Components/Navbar/Navbar";
import Text from "../Components/Text/Text";
import Star from "../Components/SVGs/Star";
import CreateReviewButton from "../Components/Buttons/CreateReviewButton";
import EditButton from "../Components/Buttons/EditButton";
import ReviewReactions from "../Components/ReviewReactions/ReviewReactions";
import { CommentAPI } from "../API/Comments";
import InputField from "../Components/InputField/InputField";
import Button from "../Components/Buttons/Button";
import buttonStyle from "../Components/Buttons/Buttons.module.css";
import commentStyle from "./CommentCard.module.css";
import { REVIEW_CONSTS } from "../Types/Consts";

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

async function makeComments(comments: CommentFull[], reviewer: string, reviewed: number, user?: UserMe) {
    const target: CommentCardProps[] = [];
    const size: number = comments.length;
    for (var i = 0; i < size; i++) {
        const current: CommentFull = comments[i];
        const us: UserPublic = await UserAPI.getByUsername(current.commentator);
        target.push({
            reviewer,
            reviewed,
            showUser: true,
            userName: current.commentator,
            displayName: us.userData.displayName,
            userAvatar: us.avatar ?? "https://i.pinimg.com/736x/2f/15/f2/2f15f2e8c688b3120d3d26467b06330c.jpg",
            description: current.text,
            date: current.createdAt,
            id: current.id,
            canModify: user !== undefined && current.commentator === user.accountName,
            isModifying: false,
        } as CommentCardProps);
    }
    return target;
}

type CommentCardProps = {
    reviewer?: string;
    reviewed?: number;
    showUser: boolean;
    userName: string;
    displayName: string;
    userAvatar?: string;
    description: string;
    date: string;
    id: string;
    canModify: boolean;
    isModifying: boolean;
    setReplyToEdit: React.Dispatch<React.SetStateAction<string | undefined>>;
    setReplyToEditText: React.Dispatch<React.SetStateAction<string>>;
    setReplyToEditFinish: (id: string, text: string) => void;
};

const months: string[] = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

function parseDate(date: string): string {
    let arr: string[] = date.replace(/\.[0-9]+Z/g, "").split(/[T:-]+/g);
    if (arr.length != 6) return "???";
    const index: number = +arr[1];
    if (isNaN(index) || index <= 0 || index > months.length) return "???";
    return arr[3] + ":" + arr[4] + ":" + arr[5] + ", " + months[index - 1] + " " + arr[2] + ", " + arr[0];
}

function CommentCard({
    reviewer,
    reviewed,
    showUser = false,
    displayName,
    userAvatar = "https://i.pinimg.com/736x/2f/15/f2/2f15f2e8c688b3120d3d26467b06330c.jpg",
    description = "",
    date = "",
    id,
    canModify,
    isModifying,
    setReplyToEdit,
    setReplyToEditText,
    setReplyToEditFinish,
}: CommentCardProps) {
    return (
        <div className={commentStyle.panel}>
            <Panel type="secondary" direction="row" className={commentStyle.fullWidth}>
                {showUser ? (
                    <div className={commentStyle.userBlock} tabIndex={0}>
                        <img src={userAvatar} className={commentStyle.avatar} />
                        <Text variant="h3">{displayName}</Text>
                    </div>
                ) : (
                    <div></div>
                )}
                {isModifying ? (
                    <div flex-direction="column" className={commentStyle.fullWidth}>
                        <Text variant="small" color="var(--mutedText)">
                            characters left:{" "}
                        </Text>
                        <Text
                            variant="small"
                            color={
                                REVIEW_CONSTS.maxCommentLength === description.length ? "var(--pink)" : "var(--cyan)"
                            }
                        >
                            {REVIEW_CONSTS.maxCommentLength - description.length}
                        </Text>
                        <InputField
                            value={description}
                            multiline
                            placeholder="edit your comment here..."
                            onChange={(e) => {
                                if (e.target.value.length <= REVIEW_CONSTS.maxCommentLength)
                                    setReplyToEditText(e.target.value);
                            }}
                        />
                        <Button
                            className={`${commentStyle.editReplyButton}`}
                            color="var(--transparent)"
                            onClick={async () => {
                                if (reviewer !== undefined && reviewed !== undefined) {
                                    setReplyToEditFinish(id, description);
                                    setReplyToEdit(undefined);
                                    await CommentAPI.edit(reviewer, reviewed, id, description);
                                }
                            }}
                            aria-label="Create Reply"
                        >
                            <Text variant="h3">FINISH EDITING</Text>
                        </Button>
                    </div>
                ) : (
                    <div flex-direction="column" className={commentStyle.fullWidth}>
                        <Text variant="small" color="var(--cyan)">
                            Posted on {parseDate(date)}
                        </Text>
                        <Text variant="small" multiline>
                            {`\n` + description}
                        </Text>
                    </div>
                )}
                {canModify && !isModifying && (
                    <EditButton
                        onClick={() => {
                            setReplyToEdit(id);
                            setReplyToEditText(description);
                        }}
                    />
                )}
            </Panel>
        </div>
    );
}

function ReviewPage() {
    const { reviewer, reviewed } = useParams<{ reviewer: string; reviewed: string }>();
    const navigate = useNavigate();

    const [game, setGame] = useState<any>(null);
    const [review, setReview] = useState<ReviewFull | null>(null);
    const [myReview, setMyReview] = useState<ReviewFull | null>(null);
    const [isOwnReview, setIsOwnReview] = useState(false);
    const [comments, setComments] = useState<CommentCardProps[]>([]);
    const [authUserName, setAuthUserName] = useState<string | undefined>(undefined);
    const [authDisplayName, setAuthDisplayName] = useState<string | undefined>(undefined);
    const [isReplying, setIsReplying] = useState(false);
    const [yourReply, setYourReply] = useState("");
    const [replyToEdit, setReplyToEdit] = useState<string | undefined>(undefined);
    const [replyToEditText, setReplyToEditText] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const reviewedNum: number | undefined = reviewed ? parseInt(reviewed) : undefined;

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

                let writeComments: boolean = true;
                try {
                    const me: UserMe = await UserAPI.getMe();
                    console.log(me);
                    setAuthUserName(me.accountName);
                    setAuthDisplayName(me.userData.displayName);
                    if (commentResult.status === "fulfilled") {
                        setComments(await makeComments(commentResult.value, reviewer!, reviewedNum, me));
                        writeComments = false;
                    }
                    if (me.accountName === reviewer) {
                        setIsOwnReview(true);
                        setMyReview(reviewResult.status === "fulfilled" ? reviewResult.value : null);
                    } else {
                        const ownReview = await ReviewAPI.get(me.accountName, reviewedNum);
                        setMyReview(ownReview);
                    }
                } catch {
                    console.log("NO");
                    setMyReview(null);
                    if (writeComments && commentResult.status === "fulfilled")
                        setComments(await makeComments(commentResult.value, reviewer!, reviewedNum));
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

    const platform: string = review?.platforms?.length ? review.platforms.join(", ") : "N/A";
    const hoursPlayed: number = review?.hoursPlayed ?? 0;
    const played: string = hoursPlayed > 0 ? "YES" : "NO";
    const stars: ("full" | "half" | "empty")[] = getStars(normalizeRating(score));

    comments.sort((c1, c2) => c2.date.localeCompare(c1.date));

    function setReplyToEditFinish(id: string, text: string) {
        for (var i = 0; i < comments.length; i++)
            if (comments[i].id === id) {
                comments[i].description = text;
                break;
            }
    }

    function yourReplySection() {
        if (authUserName === undefined || authDisplayName === undefined)
            return (
                <div className={style.yourReplyRow}>
                    <Button
                        className={`${buttonStyle.createReview} ${buttonStyle.createReviewFull}`}
                        color="var(--transparent)"
                        onClick={() => navigate("/login")}
                        aria-label="Create Reply"
                    >
                        <Text variant="h3">LOGIN TO REPLY</Text>
                    </Button>
                </div>
            );
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
                                        const result: CommentFull = await CommentAPI.add(reviewer, game.id, yourReply);
                                        comments.unshift({
                                            reviewer,
                                            reviewed: game.id,
                                            showUser: true,
                                            userName: authUserName,
                                            displayName: authDisplayName,
                                            description: yourReply,
                                            canModify: true,
                                            isModifying: false,
                                            date: result.createdAt,
                                            id: result.id,
                                            setReplyToEdit,
                                            setReplyToEditText,
                                            setReplyToEditFinish,
                                        });
                                        setComments(comments);
                                        setIsReplying(false);
                                        setYourReply("");
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
                    <Text variant="h3">REPLY</Text>
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
                                <Text variant="body" className={style.reviewText} multiline>
                                    {reviewText}
                                </Text>
                                <div className={style.voteRow}>
                                    {isOwnReview && (
                                        <EditButton onClick={() => navigate(`/game/${reviewed}/review/edit`)} />
                                    )}
                                    {reviewer && reviewedNum !== undefined ? (
                                        <ReviewReactions
                                            className={style.voteActions}
                                            reviewer={reviewer}
                                            reviewed={reviewedNum}
                                        />
                                    ) : null}
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
                                    reviewer={c.reviewer}
                                    reviewed={c.reviewed}
                                    showUser={c.showUser}
                                    userName={c.userName}
                                    displayName={c.displayName}
                                    description={
                                        replyToEdit !== undefined && replyToEdit === c.id
                                            ? replyToEditText
                                            : c.description
                                    }
                                    canModify={c.canModify}
                                    isModifying={replyToEdit !== undefined && replyToEdit === c.id}
                                    date={c.date}
                                    id={c.id}
                                    setReplyToEdit={setReplyToEdit}
                                    setReplyToEditText={setReplyToEditText}
                                    setReplyToEditFinish={setReplyToEditFinish}
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
