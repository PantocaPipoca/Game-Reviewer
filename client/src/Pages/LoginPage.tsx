import { useEffect, useState } from "react";
import Panel from "../Components/Panel/Panel";
import InputField from "../Components/InputField/InputField";
import LoginButton from "../Components/Buttons/LoginButton";
import Text from "../Components/Text/Text";
import style from "./LoginPage.module.css";
import { Link, useNavigate } from "react-router-dom";
import { UserAPI } from "../API/User";

function LoginPage() {
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) navigate("/");
    }, [navigate]);

    const handleLogin = async () => {
        const accountName = identifier.trim();
        setError("");

        if (!accountName || !password) {
            setError("All fields are required.");
            return;
        }

        setLoading(true);
        try {
            const result = await UserAPI.login({ accountName, password });
            localStorage.setItem("token", result.token);
            navigate("/");
        } catch (err: any) {
            const message = err.response?.data?.message || "Login failed. Please try again.";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={style.page}>
            <Panel type="main" className={style.panel}>
                <Text variant="h2">USER LOGIN</Text>

                <div className={style.fields}>
                    <div className={style.fieldGroup}>
                        <Text>email / userName</Text>
                        <InputField
                            type="text"
                            placeholder="insert email / userName ..."
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                        />
                    </div>

                    <div className={style.fieldGroup}>
                        <Text>password</Text>
                        <InputField
                            type="password"
                            placeholder="insert password ..."
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </div>

                <div className={style.forgotRow}>
                    <Text color="var(--mutedText)">forgot password?</Text>
                    <Link to="#" className={`body ${style.link}`}>
                        {`> `}RESET PASSWORD
                    </Link>
                </div>

                <LoginButton onClick={handleLogin} disabled={loading} />
                {error && <Text color="var(--pink)"> * {error}</Text>}

                <div className={style.signupRow}>
                    <Text color="var(--mutedText)">don't have an account?</Text>
                    <Link to="/register" className={`body ${style.link}`}>
                        {`> `}CREATE ACCOUNT
                    </Link>
                </div>
            </Panel>
        </div>
    );
}

export default LoginPage;
