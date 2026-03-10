import type { CSSProperties, ElementType, ReactNode } from "react";
import type { CssVar } from "../../Types/Types";

type TextProps = {
    as?: ElementType;
    children?: ReactNode;
    variant?: "h1" | "h2" | "h3" | "body" | "small" | "logo";
    className?: string;
    color?: CssVar;
    style?: CSSProperties;
};

function Text({
    as: Tag = "span",
    children,
    variant = "body",
    className = "",
    color,
    style,
    ...rest
}: TextProps & Record<string, unknown>) {
    return (
        <Tag className={`${variant} ${className}`} style={{ color, ...style }} {...rest}>
            {children}
        </Tag>
    );
}

export default Text;
