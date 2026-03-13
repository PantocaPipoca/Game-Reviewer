import Button from "./Button";
import Text from "../Text/Text";
import style from "./Buttons.module.css";
import type { CssVar } from "../../Types/Types";

type LogoutButtonProps = {
    color?: CssVar;
    tColor?: CssVar;
    onClick?: () => void;
    disabled?: boolean;
};

function LogoutButton({ color, tColor, onClick, disabled }: LogoutButtonProps) {
    return (
        <Button className={style.logout} color={color} tColor={tColor} onClick={onClick} disabled={disabled}>
            <Text>LOG OUT</Text>
        </Button>
    );
}

export default LogoutButton;
