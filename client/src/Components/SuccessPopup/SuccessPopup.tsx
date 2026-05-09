import Text from "../Text/Text";
import style from "./SuccessPopup.module.css";

type Props = {
    text: string;
    durationSeconds: number;
    visible: boolean;
};

function SuccessPopup({ text, durationSeconds, visible }: Props) {
    if (!visible || !text) return null;

    return (
        <div className={style.container}>
            <div className={style.panel}>
                <Text variant="body" color="var(--mainText)">
                    {text}
                </Text>
                <div className={style.progress} style={{ animationDuration: `${durationSeconds}s` }} />
            </div>
        </div>
    );
}

export default SuccessPopup;
