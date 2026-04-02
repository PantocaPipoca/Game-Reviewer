import { useNavigate } from "react-router-dom";
import Text from "../Text/Text";
import Button from "../Buttons/Button";
import defaultPfp from "../../Assets/default-pfp.png";
import style from "./FollowerItem.module.css";

type Props = {
    username: string;
    isOwner: boolean;
    type: "followers" | "following";
    onRemove: (username: string) => void;
};

function FollowerItem({ username, isOwner, type, onRemove }: Props) {
    const navigate = useNavigate();
    return (
        <div className={style.item}>
            <div className={style.leftSide} onClick={() => navigate(`/user/${username}`)}>
                <div className={style.avatarWrapper}>
                    <img src={defaultPfp} alt={username} className={style.avatar} />
                </div>
                <Text color="var(--mainText)">{username}</Text>
            </div>
            <div className={style.actions}>
                {isOwner && (
                    <Button
                        className={style.actionButton}
                        onClick={() => onRemove(username)}
                    >
                        <Text variant="small" color={type === "followers" ? "var(--mutedText)" : "var(--pink)"}>
                            {type === "followers" ? "X REMOVE" : "X UNFOLLOW"}
                        </Text>
                    </Button>
                )}
            </div>
        </div>
    );
}

export default FollowerItem;