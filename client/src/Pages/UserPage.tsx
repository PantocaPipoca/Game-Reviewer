import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar/Navbar";
import Panel from "../Components/Panel/Panel";
import Text from "../Components/Text/Text";
import Button from "../Components/Buttons/Button";
import style from "./UserPage.module.css";
import { UserAPI } from "../API/User";
import { isAuthenticated } from "../API/Auth";
import type { ReviewFull, UserPublic, ReviewWithAvatar } from "../API/Types";
import defaultAvatar from "../Assets/default-pfp.png";
import { FollowerAPI } from "../API/Follower";
import { ReviewAPI } from "../API/Reviews";
import { GameAPI } from "../API/Games";
import FollowerListOverlay from "../Components/FollowerList/FollowerListOverlay";
import { useSuccessPopup } from "../Hooks/SuccessPopup";
import ReviewCard from "../Components/ReviewCard/ReviewCard";
import ReviewFilter, { type SortField, type SortOrder } from "../Components/ReviewFilter/ReviewFilter";
import UserStatsPanel from "../Components/UserStatsPanel/UserStatsPanel";
import { sortReviews } from "../Utils/ReviewSort";

const NO_COVER = "https://vglist.co/assets/no-cover-5b40e3b1.png";

function getCoverUrl(game: any): string {
    const url: string | undefined = game?.cover?.url;
    if (!url) return NO_COVER;
    const full = url.startsWith("//") ? `https:${url}` : url;
    return full.replace("t_thumb", "t_cover_big");
}

type ReviewWithGame = ReviewFull & { gameName?: string; gameCover?: string };
type FollowState = "not_following" | "pending" | "following";
type OverlayTab = "followers" | "following";

function UserPage() {
    const { username } = useParams<{ username: string }>();
    const navigate = useNavigate();
    const { showSuccess } = useSuccessPopup();

    const [profile, setProfile] = useState<UserPublic | null>(null);
    const [isOwner, setIsOwner] = useState(false);
    const [canView, setCanView] = useState(false);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ reviews: 0, following: 0, followers: 0 });
    const [reviews, setReviews] = useState<ReviewWithGame[]>([]);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [followState, setFollowState] = useState<FollowState>("not_following");
    const [followLoading, setFollowLoading] = useState(false);
    const [followOverlay, setFollowOverlay] = useState<OverlayTab | null>(null);

    const [sortField, setSortField] = useState<SortField>("createdAt");
    const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

    type ReviewWithGame = ReviewWithAvatar & { gameName?: string; gameCover?: string };

    // replace the useMemo block:
    const sortedReviews = useMemo(() => sortReviews(reviews, sortField, sortOrder), [reviews, sortField, sortOrder]);

    useEffect(() => {
        load();
    }, [username]);

    async function load() {
        try {
            const [profileData, currentUser] = await Promise.all([
                UserAPI.getByUsername(username!),
                isAuthenticated().then((ok) => (ok ? UserAPI.getMe() : null)),
            ]);
            setProfile(profileData);
            const owner = currentUser?.accountName === profileData.accountName;
            setIsOwner(owner);
            setIsLoggedIn(!!currentUser);

            const canView: boolean = !profileData.isPrivate || owner || !!profileData.userData;
            setCanView(canView);

            if (currentUser && !owner) {
                let isFollowing = false;

                try {
                    const followers = await FollowerAPI.getFollowers(username!);
                    isFollowing = !!followers.find((f) => f.follows === currentUser.accountName && f.accepted);
                } catch {
                    // private account currentUser not following yet
                }

                try {
                    const sentRequests = await FollowerAPI.getRequestsSent();
                    const isPending = !!sentRequests.find((f) => f.followed === username);

                    if (isFollowing) setFollowState("following");
                    else if (isPending) setFollowState("pending");
                    else setFollowState("not_following");
                } catch {
                    setFollowState(isFollowing ? "following" : "not_following");
                }
            }

            if (canView) {
                try {
                    const [reviewData, following, followers] = await Promise.all([
                        ReviewAPI.getByUser(username!),
                        FollowerAPI.getFollowing(username!),
                        FollowerAPI.getFollowers(username!),
                    ]);
                    setStats({
                        reviews: reviewData.length,
                        following: following.length,
                        followers: followers.filter((f) => f.accepted).length,
                    });
                    const uniqueIds = reviewData.map((r) => r.reviewed);
                    const gameCovers = uniqueIds.length > 0 ? await GameAPI.getBatch(uniqueIds) : [];
                    const coverMap = new Map(gameCovers.map((g) => [g.id, g]));

                    const reviewsWithGameInfo: ReviewWithGame[] = reviewData.map((review) => {
                        const igdb = coverMap.get(review.reviewed);
                        return {
                            ...review,
                            gameName: igdb?.name,
                            gameCover: getCoverUrl(igdb),
                        };
                    });
                    setReviews(reviewsWithGameInfo);
                } catch {}
            }
        } catch (error: any) {
            console.log("FAILED:", error?.response?.status, error?.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleFollow() {
        if (!isLoggedIn) {
            navigate("/login");
            return;
        }
        setFollowLoading(true);
        const currentState = followState;
        try {
            if (currentState === "following" || currentState === "pending") {
                await FollowerAPI.unfollow(username!);
                setFollowState("not_following");
                if (currentState === "following") {
                    setStats((s) => ({ ...s, followers: Math.max(0, s.followers - 1) }));
                    showSuccess("Unfollowed successfully.", 3);
                } else {
                    showSuccess("Follow request canceled successfully.", 3);
                }
            } else {
                await FollowerAPI.follow(username!);
                const isPrivate = profile?.isPrivate;
                setFollowState(isPrivate ? "pending" : "following");
                if (!isPrivate) {
                    setStats((s) => ({ ...s, followers: s.followers + 1 }));
                    showSuccess("Followed successfully.", 3);
                } else {
                    showSuccess("Follow request sent successfully.", 3);
                }
            }
        } catch (error: any) {
            console.log("Follow action failed:", error?.response?.data);
        } finally {
            setFollowLoading(false);
        }
    }

    function handleOverlayRemove(type: OverlayTab) {
        if (type === "followers") setStats((s) => ({ ...s, followers: Math.max(0, s.followers - 1) }));
        if (type === "following") setStats((s) => ({ ...s, following: Math.max(0, s.following - 1) }));
    }

    function renderFollowButton() {
        if (followState === "following") {
            return (
                <Button
                    className={`${style.followButton} ${style.unfollowButton}`}
                    onClick={handleFollow}
                    disabled={followLoading}
                >
                    <Text color="var(--pink)">{`> UNFOLLOW`}</Text>
                </Button>
            );
        }
        if (followState === "pending") {
            return (
                <Button
                    className={`${style.followButton} ${style.pendingButton}`}
                    onClick={handleFollow}
                    disabled={followLoading}
                >
                    <Text color="var(--mutedText)">{`X CANCEL REQUEST`}</Text>
                </Button>
            );
        }
        return (
            <Button
                className={`${style.followButton} ${style.followActiveButton}`}
                onClick={handleFollow}
                disabled={followLoading}
            >
                <Text color="var(--pink)">{`> FOLLOW`}</Text>
            </Button>
        );
    }

    if (loading) {
        return (
            <div>
                <Navbar />
                <div className={style.mainPanel}>
                    <Panel type="main">
                        <Text color="var(--mutedText)">Loading...</Text>
                    </Panel>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div>
                <Navbar />
                <div className={style.mainPanel}>
                    <Panel type="main">
                        <Text color="var(--pink)">User not found</Text>
                    </Panel>
                </div>
            </div>
        );
    }

    const memberSince =
        profile.createdAt &&
        new Date(profile.createdAt).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });

    const displayName = profile.userData?.displayName ?? profile.accountName;

    return (
        <div>
            <Navbar />
            <div className={style.mainPanel}>
                <Panel type="main">
                    <div className={style.topSection}>
                        <div className={style.leftColumn}>
                            <Panel type="secondary" className={style.avatarPanel}>
                                <div className={style.avatarWrapper}>
                                    <img
                                        src={profile.avatar ?? defaultAvatar}
                                        alt={profile.accountName}
                                        className={style.avatar}
                                    />
                                </div>
                                <Text variant="h3" color="var(--cyan)">
                                    {displayName}
                                </Text>
                            </Panel>

                            {isOwner ? (
                                <Button className={style.editButton} onClick={() => navigate(`/user/${username}/edit`)}>
                                    <Text>{`> EDIT PROFILE`}</Text>
                                </Button>
                            ) : (
                                renderFollowButton()
                            )}
                        </div>

                        {canView ? (
                            <div className={style.rightColumn}>
                                <Panel type="secondary" className={style.statsPanel}>
                                    <div className={style.statCell}>
                                        <Text variant="body">Reviews</Text>
                                        <Text variant="h2" color="var(--cyan)">
                                            {stats.reviews}
                                        </Text>
                                    </div>

                                    <div className={style.statDivider} />

                                    <div
                                        className={`${style.statCell} ${style.statClickable}`}
                                        onClick={() => setFollowOverlay("followers")}
                                    >
                                        <Text variant="body">Followers</Text>
                                        <Text variant="h2" color="var(--cyan)">
                                            {stats.followers}
                                        </Text>
                                    </div>

                                    <div className={style.statDivider} />

                                    <div
                                        className={`${style.statCell} ${style.statClickable}`}
                                        onClick={() => setFollowOverlay("following")}
                                    >
                                        <Text variant="body">Following</Text>
                                        <Text variant="h2" color="var(--cyan)">
                                            {stats.following}
                                        </Text>
                                    </div>
                                </Panel>
                                <Panel type="secondary" className={style.infoPanel}>
                                    <Text variant="body" color="var(--cyan)">{`Member since ${memberSince}`}</Text>
                                    <Text variant="small" color="var(--mutedText)">
                                        {profile.userData.gender}
                                    </Text>
                                    <Text variant="small" multiline>
                                        {profile.userData.bio}
                                    </Text>
                                </Panel>
                            </div>
                        ) : (
                            <div className={style.rightColumn}>
                                <Panel type="secondary" className={style.privatePanel}>
                                    <Text color="var(--pink)">This profile is private</Text>
                                </Panel>
                            </div>
                        )}
                    </div>

                    {canView && (
                        <>
                            <hr />
                            {reviews.length === 0 ? (
                                <Panel type="secondary" className={style.activityPanel}>
                                    <Text color="var(--pink)">NO ACTIVITY</Text>
                                </Panel>
                            ) : (
                                <div className={style.reviewSection}>
                                    <UserStatsPanel reviews={reviews} />
                                    <ReviewFilter
                                        sortField={sortField}
                                        sortOrder={sortOrder}
                                        onSort={(field, order) => {
                                            setSortField(field);
                                            setSortOrder(order);
                                        }}
                                    />
                                    <div className={style.reviewList}>
                                        {sortedReviews.map((review) => (
                                            <ReviewCard
                                                key={`${review.reviewer}-${review.reviewed}`}
                                                cover={review.gameCover}
                                                gameName={review.gameName}
                                                description={review.text}
                                                rating={review.score}
                                                hoursPlayed={review.hoursPlayed}
                                                platforms={review.platforms}
                                                showUser={false}
                                                reviewer={review.reviewer}
                                                reviewed={review.reviewed}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </Panel>
            </div>

            {followOverlay && (
                <FollowerListOverlay
                    initialTab={followOverlay}
                    username={username!}
                    displayName={displayName}
                    isOwner={isOwner}
                    onClose={() => setFollowOverlay(null)}
                    onRemove={handleOverlayRemove}
                />
            )}
        </div>
    );
}

export default UserPage;
