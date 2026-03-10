import { useState } from "react";
import Panel from "../Components/Panel/Panel";
import InputField from "../Components/InputField/InputField";
import SignupButton from "../Components/Buttons/SignupButton";
import Text from "../Components/Text/Text";
import style from "./RegisterPage.module.css";
import { Link, useNavigate } from 'react-router-dom';
import { UserAPI } from "../API/User";

function RegisterPage() {
    const [email, setEmail] = useState("");
    const [userName, setUserName] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    const handleSignup = async () => {
        setError("");

        if(!email || !userName || !displayName || !password){
            setError("All fields are required.");
            return;
        }
        if(!EMAIL_REGEX.test(email)){
            setError("Invalid email format.");
            return;
        }
        if(userName.length < 3){
            setError("Username must be at least 3 characters.");
            return;
        }
        if(password.length < 8){
            setError("Password must be at least 8 characters.");
            return;
        }
        if(password !== confirmPassword){
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);
        try {
            const result = await UserAPI.register({ accountName: userName, displayName, password, email });
            navigate("/login");
        } catch (err: any) {
            const message = err.response?.data?.message || "Registration failed. Please try again.";
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
                    <Text color="var(--mutedText)">
                        already have an account?
                    </Text>
                    <Link to="/login" className={`body ${style.link}`}>
                        {`> `}LOGIN
                    </Link>
                </div>
            </Panel>
        </div>
    );
}

export default RegisterPage;
