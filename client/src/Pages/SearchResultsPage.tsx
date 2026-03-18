import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import type { GameSearchResult } from "../API/Types";
import GameCard from "../Components/GameCards/GameCard";
import Navbar from "../Components/Navbar/Navbar";
import Panel from "../Components/Panel/Panel";
import Text from "../Components/Text/Text";
import style from "./SearchResultsPage.module.css";

const FALLBACK_COVER = "https://vglist.co/assets/no-cover-5b40e3b1.png";

function toCoverUrl(result: GameSearchResult): string {
    const url = result.cover;
    if (!url) return FALLBACK_COVER;
    return url.startsWith("//") ? `https:${url}` : url;
}

function SearchResultsPage() {
    const [searchParams] = useSearchParams();

    const query = (searchParams.get("q") ?? "").trim();
    const results = useMemo<GameSearchResult[]>(() => {
        if (!query) return [];
        return [];
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

                    {query && results.length === 0 && (
                        <Text variant="body" color="var(--mutedText)">
                            No results for this search.
                        </Text>
                    )}

                    <hr />

                    {results.length > 0 && (
                        <Panel type="secondary" direction="row" className={style.list}>
                            {results.map((game) => (
                                <GameCard key={game.id} name={game.name} cover={toCoverUrl(game)} />
                            ))}
                        </Panel>
                    )}
                </Panel>
            </div>
        </div>
    );
}

export default SearchResultsPage;
