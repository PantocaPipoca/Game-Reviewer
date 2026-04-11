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
    const [loading, setLoading] = useState(true);

    useCloseOverlay(onClose);

    useEffect(() => {
        async function fetchAll() {
            setLoading(true);
            try {
                const [f, fg] = await Promise.all([
                    FollowerAPI.getFollowers(username),
                    FollowerAPI.getFollowing(username),
                ]);
                setFollowers(f.filter((x) => x.accepted));
                setFollowing(fg.filter((x) => x.accepted));
            } catch {
                setFollowers([]);
                setFollowing([]);
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
                setFollowers((prev) => prev.filter((f) => f.follows !== targetUsername)); // makes the list keep everything except the target user
            } else {
                await FollowerAPI.unfollow(targetUsername);
                setFollowing((prev) => prev.filter((f) => f.followed !== targetUsername));
            }
            onRemove(activeTab);
        } catch (error: any) {
            console.log("Remove failed:", error?.response?.data);
        }
    }

    const list = activeTab === "followers" ? followers : following;

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
                        ) : list.length === 0 ? (
                            <div className={style.centerMessage}>
                                <Text color="var(--mutedText)">
                                    {activeTab === "followers" ? "No followers yet" : "Not following anyone yet"}
                                </Text>
                            </div>
                        ) : (
                            list.map((f) => {
                                const displayUsername: string = activeTab === "followers" ? f.follows : f.followed;
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
                    </div>
                </div>
            </div>
        </div>
    );
}

export default FollowerListOverlay;
