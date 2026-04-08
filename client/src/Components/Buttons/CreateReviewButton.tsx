import { useNavigate, useParams } from "react-router-dom";
import Button from "./Button";
import Text from "../Text/Text";
import style from "./CreateReviewButton.module.css";

function CreateReviewButton() {
    const navigate = useNavigate();
    const { gameID } = useParams<{ gameID: string }>();

    function handleClick() {
        if (!gameID) return;
        navigate(`/game/${gameID}/review/create`);
    }

    return (
        <Button
            className={style.createReviewButton}
            color="var(--transparent)"
            onClick={handleClick}
            aria-label="Create Review"
        >
            <Text variant="h1" className={style.plus}>
                +
            </Text>
        </Button>
    );
}

export default CreateReviewButton;
