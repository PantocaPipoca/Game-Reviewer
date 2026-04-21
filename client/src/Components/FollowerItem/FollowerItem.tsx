import { useNavigate } from "react-router-dom";
import Text from "../Text/Text";
import Button from "../Buttons/Button";
import defaultAvatar from "../../Assets/default-pfp.png";
import style from "./FollowerItem.module.css";

type Props = {
    username: string;
    avatar: string | null;
    isOwner: boolean;
    type: "followers" | "following";
    pending?: boolean;
    onRemove: (username: string) => void;
};

function FollowerItem({ username, avatar, isOwner, type, pending = false, onRemove }: Props) {
    const navigate = useNavigate();

    const buttonLabel = type === "followers" ? "X REMOVE" : pending ? "X CANCEL" : "X UNFOLLOW";

    const buttonColor = type === "followers" || pending ? "var(--mutedText)" : "var(--pink)";

    return (
        <div className={style.item}>
            <div className={style.leftSide} onClick={() => navigate(`/user/${username}`)}>
                <div className={style.avatarWrapper}>
                    <img src={avatar ?? defaultAvatar} alt={username} className={style.avatar} />
                </div>
                <Text color={pending ? "var(--mutedText)" : "var(--mainText)"}>{username}</Text>
            </div>
            <div className={style.actions}>
                {isOwner && (
                    <Button className={style.actionButton} onClick={() => onRemove(username)}>
                        <Text variant="small" color={buttonColor}>
                            {buttonLabel}
                        </Text>
                    </Button>
                )}
            </div>
        </div>
    );
}

export default FollowerItem;
