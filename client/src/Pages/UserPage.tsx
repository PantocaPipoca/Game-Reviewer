import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar/Navbar";
import Panel from "../Components/Panel/Panel";
import Text from "../Components/Text/Text";
import style from "./UserPage.module.css";
import { UserAPI } from "../API/User";
import { isAuthenticated } from "../API/Auth";
import type { ReviewFull, UserPublic } from "../API/Types";
import defaultPfp from "../Assets/default-pfp.png";
import Button from "../Components/Buttons/Button";
import { FollowerAPI } from "../API/Follower";
import { ReviewAPI } from "../API/Reviews";
import { GameAPI } from "../API/Games";

type ReviewWithGame = ReviewFull & { gameName?: string; gameCover?: string };
type FollowState = "not_following" | "pending" | "following";

function UserPage() {
    const { username } = useParams<{ username: string }>();
    const navigate = useNavigate();
    const [profile, setProfile] = useState<UserPublic | null>(null);
    const [isOwner, setIsOwner] = useState(false);
    const [canView, setCanView] = useState(false);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ reviews: 0, following: 0, followers: 0 });
    const [reviews, setReviews] = useState<ReviewWithGame[]>([]);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [followState, setFollowState] = useState<FollowState>("not_following");
    const [followLoading, setFollowLoading] = useState(false);

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
                try {
                    const followers = await FollowerAPI.getFollowers(username!);
                    const relation = followers.find((f) => f.follows === currentUser.accountName);
                    if (!relation) setFollowState("not_following");
                    else if (relation.accepted) setFollowState("following");
                    else setFollowState("pending");
                } catch {
                    setFollowState("not_following");
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

                    const reviewsWithGames = await Promise.all(
                        reviewData.map(async (review) => {
                            try {
                                const gameData = await GameAPI.getById(review.reviewed);
                                return { ...review, gameName: gameData.gameName, gameCover: undefined };
                            } catch {
                                return review;
                            }
                        })
                    );
                    setReviews(reviewsWithGames);
                } catch {
                    // private or unavailable
                }
            }
        } catch (error: any) {
            console.log("FAILED:", error?.response?.status, error?.response?.data, error?.message);
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
        try {
            if (followState === "following" || followState === "pending") {
                await FollowerAPI.unfollow(username!);
                setFollowState("not_following");
                if (followState === "following") setStats((s) => ({ ...s, followers: Math.max(0, s.followers - 1) }));
            } else {
                await FollowerAPI.follow(username!);
                const isPrivate = profile?.isPrivate;
                setFollowState(isPrivate ? "pending" : "following");
                if (!isPrivate) setStats((s) => ({ ...s, followers: s.followers + 1 }));
            }
        } catch (error: any) {
            console.log("Follow action failed:", error?.response?.data);
        } finally {
            setFollowLoading(false);
        }
    }

    function renderFollowButton() {
        if (followState === "following") {
            return (
                <Button
                    className={`${style.followButton} ${style.unfollowButton}`}
                    onClick={handleFollow}
                    disabled={followLoading}
                >
                    <Text color="var(--pink)">UNFOLLOW</Text>
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
                    <Text color="var(--mutedText)">PENDING...</Text>
                </Button>
            );
        }
        return (
            <Button className={style.followButton} onClick={handleFollow} disabled={followLoading}>
                <Text color="var(--pink)">FOLLOW</Text>
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

    const memberSince = profile.createdAt
        ? new Date(profile.createdAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
          })
        : null;

    return (
        <div>
            <Navbar />
            <div className={style.mainPanel}>
                <Panel type="main">
                    <div className={style.topSection}>
                        <div className={style.leftColumn}>
                            <Panel type="secondary" className={style.avatarPanel}>
                                <div className={style.avatarWrapper}>
                                    <img src={defaultPfp} alt={profile.accountName} className={style.avatar} />
                                </div>
                                <Text variant="h3" color="var(--cyan)">
                                    {profile.userData?.displayName ?? profile.accountName}
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
                                    <div className={style.statCell}>
                                        <Text variant="body">Following</Text>
                                        <Text variant="h2" color="var(--cyan)">
                                            {stats.following}
                                        </Text>
                                    </div>

                                    <div className={style.statDivider} />
                                    <div className={style.statCell}>
                                        <Text variant="body">Followers</Text>
                                        <Text variant="h2" color="var(--cyan)">
                                            {stats.followers}
                                        </Text>
                                    </div>
                                </Panel>
                                <Panel type="secondary" className={style.infoPanel}>
                                    <Text variant="body" color="var(--cyan)">{`Member since ${memberSince}`}</Text>
                                    <Text variant="small" color="var(--mutedText)">
                                        {profile.userData.gender}
                                    </Text>
                                    <Text variant="small">{profile.userData.bio}</Text>
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

                    {canView ? (
                        <>
                            <hr />
                            {reviews.length === 0 ? (
                                <Panel type="secondary" className={style.activityPanel}>
                                    <Text color="var(--pink)">NO ACTIVITY</Text>
                                </Panel>
                            ) : (
                                <div className={style.reviewList}></div>
                            )}
                        </>
                    ) : null}
                </Panel>
            </div>
        </div>
    );
}

export default UserPage;
