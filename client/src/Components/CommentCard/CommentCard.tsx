import style from "./CommentCard.module.css";
import Panel from "../Panel/Panel";
import Text from "../Text/Text";
import EditButton from "../Buttons/EditButton";
import { REVIEW_CONSTS } from "../../Types/Consts";
import InputField from "../InputField/InputField";
import Button from "../Buttons/Button";
import { CommentAPI } from "../../API/Comments";
import buttonStyle from "../Buttons/Buttons.module.css";

export type CommentCardProps = {
    reviewer?: string;
    reviewed?: number;
    showUser: boolean;
    userName: string;
    displayName: string;
    userAvatar?: string;
    description: string;
    date: string;
    id: string;
    canModify: boolean;
    isModifying: boolean;
    setReplyToEdit: React.Dispatch<React.SetStateAction<string | undefined>>;
    setReplyToEditText: React.Dispatch<React.SetStateAction<string>>;
    setReplyToEditFinish: (id: string, text: string) => void;
    setReplyToRemove: (id: string) => void;
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
    reviewer,
    reviewed,
    showUser = false,
    userName,
    displayName,
    userAvatar = "https://i.pinimg.com/736x/2f/15/f2/2f15f2e8c688b3120d3d26467b06330c.jpg",
    description = "",
    date = "",
    id,
    canModify,
    isModifying,
    setReplyToEdit,
    setReplyToEditText,
    setReplyToEditFinish,
    setReplyToRemove,
}: CommentCardProps) {
    return (
        <div className={style.panel}>
            <Panel type="secondary" direction="row" className={style.fullWidth}>
                {showUser ? (
                    <div className={style.userBlock} tabIndex={0}>
                        <img src={userAvatar} className={style.avatar} />
                        <Text variant="body" className={style.userName} title={displayName}>
                            {displayName}
                        </Text>
                    </div>
                ) : (
                    <div></div>
                )}
                {isModifying ? (
                    <div flex-direction="column" className={style.fullWidth}>
                        <Text variant="body" color="var(--mutedText)">
                            characters left:{" "}
                        </Text>
                        <Text
                            variant="body"
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
                            onChange={(e) => {
                                if (e.target.value.length <= REVIEW_CONSTS.maxCommentLength)
                                    setReplyToEditText(e.target.value);
                            }}
                        />
                        <Button
                            className={`${style.editReplyButton}`}
                            color="var(--transparent)"
                            onClick={async () => {
                                if (reviewer !== undefined && reviewed !== undefined) {
                                    setReplyToEditFinish(id, description);
                                    setReplyToEdit(undefined);
                                    await CommentAPI.edit(reviewer, reviewed, id, description);
                                }
                            }}
                            aria-label="Create Reply"
                        >
                            <Text variant="h3">FINISH EDITING</Text>
                        </Button>
                    </div>
                ) : (
                    <div flex-direction="column" className={style.fullWidth}>
                        <Text variant="body" color="var(--cyan)">
                            Posted on {parseDate(date)}
                        </Text>
                        <Text variant="body" multiline>
                            {`\n` + description}
                        </Text>
                    </div>
                )}
                {canModify && !isModifying && (
                    <>
                        <EditButton
                            onClick={() => {
                                setReplyToEdit(id);
                                setReplyToEditText(description);
                            }}
                        />
                        <Button
                            className={buttonStyle.edit}
                            color="var(--transparent)"
                            tColor="var(--pink)"
                            onClick={async () => {
                                if (reviewer !== undefined && reviewed !== undefined) {
                                    setReplyToRemove(id);
                                    setReplyToEdit(id);
                                    await CommentAPI.remove(reviewer, reviewed, id);
                                }
                            }}
                        >
                            <svg width={18} />
                            X
                            <svg width={18} />
                        </Button>
                    </>
                )}
            </Panel>
        </div>
    );
}

export default CommentCard;
