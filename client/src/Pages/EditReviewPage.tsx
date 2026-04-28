import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../Components/Navbar/Navbar";
import Panel from "../Components/Panel/Panel";
import Text from "../Components/Text/Text";
import InputField from "../Components/InputField/InputField";
import Dropdown from "../Components/InputField/Dropdown";
import Button from "../Components/Buttons/Button";
import Star from "../Components/SVGs/Star";
import { GameAPI } from "../API/Games";
import { ReviewAPI } from "../API/Reviews";
import { UserAPI } from "../API/User";
import defaultPfp from "../Assets/default-pfp.png";
import style from "./EditReviewPage.module.css";
import { REVIEW_CONSTS, REVIEW_ERRORS } from "../Types/Consts";
import { useSuccessPopup } from "../Hooks/SuccessPopup";

type GameLike = {
    id: number;
    name?: string;
    cover?: { url?: string };
    platforms?: { name?: string }[];
    summary?: string;
};

const MAX_STARS: number = 5;

function getCoverUrl(game: GameLike | null): string {
    const url = game?.cover?.url;
    if (!url) return "https://vglist.co/assets/no-cover-5b40e3b1.png";
    const full = url.startsWith("//") ? `https:${url}` : url;
    return full.replace("t_thumb", "t_cover_big");
}

function getStars(score: number): ("full" | "half" | "empty")[] {
    const normalized = Math.max(0, Math.min(10, score)) / 2;
    return Array.from({ length: MAX_STARS }, (_, i) => {
        const pos = i + 1;
        if (normalized >= pos) return "full";
        if (normalized >= pos - 0.5) return "half";
        return "empty";
    });
}

function EditReviewPage() {
    const navigate = useNavigate();
    const { gameID } = useParams<{ gameID: string }>();
    const { showSuccess } = useSuccessPopup();

    const [game, setGame] = useState<GameLike | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const [rating, setRating] = useState(0);
    const [hoverScore, setHoverScore] = useState<number | null>(null);
    const [played, setPlayed] = useState(true);
    const [hoursPlayed, setHoursPlayed] = useState("");
    const [platform, setPlatform] = useState("");
    const [reviewText, setReviewText] = useState("");
    const [formError, setFormError] = useState("");

    useEffect(() => {
        if (!gameID) return;
        async function load() {
            setLoading(true);
            setError(false);
            try {
                const id = parseInt(gameID!);
                const me = await UserAPI.getMe();

                const [gameResult, reviewResult] = await Promise.allSettled([
                    GameAPI.getById(id),
                    ReviewAPI.get(me.accountName, id),
                ]);

                if (gameResult.status === "fulfilled") {
                    const raw = gameResult.value;
                    const normalized: GameLike = Array.isArray(raw) ? (raw[0] ?? null) : raw;
                    setGame(normalized ?? null);
                } else {
                    setError(true);
                }

                if (reviewResult.status === "fulfilled") {
                    const review = reviewResult.value;
                    setRating(review.score);
                    setReviewText(review.text);
                    const reviewHoursPlayed = review.hoursPlayed ?? 0;
                    setHoursPlayed(reviewHoursPlayed > 0 ? `${reviewHoursPlayed}` : "");
                    setPlayed(reviewHoursPlayed > 0);
                    setPlatform(review.platforms[0] ?? "");
                } else {
                    navigate(`/game/${gameID}/review/create`, { replace: true });
                }
            } catch {
                setError(true);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [gameID, navigate]);

    useEffect(() => {
        if (!played) {
            setHoursPlayed("");
            setPlatform("");
            return;
        }

        const availablePlatforms = game?.platforms ?? [];
        if (!platform && availablePlatforms.length > 0) {
            setPlatform(availablePlatforms[0]?.name ?? "");
        }
    }, [game, played, platform]);

    async function handleSubmit() {
        setFormError("");
        if (!gameID) {
            setFormError(REVIEW_ERRORS.missingGameId);
            return;
        }
        if (rating <= 0) {
            setFormError(REVIEW_ERRORS.noRatingAlter);
            return;
        }
        if (!reviewText.trim()) {
            setFormError(REVIEW_ERRORS.noReviewAlter);
            return;
        }
        if (played) {
            const normalizedHours = Number(hoursPlayed);
            if (!hoursPlayed || Number.isNaN(normalizedHours) || normalizedHours <= 0) {
                setFormError(REVIEW_ERRORS.hoursPlayedRequired);
                return;
            }
            if (!platform.trim()) {
                setFormError(REVIEW_ERRORS.platformRequired);
                return;
            }
        }

        setSubmitting(true);
        try {
            const normalizedHoursPlayed = played ? Number(hoursPlayed) : 0;
            const normalizedPlatforms = played && platform.trim() ? [platform.trim()] : [];
            await ReviewAPI.update(Number(gameID), {
                text: reviewText.trim(),
                score: rating,
                hoursPlayed: normalizedHoursPlayed,
                platforms: normalizedPlatforms,
            });
            showSuccess("Review updated successfully.", 3);
            navigate(`/game/${gameID}`);
        } catch {
            setFormError(REVIEW_ERRORS.failedSave);
        } finally {
            setSubmitting(false);
        }
    }

    async function handleDelete() {
        if (!gameID) return;
        setDeleting(true);
        try {
            await ReviewAPI.remove(Number(gameID));
            showSuccess("Review deleted successfully.", 3);
            navigate(`/game/${gameID}`);
        } catch {
            setFormError(REVIEW_ERRORS.failedDel);
            setShowDeleteConfirm(false);
        } finally {
            setDeleting(false);
        }
    }

    function handleStarClick(starIndex: number, clientX: number, element: HTMLButtonElement) {
        const bounds = element.getBoundingClientRect();
        const isLeftHalf = clientX - bounds.left < bounds.width / 2;
        setRating(isLeftHalf ? (starIndex - 1) * 2 + 1 : starIndex * 2);
    }

    function handleStarMouseMove(starIndex: number, clientX: number, element: HTMLButtonElement) {
        const bounds = element.getBoundingClientRect();
        const isLeftHalf = clientX - bounds.left < bounds.width / 2;
        setHoverScore(isLeftHalf ? (starIndex - 1) * 2 + 1 : starIndex * 2);
    }

    const displayScore = hoverScore ?? rating;
    const coverUrl = getCoverUrl(game);
    const gameName = game?.name ?? "Unknown Game";
    const platformOptions =
        game?.platforms
            ?.map((p) => p?.name?.trim() ?? "")
            .filter((name, index, arr): name is string => !!name && arr.indexOf(name) === index)
            .map((name) => ({ value: name, label: name })) ?? [];

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

    if (error || !game) {
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

    return (
        <div>
            <Navbar />
            <div className={style.mainPanel}>
                <Panel type="main">
                    <div className={style.headerRow}>
                        <Text variant="h2" color="var(--mutedText)">
                            EDITING REVIEW
                        </Text>
                        <Button
                            className={style.deleteButton}
                            onClick={() => setShowDeleteConfirm(true)}
                            disabled={deleting}
                            color="var(--transparent)"
                        >
                            <Text variant="h3" color="var(--pink)">{`> DELETE`}</Text>
                        </Button>
                    </div>

                    <div className={style.topRow}>
                        <div className={style.leftColumn}>
                            <Panel type="secondary" direction="column" className={style.coverPanel}>
                                <img src={coverUrl} className={style.cover} />
                                <hr />
                                <Text className={style.gameName}>{gameName}</Text>
                            </Panel>
                        </div>

                        <div className={style.rightPanelWrapper}>
                            <Panel type="secondary" className={style.rightPanel}>
                                <div className={style.topBlock}>
                                    <div className={style.avatarBlock}>
                                        <img src={defaultPfp} className={style.avatar} />
                                        <Text variant="body" color="var(--mutedText)">
                                            you
                                        </Text>
                                    </div>

                                    <div className={style.metaStack}>
                                        <div className={style.fieldRow}>
                                            <Text variant="body" className={style.fieldLabel}>
                                                Rating:
                                            </Text>
                                            <div className={style.fieldValue}>
                                                <div
                                                    className={style.starsRow}
                                                    onMouseLeave={() => setHoverScore(null)}
                                                >
                                                    {getStars(displayScore).map((type, i) => (
                                                        <button
                                                            key={i}
                                                            className={style.starButton}
                                                            onClick={(e) =>
                                                                handleStarClick(i + 1, e.clientX, e.currentTarget)
                                                            }
                                                            onMouseMove={(e) =>
                                                                handleStarMouseMove(i + 1, e.clientX, e.currentTarget)
                                                            }
                                                        >
                                                            <Star type={type} size={42} color="var(--green)" />
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className={style.fieldRow}>
                                            <Text variant="body" className={style.fieldLabel}>
                                                Played:
                                            </Text>
                                            <div className={style.fieldValue}>
                                                <div
                                                    className={`${style.toggle} ${played ? style.toggleOn : ""}`}
                                                    onClick={() => setPlayed((p) => !p)}
                                                />
                                                <Text variant="body" color={played ? "var(--green)" : "var(--pink)"}>
                                                    {played ? "YES" : "NO"}
                                                </Text>
                                            </div>
                                        </div>

                                        <div className={style.fieldRow}>
                                            <Text variant="body" className={style.fieldLabel}>
                                                Hours Played:
                                            </Text>
                                            <div className={style.fieldValue}>
                                                <InputField
                                                    type="number"
                                                    value={hoursPlayed}
                                                    placeholder="0"
                                                    onChange={(e) => setHoursPlayed(e.target.value.replace(/\D/g, ""))}
                                                    disabled={!played}
                                                />
                                            </div>
                                        </div>

                                        <div className={style.fieldRow}>
                                            <Text variant="body" className={style.fieldLabel}>
                                                Platform:
                                            </Text>
                                            <div className={style.fieldValue}>
                                                <Dropdown
                                                    value={platform}
                                                    onChange={(value) => setPlatform(value)}
                                                    disabled={!played}
                                                    options={
                                                        platformOptions.length > 0
                                                            ? platformOptions
                                                            : [{ value: "", label: "No platforms available" }]
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <Text
                                    color={
                                        reviewText.length < REVIEW_CONSTS.maxCommentLength
                                            ? "var(--mutedText)"
                                            : "var(--pink)"
                                    }
                                >
                                    characters left: {REVIEW_CONSTS.maxCommentLength - reviewText.length}
                                </Text>
                                <div className={style.reviewInputStack}>
                                    <InputField
                                        multiline
                                        value={reviewText}
                                        placeholder="write your review..."
                                        onChange={(e) => {
                                            if (e.target.value.length <= REVIEW_CONSTS.maxCommentLength)
                                                setReviewText(e.target.value);
                                            else setFormError(REVIEW_ERRORS.reviewTooLong);
                                        }}
                                    />
                                </div>
                            </Panel>
                        </div>
                    </div>

                    <Button className={style.submitButton} onClick={handleSubmit} disabled={submitting}>
                        <Text variant="h3">{submitting ? `> SAVING...` : `> SAVE CHANGES`}</Text>
                    </Button>
                    {formError && <Text color="var(--pink)">* {formError}</Text>}
                </Panel>
            </div>

            {showDeleteConfirm && (
                <div className={style.overlayBackdrop}>
                    <div className={style.confirmPanel}>
                        <Text variant="h2">DELETE REVIEW?</Text>
                        <Text color="var(--mutedText)">This action cannot be undone.</Text>
                        <div className={style.confirmButtons}>
                            <Button
                                className={style.confirmDeleteButton}
                                onClick={handleDelete}
                                disabled={deleting}
                                color="var(--transparent)"
                            >
                                <Text variant="h3" color="var(--pink)">
                                    {deleting ? `> DELETING...` : `> YES, DELETE`}
                                </Text>
                            </Button>
                            <Button
                                className={style.cancelButton}
                                onClick={() => setShowDeleteConfirm(false)}
                                disabled={deleting}
                                color="var(--transparent)"
                            >
                                <Text variant="h3">{`> CANCEL`}</Text>
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default EditReviewPage;
