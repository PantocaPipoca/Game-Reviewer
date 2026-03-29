import { useEffect, useState } from "react";
import LoginButton from "../Buttons/LoginButton";
import LogoutButton from "../Buttons/LogoutButton";
import SignupButton from "../Buttons/SignupButton";
import Search from "../InputField/Search";
import Text from "../Text/Text";
import style from "./Navbar.module.css";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { isAuthenticated } from "../../API/Auth";
import { UserAPI } from "../../API/User";

function Navbar() {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState("");

    useEffect(() => {
        async function load() {
            try {
                const authenticated = await isAuthenticated();
                setIsLoggedIn(authenticated);

                if (authenticated) {
                    const me = await UserAPI.getMe();
                    setUsername(me.accountName);
                }
            } catch {
                // dont know what to put here
            }
        }

        load();
    }, []);

    const handleLogout = () => {
        UserAPI.logout();
        setIsLoggedIn(false);
        setUsername("");
        navigate("/");
    };

    return (
        <div className={style.bar}>
            <Link to="/">
                <Text variant="logo" color="var(--green)">
                    Game_Reviewer+
                </Text>
            </Link>
            <Search />
            {isLoggedIn ? (
                <>
                    <LogoutButton onClick={handleLogout} />
                    <Link to={`/user/${username}`} className={style.profileLink}></Link>
                </>
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
    );
}

export default Navbar;
