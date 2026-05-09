import { useEffect, useState } from "react";
import Text from "../Text/Text";
import Button from "../Buttons/Button";
import FollowerItem from "../FollowerItem/FollowerItem";
import { FollowerAPI } from "../../API/Follower";
import type { FollowerPublic } from "../../API/Types";
import style from "./FollowerListOverlay.module.css";
import { useCloseOverlay } from "../../Hooks/CloseOverlay";

type Tab = "followers" | "following";

type Props = {
    initialTab: Tab;
    username: string;
    displayName: string;
    isOwner: boolean;
    onClose: () => void;
    onRemove: (type: Tab) => void;
};

function FollowerListOverlay({ initialTab, username, displayName, isOwner, onClose, onRemove }: Props) {
    const [activeTab, setActiveTab] = useState<Tab>(initialTab);
    const [followers, setFollowers] = useState<FollowerPublic[]>([]);
    const [following, setFollowing] = useState<FollowerPublic[]>([]);
    const [pendingFollowing, setPendingFollowing] = useState<FollowerPublic[]>([]);
    const [loading, setLoading] = useState(true);

    useCloseOverlay(onClose);

    useEffect(() => {
        async function fetchAll() {
            setLoading(true);
            try {
                const followers: FollowerPublic[] = await FollowerAPI.getFollowers(username);
                const following: FollowerPublic[] = await FollowerAPI.getFollowing(username);
                const pendingSent: FollowerPublic[] | null = isOwner ? await FollowerAPI.getRequestsSent() : null;
                setFollowers(followers.filter((x) => x.accepted));
                setFollowing(following.filter((x) => x.accepted));
                if (isOwner && pendingSent) setPendingFollowing(pendingSent.filter((x) => !x.accepted));
            } catch {
                setFollowers([]);
                setFollowing([]);
                setPendingFollowing([]);
            } finally {
                setLoading(false);
            }
        }
        fetchAll();
    }, [username]);

    async function handleRemove(targetUsername: string) {
        try {
            if (activeTab === "followers") {
                await FollowerAPI.removeFollower(targetUsername);
                setFollowers((prev) => prev.filter((f) => f.follows !== targetUsername));
            } else {
                await FollowerAPI.unfollow(targetUsername);
                setFollowing((prev) => prev.filter((f) => f.followed !== targetUsername));
            }
            onRemove(activeTab);
        } catch (error: any) {
            console.log("Remove failed:", error?.response?.data);
        }
    }

    async function handleCancelRequest(targetUsername: string) {
        try {
            await FollowerAPI.unfollow(targetUsername);
            setPendingFollowing((prev) => prev.filter((f) => f.followed !== targetUsername));
            onRemove("following");
        } catch (error: any) {
            console.log("Cancel failed:", error?.response?.data);
        }
    }

    const list: FollowerPublic[] = activeTab === "followers" ? followers : following;
    const showPending: boolean = activeTab === "following" && isOwner && pendingFollowing.length > 0;

    return (
        <div className={style.backdrop} onClick={onClose}>
            <div className={style.overlayWrapper} onClick={(e) => e.stopPropagation()}>
                <div className={style.panel}>
                    <Button className={style.closeButton} onClick={onClose}>
                        <Text color="var(--pink)">✕</Text>
                    </Button>

                    <div className={style.header}>
                        <Text variant="h3" color="var(--cyan)">
                            {displayName}
                        </Text>
                    </div>

                    <div className={style.tabs}>
                        <Button
                            className={`${style.tab} ${activeTab === "followers" ? style.tabActive : ""}`}
                            onClick={() => setActiveTab("followers")}
                        >
                            <Text color={activeTab === "followers" ? "var(--mainText)" : "var(--mutedText)"}>
                                Followers
                            </Text>
                        </Button>
                        <Button
                            className={`${style.tab} ${activeTab === "following" ? style.tabActive : ""}`}
                            onClick={() => setActiveTab("following")}
                        >
                            <Text color={activeTab === "following" ? "var(--mainText)" : "var(--mutedText)"}>
                                Following
                            </Text>
                        </Button>
                    </div>

                    <div className={style.listContainer}>
                        {loading ? (
                            <div className={style.centerMessage}>
                                <Text color="var(--mutedText)">Loading...</Text>
                            </div>
                        ) : (
                            <>
                                {showPending && (
                                    <>
                                        <div className={style.sectionLabel}>
                                            <Text variant="small" color="var(--mainText)">
                                                Pending requests
                                            </Text>
                                        </div>
                                        <div className={style.pendingList}>
                                            {pendingFollowing.map((f) => (
                                                <FollowerItem
                                                    key={f.followed}
                                                    username={f.followed}
                                                    avatar={f.followedUser?.avatar ?? null}
                                                    isOwner={isOwner}
                                                    type="following"
                                                    pending
                                                    onRemove={handleCancelRequest}
                                                />
                                            ))}
                                        </div>
                                        <hr />
                                    </>
                                )}

                                {list.length === 0 && !showPending ? (
                                    <div className={style.centerMessage}>
                                        <Text color="var(--mutedText)">
                                            {activeTab === "followers"
                                                ? "No followers yet"
                                                : "Not following anyone yet"}
                                        </Text>
                                    </div>
                                ) : (
                                    list.map((f) => {
                                        const displayUsername: string =
                                            activeTab === "followers" ? f.follows : f.followed;
                                        return (
                                            <FollowerItem
                                                key={displayUsername}
                                                username={displayUsername}
                                                avatar={f.followsUser?.avatar ?? f.followedUser?.avatar ?? null}
                                                isOwner={isOwner}
                                                type={activeTab}
                                                onRemove={handleRemove}
                                            />
                                        );
                                    })
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default FollowerListOverlay;
