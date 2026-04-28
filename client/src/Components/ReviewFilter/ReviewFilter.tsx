import Button from "../Buttons/Button";
import Text from "../Text/Text";
import style from "./ReviewFilter.module.css";

export type SortField = "createdAt" | "score" | "hoursPlayed";
export type SortOrder = "desc" | "asc";

const SORT_LABELS: Record<SortField, string> = {
    createdAt: "Date",
    score: "Score",
    hoursPlayed: "Hours",
};

type ReviewFilterBarProps = {
    sortField: SortField;
    sortOrder: SortOrder;
    fields?: SortField[];
    onSort: (field: SortField, order: SortOrder) => void;
};

function ReviewFilter({
    sortField,
    sortOrder,
    fields = ["createdAt", "score", "hoursPlayed"],
    onSort,
}: ReviewFilterBarProps) {
    function handleClick(field: SortField) {
        if (field === sortField) onSort(field, sortOrder === "desc" ? "asc" : "desc");
        else onSort(field, "desc");
    }

    return (
        <div className={style.filterBar}>
            <Text variant="small" color="var(--mutedText)">
                Sort by
            </Text>
            <div className={style.filterGroup}>
                {fields.map((f) => {
                    const isActive = sortField === f;
                    const arrow = isActive ? (sortOrder === "desc" ? " ∨" : " ∧") : " ∨";
                    return (
                        <Button
                            key={f}
                            className={`${style.filterBtn} ${isActive ? style.filterBtnActive : ""}`}
                            onClick={() => handleClick(f)}
                        >
                            <Text variant="body" color={isActive ? "var(--pink)" : undefined}>
                                {SORT_LABELS[f]}
                                {arrow}
                            </Text>
                        </Button>
                    );
                })}
            </div>
        </div>
    );
}

export default ReviewFilter;
