import Button from "./Button";
import style from "./Buttons.module.css";
import Edit from "../SVGs/Edit";

type EditButtonProps = {
    onClick?: () => void;
    disabled?: boolean;
};

function EditButton({ onClick, disabled }: EditButtonProps) {
    return (
        <Button
            className={style.edit}
            color="var(--transparent)"
            tColor="var(--mutedText)"
            onClick={onClick}
            disabled={disabled}
        >
            <Edit />
        </Button>
    );
}

export default EditButton;
