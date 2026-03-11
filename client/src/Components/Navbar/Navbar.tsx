import { useState } from "react";
import LoginButton from "../Buttons/LoginButton";
import LogoutButton from "../Buttons/LogoutButton";
import SignupButton from "../Buttons/SignupButton";
import Search from "../InputField/Search";
import Text from "../Text/Text";
import style from "./Navbar.module.css";
import { Link, useNavigate } from "react-router-dom";
import { isAuthenticated } from "../../API/Auth";
import { UserAPI } from "../../API/User";

function Navbar() {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(isAuthenticated());

    const handleLogout = () => {
        UserAPI.logout();
        setIsLoggedIn(false);
        navigate("/");
    };

    return (
        <div className={style.bar}>
            <Text variant="logo" color="var(--green)">
                Game_Reviewer+
            </Text>
            <Search />
            {isLoggedIn ? (
                <>
                    <LogoutButton onClick={handleLogout} />
                    <Link to="/me" className={style.profileLink} />
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
