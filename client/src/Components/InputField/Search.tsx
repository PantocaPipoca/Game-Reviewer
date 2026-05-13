import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { GameAPI } from "../../API/Games";
import { UserAPI } from "../../API/User";
import type { GameSearchResult, UserPublic } from "../../API/Types";
import defaultPfp from "../../Assets/default-pfp.png";
import Button from "../Buttons/Button";
import Panel from "../Panel/Panel";
import Text from "../Text/Text";
import InputField from "./InputField";
import style from "./Search.module.css";

const DROPDOWN_LIMIT = 5;
const MIN_QUERY_LENGTH = 3;
const DEBOUNCE_MS = 450;
const CACHE_TTL_MS = 5 * 60 * 1000;
const FALLBACK_COVER = "https://vglist.co/assets/no-cover-5b40e3b1.png";

type GameCacheEntry = {
    timestamp: number;
    data: GameSearchResult[];
};

type UserCacheEntry = {
    timestamp: number;
    data: UserPublic[];
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
    const [gameResults, setGameResults] = useState<GameSearchResult[]>([]);
    const [userResults, setUserResults] = useState<UserPublic[]>([]);
    const [isLoadingGames, setIsLoadingGames] = useState(false);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    const [gameError, setGameError] = useState(false);
    const [userError, setUserError] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const gameCacheRef = useRef<Map<string, GameCacheEntry>>(new Map());
    const userCacheRef = useRef<Map<string, UserCacheEntry>>(new Map());
    const gameRequestIdRef = useRef(0);
    const userRequestIdRef = useRef(0);

    useEffect(() => {
        if (location.pathname !== "/search/games" && location.pathname !== "/search/users") return;
        setQuery(searchParams.get("q") ?? "");
    }, [location.pathname, searchParams]);

    useEffect(() => {
        const normalizedQuery = query.trim();

        if (normalizedQuery.length < MIN_QUERY_LENGTH) {
            setGameResults([]);
            setUserResults([]);
            setIsLoadingGames(false);
            setIsLoadingUsers(false);
            setGameError(false);
            setUserError(false);
            return;
        }

        const timeoutId = setTimeout(async () => {
            const cachedGames = gameCacheRef.current.get(normalizedQuery);
            const cachedUsers = userCacheRef.current.get(normalizedQuery);

            const gameCacheIsValid = !!cachedGames && Date.now() - cachedGames.timestamp < CACHE_TTL_MS;
            const userCacheIsValid = !!cachedUsers && Date.now() - cachedUsers.timestamp < CACHE_TTL_MS;

            if (gameCacheIsValid) {
                setGameResults(cachedGames.data);
                setGameError(false);
            }

            if (userCacheIsValid) {
                setUserResults(cachedUsers.data);
                setUserError(false);
            }

            if (gameCacheIsValid && userCacheIsValid) return;

            const gameRequestId = ++gameRequestIdRef.current;
            const userRequestId = ++userRequestIdRef.current;

            if (!gameCacheIsValid) setIsLoadingGames(true);
            if (!userCacheIsValid) setIsLoadingUsers(true);

            const gamesPromise: Promise<GameSearchResult[]> = gameCacheIsValid
                ? Promise.resolve(cachedGames!.data)
                : GameAPI.search({ name: normalizedQuery, limit: DROPDOWN_LIMIT });

            const usersPromise: Promise<UserPublic[]> = userCacheIsValid
                ? Promise.resolve(cachedUsers!.data)
                : UserAPI.search(normalizedQuery);

            const [gamesResponse, usersResponse] = await Promise.allSettled([gamesPromise, usersPromise]);

            if (!gameCacheIsValid && gameRequestIdRef.current === gameRequestId) {
                if (gamesResponse.status === "fulfilled") {
                    setGameResults(gamesResponse.value);
                    setGameError(false);
                    gameCacheRef.current.set(normalizedQuery, {
                        timestamp: Date.now(),
                        data: gamesResponse.value,
                    });
                } else {
                    setGameResults([]);
                    setGameError(true);
                }
                setIsLoadingGames(false);
            }

            if (!userCacheIsValid && userRequestIdRef.current === userRequestId) {
                if (usersResponse.status === "fulfilled") {
                    setUserResults(usersResponse.value.slice(0, DROPDOWN_LIMIT));
                    setUserError(false);
                    userCacheRef.current.set(normalizedQuery, {
                        timestamp: Date.now(),
                        data: usersResponse.value,
                    });
                } else {
                    setUserResults([]);
                    setUserError(true);
                }
                setIsLoadingUsers(false);
            }
        }, DEBOUNCE_MS);

        return () => clearTimeout(timeoutId);
    }, [query]);

    const goToSearchPage = () => {
        const normalizedQuery = query.trim();
        if (!normalizedQuery) return;
        navigate(`/search/games?q=${encodeURIComponent(normalizedQuery)}`);
        setIsFocused(false);
    };

    const goToUserSearchPage = () => {
        const normalizedQuery = query.trim();
        if (!normalizedQuery) return;
        navigate(`/search/users?q=${encodeURIComponent(normalizedQuery)}`);
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
                        {isLoadingGames && (
                            <Panel type="terciary" className={style.statusRow}>
                                <Text variant="body" color="var(--mutedText)">
                                    searching games...
                                </Text>
                            </Panel>
                        )}

                        {!isLoadingGames && gameError && (
                            <Panel type="terciary" className={style.statusRow}>
                                <Text variant="body" color="var(--pink)">
                                    error during game search
                                </Text>
                            </Panel>
                        )}

                        {!isLoadingGames && !gameError && gameResults.length === 0 && (
                            <Panel type="terciary" className={style.statusRow}>
                                <Text variant="body" color="var(--mutedText)">
                                    no games found
                                </Text>
                            </Panel>
                        )}

                        {!isLoadingGames &&
                            !gameError &&
                            gameResults.map((game) => (
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

                        {shouldShowDropdown && query.trim().length >= MIN_QUERY_LENGTH && (
                            <Button className={style.viewAllButton} onClick={goToSearchPage}>
                                <Text variant="body" color="var(--pink)">
                                    {`>`} See more games
                                </Text>
                            </Button>
                        )}

                        <hr />

                        {isLoadingUsers && (
                            <Panel type="terciary" className={style.statusRow}>
                                <Text variant="body" color="var(--mutedText)">
                                    searching users...
                                </Text>
                            </Panel>
                        )}

                        {!isLoadingUsers && userError && (
                            <Panel type="terciary" className={style.statusRow}>
                                <Text variant="body" color="var(--pink)">
                                    error during user search
                                </Text>
                            </Panel>
                        )}

                        {!isLoadingUsers && !userError && userResults.length === 0 && (
                            <Panel type="terciary" className={style.statusRow}>
                                <Text variant="body" color="var(--mutedText)">
                                    no users found
                                </Text>
                            </Panel>
                        )}

                        {!isLoadingUsers &&
                            !userError &&
                            userResults.slice(0, DROPDOWN_LIMIT).map((user) => (
                                <Panel
                                    key={user.username}
                                    type="terciary"
                                    className={style.itemRow}
                                    direction="row"
                                    interactive
                                    onClick={() => {
                                        navigate(`/user/${user.username}`);
                                        setIsFocused(false);
                                    }}
                                >
                                    <img
                                        className={style.avatar}
                                        src={user.avatar ?? defaultPfp}
                                        alt={user.username}
                                    />
                                    <div className={style.userInfo}>
                                        <Text className={style.name} variant="body">
                                            {user.userData?.displayName || `@${user.username}`}
                                        </Text>
                                        {user.userData?.displayName &&
                                            user.userData.displayName !== user.username && (
                                                <Text variant="small" color="var(--mutedText)">
                                                    @{user.username}
                                                </Text>
                                            )}
                                    </div>
                                </Panel>
                            ))}

                        {shouldShowDropdown && query.trim().length >= MIN_QUERY_LENGTH && (
                            <Button className={style.viewAllButton} onClick={goToUserSearchPage}>
                                <Text variant="body" color="var(--pink)">
                                    {`>`} See more users
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
