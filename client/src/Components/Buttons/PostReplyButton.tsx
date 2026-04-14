import { useNavigate } from "react-router-dom";
import style from "./Buttons.module.css";
import Text from "../Text/Text";
import Button from "./Button";

type PostReplyButtonProps = {
    reviewer: string;
    reviewed: number;
    comment: string;
};

function PostReplyButton({ reviewer, reviewed, comment }: PostReplyButtonProps) {
    const navigate = useNavigate();

    function handleClick() {
        console.log(reviewer, reviewed);
        if (!reviewer || !reviewed) return;
        navigate(`/reviews/${reviewer}/${reviewed}/comments/`);
    }

    return (
        <Button className={style.createComment} onClick={handleClick} disabled={comment.length === 0}>
            <Text>POST</Text>
        </Button>
    );
}

export default PostReplyButton;
