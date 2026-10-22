import { useEffect, useRef, useState } from "react";
import LoginButton from "../Buttons/LoginButton";
import SignupButton from "../Buttons/SignupButton";
import Search from "../InputField/Search";
import Text from "../Text/Text";
import style from "./Navbar.module.css";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { isAuthenticated } from "../../API/Auth";
import { UserAPI } from "../../API/User";
import { FollowerAPI } from "../../API/Follower";
import LogoutConfirmOverlay from "../LogoutConfirm/LogoutConfirm";
import NotificationsOverlay from "../Notifications/NotificationsOverlay";
import Button from "../Buttons/Button";
import { useCloseOverlay } from "../../Hooks/CloseOverlay";
import defaultPfp from "../../Assets/default-pfp.png";
function BellIcon() {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
        >
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
    );
}

function Navbar() {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState("");
    const [pendingCount, setPendingCount] = useState(0);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);
    const bellRef = useRef<HTMLDivElement>(null);
    const [avatar, setAvatar] = useState<string | null>(null);

    useCloseOverlay(() => setShowNotifications(false), bellRef);
    useCloseOverlay(() => setShowDropdown(false), profileRef);

    useEffect(() => {
        async function load() {
            try {
                const authenticated = await isAuthenticated();
                setIsLoggedIn(authenticated);

                if (authenticated) {
                    const me = await UserAPI.getMe();
                    setUsername(me.username);
                    setAvatar(me.avatar ?? null);
                    try {
                        const pending = await FollowerAPI.getRequestsReceived();
                        setPendingCount(pending.length);
                    } catch {}
                }
            } catch {}
        }
        load();
    }, []);

    function handleLogoutConfirmed() {
        UserAPI.logout();
        setIsLoggedIn(false);
        setUsername("");
        setShowLogoutConfirm(false);
        navigate("/");
    }

    // update pending count in real time when accept/reject requests
    function handleRequestHandled() {
        setPendingCount((prev) => Math.max(0, prev - 1));
    }

    return (
        <>
            <div className={style.bar}>
                <Link to="/">
                    <Text variant="logo" color="var(--green)">
                        Game_Reviewer+
                    </Text>
                </Link>

                <Search />

                {isLoggedIn ? (
                    <div className={style.rightSection}>
                        {/* Notification */}
                        <div className={style.bellWrapper} ref={bellRef}>
                            <Button
                                className={style.bellButton}
                                onClick={() => {
                                    setShowNotifications((v) => !v);
                                    setShowDropdown(false);
                                }}
                            >
                                <BellIcon />
                                {pendingCount > 0 && <span className={style.badge}>{pendingCount}</span>}
                            </Button>

                            {showNotifications && (
                                <NotificationsOverlay
                                    onClose={() => setShowNotifications(false)}
                                    onRequestHandled={handleRequestHandled}
                                />
                            )}
                        </div>

                        {/* Profile and dropdown */}
                        <div className={style.profileArea} ref={profileRef}>
                            <Button
                                className={style.profileButton}
                                onClick={() => {
                                    setShowDropdown((v) => !v);
                                    setShowNotifications(false);
                                }}
                            >
                                <img
                                    src={avatar ?? defaultPfp}
                                    alt={username}
                                    className={style.profileAvatar}
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = defaultPfp;
                                    }}
                                />
                                <Text color="var(--mainText)">{username}</Text>
                            </Button>

                            {showDropdown && (
                                <div className={style.dropdown}>
                                    <Button
                                        className={style.dropdownItem}
                                        onClick={() => {
                                            navigate(`/user/${username}`);
                                            setShowDropdown(false);
                                        }}
                                    >
                                        <Text color="var(--cyan)">{`> SEE PROFILE`}</Text>
                                    </Button>
                                    <div className={style.dropdownDivider} />
                                    <Button
                                        className={style.dropdownItem}
                                        onClick={() => {
                                            setShowDropdown(false);
                                            setShowLogoutConfirm(true);
                                        }}
                                    >
                                        <Text color="var(--pink)">{`> LOGOUT`}</Text>
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <>
                        <Link to="/register">
                            <SignupButton />
                        </Link>
                        <Link to="/login">
                            <LoginButton />
                        </Link>
                    </>
                )}
            </div>

            {showLogoutConfirm && (
                <LogoutConfirmOverlay onConfirm={handleLogoutConfirmed} onCancel={() => setShowLogoutConfirm(false)} />
            )}
        </>
    );
}

export default Navbar;
