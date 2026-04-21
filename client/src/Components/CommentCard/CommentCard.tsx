import style from "./CommentCard.module.css";
import Panel from "../Panel/Panel";
import Text from "../Text/Text";
import EditButton from "../Buttons/EditButton";
import { REVIEW_CONSTS } from "../../Types/Consts";
import InputField from "../InputField/InputField";

export type CommentCardProps = {
    showUser?: boolean;
    userName?: string;
    userAvatar?: string;
    description?: string;
    date: string;
    canModify?: boolean;
    isModifying?: boolean;
};

const months: string[] = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

function parseDate(date: string): string {
    let arr: string[] = date.replace(/\.[0-9]+Z/g, "").split(/[T:-]+/g);
    if (arr.length != 6) return "???";
    const index: number = +arr[1];
    if (isNaN(index) || index <= 0 || index > months.length) return "???";
    return arr[3] + ":" + arr[4] + ":" + arr[5] + ", " + months[index - 1] + " " + arr[2] + ", " + arr[0];
}

function CommentCard({
    showUser = false,
    userName = "######",
    userAvatar = "https://i.pinimg.com/736x/2f/15/f2/2f15f2e8c688b3120d3d26467b06330c.jpg",
    description = "",
    date = "",
    canModify = false,
    isModifying = false,
}: CommentCardProps) {
    return (
        <div className={style.panel}>
            <Panel type="secondary" direction="row" className={style.fullWidth}>
                {showUser ? (
                    <div className={style.userBlock} tabIndex={0}>
                        <img src={userAvatar} className={style.avatar} />
                        <Text variant="h3">{userName}</Text>
                    </div>
                ) : (
                    <div></div>
                )}
                {isModifying ? (
                    <div flex-direction="column" className={style.fullWidth}>
                        <Text variant="small" color="var(--green)">
                            characters left:{" "}
                        </Text>
                        <Text
                            variant="small"
                            color={
                                REVIEW_CONSTS.maxCommentLength === description.length ? "var(--pink)" : "var(--cyan)"
                            }
                        >
                            {REVIEW_CONSTS.maxCommentLength - description.length}
                        </Text>
                        <InputField
                            value={description}
                            multiline
                            placeholder="edit your comment here..."
                            onChange={() => {}}
                        />
                    </div>
                ) : (
                    <div flex-direction="column" className={style.fullWidth}>
                        <Text variant="small" color="var(--cyan)">
                            Posted on {parseDate(date)}
                        </Text>
                        <Text variant="small" multiline>
                            {`\n` + description}
                        </Text>
                    </div>
                )}
                {canModify && !isModifying && <EditButton onClick={() => {}}></EditButton>}
            </Panel>
        </div>
    );
}

export default CommentCard;
