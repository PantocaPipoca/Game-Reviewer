import { useNavigate, useParams } from "react-router-dom";
import Button from "./Button";
import Text from "../Text/Text";
import style from "./Buttons.module.css";

type CreateReviewButtonProps = {
    gameID?: number | string;
    size?: "default" | "full";
};

function CreateReviewButton({ gameID, size = "default" }: CreateReviewButtonProps) {
    const navigate = useNavigate();
    const { gameID: routeGameID } = useParams<{ gameID: string }>();

    function handleClick() {
        const targetGameID = gameID ?? routeGameID;
        if (!targetGameID) return;
        navigate(`/game/${targetGameID}/review/create`);
    }

    return (
        <Button
            className={`${style.createReview} ${size === "full" ? style.createReviewFull : ""}`}
            color="var(--transparent)"
            onClick={handleClick}
            aria-label="Create Review"
        >
            <Text variant="h1">+</Text>
        </Button>
    );
}

export default CreateReviewButton;
