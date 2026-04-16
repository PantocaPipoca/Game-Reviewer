import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ReactionAPI } from "../../API/Reactions";
import DownvoteButton from "../Buttons/DownvoteButton";
import UpvoteButton from "../Buttons/UpvoteButton";
import Text from "../Text/Text";

type ReviewReactionsProps = {
    reviewer: string;
    reviewed: number;
    className?: string;
};

function ReviewReactions({ reviewer, reviewed, className = "" }: ReviewReactionsProps) {
    const navigate = useNavigate();
    const [likes, setLikes] = useState(0);
    const [dislikes, setDislikes] = useState(0);
    const [reaction, setReaction] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const [l, d] = await Promise.all([
                    ReactionAPI.getLikes(reviewer, reviewed),
                    ReactionAPI.getDislikes(reviewer, reviewed),
                ]);
                setLikes(l);
                setDislikes(d);
                try {
                    const r = await ReactionAPI.getReaction(reviewer, reviewed);
                    setReaction(r.value);
                } catch {
                    setReaction(null);
                }
            } catch {
                // counts stay 0
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [reviewer, reviewed]);

    async function handleReaction(next: boolean) {
        try {
            if (reaction === next) {
                await ReactionAPI.removeReaction(reviewer, reviewed);
            } else if (next) {
                await ReactionAPI.like(reviewer, reviewed);
            } else {
                await ReactionAPI.dislike(reviewer, reviewed);
            }
            const [l, d] = await Promise.all([
                ReactionAPI.getLikes(reviewer, reviewed),
                ReactionAPI.getDislikes(reviewer, reviewed),
            ]);
            setLikes(l);
            setDislikes(d);
            setReaction(reaction === next ? null : next);
        } catch (error: any) {
            if (error?.response?.status === 401) navigate("/login");
        }
    }

    return (
        <div className={className}>
            <UpvoteButton active={reaction === true} disabled={loading} onClick={() => handleReaction(true)} />
            <Text variant="h3">{likes}</Text>
            <DownvoteButton active={reaction === false} disabled={loading} onClick={() => handleReaction(false)} />
            <Text variant="h3">{dislikes}</Text>
        </div>
    );
}

export default ReviewReactions;
