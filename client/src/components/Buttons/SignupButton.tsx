import Button from "./Button";
import Text from "../Text/Text";
import style from "./Buttons.module.css";

function SignupButton() {
    return (
        <Button className={style.signup}>
            <Text>SIGN UP</Text>
        </Button>
    );
}

export default SignupButton;
