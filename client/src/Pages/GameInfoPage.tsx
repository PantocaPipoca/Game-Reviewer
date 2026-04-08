import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import style from "./GameInfoPage.module.css";
import Panel from "../Components/Panel/Panel";
import Navbar from "../Components/Navbar/Navbar";
import Text from "../Components/Text/Text";
import Star from "../Components/Star/Star";
import type { CssVar } from "../Types/Types";
import ReviewCard from "../Components/ReviewCard/ReviewCard";
import CreateReviewButton from "../Components/Buttons/CreateReviewButton";
import { GameAPI } from "../API/Games";
import { ReviewAPI } from "../API/Reviews";
import type { ReviewFull } from "../API/Types";

type RatingType = "user" | "your" | "friends";

type descriptionFieldProps = {
    label: string;
    value: string;
};

type infoItemProps = {
    title: string;
    items: string[];
};

function getRatingColor(type: RatingType): CssVar {
    if (type === "user") return "var(--cyan)";
    if (type === "your") return "var(--pink)";
    return "var(--green)";
}

function RatingRow({ type, value }: { type: RatingType; value?: number }) {
    const color: CssVar = getRatingColor(type);
    const isYourRating: boolean = type === "your";
    const displayValue: number = value ?? 0;

    const titleMap: Record<RatingType, string> = {
        user: "User Ratings",
        your: "Your Rating",
        friends: "Friends Rating",
    };

    return (
        <div className={style.ratingRow}>
            <Text variant="h2">{titleMap[type]}</Text>

            <div className={style.ratingContent}>
                <Star type="full" size={46} color={color} />
                {isYourRating ? <CreateReviewButton /> : <Text variant="h1">{displayValue.toFixed(1)}</Text>}
            </div>
        </div>
    );
}

function DescriptionField({ label, value }: descriptionFieldProps) {
    return (
        <div>
            <Text variant="body">{label}: </Text>
            <Text variant="body" color="var(--cyan)">
                {value}
            </Text>
        </div>
    );
}

function InfoSection({ title, items }: infoItemProps) {
    return (
        <>
            <hr />
            <div className={style.infoSection}>
                <Text variant="h2">{title}</Text>
                <ul>
                    {items.map((item) => (
                        <li key={item}>
                            <Text variant="body">{item}</Text>
                        </li>
                    ))}
                </ul>
            </div>
        </>
    );
}

function getCoverUrl(game: any): string {
    const url: string | undefined = game?.cover?.url;
    if (!url) return "https://vglist.co/assets/no-cover-5b40e3b1.png";
    const full = url.startsWith("//") ? `https:${url}` : url;
    return full.replace("t_thumb", "t_cover_big");
}

function getScreenshotUrl(screenshot: any): string {
    const url: string | undefined = screenshot?.url;
    if (!url) return "https://vglist.co/assets/no-cover-5b40e3b1.png";
    const full = url.startsWith("//") ? `https:${url}` : url;
    return full.replace("t_thumb", "t_screenshot_big");
}

function getArtworkUrl(artwork: any): string {
    const url: string | undefined = artwork?.url;
    if (!url) return "https://vglist.co/assets/no-cover-5b40e3b1.png";
    const full = url.startsWith("//") ? `https:${url}` : url;
    return full.replace("t_thumb", "t_1080p");
}

function computeAverageScore(reviews: ReviewFull[]): number {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum, r) => sum + r.score, 0);
    return parseFloat((total / reviews.length).toFixed(1));
}

function GameInfoPage() {
    const { gameID } = useParams<{ gameID: string }>();

    const [game, setGame] = useState<any | null>(null);
    const [reviews, setReviews] = useState<ReviewFull[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!gameID) return;

        async function load() {
            setLoading(true);
            setError(false);
            try {
                const id = parseInt(gameID!);
                const [gameResult, reviewResult] = await Promise.allSettled([
                    GameAPI.getById(id),
                    ReviewAPI.getByGame(id),
                ]);

                if (gameResult.status === "fulfilled") {
                    const igdbData = Array.isArray(gameResult.value)
                        ? (gameResult.value[0] ?? null)
                        : (gameResult.value ?? null);
                    setGame(igdbData);
                } else {
                    setError(true);
                }

                if (reviewResult.status === "fulfilled") {
                    setReviews(reviewResult.value);
                }
            } catch {
                setError(true);
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [gameID]);

    const coverUrl: string = getCoverUrl(game);
    const gameName: string = game?.name ?? "Unknown Game";
    const summary: string = game?.summary ?? "";

    const genres: string[] = (game?.genres ?? []).map((g: any) => g.name as string);
    const platforms: string[] = (game?.platforms ?? []).map((p: any) => p.name as string);
    const themes: string[] = (game?.themes ?? []).map((t: any) => t.name as string);

    const developers: string[] = (game?.involved_companies ?? [])
        .filter((ic: any) => ic.developer)
        .map((ic: any) => ic.company?.name as string)
        .filter(Boolean);

    const publishers: string[] = (game?.involved_companies ?? [])
        .filter((ic: any) => ic.publisher)
        .map((ic: any) => ic.company?.name as string)
        .filter(Boolean);

    const supportingDevs: string[] = (game?.involved_companies ?? [])
        .filter((ic: any) => ic.supporting)
        .map((ic: any) => ic.company?.name as string)
        .filter(Boolean);

    const porting: string[] = (game?.involved_companies ?? [])
        .filter((ic: any) => ic.porting)
        .map((ic: any) => ic.company?.name as string)
        .filter(Boolean);

    // First artwork, then first screenshot
    const artworks: any[] = game?.artworks ?? [];
    const screenshots: any[] = game?.screenshots ?? [];
    const mediaUrl: string =
        artworks.length > 0
            ? getArtworkUrl(artworks[0])
            : screenshots.length > 0
              ? getScreenshotUrl(screenshots[0])
              : "https://vglist.co/assets/no-cover-5b40e3b1.png";

    const averageScore: number = computeAverageScore(reviews);

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
                        <Text color="var(--pink)">Failed to load game.</Text>
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
                    <div className={style.content}>
                        <div className={style.leftColumn}>
                            <Panel type="secondary" className={style.coverPanel}>
                                <img src={coverUrl} className={style.cover} />
                                <hr />
                                <Text className={style.gameName}>{gameName}</Text>
                            </Panel>
                            <Panel type="secondary" className={style.bottomLeftRow}>
                                <RatingRow type="user" value={averageScore} />
                                <hr />
                                <RatingRow type="your" />
                                <hr />
                                <RatingRow type="friends" value={0} />

                                {developers.length > 0 && <InfoSection title="Main Developers" items={developers} />}
                                {supportingDevs.length > 0 && (
                                    <InfoSection title="Supporting Devs" items={supportingDevs} />
                                )}
                                {porting.length > 0 && <InfoSection title="Porting Developers" items={porting} />}
                                {publishers.length > 0 && <InfoSection title="Publishers" items={publishers} />}
                                {themes.length > 0 && <InfoSection title="Themes" items={themes} />}
                            </Panel>
                        </div>

                        <div className={style.rightColumn}>
                            <Panel type="secondary">
                                <img src={mediaUrl} className={style.media} />
                            </Panel>
                            <Panel type="secondary">
                                <div className={style.description}>
                                    {genres.length > 0 && <DescriptionField label="Genre" value={genres.join(", ")} />}
                                    {platforms.length > 0 && (
                                        <DescriptionField label="Platforms" value={platforms.join(", ")} />
                                    )}
                                    {summary && <Text variant="body">{summary}</Text>}
                                </div>
                            </Panel>

                            {reviews.map((review) => (
                                <ReviewCard
                                    key={`${review.reviewer}-${review.reviewed}`}
                                    title={review.reviewer}
                                    description={review.text}
                                    rating={review.score}
                                    showUser
                                    userName={review.reviewer}
                                />
                            ))}

                            {reviews.length === 0 && (
                                <Panel type="secondary">
                                    <Text color="var(--mutedText)">No reviews yet.</Text>
                                </Panel>
                            )}
                        </div>
                    </div>
                </Panel>
            </div>
        </div>
    );
}

export default GameInfoPage;
