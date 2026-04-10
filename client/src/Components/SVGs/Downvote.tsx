import type { CssVar } from "../../Types/Types";

type DownvoteProps = {
    size?: number;
    className?: string;
    color?: CssVar;
};

function Downvote({ size = 24, className, color = "var(--mainText)" }: DownvoteProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M12 5v14" />
            <path d="M19 12l-7 7-7-7" />
        </svg>
    );
}

export default Downvote;
