import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar/Navbar";
import Panel from "../Components/Panel/Panel";
import Text from "../Components/Text/Text";
import Button from "../Components/Buttons/Button";
import style from "./EditProfilePage.module.css";
import { UserAPI } from "../API/User";
import { isAuthenticated } from "../API/Auth";
import { ACCOUNT_CONSTS, ACCOUNT_ERRORS, AUTH_ERRORS, AUTH_VALIDATION, REVIEW_ERRORS } from "../Types/Consts";
import type { UserMe } from "../API/Types";
import defaultPfp from "../Assets/default-pfp.png";
import { RowAux } from "./RegisterPage";

function EditProfilePage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [showConfirm, setShowConfirm] = useState(false);
    const [pendingAvatar, setPendingAvatar] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [_, setCurrentUsername] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

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
            setCurrentUsername(me.accountName);
            setAvatarUrl(me.avatar ?? null);
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

    function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        setPendingAvatar(file);
        const reader = new FileReader();
        reader.onload = (event) => {
            const result = event.target?.result as string;
            if (typeof result === "string" && result.startsWith("data:image/")) {
                setAvatarPreview(result);
            }
        };
        reader.readAsDataURL(file);
        if (fileInputRef.current) fileInputRef.current.value = "";
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
            if (pendingAvatar) {
                const result = await UserAPI.uploadAvatar(pendingAvatar);
                setAvatarUrl(result.url);
                setPendingAvatar(null);
            }
            await UserAPI.updateMe({
                isPrivate,
                email,
                userData: { displayName, gender, bio },
                ...(password ? { password } : {}),
            });
            navigate(-1);
        } catch (err: any) {
            setError(err?.response?.data?.message ?? REVIEW_ERRORS.failed);
        } finally {
            setSaving(false);
        }
    }

    if (loading)
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

    return (
        <div>
            <Navbar />
            <div className={style.mainPanel}>
                <Panel type="main" className={style.panel}>
                    <Text variant="h2" color="var(--green)">
                        EDIT PROFILE
                    </Text>

                    <div className={style.fields}>
                        <div className={style.topRow}>
                            <div className={style.avatarSection}>
                                <div className={style.avatarSquare}>
                                    <img
                                        src={avatarPreview ?? avatarUrl ?? defaultPfp}
                                        alt="profile"
                                        className={style.avatarImg}
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = defaultPfp;
                                        }}
                                    />
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    style={{ display: "none" }}
                                    onChange={handleAvatarChange}
                                />
                                <Button className={style.avatarButton} onClick={() => fileInputRef.current?.click()}>
                                    <Text>{`> CHANGE AVATAR`}</Text>
                                </Button>
                            </div>

                            <div className={style.nameGenderGroup}>
                                {RowAux(
                                    "displayName",
                                    "text",
                                    "displayName ...",
                                    displayName,
                                    AUTH_VALIDATION.maxUserNameLength,
                                    false,
                                    setDisplayName,
                                    setError,
                                    AUTH_ERRORS.displayNameTooLong
                                )}
                                {RowAux(
                                    "gender",
                                    "text",
                                    "gender (optional) ...",
                                    gender,
                                    ACCOUNT_CONSTS.maxGenderLength,
                                    false,
                                    setGender,
                                    setError,
                                    ACCOUNT_ERRORS.genderTooLong
                                )}
                            </div>
                        </div>

                        {RowAux(
                            "bio",
                            "text",
                            "bio (optional) ...",
                            bio,
                            ACCOUNT_CONSTS.maxBioLength,
                            true,
                            setBio,
                            setError,
                            ACCOUNT_ERRORS.bioTooLong
                        )}

                        {RowAux(
                            "email",
                            "email",
                            "new email (optional) ...",
                            email,
                            AUTH_VALIDATION.maxEmailLength,
                            false,
                            setEmail,
                            setError,
                            AUTH_ERRORS.emailTooLong
                        )}

                        {RowAux(
                            "new password",
                            "password",
                            "new password (optional) ...",
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
                            "confirm new password ...",
                            confirmPassword,
                            AUTH_VALIDATION.maxPasswordLength,
                            false,
                            setConfirmPassword,
                            setError,
                            AUTH_ERRORS.passwordTooLong
                        )}

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
