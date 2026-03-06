import type { ChangeEvent } from "react";
import Text from "../Text/Text";
import style from "./InputField.module.css";

type InputFieldProps = {
    placeholder?: string;
    type?: "text" | "password" | "email" | "search" | "number";
    value?: string;
    onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
    className?: string;
    variant?: "h1" | "h2" | "h3" | "body" | "small";
};

function InputField({
    placeholder = "",
    type = "text",
    value,
    onChange,
    className = "",
    variant = "body",
}: InputFieldProps) {
    return (
        <div className={`${style.inputField} ${className}`}>
            <Text variant={variant}>{`>`}</Text>
            <input
                className={`${variant} ${style.input}`}
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
            />
        </div>
    );
}

export default InputField;
