type StarProps = {
    type?: "full" | "half" | "empty";
    size?: number;
};

function Star({ type = "empty", size = 16 }: StarProps) {
    const getFill = () => {
        if (type === "full") return "var(--green)";
        if (type === "half") return "url(#half)";
        return "var(--mutedText)";
    };

    return (
        <svg width={size} height={size} viewBox="0 0 24 24">
            {type === "half" && (
                <defs>
                    <linearGradient id="half">
                        <stop offset="50%" stopColor="var(--green)" />
                        <stop offset="50%" stopColor="var(--mutedText)" />
                    </linearGradient>
                </defs>
            )}

            <path
                d="M12 2L14.9 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L9.1 8.26L12 2Z"
                fill={getFill()}
            />
        </svg>
    );
}

export default Star;
