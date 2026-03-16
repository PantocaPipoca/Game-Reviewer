import Button from "./Button";
import Text from "../Text/Text";
import style from "./Buttons.module.css";
import type { CssVar } from "../../Types/Types";

type SignupButtonProps = {
    color?: CssVar;
    tColor?: CssVar;
    onClick?: () => void;
    disabled?: boolean;
};

function SignupButton({ color, tColor, onClick, disabled }: SignupButtonProps) {
    return (
        <Button className={style.signup} color={color} tColor={tColor} onClick={onClick} disabled={disabled}>
            <Text>SIGN UP</Text>
        </Button>
    );
}

export default SignupButton;
