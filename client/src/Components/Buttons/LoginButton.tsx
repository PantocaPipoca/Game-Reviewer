import Button from "./Button";
import Text from "../Text/Text";
import style from "./Buttons.module.css";
import type { CssVar } from "../../Types/Types";

type LoginButtonProps = {
    color?: CssVar;
    tColor?: CssVar;
    onClick?: () => void;
    disabled?: boolean;
};

function LoginButton({ color, tColor, onClick, disabled }: LoginButtonProps) {
    return (
        <Button className={style.login} color={color} tColor={tColor} onClick={onClick} disabled={disabled}>
            <Text>LOGIN</Text>
        </Button>
    );
}

export default LoginButton;
