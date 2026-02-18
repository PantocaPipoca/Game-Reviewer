import type { ReactNode } from "react";

type TextProps = {
    children: ReactNode;
    variant?: "h1" | "h2" | "h3" | "body" | "small";
    className?: string;
};

function Text({ children, variant = "body", className = "" }: TextProps) {
    return <span className={`${variant} ${className}`}>{children}</span>;
}

export default Text;
