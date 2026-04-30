import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { GameAPI } from "../API/Games";
import type { GameSearchResult } from "../API/Types";
import GameCard from "../Components/GameCards/GameCard";
import Navbar from "../Components/Navbar/Navbar";
import Panel from "../Components/Panel/Panel";
import Text from "../Components/Text/Text";
import style from "./SearchResultsPage.module.css";

const FALLBACK_COVER: string = "https://vglist.co/assets/no-cover-5b40e3b1.png";
const ITEMS_PER_PAGE: number = 50;

function toCoverUrl(result: GameSearchResult): string {
    const url = result.cover;
    if (!url) return FALLBACK_COVER;
    return url.startsWith("//") ? `https:${url}` : url;
}

function SearchResultsPage() {
    const [searchParams] = useSearchParams();

    const query = (searchParams.get("q") ?? "").trim();

    const [results, setResults] = useState<GameSearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const endOfListRef = useRef<HTMLDivElement>(null);

    const loadGames = async (startOffset: number, isInitial: boolean = false) => {
        try {
            if (isInitial) setLoading(true);
            else setLoadingMore(true);

            const newResults = await GameAPI.search({
                name: query,
                offset: startOffset,
                limit: ITEMS_PER_PAGE,
            });

            if (isInitial) {
                setResults(newResults);
                setError(false);
            } else {
                setResults((prev) => [...prev, ...newResults]);
            }

            setHasMore(newResults.length === ITEMS_PER_PAGE);
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
                if (entries[0].isIntersecting && !loading && !loadingMore && hasMore && query) {
                    loadGames(results.length, false);
                }
            },
            { threshold: 0.1 }
        );

        if (endOfListRef.current) observer.observe(endOfListRef.current);

        return () => {
            if (endOfListRef.current) observer.unobserve(endOfListRef.current);
        };
    }, [loading, loadingMore, hasMore, query, results.length]);

    useEffect(() => {
        if (!query) return;

        setLoading(true);
        setError(false);
        setResults([]);
        setHasMore(true);

        loadGames(0, true);
    }, [query]);

    return (
        <div>
            <Navbar />
            <div className={style.mainPanel}>
                <Panel type="main">
                    <Text variant="h2">Search results for:</Text>
                    <Text variant="h3" color="var(--mutedText)">
                        {query ? `"${query}"` : "Write something to search for"}
                    </Text>

                    <hr />

                    {loading && <Text color="var(--mutedText)">searching...</Text>}

                    {!loading && error && <Text color="var(--pink)">* error during search. please try again.</Text>}

                    {!loading && !error && query && results.length === 0 && (
                        <Text color="var(--mutedText)">no results for this search.</Text>
                    )}

                    {!loading && !error && results.length > 0 && (
                        <Panel type="secondary" direction="row" className={style.list}>
                            {results.map((game) => (
                                <GameCard key={game.id} name={game.name} cover={toCoverUrl(game)} gameID={game.id} />
                            ))}
                        </Panel>
                    )}

                    {!loading && !error && results.length > 0 && (
                        <div ref={endOfListRef}>
                            {loadingMore && <Text color="var(--mutedText)">loading more games...</Text>}
                            {!loadingMore && !hasMore && (
                                <Text color="var(--mutedText)">no more games for search "{query}"</Text>
                            )}
                        </div>
                    )}
                </Panel>
            </div>
        </div>
    );
}

export default SearchResultsPage;
