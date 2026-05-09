import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./Styles/global.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import { SuccessPopupProvider } from "./Hooks/SuccessPopup";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <SuccessPopupProvider>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </SuccessPopupProvider>
    </StrictMode>
);
