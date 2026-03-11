import { useEffect, useState, type ReactNode } from "react";
import Button from "../Buttons/Button";
import style from "./Carousel.module.css";

const FADE_TIME: number = 300;

type CarouselProps<T> = {
    items: T[];
    renderItem: (item: T) => ReactNode;
    pageSize?: number;
    hasMore?: boolean;
    isLoading?: boolean;
    onLoadMore?: () => void;
    loadMoreThresholdPages?: number;
};

function Carousel<T>({
    items,
    renderItem,
    pageSize = 5,
    hasMore = false,
    isLoading = false,
    onLoadMore,
    loadMoreThresholdPages = 1,
}: CarouselProps<T>) {
    const [page, setPage] = useState(1);
    const [isFadingOut, setIsFadingOut] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    if (pageSize <= 0) pageSize = 1;

    const maxPage: number = Math.max(1, Math.ceil(items.length / pageSize));

    const canPrev: boolean = page > 1 && !isAnimating;
    const canNext: boolean = page < maxPage && !isAnimating;

    useEffect(() => {
        if (!onLoadMore || isLoading || !hasMore) return;

        const threshold = Math.max(0, loadMoreThresholdPages);
        const pagesUntilEnd = maxPage - page;
        const shouldLoadMore = pagesUntilEnd <= threshold;

        if (shouldLoadMore) {
            onLoadMore();
        }
    }, [page, maxPage, hasMore, isLoading, onLoadMore, loadMoreThresholdPages]);

    function fadeInOutAnimation(page: number): void {
        setIsAnimating(true);
        setIsFadingOut(true);

        setTimeout(() => {
            setPage(page);
            setIsFadingOut(false);

            setTimeout(() => {
                setIsAnimating(false);
            }, FADE_TIME);
        }, FADE_TIME);
    }

    function goNext(): void {
        fadeInOutAnimation(Math.min(page + 1, maxPage));
    }

    function goPrev(): void {
        fadeInOutAnimation(Math.max(page - 1, 1));
    }

    const start: number = (page - 1) * pageSize;

    return (
        <div className={style.frame}>
            <div className={`${style.navButtonLeft}`}>
                <Button onClick={goPrev} disabled={!canPrev}>
                    {"<"}
                </Button>
            </div>

            <div
                className={`${style.row} ${isFadingOut ? style.transparent : ""}`}
            >
                {items
                    .slice(start, start + pageSize)
                    .map((item) => renderItem(item))}
            </div>

            <div className={`${style.navButtonRight}`}>
                <Button onClick={goNext} disabled={!canNext}>
                    {">"}
                </Button>
            </div>
        </div>
    );
}

export default Carousel;
