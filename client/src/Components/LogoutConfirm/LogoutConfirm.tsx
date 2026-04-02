import Text from "../Text/Text";
import Button from "../Buttons/Button";
import style from "./LogoutConfirm.module.css";
import { useCloseOverlay } from "../../Hooks/CloseOverlay";

type Props = {
    onConfirm: () => void;
    onCancel: () => void;
};

function LogoutConfirmOverlay({ onConfirm, onCancel }: Props) {
    useCloseOverlay(onCancel);

    return (
        <div className={style.backdrop} onClick={onCancel}>
            <div className={style.panel} onClick={(e) => e.stopPropagation()}>
                <Text variant="h3" color="var(--mainText)">
                    Log out?
                </Text>
                <Text color="var(--mutedText)">Are you sure you want to log out?</Text>
                <div className={style.actions}>
                    <Button className={style.cancelButton} onClick={onCancel}>
                        <Text color="var(--mainText)">{`X CANCEL`}</Text>
                    </Button>
                    <Button className={style.confirmButton} onClick={onConfirm}>
                        <Text color="var(--pink)">{`> LOGOUT`}</Text>
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default LogoutConfirmOverlay;
