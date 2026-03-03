import Button from "./Button";
import Text from "../Text/Text";
import style from "./Buttons.module.css";
import type { CssVar } from "../../Types/Types";

type LoginButtonProps = {
    color?: CssVar;
    tColor?: CssVar;
};

function LoginButton({ color, tColor }: LoginButtonProps) {
    return (
        <Button className={style.login} color={color} tColor={tColor}>
            <Text>LOGIN</Text>
        </Button>
    );
}

export default LoginButton;
