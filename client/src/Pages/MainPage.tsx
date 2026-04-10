import type { ReactNode } from "react";
import Navbar from "../Components/Navbar/Navbar";
import BigGameCard, { type BigGameCardProps } from "../Components/GameCards/BigGameCard";
import GameCard, { type GameCardProps } from "../Components/GameCards/GameCard";
import Carousel from "../Components/Carousel/Carousel";
import Panel from "../Components/Panel/Panel";
import style from "./MainPage.module.css";
import Text from "../Components/Text/Text";

const POPULAR_GAMES: BigGameCardProps[] = [
    {
        name: "Celeste",
        cover: "https://www.gamespot.com/a/uploads/screen_kubrick/1556/15568848/3344763-7693939071-da3dd1bae53674882038f46b61fbf726",
        genres: ["Platform", "Adventure", "Indie"],
        developer: "Extremely OK Games",
        collage: [
            "https://images.igdb.com/igdb/image/upload/t_720p/fwjvpiu2ircdq5afkm1o.webp",
            "https://images.igdb.com/igdb/image/upload/t_720p/vahss8soe3tginavzmzp.webp",
            "https://images.igdb.com/igdb/image/upload/t_720p/fkbchtayhzmfnljfusel.webp",
            "https://images.igdb.com/igdb/image/upload/t_720p/loakfrjghok9fxnh59lt.webp",
        ],
        gameID: 26226,
    },
    {
        name: "Hades",
        cover: "https://images.igdb.com/igdb/image/upload/t_720p/ar3m4o.webp",
        genres: ["Action RPG", "Roguelike"],
        developer: "Supergiant Games",
        collage: [
            "https://images.igdb.com/igdb/image/upload/t_720p/sc8lik.webp",
            "https://images.igdb.com/igdb/image/upload/t_720p/sc8lim.webp",
            "https://images.igdb.com/igdb/image/upload/t_720p/sc8lin.webp",
            "https://images.igdb.com/igdb/image/upload/t_720p/sc8lij.webp",
        ],
        gameID: 113112,
    },
];

const RECOMENDED: GameCardProps[] = [
    {
        name: "Blasphemous",
        rating: 5.0,
        cover: "https://upload.wikimedia.org/wikipedia/en/c/cd/Blasphemous_%28video_game%29.jpg",
        gameID: 26820,
    },
    {
        name: "Hollow Knight: Lifeblood",
        rating: 4.9,
        cover: "https://m.media-amazon.com/images/M/MV5BMGIyYmJmZDgtOWQ1Ny00NDFiLTk2OTgtM2Q2ZWQ4OWIxZjg3XkEyXkFqcGc@._V1_.jpg",
        gameID: 14593,
    },
    {
        name: "Celeste",
        rating: 4.8,
        cover: "https://upload.wikimedia.org/wikipedia/commons/0/0f/Celeste_box_art_full.png",
        gameID: 26226,
    },
    {
        name: "Dead Cells",
        rating: 4.7,
        cover: "https://upload.wikimedia.org/wikipedia/en/thumb/1/1f/Dead_cells_cover_art.png/250px-Dead_cells_cover_art.png",
        gameID: 26855,
    },
    {
        name: "Hades",
        rating: 4.9,
        cover: "https://upload.wikimedia.org/wikipedia/en/c/cc/Hades_cover_art.jpg",
        gameID: 113112,
    },
    {
        name: "Ori and the Will of the Wisps",
        rating: 4.8,
        cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co2e1l.webp",
        gameID: 37001,
    },
    {
        name: "Shovel Knight",
        rating: 4.7,
        cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/cobaa7.webp",
        gameID: 7444,
    },
    {
        name: "Stardew Valley",
        rating: 4.9,
        cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/coa93h.webp",
        gameID: 17000,
    },
    {
        name: "Undertale",
        rating: 4.8,
        cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/cob1t2.webp",
        gameID: 12517,
    },
    {
        name: "Katana ZERO",
        rating: 4.7,
        cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1isp.webp",
        gameID: 20150,
    },
    {
        name: "Axiom Verge",
        rating: 4.6,
        cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1kml.webp",
        gameID: 8652,
    },
    {
        name: "Rain World",
        rating: 4.6,
        cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co24pm.webp",
        gameID: 14761,
    },
    {
        name: "Hyper Light Drifter",
        rating: 4.7,
        cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co2edn.webp",
        gameID: 9806,
    },
    {
        name: "Dandara",
        rating: 4.5,
        cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1tvu.webp",
        gameID: 27435,
    },
];

const FRIEND_RECOMENDED: GameCardProps[] = [
    {
        name: "Elden Ring",
        rating: 4.9,
        cover: "https://upload.wikimedia.org/wikipedia/en/b/b9/Elden_Ring_Box_art.jpg",
        gameID: 119133,
    },
    {
        name: "Dark Souls III",
        rating: 4.8,
        cover: "https://m.media-amazon.com/images/M/MV5BNzQzODQ3YzktNTM1Yy00NmNmLTk3NTItNGVlY2M1MzI4MjQ0XkEyXkFqcGc@._V1_QL75_UX190_CR0,2,190,281_.jpg",
        gameID: 11133,
    },
    {
        name: "Sekiro: Shadows Die Twice",
        rating: 4.8,
        cover: "https://upload.wikimedia.org/wikipedia/en/6/6e/Sekiro_art.jpg",
        gameID: 76882,
    },
    {
        name: "Cuphead",
        rating: 4.7,
        cover: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTm4TDov1aLCggQZLcimMB2D-i36w1lkfN_0w&s",
        gameID: 9061,
    },
    {
        name: "Disco Elysium",
        rating: 4.9,
        cover: "https://upload.wikimedia.org/wikipedia/en/0/0d/Disco_Elysium_Poster.jpeg",
        gameID: 26472,
    },
];

function Section({ title, href, children }: { title: string; href: string; children: ReactNode }) {
    return (
        <div className={style.section}>
            <div className={style.header}>
                <Text>{title}</Text>
                <a href={href} className={style.seeMore}>
                    <Text color="var(--pink)">{`> `}See More</Text>
                </a>
            </div>
            {children}
        </div>
    );
}

function MainPage() {
    return (
        <div>
            <Navbar />
            <div className={style.mainPanel}>
                <Panel type="main">
                    <Section title="Popular Games" href="#">
                        <Carousel
                            items={POPULAR_GAMES}
                            pageSize={1}
                            renderItem={(game) => ({ node: <BigGameCard key={game.name} {...game} /> })}
                        />
                    </Section>
                    <hr />
                    <Section title="Recomended to you" href="#">
                        <Carousel
                            items={RECOMENDED}
                            renderItem={(game) => ({ node: <GameCard key={game.name} {...game} /> })}
                        />
                    </Section>
                    <hr />
                    <Section title="Popular with your friends" href="#">
                        <Carousel
                            items={FRIEND_RECOMENDED}
                            renderItem={(game) => ({ node: <GameCard key={game.name} {...game} /> })}
                        />
                    </Section>
                </Panel>
            </div>
        </div>
    );
}

export default MainPage;
