import { useState, type ReactNode } from "react";
import Button from "../Buttons/Button";
import style from "./Carousel.module.css";

type CarouselProps<T> = {
    items: T[];
    renderItem: (item: T, index: number) => ReactNode;
    pageSize?: number;
};

function Carousel<T>({ items, renderItem, pageSize = 5 }: CarouselProps<T>) {
    const [page, setPage] = useState(0);

    if (pageSize < 0) pageSize = 1;

    const maxPage: number = Math.max(0, Math.ceil(items.length / pageSize) - 1);

    const canPrev: boolean = page > 0;
    const canNext: boolean = page < maxPage;

    function goNext(): void {
        setPage((prev) => Math.min(prev + 1, maxPage));
    }

    function goPrev(): void {
        setPage((prev) => Math.max(prev - 1, 0));
    }

    const start: number = page * pageSize;

    return (
        <div className={style.frame}>
            <div className={`${style.navButtonLeft}`}>
                <Button onClick={goPrev} disabled={!canPrev}>
                    {"<"}
                </Button>
            </div>

            <div className={style.row}>
                {items.slice(start, start + pageSize).map((item, i) => renderItem(item, start + i))}
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
