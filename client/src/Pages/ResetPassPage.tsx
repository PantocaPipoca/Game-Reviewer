import { useState } from "react";
import Panel from "../Components/Panel/Panel";
import InputField from "../Components/InputField/InputField";
import Button from "../Components/Buttons/Button";
import Text from "../Components/Text/Text";
import style from "./RegisterPage.module.css";
import CLIENT from "../API/Client";
import { useNavigate } from "react-router-dom";
import { UserAPI } from "../API/User";

function ResetPassPage() {
    const [code, setCode] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    const submitResetPassword = async () => {
        setLoading(true);
        const username = window.location.hash.slice(1);
        try {
            if (password != confirmPassword) {
                setError("passwords don't match");
                return;
            }
            await CLIENT.post("/users/reset-password", {
                passResetCode: Number(code),
                username,
                password,
            });
            await UserAPI.login({ username: username, password });
            navigate("/");
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
                <Text variant="h2">PLEASE INSERT CODE SENT BY EMAIL AND NEW PASSWORD</Text>
                <div className={style.fields}>
                    <div className={style.fieldGroup}>
                        <Text>code</Text>
                        <InputField
                            type="text"
                            placeholder="email code"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") submitResetPassword();
                            }}
                        />
                    </div>
                    <div className={style.fieldGroup}>
                        <Text>password</Text>
                        <InputField
                            type="password"
                            placeholder="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") submitResetPassword();
                            }}
                        />
                    </div>
                    <div className={style.fieldGroup}>
                        <Text>confirm password</Text>
                        <InputField
                            type="password"
                            placeholder="confirm password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") submitResetPassword();
                            }}
                        />
                    </div>
                </div>
                <Button
                    color="var(--green)"
                    tColor="var(--reverseText)"
                    onClick={submitResetPassword}
                    disabled={loading}
                >
                    <Text>SUBMIT</Text>
                </Button>
                {error && <Text color="var(--pink)"> * {error}</Text>}
            </Panel>
        </div>
    );
}

export default ResetPassPage;
