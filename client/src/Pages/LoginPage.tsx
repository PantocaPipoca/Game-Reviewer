import { useEffect, useState } from "react";
import Panel from "../Components/Panel/Panel";
import InputField from "../Components/InputField/InputField";
import LoginButton from "../Components/Buttons/LoginButton";
import Text from "../Components/Text/Text";
import style from "./LoginPage.module.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { UserAPI } from "../API/User";
import { isAuthenticated } from "../API/Auth";
import { AUTH_ERRORS } from "../Types/Consts";

function LoginPage() {
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const location = useLocation();
    const redirectPath = (location.state as { from?: string } | undefined)?.from || "/";

    useEffect(() => {
        isAuthenticated().then((authenticated) => {
            if (authenticated) navigate(redirectPath, { replace: true });
        });
    }, [navigate, redirectPath]);

    const handleLogin = async () => {
        const accountName = identifier.trim();
        setError("");

        if (!accountName || !password) {
            setError(AUTH_ERRORS.requiredFields);
            return;
        }

        setLoading(true);
        try {
            await UserAPI.login({ accountName, password });
            navigate(redirectPath, { replace: true });
        } catch (err: any) {
            if (err.response.status == 428) {
                navigate(`/validation#${accountName}`, {
                    state: { from: redirectPath },
                    replace: true,
                });
            }
            const message = err.response?.data?.message || AUTH_ERRORS.loginFailed;
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
                    <Link to="/register" state={{ from: redirectPath }} className={`body ${style.link}`}>
                        {`> `}CREATE ACCOUNT
                    </Link>
                </div>
            </Panel>
        </div>
    );
}

export default LoginPage;
