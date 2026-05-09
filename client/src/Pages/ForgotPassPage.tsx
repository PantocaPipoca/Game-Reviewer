import { useState } from "react";
import Panel from "../Components/Panel/Panel";
import InputField from "../Components/InputField/InputField";
import Button from "../Components/Buttons/Button";
import Text from "../Components/Text/Text";
import style from "./RegisterPage.module.css";
import CLIENT from "../API/Client";
import { useNavigate } from "react-router-dom";

function ForgotPassPage() {
    const [username, setUsername] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    const submitUsername = async () => {
        setLoading(true);
        try {
            await CLIENT.post("/users/recover-password", {
                username,
            });
            navigate(`/reset-password#${username}`);
        } catch (err: any) {
            const message = err.response?.data?.message || "User not found";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={style.page}>
            <Panel type="main" className={style.panel}>
                <Text variant="h2">PLEASE INSERT YOUR USERNAME</Text>
                <div className={style.fields}>
                    <div className={style.fieldGroup}>
                        <Text>userName</Text>
                        <InputField
                            type="text"
                            placeholder="We can't help if you forgot your username... YET!"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") submitUsername();
                            }}
                        />
                    </div>
                </div>
                <Button color="var(--green)" tColor="var(--reverseText)" onClick={submitUsername} disabled={loading}>
                    <Text>SEND</Text>
                </Button>
                {error && <Text color="var(--pink)"> * {error}</Text>}
            </Panel>
        </div>
    );
}

export default ForgotPassPage;
