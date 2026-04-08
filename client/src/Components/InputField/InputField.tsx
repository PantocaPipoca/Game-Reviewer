import { useEffect, useRef } from "react";
import type { ChangeEvent, FocusEvent, KeyboardEvent, MouseEvent as ReactMouseEvent } from "react";
import Text from "../Text/Text";
import style from "./InputField.module.css";

type InputFieldProps = {
    placeholder?: string;
    type?: "text" | "password" | "email" | "search" | "number";
    value?: string;
    onChange?: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    onKeyDown?: (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    onFocus?: (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    onBlur?: (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    className?: string;
    variant?: "h1" | "h2" | "h3" | "body" | "small";
    multiline?: boolean;
};

function InputField({
    placeholder = "",
    type = "text",
    value,
    onChange,
    onKeyDown,
    onFocus,
    onBlur,
    variant = "body",
    multiline = false,
}: InputFieldProps) {
    const isNumeric = type === "number";
    const renderedType = isNumeric ? "text" : type;
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    useEffect(() => {
        if (!multiline || !textareaRef.current) return;
        textareaRef.current.style.height = "0px";
        textareaRef.current.style.height = `${Math.max(180, textareaRef.current.scrollHeight)}px`;
    }, [multiline, value]);

    function handleChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        if (isNumeric) {
            const digitsOnly = e.target.value.replace(/\D/g, "");
            if (digitsOnly !== e.target.value) {
                e.target.value = digitsOnly;
            }
        }
        onChange?.(e);
    }

    return (
        <div className={`${style.inputField} ${multiline ? style.inputFieldMultiline : ""}`}>
            <Text variant={variant}>{`>`}</Text>
            {multiline ? (
                <textarea
                    ref={textareaRef}
                    className={`${variant} ${style.textareaInput}`}
                    placeholder={placeholder}
                    value={value}
                    onChange={handleChange}
                    onKeyDown={onKeyDown}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    rows={1}
                />
            ) : (
                <input
                    className={`${variant} ${style.input}`}
                    type={renderedType}
                    inputMode={isNumeric ? "numeric" : undefined}
                    pattern={isNumeric ? "[0-9]*" : undefined}
                    placeholder={placeholder}
                    value={value}
                    onChange={handleChange}
                    onKeyDown={onKeyDown}
                    onFocus={onFocus}
                    onBlur={onBlur}
                />
            )}
        </div>
    );
}

export default InputField;
