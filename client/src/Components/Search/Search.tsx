import Text from "../Text/Text";
import style from "./Search.module.css";

function Search() {
    return (
        <div className={style.search}>
            <Text>{`>`}</Text> <Text color="var(--mutedText)">Search...</Text>
        </div>
    );
}

export default Search;
