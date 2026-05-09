type UpvoteProps = {
    size?: number;
    className?: string;
};

function Upvote({ size = 24, className }: UpvoteProps) {
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
            <path d="M12 19V5" />
            <path d="M5 12l7-7 7 7" />
        </svg>
    );
}

export default Upvote;
