import Button from "./Button";
import style from "./Buttons.module.css";

type EditButtonProps = {
    onClick?: () => void;
    disabled?: boolean;
};

function EditIcon() {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
    );
}

function EditButton({ onClick, disabled }: EditButtonProps) {
    return (
        <Button
            className={style.edit}
            color="var(--transparent)"
            tColor="var(--mutedText)"
            onClick={onClick}
            disabled={disabled}
        >
            <EditIcon />
        </Button>
    );
}

export default EditButton;
