import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { GameAPI } from "../../API/Games";
import type { GameSearchResult } from "../../API/Types";
import Button from "../Buttons/Button";
import Panel from "../Panel/Panel";
import Text from "../Text/Text";
import InputField from "./InputField";
import style from "./Search.module.css";

const DROPDOWN_LIMIT = 5;
const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 450;
const CACHE_TTL_MS = 5 * 60 * 1000;
const FALLBACK_COVER = "https://vglist.co/assets/no-cover-5b40e3b1.png";

type CacheEntry = {
    timestamp: number;
    data: GameSearchResult[];
};

function toCoverUrl(result: GameSearchResult): string {
    const url = result.cover;
    if (!url) return FALLBACK_COVER;
    return url.startsWith("//") ? `https:${url}` : url;
}

function Search() {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();

    const [query, setQuery] = useState("");
    const [results, setResults] = useState<GameSearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const cacheRef = useRef<Map<string, CacheEntry>>(new Map());
    const requestIdRef = useRef(0);

    useEffect(() => {
        if (location.pathname !== "/search") return;
        setQuery(searchParams.get("q") ?? "");
    }, [location.pathname, searchParams]);

    useEffect(() => {
        const normalizedQuery = query.trim();

        if (normalizedQuery.length < MIN_QUERY_LENGTH) {
            setResults([]);
            setIsLoading(false);
            setError(false);
            return;
        }

        const timeoutId = setTimeout(async () => {
            const cachedResult = cacheRef.current.get(normalizedQuery);

            if (cachedResult && Date.now() - cachedResult.timestamp < CACHE_TTL_MS) {
                setResults(cachedResult.data);
                setError(false);
                return;
            }

            const requestId = ++requestIdRef.current;
            setIsLoading(true);
            try {
                const response = await GameAPI.search({ name: normalizedQuery, limit: DROPDOWN_LIMIT });
                if (requestIdRef.current !== requestId) return;

                setResults(response);
                setError(false);
                cacheRef.current.set(normalizedQuery, {
                    timestamp: Date.now(),
                    data: response,
                });
            } catch {
                if (requestIdRef.current !== requestId) return;
                setResults([]);
                setError(true);
            } finally {
                if (requestIdRef.current === requestId) {
                    setIsLoading(false);
                }
            }
        }, DEBOUNCE_MS);

        return () => clearTimeout(timeoutId);
    }, [query]);

    const goToSearchPage = () => {
        const normalizedQuery = query.trim();
        if (!normalizedQuery) return;
        navigate(`/search?q=${encodeURIComponent(normalizedQuery)}`);
        setIsFocused(false);
    };

    const shouldShowDropdown = isFocused;

    return (
        <div className={style.wrapper}>
            <InputField
                type="search"
                placeholder="Search..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onKeyDown={(event) => {
                    if (event.key === "Enter") {
                        event.preventDefault();
                        goToSearchPage();
                    }
                }}
            />

            {shouldShowDropdown && (
                <div onMouseDown={(event) => event.preventDefault()}>
                    <Panel type="secondary" className={style.dropdown}>
                        {isLoading && (
                            <Panel type="terciary" className={style.statusRow}>
                                <Text variant="body" color="var(--mutedText)">
                                    searching...
                                </Text>
                            </Panel>
                        )}

                        {!isLoading && error && (
                            <Panel type="terciary" className={style.statusRow}>
                                <Text variant="body" color="var(--pink)">
                                    error during search
                                </Text>
                            </Panel>
                        )}

                        {!isLoading && !error && results.length === 0 && (
                            <Panel type="terciary" className={style.statusRow}>
                                <Text variant="body" color="var(--mutedText)">
                                    no results
                                </Text>
                            </Panel>
                        )}

                        {!isLoading &&
                            !error &&
                            results.map((game) => (
                                <Panel
                                    key={game.id}
                                    type="terciary"
                                    className={style.itemRow}
                                    direction="row"
                                    interactive
                                    onClick={() => {
                                        navigate(`/game/${game.id}`);
                                        setIsFocused(false);
                                    }}
                                >
                                    <img className={style.cover} src={toCoverUrl(game)} alt={game.name} />
                                    <Text className={style.name} variant="body">
                                        {game.name}
                                    </Text>
                                </Panel>
                            ))}

                        {shouldShowDropdown && query.trim().length > MIN_QUERY_LENGTH && (
                            <Button className={style.viewAllButton} onClick={goToSearchPage}>
                                <Text variant="body" color="var(--pink)">
                                    {`>`} See More
                                </Text>
                            </Button>
                        )}
                    </Panel>
                </div>
            )}
        </div>
    );
}

export default Search;
