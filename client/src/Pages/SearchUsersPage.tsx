import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { UserAPI } from "../API/User";
import type { UserPublic } from "../API/Types";
import defaultPfp from "../Assets/default-pfp.png";
import Navbar from "../Components/Navbar/Navbar";
import Panel from "../Components/Panel/Panel";
import Text from "../Components/Text/Text";
import style from "./SearchUsersPage.module.css";

function SearchUsersPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const query = (searchParams.get("q") ?? "").trim();

    const [results, setResults] = useState<UserPublic[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!query) return;

        setLoading(true);
        setError(false);
        setResults([]);

        UserAPI.search(query)
            .then((data) => setResults(data))
            .catch(() => setError(true))
            .finally(() => setLoading(false));
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
                                        src={user.profilePic ?? defaultPfp}
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
                </Panel>
            </div>
        </div>
    );
}

export default SearchUsersPage;
