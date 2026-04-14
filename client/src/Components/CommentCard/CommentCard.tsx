import style from "./CommentCard.module.css";
import Panel from "../Panel/Panel";
import Text from "../Text/Text";

export type CommentCardProps = {
    showUser?: boolean;
    userName?: string;
    description?: string;
    canModify?: boolean;
    isModifying?: boolean;
};

function CommentCard({
    showUser = false,
    userName = "######",
    description = "",
    canModify = false,
    isModifying = false,
}: CommentCardProps) {
    return (
        <div className={style.panel}>
            <Panel type="secondary" direction="row" className={style.fullWidth}>
                {showUser ? (
                    <div className={style.userBlock} role="button" tabIndex={0}>
                        <Text variant="h3">{userName}</Text>
                    </div>
                ) : (
                    <div></div>
                )}
            </Panel>
        </div>
    );
}

export default CommentCard;
