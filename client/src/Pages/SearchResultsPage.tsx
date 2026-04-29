import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { GameAPI } from "../API/Games";
import type { GameSearchResult } from "../API/Types";
import GameCard from "../Components/GameCards/GameCard";
import Navbar from "../Components/Navbar/Navbar";
import Panel from "../Components/Panel/Panel";
import Text from "../Components/Text/Text";
import style from "./SearchResultsPage.module.css";

const FALLBACK_COVER: string = "https://vglist.co/assets/no-cover-5b40e3b1.png";

function toCoverUrl(result: GameSearchResult): string {
    const url: string | undefined = result.cover;
    if (!url) return FALLBACK_COVER;
    return url.startsWith("//") ? `https:${url}` : url;
}

function SearchResultsPage() {
    const [searchParams] = useSearchParams();

    const query: string = (searchParams.get("q") ?? "").trim();

    const [results, setResults] = useState<GameSearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!query) return;

        setLoading(true);
        setError(false);
        setResults([]);

        GameAPI.search({ name: query, sortRelevant: true })
            .then((data) => setResults(data))
            .catch(() => setError(true))
            .finally(() => setLoading(false));
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
                </Panel>
            </div>
        </div>
    );
}

export default SearchResultsPage;
