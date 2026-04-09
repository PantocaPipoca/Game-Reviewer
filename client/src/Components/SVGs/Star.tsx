import type { CssVar } from "../../Types/Types";

type StarProps = {
    type?: "full" | "half" | "empty";
    size?: number;
    color?: CssVar;
};

function Star({ type = "empty", size = 16, color = "var(--green)" }: StarProps) {
    const baseColor: CssVar = "var(--mutedText)";

    return (
        <svg width={size} height={size} viewBox="0 0 24 24">
            <path
                d="M12 2L14.9 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L9.1 8.26L12 2Z"
                fill={baseColor}
            />

            {type === "full" && (
                <path
                    d="M12 2L14.9 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L9.1 8.26L12 2Z"
                    fill={color}
                />
            )}

            {type === "half" && (
                <path
                    d="M12 2L14.9 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L9.1 8.26L12 2Z"
                    fill={color}
                    clipPath="inset(0 50% 0 0)"
                />
            )}
        </svg>
    );
}

export default Star;
