import Button from "../Buttons/Button";
import LoginButton from "../Buttons/LoginButton";
import SignupButton from "../Buttons/SignupButton";
import Search from "../Search/Search";
import Text from "../Text/Text";
import style from "./Navbar.module.css";

function Navbar() {
    return (
        <div className={style.bar}>
            <Text variant="logo" color="var(--green)">
                Game_Reviewer+
            </Text>
            <Search />
            <SignupButton />
            <LoginButton />
        </div>
    );
}

export default Navbar;
