import Button from "./Button";
import Text from "../Text/Text";
import style from "./Buttons.module.css";

type FilterButtonProps = {
    label: string;
    active?: boolean;
    onClick?: () => void;
};

function FilterButton({ label, active = false, onClick }: FilterButtonProps) {
    return (
        <Button className={`${style.filterButton} ${active ? style.filterButtonActive : ""}`} onClick={onClick}>
            <Text variant="body" color={active ? "var(--pink)" : undefined}>
                {label}
            </Text>
        </Button>
    );
}

export default FilterButton;
