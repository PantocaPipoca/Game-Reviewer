import { createContext, useContext, useEffect, useState } from "react";
import type { PropsWithChildren } from "react";
import SuccessPopup from "../Components/SuccessPopup/SuccessPopup";

type SuccessPopupContextValue = {
    showSuccess: (text: string, durationSeconds?: number) => void;
};

const SuccessPopupContext = createContext<SuccessPopupContextValue | null>(null);

export function SuccessPopupProvider({ children }: PropsWithChildren) {
    const [popup, setPopup] = useState<{ text: string; durationSeconds: number } | null>(null);

    function showSuccess(text: string, durationSeconds: number = 3) {
        setPopup({ text, durationSeconds });
    }

    useEffect(() => {
        if (!popup) return;
        const timer = setTimeout(() => setPopup(null), popup.durationSeconds * 1000);
        return () => clearTimeout(timer);
    }, [popup]);

    return (
        <SuccessPopupContext.Provider value={{ showSuccess }}>
            {children}
            <SuccessPopup
                text={popup?.text ?? ""}
                durationSeconds={popup?.durationSeconds ?? 0}
                visible={popup !== null}
            />
        </SuccessPopupContext.Provider>
    );
}

export function useSuccessPopup() {
    const context = useContext(SuccessPopupContext);
    if (!context) {
        throw new Error("useSuccessPopup must be used inside SuccessPopupProvider");
    }
    return context;
}
