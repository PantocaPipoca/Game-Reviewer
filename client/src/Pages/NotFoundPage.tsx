import { useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar/Navbar";
import Panel from "../Components/Panel/Panel";
import Text from "../Components/Text/Text";
import Button from "../Components/Buttons/Button";
import style from "./NotFoundPage.module.css";

function NotFoundPage() {
    const navigate = useNavigate();

    return (
        <div>
            <Navbar />
            <div className={style.mainPanel}>
                <Panel type="main">
                    <Text variant="h1">404</Text>
                    <Text color="var(--pink)" variant="h2">
                        Page not found
                    </Text>
                </Panel>
            </div>
        </div>
    );
}

export default NotFoundPage;
