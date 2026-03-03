import { useState } from "react";
import Panel from "../Components/Panel/Panel";
import InputField from "../Components/InputField/InputField";
import SignupButton from "../Components/Buttons/SignupButton";
import Text from "../Components/Text/Text";
import style from "./RegisterPage.module.css";

function RegisterPage() {
    const [email, setEmail] = useState("");
    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");

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
                        <Text>password</Text>
                        <InputField
                            type="password"
                            placeholder="insert password ..."
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </div>

                <SignupButton color="var(--green)" tColor="var(--reverseText)" />

                <div className={style.loginRow}>
                    <Text color="var(--mutedText)">already have an account?</Text>
                    <a href="#" className={`body ${style.link}`}>
                        {`> `}LOGIN
                    </a>
                </div>
            </Panel>
        </div>
    );
}

export default RegisterPage;
