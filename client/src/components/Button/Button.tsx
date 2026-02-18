import type { ReactNode } from "react";
import style from "./Button.module.css";

type ButtonTypes = {
    children?: ReactNode;
};

function Button({ children }: ButtonTypes) {
    return <button className={style.Button}>{children}</button>;
}

export default Button;
