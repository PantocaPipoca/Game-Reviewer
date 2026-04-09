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
import defaultPfp from "../Assets/default-pfp.png";
import style from "./CreateReviewPage.module.css";

type GameLike = {
    id: number;
    name?: string;
    cover?: { url?: string };
    platforms?: { name?: string }[];
    summary?: string;
};

const MAX_STARS = 5;

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

function CreateReviewPage() {
    const navigate = useNavigate();
    const { gameID } = useParams<{ gameID: string }>();

    const [game, setGame] = useState<GameLike | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [rating, setRating] = useState(0);
    const [hoverScore, setHoverScore] = useState<number | null>(null);
    const [played, setPlayed] = useState(true);
    const [hoursPlayed, setHoursPlayed] = useState("");
    const [platform, setPlatform] = useState("");
    const [reviewText, setReviewText] = useState("");
    const [formError, setFormError] = useState("");

    useEffect(() => {
        async function load() {
            if (!gameID) return;
            try {
                const loadedGame = (await GameAPI.getById(Number(gameID))) as unknown as GameLike | GameLike[];
                const normalizedGame = Array.isArray(loadedGame) ? (loadedGame[0] ?? null) : loadedGame;
                setGame(normalizedGame ?? null);
            } catch {
                setError(true);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [gameID]);

    useEffect(() => {
        const availablePlatforms = game?.platforms ?? [];
        if (!platform && availablePlatforms.length > 0) {
            setPlatform(availablePlatforms[0]?.name ?? "");
        }
    }, [game, platform]);

    async function handleSubmit() {
        setFormError("");
        if (!gameID) {
            setFormError("Missing game id");
            return;
        }
        if (rating <= 0) {
            setFormError("Select a rating before publishing");
            return;
        }
        if (!reviewText.trim()) {
            setFormError("Write a short review before publishing");
            return;
        }

        setSubmitting(true);
        try {
            await ReviewAPI.publish(Number(gameID), {
                text: reviewText.trim(),
                score: rating,
            });
            navigate(`/game/${gameID}`);
        } catch {
            setFormError("Failed to publish review");
        } finally {
            setSubmitting(false);
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
                        <Text color="var(--pink)">Failed to load review draft.</Text>
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
                                                <div className={style.starsRow}>
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
                                                            onMouseLeave={() => setHoverScore(null)}
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

                                <div className={style.reviewInputStack}>
                                    <InputField
                                        multiline
                                        value={reviewText}
                                        placeholder="write your review..."
                                        onChange={(e) => setReviewText(e.target.value)}
                                    />
                                </div>
                            </Panel>
                        </div>
                    </div>

                    <Button className={style.submitButton} onClick={handleSubmit} disabled={submitting}>
                        <Text variant="h3">{submitting ? `> PUBLISHING...` : `> PUBLISH REVIEW`}</Text>
                    </Button>
                    {formError && <Text color="var(--pink)">* {formError}</Text>}
                </Panel>
            </div>
        </div>
    );
}

export default CreateReviewPage;
