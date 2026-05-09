import { useState } from "react";
import Panel from "../Components/Panel/Panel";
import InputField from "../Components/InputField/InputField";
import Button from "../Components/Buttons/Button";
import Text from "../Components/Text/Text";
import style from "./RegisterPage.module.css";
import CLIENT from "../API/Client";
import { useLocation, useNavigate } from "react-router-dom";

function ValidationPage() {
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const navigate = useNavigate();
    const location = useLocation();
    const redirectPath = (location.state as { from?: string } | undefined)?.from || "/";

    const submitCode = async () => {
        setLoading(true);
        try {
            await CLIENT.get("/users/validation", {
                params: {
                    user: window.location.hash.slice(1),
                    code,
                },
            });
            navigate(redirectPath, { replace: true });
        } catch (err: any) {
            const message = err.response?.data?.message || "wrong code";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={style.page}>
            <Panel type="main" className={style.panel}>
                <Text variant="h2">PLEASE INSERT CODE SENT BY EMAIL</Text>
                <div className={style.fields}>
                    <InputField
                        type="text"
                        placeholder="are you ready to review some games?"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") submitCode();
                        }}
                    />
                </div>
                <Button color="var(--green)" tColor="var(--reverseText)" onClick={submitCode} disabled={loading}>
                    <Text>SUBMIT</Text>
                </Button>
                {error && <Text color="var(--pink)"> * {error}</Text>}
            </Panel>
        </div>
    );
}

export default ValidationPage;
