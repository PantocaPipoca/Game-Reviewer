import Button from "../Buttons/Button";
import LoginButton from "../Buttons/LoginButton";
import Search from "../Search/Search";
import Text from "../Text/Text";
import style from "./Navbar.module.css";

function Navbar() {
    return (
        <div className={style.bar}>
            <Text variant="h1" color="var(--green)">
                Game_Reviewer+
            </Text>
            <Search />
            <Button color="var(--transparent)">
                <Text color="var(--mainText)"> SIGNUP</Text>
            </Button>
            <LoginButton />
        </div>
    );
}

export default Navbar;
