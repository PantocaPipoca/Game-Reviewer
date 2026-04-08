import { useMemo, useRef, useState } from "react";
import { useCloseOverlay } from "../../Hooks/CloseOverlay";
import Panel from "../Panel/Panel";
import Text from "../Text/Text";
import style from "./Dropdown.module.css";

type DropdownOption = {
    value: string;
    label: string;
};

type DropdownProps = {
    value?: string;
    onChange?: (value: string) => void;
    options: DropdownOption[];
};

function Dropdown({ value, onChange, options }: DropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement | null>(null);
    useCloseOverlay(() => setIsOpen(false), rootRef);

    const selectedLabel = useMemo(
        () => options.find((option) => option.value === value)?.label ?? "Select...",
        [options, value]
    );

    return (
        <div ref={rootRef} className={`${style.dropdownRoot}`}>
            <button type="button" className={style.dropdownTrigger} onClick={() => setIsOpen((v) => !v)}>
                <Text variant="body">{`>`}</Text>
                <Text variant="body" className={style.dropdownValue}>
                    {selectedLabel}
                </Text>
                <Text className={`${isOpen ? style.selectArrowOpen : ""}`}>▼</Text>
            </button>

            {isOpen && (
                <Panel type="secondary" className={style.dropdownMenu}>
                    {options.map((option) => (
                        <Panel
                            key={option.value}
                            type="terciary"
                            className={`${style.dropdownItem} ${option.value === value ? style.dropdownItemActive : ""}`}
                            interactive
                            onClick={() => {
                                onChange?.(option.value);
                                setIsOpen(false);
                            }}
                        >
                            <Text variant="body">{option.label}</Text>
                        </Panel>
                    ))}
                </Panel>
            )}
        </div>
    );
}

export default Dropdown;
