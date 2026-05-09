import Button from "./Button";
import style from "./Buttons.module.css";
import Upvote from "../SVGs/Upvote";

type UpvoteButtonProps = {
    active?: boolean;
    disabled?: boolean;
    onClick?: () => void;
};

function UpvoteButton({ active = false, disabled = false, onClick }: UpvoteButtonProps) {
    return (
        <Button
            className={`${style.voteButton} ${active ? style.voteButtonActive : ""}`}
            color="var(--transparent)"
            onClick={onClick}
            disabled={disabled}
        >
            <Upvote className={style.voteIcon} />
        </Button>
    );
}

export default UpvoteButton;
