import Button from "./Button";
import style from "./Buttons.module.css";
import Downvote from "../SVGs/Downvote";

type DownvoteButtonProps = {
    active?: boolean;
    disabled?: boolean;
    onClick?: () => void;
};

function DownvoteButton({ active = false, disabled = false, onClick }: DownvoteButtonProps) {
    return (
        <Button
            className={`${style.voteButton} ${active ? style.voteButtonActive : ""}`}
            color="var(--transparent)"
            onClick={onClick}
            disabled={disabled}
        >
            <Downvote className={style.voteIcon} />
        </Button>
    );
}

export default DownvoteButton;
