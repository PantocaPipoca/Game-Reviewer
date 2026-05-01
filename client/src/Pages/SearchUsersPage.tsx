import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { UserAPI } from "../API/User";
import type { UserPublic } from "../API/Types";
import defaultPfp from "../Assets/default-pfp.png";
import Navbar from "../Components/Navbar/Navbar";
import Panel from "../Components/Panel/Panel";
import Text from "../Components/Text/Text";
import style from "./SearchUsersPage.module.css";

const ITEMS_PER_PAGE: number = 1;

function SearchUsersPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const query = (searchParams.get("q") ?? "").trim();

    const [results, setResults] = useState<UserPublic[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const endOfListRef = useRef<HTMLDivElement>(null);

    const loadUsers = async (startOffset: number, isInitial: boolean = false) => {
        try {
            if (isInitial) setLoading(true);
            else setLoadingMore(true);

            const newResults = await UserAPI.search(query, startOffset, ITEMS_PER_PAGE);

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
                    loadUsers(results.length, false);
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

        loadUsers(0, true);
    }, [query]);

    return (
        <div>
            <Navbar />
            <div className={style.mainPanel}>
                <Panel type="main" className={style.resultsPanel}>
                    <Text variant="h2">User search results for:</Text>
                    <Text variant="h3" color="var(--mutedText)">
                        {query ? `"${query}"` : "Write something to search for"}
                    </Text>

                    <hr />

                    {loading && <Text color="var(--mutedText)">searching users...</Text>}

                    {!loading && error && <Text color="var(--pink)">* error during search. please try again.</Text>}

                    {!loading && !error && query && results.length === 0 && (
                        <Text color="var(--mutedText)">no users found for this search.</Text>
                    )}

                    {!loading && !error && results.length > 0 && (
                        <Panel type="secondary" className={style.list}>
                            {results.map((user) => (
                                <Panel
                                    key={user.accountName}
                                    type="terciary"
                                    className={style.userRow}
                                    direction="row"
                                    interactive
                                    onClick={() => navigate(`/user/${user.accountName}`)}
                                >
                                    <img
                                        src={user.avatar ?? defaultPfp}
                                        alt={user.accountName}
                                        className={style.avatar}
                                    />
                                    <div className={style.userMeta}>
                                        <Text variant="h3">{user.userData.displayName || user.accountName}</Text>
                                        <Text variant="body" color="var(--mutedText)">
                                            @{user.accountName}
                                        </Text>
                                    </div>
                                </Panel>
                            ))}
                        </Panel>
                    )}

                    {!loading && !error && results.length > 0 && (
                        <div ref={endOfListRef}>
                            {loadingMore && <Text color="var(--mutedText)">loading more users...</Text>}
                            {!loadingMore && !hasMore && (
                                <Text color="var(--mutedText)">no more users for search "{query}"</Text>
                            )}
                        </div>
                    )}
                </Panel>
            </div>
        </div>
    );
}

export default SearchUsersPage;
