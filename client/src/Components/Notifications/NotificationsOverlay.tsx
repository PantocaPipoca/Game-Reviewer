import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FollowerAPI } from "../../API/Follower";
import type { FollowerFull } from "../../API/Types";
import Text from "../Text/Text";
import Button from "../Buttons/Button";
import defaultPfp from "../../Assets/default-pfp.png";
import style from "./NotificationsOverlay.module.css";

type Props = {
    onClose: () => void;
    onRequestHandled: () => void;
};

function NotificationsOverlay({ onClose, onRequestHandled }: Props) {
    const navigate = useNavigate();
    const [requests, setRequests] = useState<FollowerFull[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const data = await FollowerAPI.getRequestsReceived();
                setRequests(data);
            } catch {
                setRequests([]);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    async function handleAccept(username: string) {
        try {
            await FollowerAPI.acceptRequest(username);
            setRequests((prev) => prev.filter((r) => r.follows !== username));
            onRequestHandled();
        } catch (error: any) {
            console.log("Accept failed:", error?.response?.data);
        }
    }

    async function handleDecline(username: string) {
        try {
            await FollowerAPI.rejectRequest(username);
            setRequests((prev) => prev.filter((r) => r.follows !== username));
            onRequestHandled();
        } catch (error: any) {
            console.log("Decline failed:", error?.response?.data);
        }
    }

    return (
        <div className={style.panel}>
            <div className={style.header}>
                <Text variant="small" color="var(--mutedText)">
                    NOTIFICATIONS
                </Text>
            </div>

            <div className={style.list}>
                {loading ? (
                    <div className={style.empty}>
                        <Text variant="small" color="var(--mutedText)">
                            Loading...
                        </Text>
                    </div>
                ) : requests.length === 0 ? (
                    <div className={style.empty}>
                        <Text variant="small" color="var(--mutedText)">
                            No pending requests
                        </Text>
                    </div>
                ) : (
                    requests.map((r) => (
                        <div key={r.follows} className={style.item}>
                            <div
                                className={style.itemLeft}
                                onClick={() => {
                                    navigate(`/user/${r.follows}`);
                                    onClose();
                                }}
                            >
                                <div className={style.avatarWrapper}>
                                    <img src={defaultPfp} alt={r.follows} className={style.avatar} />
                                </div>
                                <div className={style.itemText}>
                                    <Text variant="small" color="var(--mainText)">
                                        {r.follows}
                                    </Text>
                                    <Text variant="small" color="var(--mutedText)">
                                        wants to follow you
                                    </Text>
                                </div>
                            </div>
                            <div className={style.itemActions}>
                                <Button
                                    className={`${style.actionBtn} ${style.acceptBtn}`}
                                    onClick={() => handleAccept(r.follows)}
                                >
                                    <Text variant="small" color="var(--green)">{`> ACCEPT`}</Text>
                                </Button>
                                <Button
                                    className={`${style.actionBtn} ${style.declineBtn}`}
                                    onClick={() => handleDecline(r.follows)}
                                >
                                    <Text variant="small" color="var(--pink)">
                                        X REJECT
                                    </Text>
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default NotificationsOverlay;
