import Button from "./Button";
import Text from "../Text/Text";
import style from "./Buttons.module.css";

function LoginButton() {
    return (
        <Button className={style.login}>
            <Text color="var(--reverseText)">LOGIN</Text>
        </Button>
    );
}

export default LoginButton;
