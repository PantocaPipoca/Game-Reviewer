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

function BellIcon() {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 9 10"
            style={{ imageRendering: "pixelated", display: "block" }}
            aria-hidden
        >
            <rect x="4" y="0" width="1" height="1" fill="currentColor" />
            <rect x="3" y="1" width="3" height="1" fill="currentColor" />
            <rect x="2" y="2" width="5" height="1" fill="currentColor" />
            <rect x="1" y="3" width="7" height="1" fill="currentColor" />
            <rect x="1" y="4" width="7" height="1" fill="currentColor" />
            <rect x="1" y="5" width="7" height="1" fill="currentColor" />
            <rect x="0" y="6" width="9" height="1" fill="currentColor" />
            <rect x="3" y="8" width="3" height="1" fill="currentColor" />
            <rect x="4" y="9" width="1" height="1" fill="currentColor" />
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

    useCloseOverlay(() => setShowNotifications(false), bellRef);
    useCloseOverlay(() => setShowDropdown(false), profileRef);

    useEffect(() => {
        async function load() {
            try {
                const authenticated = await isAuthenticated();
                setIsLoggedIn(authenticated);

                if (authenticated) {
                    const me = await UserAPI.getMe();
                    setUsername(me.accountName);
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
                                <div className={style.profileAvatar} />
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
