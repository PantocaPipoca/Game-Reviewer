import type { ReviewFull } from "../API/Types";
import type { SortField, SortOrder } from "../Components/ReviewFilter/ReviewFilter";

export function sortReviews<T extends ReviewFull>(reviews: T[], sortField: SortField, sortOrder: SortOrder): T[] {
    return [...reviews].sort((a, b) => {
        let aVal: number, bVal: number;
        if (sortField === "createdAt") {
            aVal = new Date(a.createdAt).getTime();
            bVal = new Date(b.createdAt).getTime();
        } else if (sortField === "score") {
            aVal = a.score;
            bVal = b.score;
        } else {
            aVal = a.hoursPlayed ?? 0;
            bVal = b.hoursPlayed ?? 0;
        }
        return sortOrder === "desc" ? bVal - aVal : aVal - bVal;
    });
}
