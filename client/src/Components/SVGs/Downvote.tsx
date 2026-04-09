type DownvoteProps = {
    size?: number;
    className?: string;
};

function Downvote({ size = 24, className }: DownvoteProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
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
