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
import type { AuthResponse } from "../API/Types";

export function RowAux(
    header: string,
    type: "number" | "email" | "password" | "search" | "text" | undefined,
    placeholder: string | undefined,
    value: string,
    maxLength: number,
    multiline: boolean,
    setValue: (value: React.SetStateAction<string>) => void,
    setError: React.Dispatch<React.SetStateAction<string>>,
    errorMsg: string
) {
    return (
        <div className={style.fieldGroup}>
            <div className={style.loginRow}>
                <Text>{header}</Text>
                <Text color={value.length < maxLength ? "var(--mutedText)" : "var(--pink)"}>
                    {value.length ? "characters left: " + (maxLength - value.length) : ""}
                </Text>
            </div>
            <InputField
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={(e) => {
                    if (e.target.value.length <= maxLength) setValue(e.target.value);
                    else setError(errorMsg);
                }}
                multiline={multiline}
            />
        </div>
    );
}

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
            const user: string | AuthResponse = await UserAPI.register({
                accountName: userName,
                displayName,
                password,
                email,
            });

            if (typeof user === "object" && "token" in user) {
                // AuthResponse - alr verified
                navigate(redirectPath, { replace: true });
            } else {
                // needs validaton
                navigate(`/validation#${user}`, {
                    state: { from: redirectPath },
                    replace: true,
                });
            }
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
                    {RowAux(
                        "email",
                        "email",
                        "insert email ...",
                        email,
                        AUTH_VALIDATION.maxEmailLength,
                        false,
                        setEmail,
                        setError,
                        AUTH_ERRORS.emailTooLong
                    )}

                    {RowAux(
                        "userName",
                        "text",
                        "insert userName ...",
                        userName,
                        AUTH_VALIDATION.maxUserNameLength,
                        false,
                        setUserName,
                        setError,
                        AUTH_ERRORS.userNameTooLong
                    )}

                    {RowAux(
                        "displayName",
                        "text",
                        "insert displayName ...",
                        displayName,
                        AUTH_VALIDATION.maxUserNameLength,
                        false,
                        setDisplayName,
                        setError,
                        AUTH_ERRORS.displayNameTooLong
                    )}

                    {RowAux(
                        "password",
                        "password",
                        "insert password ...",
                        password,
                        AUTH_VALIDATION.maxPasswordLength,
                        false,
                        setPassword,
                        setError,
                        AUTH_ERRORS.passwordTooLong
                    )}

                    {RowAux(
                        "confirm password",
                        "password",
                        "confirm password ...",
                        confirmPassword,
                        AUTH_VALIDATION.maxPasswordLength,
                        false,
                        setConfirmPassword,
                        setError,
                        AUTH_ERRORS.passwordTooLong
                    )}
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
