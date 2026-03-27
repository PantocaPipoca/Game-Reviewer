import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar/Navbar";
import Panel from "../Components/Panel/Panel";
import Text from "../Components/Text/Text";
import InputField from "../Components/InputField/InputField";
import Button from "../Components/Buttons/Button";
import style from "./EditProfilePage.module.css";
import { UserAPI } from "../API/User";
import { isAuthenticated } from "../API/Auth";
import { AUTH_ERRORS, AUTH_VALIDATION } from "../Types/Consts";
import type { UserMe } from "../API/Types";

function EditProfilePage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [showConfirm, setShowConfirm] = useState(false);

    const [displayName, setDisplayName] = useState("");
    const [gender, setGender] = useState("");
    const [bio, setBio] = useState("");
    const [email, setEmail] = useState("");
    const [isPrivate, setIsPrivate] = useState(false);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    useEffect(() => {
        load();
    }, []);

    async function load() {
        try {
            const authenticated = await isAuthenticated();
            if (!authenticated) {
                navigate("/login");
                return;
            }
            const me: UserMe = await UserAPI.getMe();
            setDisplayName(me.userData?.displayName ?? "");
            setGender(me.userData?.gender ?? "");
            setEmail(me.email ?? "");
            setBio(me.userData?.bio ?? "");
            setIsPrivate(me.isPrivate);
        } catch {
            navigate("/login");
        } finally {
            setLoading(false);
        }
    }

    function handleSaveClick() {
        setError("");
        if (email !== "" && !AUTH_VALIDATION.emailRegex.test(email)) {
            setError(AUTH_ERRORS.invalidEmail);
            return;
        }
        if (password && password.length < AUTH_VALIDATION.minPasswordLength) {
            setError(AUTH_ERRORS.passwordTooShort);
            return;
        }
        if (password && password !== confirmPassword) {
            setError(AUTH_ERRORS.passwordsDoNotMatch);
            return;
        }
        setShowConfirm(true);
    }

    async function handleConfirm() {
        setSaving(true);
        setShowConfirm(false);
        try {
            await UserAPI.updateMe({
                isPrivate,
                email,
                userData: {
                    displayName,
                    gender,
                    bio,
                },
                ...(password ? { password } : {}),
            });
            navigate(-1);
        } catch (err: any) {
            setError(err?.response?.data?.message ?? "Failed to save changes");
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div>
                <Navbar />
                <div className={style.mainPanel}>
                    <Panel type="main">
                        <Text color="var(--mutedText)">Loading...</Text>
                    </Panel>
                </div>
            </div>
        );
    }

    return (
        <div>
            <Navbar />
            <div className={style.mainPanel}>
                <Panel type="main" className={style.panel}>
                    <Text variant="h2" color="var(--green)">
                        EDIT PROFILE
                    </Text>

                    <div className={style.fields}>
                        <div className={style.fieldGroup}>
                            <Text>display name</Text>
                            <InputField
                                value={displayName}
                                placeholder="display name..."
                                onChange={(e) => setDisplayName(e.target.value)}
                            />
                        </div>
                        <div className={style.fieldGroup}>
                            <Text>gender</Text>
                            <InputField
                                value={gender}
                                placeholder="gender (optional)..."
                                onChange={(e) => setGender(e.target.value)}
                            />
                        </div>
                        <div className={style.fieldGroup}>
                            <Text>bio</Text>
                            <div className={style.textareaWrapper}>
                                <Text color="var(--mainText)">{`>`}</Text>
                                <textarea
                                    className={`body ${style.textarea}`}
                                    value={bio}
                                    placeholder="bio (optional)..."
                                    onChange={(e) => setBio(e.target.value)}
                                    rows={4}
                                />
                            </div>
                        </div>
                        <div className={style.fieldGroup}>
                            <Text>email</Text>
                            <InputField
                                type="email"
                                value={email}
                                placeholder="new email (optional)..."
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className={style.fieldGroup}>
                            <Text>new password</Text>
                            <InputField
                                type="password"
                                value={password}
                                placeholder="new password (optional)..."
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <div className={style.fieldGroup}>
                            <Text>confirm password</Text>
                            <InputField
                                type="password"
                                value={confirmPassword}
                                placeholder="confirm new password..."
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                        <div className={style.fieldGroup}>
                            <Text>privacy</Text>
                            <div className={style.toggleRow} onClick={() => setIsPrivate((p) => !p)}>
                                <div className={`${style.toggle} ${isPrivate ? style.toggleOn : ""}`} />
                                <Text color={isPrivate ? "var(--cyan)" : "var(--mutedText)"}>
                                    {isPrivate ? "Private account" : "Public account"}
                                </Text>
                            </div>
                        </div>
                    </div>

                    {error && <Text color="var(--pink)">* {error}</Text>}

                    <div className={style.actions}>
                        <Button className={style.cancelButton} onClick={() => navigate(-1)} disabled={saving}>
                            <Text>{`> CANCEL`}</Text>
                        </Button>
                        <Button className={style.saveButton} onClick={handleSaveClick} disabled={saving}>
                            <Text>{saving ? `> SAVING...` : `> SAVE CHANGES`}</Text>
                        </Button>
                    </div>
                </Panel>
            </div>

            {showConfirm && (
                <div className={style.popUpOverlay}>
                    <Panel type="secondary" className={style.popUpConfirmBox}>
                        <Text variant="h3">CONFIRM CHANGES</Text>
                        <Text color="var(--mutedText)">Are you sure you want to save these changes?</Text>
                        <div className={style.popUpConfirmActions}>
                            <Button className={style.cancelButton} onClick={() => setShowConfirm(false)}>
                                <Text>{`> CANCEL`}</Text>
                            </Button>
                            <Button className={style.popUpConfirmButton} onClick={handleConfirm}>
                                <Text>{`> CONFIRM`}</Text>
                            </Button>
                        </div>
                    </Panel>
                </div>
            )}
        </div>
    );
}

export default EditProfilePage;
