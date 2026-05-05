import { useCallback, useEffect, useState, type ReactNode } from "react";
import Navbar from "../Components/Navbar/Navbar";
import BigGameCard, { type BigGameCardProps } from "../Components/GameCards/BigGameCard";
import GameCard, { type GameCardProps } from "../Components/GameCards/GameCard";
import Carousel from "../Components/Carousel/Carousel";
import Panel from "../Components/Panel/Panel";
import style from "./MainPage.module.css";
import Text from "../Components/Text/Text";
import { GameAPI } from "../API/Games";
import type { BigGameCover } from "../API/Types";
import { Link } from "react-router-dom";
import { isAuthenticated } from "../API/Auth";

const FRIEND_RECOMENDED: GameCardProps[] = [
    {
        name: "Elden Ring",
        rating: 4.9,
        cover: "https://upload.wikimedia.org/wikipedia/en/b/b9/Elden_Ring_Box_art.jpg",
        gameID: 119133,
    },
    {
        name: "Dark Souls III",
        rating: 4.8,
        cover: "https://m.media-amazon.com/images/M/MV5BNzQzODQ3YzktNTM1Yy00NmNmLTk3NTItNGVlY2M1MzI4MjQ0XkEyXkFqcGc@._V1_QL75_UX190_CR0,2,190,281_.jpg",
        gameID: 11133,
    },
    {
        name: "Sekiro: Shadows Die Twice",
        rating: 4.8,
        cover: "https://upload.wikimedia.org/wikipedia/en/6/6e/Sekiro_art.jpg",
        gameID: 76882,
    },
    {
        name: "Cuphead",
        rating: 4.7,
        cover: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTm4TDov1aLCggQZLcimMB2D-i36w1lkfN_0w&s",
        gameID: 9061,
    },
    {
        name: "Disco Elysium",
        rating: 4.9,
        cover: "https://upload.wikimedia.org/wikipedia/en/0/0d/Disco_Elysium_Poster.jpeg",
        gameID: 26472,
    },
];

const FALLBACK_COVER = "https://vglist.co/assets/no-cover-5b40e3b1.png";

function toUrl(url: string | undefined, size: string): string {
    if (!url) return FALLBACK_COVER;
    const full = url.startsWith("//") ? `https:${url}` : url;
    return full.replace("t_thumb", size);
}

function toBigGameCardProps(game: BigGameCover): BigGameCardProps {
    const artwork = game.artworks?.[0];
    const collage = game.screenshots?.map((s) => toUrl(s.url, "t_screenshot_big")).slice(0, 4);
    return {
        gameID: game.id ?? 0,
        name: game.name ?? "Unknown",
        cover: artwork ? toUrl(artwork.url, "t_1080p") : toUrl(game.cover?.url, "t_cover_big"),
        genres: (game.genres?.map((g) => g.name).filter(Boolean) as string[]) || ["Unknown"],
        developer: game.involved_companies?.find((c) => c.developer)?.company?.name ?? "Unknown",
        collage: collage?.length ? collage : Array(4).fill(FALLBACK_COVER),
    };
}

function toGameCardProps(game: BigGameCover): GameCardProps {
    return {
        gameID: game.id ?? 0,
        name: game.name ?? "Unknown",
        cover: toUrl(game.cover?.url, "t_cover_big"),
    };
}

function Section({ title, href, children }: { title: string; href: string; children: ReactNode }) {
    return (
        <div className={style.section}>
            <div className={style.header}>
                <Text>{title}</Text>
                <Link to={href} className={style.seeMore}>
                    <Text color="var(--pink)">{`> `}See More</Text>
                </Link>
            </div>
            {children}
        </div>
    );
}

const POPULAR_BATCH = 5;
const RECOMMENDED_BATCH = 10;

function MainPage() {
    const [popular, setPopular] = useState<BigGameCover[]>([]);
    const [popularOffset, setPopularOffset] = useState(0);
    const [popularHasMore, setPopularHasMore] = useState(true);
    const [loadingPopular, setLoadingPopular] = useState(true);
    const [popularDone, setPopularDone] = useState(false);

    const [recommended, setRecommended] = useState<BigGameCover[]>([]);
    const [recommendedOffset, setRecommendedOffset] = useState(0);
    const [recommendedHasMore, setRecommendedHasMore] = useState(true);
    const [loadingRecommended, setLoadingRecommended] = useState(true);
    const [recommendedDone, setRecommendedDone] = useState(false);

    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        isAuthenticated()
            .then(setIsLoggedIn)
            .catch(() => {});
    }, []);

    useEffect(() => {
        GameAPI.getPopular(0, POPULAR_BATCH)
            .then((data) => {
                const valid = data.filter((g) => g.id);
                setPopular(valid);
                setPopularHasMore(valid.length === POPULAR_BATCH);
            })
            .catch(() => {
                setPopular([]);
            })
            .finally(() => {
                setLoadingPopular(false);
                setPopularDone(true);
            });
    }, []);

    useEffect(() => {
        GameAPI.getRecommended(0, RECOMMENDED_BATCH)
            .catch(() => GameAPI.getPopular(0, RECOMMENDED_BATCH))
            .then((data) => {
                const valid = (data as BigGameCover[]).filter((g) => g.id);
                setRecommended(valid);
                setRecommendedHasMore(valid.length === RECOMMENDED_BATCH);
            })
            .catch(() => {
                setRecommended([]);
            })
            .finally(() => {
                setLoadingRecommended(false);
                setRecommendedDone(true);
            });
    }, []);

    const loadMorePopular = useCallback(async () => {
        if (loadingPopular || !popularHasMore) return;
        setLoadingPopular(true);
        const next = popularOffset + POPULAR_BATCH;
        try {
            const data = await GameAPI.getPopular(next, POPULAR_BATCH);
            const valid = data.filter((g) => g.id);
            setPopular((prev) => {
                const ids = new Set(prev.map((g) => g.id));
                return [...prev, ...valid.filter((g) => !ids.has(g.id))];
            });
            setPopularOffset(next);
            setPopularHasMore(valid.length === POPULAR_BATCH);
        } catch {
        } finally {
            setLoadingPopular(false);
        }
    }, [loadingPopular, popularHasMore, popularOffset]);

    const loadMoreRecommended = useCallback(async () => {
        if (loadingRecommended || !recommendedHasMore) return;
        setLoadingRecommended(true);
        const next = recommendedOffset + RECOMMENDED_BATCH;
        try {
            const data = await GameAPI.getRecommended(next, RECOMMENDED_BATCH).catch(() =>
                GameAPI.getPopular(next, RECOMMENDED_BATCH)
            );
            const valid = (data as BigGameCover[]).filter((g) => g.id);
            setRecommended((prev) => {
                const ids = new Set(prev.map((g) => g.id));
                return [...prev, ...valid.filter((g) => !ids.has(g.id))];
            });
            setRecommendedOffset(next);
            setRecommendedHasMore(valid.length === RECOMMENDED_BATCH);
        } catch {
        } finally {
            setLoadingRecommended(false);
        }
    }, [loadingRecommended, recommendedHasMore, recommendedOffset]);

    const showPopular = loadingPopular || popular.length > 0;
    const showRecommended = loadingRecommended || recommended.length > 0;
    const showFriends = FRIEND_RECOMENDED.length > 0;

    return (
        <div>
            <Navbar />
            <div className={style.mainPanel}>
                <Panel type="main">
                    {!isLoggedIn && (
                        <div className={style.hero}>
                            <div className={style.heroIntro}>
                                <Text variant="logo" color="var(--green)">
                                    GAME_REVIEWER+
                                </Text>

                                <Text variant="h3" color="var(--mainText)">
                                    Your community's game review platform.
                                </Text>
                            </div>

                            <div className={style.heroBlock}>
                                <Text variant="h2" color="var(--green)">
                                    {"// What is this?"}
                                </Text>

                                <Text variant="body" color="var(--mainText)">
                                    Game_Reviewer+ is a platform where you can write, read, and share video game
                                    reviews. It is not a site for professional critic scores, but rather a real opinion
                                    from real players. You can rate games you've played, comment on other people's
                                    reviews, react with likes and dislikes, and follow people with tastes similar to
                                    yours.
                                </Text>
                            </div>

                            <div className={style.heroBlock}>
                                <Text variant="h2" color="var(--cyan)">
                                    {"// What can you do?"}
                                </Text>

                                <Text variant="body" className={style.heroFeatureItem}>
                                    Search for any game and see the community's reviews
                                </Text>

                                <Text variant="body" className={style.heroFeatureItem}>
                                    Write reviews with your honest opinion about the games you played
                                </Text>

                                <Text variant="body" className={style.heroFeatureItem}>
                                    Comment on and react to other players' reviews
                                </Text>

                                <Text variant="body" className={style.heroFeatureItem}>
                                    Follow users and keep up with their opinions and recommendations
                                </Text>

                                <Text variant="body" className={style.heroFeatureItem}>
                                    Get recommendations based on your tastes
                                </Text>
                            </div>

                            <div className={style.heroBlock}>
                                <Text variant="h2" color="var(--pink)">
                                    {"// How does it work?"}
                                </Text>

                                <Text variant="body" color="var(--mainText)">
                                    The games come directly from the IGDB database, giving us access to thousands of
                                    games with as much information as possible. They provide the data, but we are the
                                    community.
                                </Text>
                            </div>

                            <div className={style.heroCta}>
                                <Text variant="h2">Ready to get started?</Text>

                                <div className={style.heroCtaLinks}>
                                    <Link to="/register" className={style.heroLink}>
                                        <Text variant="h3" color="var(--pink)">
                                            {"> create account"}
                                        </Text>
                                    </Link>

                                    <Text variant="h3" color="var(--mutedText)">
                                        |
                                    </Text>

                                    <Link to="/login" className={style.heroLink}>
                                        <Text variant="h3" color="var(--cyan)">
                                            {"> log in"}
                                        </Text>
                                    </Link>
                                </div>
                            </div>
                            <hr />
                        </div>
                    )}

                    {showPopular && (
                        <>
                            <Section title="Popular Games" href="/categories/popular">
                                {loadingPopular && popular.length === 0 ? (
                                    <Text color="var(--mutedText)">Loading...</Text>
                                ) : (
                                    <Carousel
                                        items={popular.map(toBigGameCardProps)}
                                        pageSize={1}
                                        hasMore={popularHasMore}
                                        isLoading={loadingPopular}
                                        onLoadMore={loadMorePopular}
                                        renderItem={(game) => ({ node: <BigGameCard key={game.gameID} {...game} /> })}
                                    />
                                )}
                            </Section>
                            <hr />
                        </>
                    )}

                    {showRecommended && (
                        <>
                            <Section title="Recommended to you" href="/categories/recommended">
                                {loadingRecommended && recommended.length === 0 ? (
                                    <Text color="var(--mutedText)">Loading...</Text>
                                ) : (
                                    <Carousel
                                        items={recommended.map(toGameCardProps)}
                                        hasMore={recommendedHasMore}
                                        isLoading={loadingRecommended}
                                        onLoadMore={loadMoreRecommended}
                                        renderItem={(game) => ({ node: <GameCard key={game.gameID} {...game} /> })}
                                    />
                                )}
                            </Section>
                            <hr />
                        </>
                    )}

                    {showFriends && (
                        <Section title="Popular with your friends" href="/categories/friends">
                            <Carousel
                                items={FRIEND_RECOMENDED}
                                renderItem={(game) => ({ node: <GameCard key={game.name} {...game} /> })}
                            />
                        </Section>
                    )}
                </Panel>
            </div>
        </div>
    );
}

export default MainPage;