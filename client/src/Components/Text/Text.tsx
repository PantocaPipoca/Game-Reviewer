import type { CSSProperties, ReactNode } from "react";
import type { CssVar } from "../../Types/Types";

type TextProps = {
    children: ReactNode;
    variant?: "h1" | "h2" | "h3" | "body" | "small" | "logo";
    className?: string;
    color?: CssVar;
    style?: CSSProperties;
};

function Text({ children, variant = "body", className = "", color, style }: TextProps) {
    return (
        <span className={`${variant} ${className}`} style={{ color, ...style }}>
            {children}
        </span>
    );
}

export default Text;
