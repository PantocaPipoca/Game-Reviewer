import Button from "./Button";
import Text from "../Text/Text";
import style from "./Buttons.module.css";
import type { CssVar } from "../../Types/Types";

type SignupButtonProps = {
    color?: CssVar;
    tColor?: CssVar;
};

function SignupButton({ color, tColor }: SignupButtonProps) {
    return (
        <Button className={style.signup} color={color} tColor={tColor}>
            <Text>SIGN UP</Text>
        </Button>
    );
}

export default SignupButton;
