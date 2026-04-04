import { useEffect } from "react";

// Close overlay when Escape is pressed or mouse clicks outside the ref element
export function useCloseOverlay(onClose: () => void, ref?: React.RefObject<HTMLElement | null>) {
    // close when Escape is pressed
    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key === "Escape") onClose();
        }
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    // mouse clicks outside the ref element
    useEffect(() => {
        if (!ref) return;
        function onMouseDown(e: MouseEvent) {
            if (ref && ref.current && !ref.current.contains(e.target as Node)) onClose();
        }
        document.addEventListener("mousedown", onMouseDown);
        return () => document.removeEventListener("mousedown", onMouseDown);
    }, [onClose, ref]);
}
