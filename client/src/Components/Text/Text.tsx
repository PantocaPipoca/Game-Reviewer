import type { CSSProperties, ElementType, ReactNode } from "react";
import type { CssVar } from "../../Types/Types";
import textStyle from "./Text.module.css";

type TextProps = {
    as?: ElementType;
    children?: ReactNode;
    variant?: "h1" | "h2" | "h3" | "body" | "small" | "logo";
    className?: string;
    color?: CssVar;
    style?: CSSProperties;
    multiline?: boolean;
};

function Text({
    as: Tag = "span",
    children,
    variant = "body",
    className = "",
    color,
    style,
    multiline,
    ...rest
}: TextProps & Record<string, unknown>) {
    return multiline ? (
        <Tag
            className={`${variant} ${className} ${textStyle.multiline}`}
            style={{ color, ...style }}
            {...rest}
            rows={1}
        >
            {children}
        </Tag>
    ) : (
        <Tag className={`${variant} ${className}`} style={{ color, ...style }} {...rest}>
            {children}
        </Tag>
    );
}

export default Text;
