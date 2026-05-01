import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { GameAPI } from "../API/Games";
import GameCard from "../Components/GameCards/GameCard";
import Navbar from "../Components/Navbar/Navbar";
import Panel from "../Components/Panel/Panel";
import Text from "../Components/Text/Text";
import style from "./SearchResultsPage.module.css";

const FALLBACK_COVER: string = "https://vglist.co/assets/no-cover-5b40e3b1.png";
const ITEMS_PER_PAGE: number = 50;

type CategoryGame = {
    id: number;
    name: string;
    cover?: { url?: string };
};

function toCoverUrl(cover?: { url?: string }): string {
    const url = cover?.url;
    if (!url) return FALLBACK_COVER;
    const fullUrl = url.startsWith("//") ? `https:${url}` : url;
    return fullUrl.replace(/t_\w+/, "t_cover_big");
}

function CategoryPage() {
    const { type } = useParams();

    const [results, setResults] = useState<CategoryGame[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const endOfListRef = useRef<HTMLDivElement>(null);

    const loadGames = async (startOffset: number, isInitial: boolean = false) => {
        try {
            if (isInitial) setLoading(true);
            else setLoadingMore(true);

            const newResults =
                type === "recommended"
                    ? await GameAPI.getRecommended(startOffset, ITEMS_PER_PAGE)
                    : await GameAPI.getPopular(startOffset, ITEMS_PER_PAGE);
            const normalizedResults = newResults.map((game) => ({
                id: game.id,
                name: game.name,
                cover: game.cover,
            }));

            if (isInitial) {
                setResults(normalizedResults);
                setError(false);
            } else {
                setResults((prev) => [...prev, ...normalizedResults]);
            }

            setHasMore(normalizedResults.length === ITEMS_PER_PAGE);
        } catch (err) {
            if (isInitial) setError(true);
        } finally {
            if (isInitial) setLoading(false);
            else setLoadingMore(false);
        }
    };

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !loading && !loadingMore && hasMore) {
                    loadGames(results.length, false);
                }
            },
            { threshold: 0.1 }
        );

        if (endOfListRef.current) observer.observe(endOfListRef.current);

        return () => {
            if (endOfListRef.current) observer.unobserve(endOfListRef.current);
        };
    }, [loading, loadingMore, hasMore, results.length]);

    useEffect(() => {
        setResults([]);
        setHasMore(true);
        setError(false);
        loadGames(0, true);
    }, [type]);

    return (
        <div>
            <Navbar />
            <div className={style.mainPanel}>
                <Panel type="main">
                    <Text variant="h2">{type}</Text>
                    <Text variant="h3" color="var(--mutedText)">
                        Showing games for {type}
                    </Text>

                    <hr />

                    {loading && <Text color="var(--mutedText)">loading...</Text>}

                    {!loading && error && <Text color="var(--pink)">* error loading games. please try again.</Text>}

                    {!loading && !error && results.length === 0 && (
                        <Text color="var(--mutedText)">no games found.</Text>
                    )}

                    {!loading && !error && results.length > 0 && (
                        <Panel type="secondary" direction="row" className={style.list}>
                            {results.map((game) => (
                                <GameCard
                                    key={game.id}
                                    name={game.name}
                                    cover={toCoverUrl(game.cover)}
                                    gameID={game.id}
                                />
                            ))}
                        </Panel>
                    )}

                    {!loading && !error && results.length > 0 && (
                        <div ref={endOfListRef}>
                            {loadingMore && <Text color="var(--mutedText)">loading more games...</Text>}
                            {!loadingMore && !hasMore && <Text color="var(--mutedText)">no more games.</Text>}
                        </div>
                    )}
                </Panel>
            </div>
        </div>
    );
}

export default CategoryPage;
