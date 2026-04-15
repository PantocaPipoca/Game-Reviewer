import { useState, useEffect } from "react";
import Panel from "../Components/Panel/Panel";
import InputField from "../Components/InputField/InputField";
import SignupButton from "../Components/Buttons/SignupButton";
import Text from "../Components/Text/Text";
import style from "./RegisterPage.module.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { UserAPI } from "../API/User";
import { isAuthenticated } from "../API/Auth";
import { AUTH_ERRORS, AUTH_VALIDATION } from "../Types/Consts";

function RegisterPage() {
    const [email, setEmail] = useState("");
    const [userName, setUserName] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
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

    const handleSignup = async () => {
        setError("");

        if (!email || !userName || !displayName || !password) {
            setError(AUTH_ERRORS.requiredFields);
            return;
        }
        if (!AUTH_VALIDATION.emailRegex.test(email)) {
            setError(AUTH_ERRORS.invalidEmail);
            return;
        }
        if (userName.length < AUTH_VALIDATION.minUserNameLength) {
            setError(AUTH_ERRORS.userNameTooShort);
            return;
        }
        if (password.length < AUTH_VALIDATION.minPasswordLength) {
            setError(AUTH_ERRORS.passwordTooShort);
            return;
        }
        if (password !== confirmPassword) {
            setError(AUTH_ERRORS.passwordsDoNotMatch);
            return;
        }

        setLoading(true);
        try {
            const name: string = await UserAPI.register({
                accountName: userName,
                displayName,
                password,
                email,
            });
            navigate(`/validation#${name}`, {
                state: { from: redirectPath },
                replace: true,
            });
        } catch (err: any) {
            const message = err.response?.data?.message || AUTH_ERRORS.registerFailed;
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={style.page}>
            <Panel type="main" className={style.panel}>
                <Text variant="h2">CREATE ACCOUNT</Text>

                <div className={style.fields}>
                    <div className={style.fieldGroup}>
                        <Text>email</Text>
                        <InputField
                            type="email"
                            placeholder="insert email ..."
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className={style.fieldGroup}>
                        <Text>userName</Text>
                        <InputField
                            type="text"
                            placeholder="insert userName ..."
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                        />
                    </div>

                    <div className={style.fieldGroup}>
                        <Text>displayName</Text>
                        <InputField
                            type="text"
                            placeholder="insert displayName ..."
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
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

                    <div className={style.fieldGroup}>
                        <Text>confirm password</Text>
                        <InputField
                            type="password"
                            placeholder="confirm password ..."
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>
                </div>
                <SignupButton
                    color="var(--green)"
                    tColor="var(--reverseText)"
                    onClick={handleSignup}
                    disabled={loading}
                />
                {error && <Text color="var(--pink)"> * {error}</Text>}

                <div className={style.loginRow}>
                    <Text color="var(--mutedText)">already have an account?</Text>
                    <Link to="/login" state={{ from: redirectPath }} className={`body ${style.link}`}>
                        {`> `}LOGIN
                    </Link>
                </div>
            </Panel>
        </div>
    );
}

export default RegisterPage;
