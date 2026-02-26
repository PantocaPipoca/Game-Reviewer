import type { ReactNode } from "react";
import Navbar from "../Components/Navbar/Navbar";
import BigGameCard from "../Components/GameCards/BigGameCard";
import GameCard, { type GameCardProps } from "../Components/GameCards/GameCard";
import Panel from "../Components/Panel/Panel";
import style from "./MainPage.module.css";
import Text from "../Components/Text/Text";

const recomended: GameCardProps[] = [
    {
        name: "Blasphemous",
        rating: 5.0,
        cover: "https://upload.wikimedia.org/wikipedia/en/c/cd/Blasphemous_%28video_game%29.jpg",
    },
    {
        name: "Hollow Knight",
        rating: 4.9,
        cover: "https://m.media-amazon.com/images/M/MV5BMGIyYmJmZDgtOWQ1Ny00NDFiLTk2OTgtM2Q2ZWQ4OWIxZjg3XkEyXkFqcGc@._V1_.jpg",
    },
    {
        name: "Celeste",
        rating: 4.8,
        cover: "https://upload.wikimedia.org/wikipedia/commons/0/0f/Celeste_box_art_full.png",
    },
    {
        name: "Dead Cells",
        rating: 4.7,
        cover: "https://upload.wikimedia.org/wikipedia/en/thumb/1/1f/Dead_cells_cover_art.png/250px-Dead_cells_cover_art.png",
    },
    {
        name: "Hades",
        rating: 4.9,
        cover: "https://upload.wikimedia.org/wikipedia/en/c/cc/Hades_cover_art.jpg",
    },
    {
        name: "Ori and the Will of the Wisps",
        rating: 4.8,
        cover: "https://upload.wikimedia.org/wikipedia/en/3/thirty/Ori_and_the_Will_of_the_Wisps.jpg",
    },
    {
        name: "Shovel Knight",
        rating: 4.7,
        cover: "https://upload.wikimedia.org/wikipedia/en/3/35/Shovel_Knight_cover_art.jpg",
    },
    {
        name: "Stardew Valley",
        rating: 4.9,
        cover: "https://upload.wikimedia.org/wikipedia/en/f/fd/Logo_of_Stardew_Valley.png",
    },
    {
        name: "Undertale",
        rating: 4.8,
        cover: "https://upload.wikimedia.org/wikipedia/en/6/6b/Undertale_cover.png",
    },
    {
        name: "Katana ZERO",
        rating: 4.7,
        cover: "https://upload.wikimedia.org/wikipedia/en/3/34/Katana_Zero_cover_art.jpg",
    },
    {
        name: "Axiom Verge",
        rating: 4.6,
        cover: "https://upload.wikimedia.org/wikipedia/en/2/23/Axiom_Verge_cover.jpg",
    },
    {
        name: "Rain World",
        rating: 4.6,
        cover: "https://upload.wikimedia.org/wikipedia/en/1/14/Rain_World_cover.jpg",
    },
    {
        name: "Hyper Light Drifter",
        rating: 4.7,
        cover: "https://upload.wikimedia.org/wikipedia/en/b/b5/Hyper_Light_Drifter_cover.jpg",
    },
    {
        name: "Dandara",
        rating: 4.5,
        cover: "https://upload.wikimedia.org/wikipedia/en/5/5d/Dandara_cover_art.jpg",
    },
];

const friendRecomended: GameCardProps[] = [
    {
        name: "Elden Ring",
        rating: 4.9,
        cover: "https://upload.wikimedia.org/wikipedia/en/b/b9/Elden_Ring_Box_art.jpg",
    },
    {
        name: "Dark Souls III",
        rating: 4.8,
        cover: "https://m.media-amazon.com/images/M/MV5BNzQzODQ3YzktNTM1Yy00NmNmLTk3NTItNGVlY2M1MzI4MjQ0XkEyXkFqcGc@._V1_QL75_UX190_CR0,2,190,281_.jpg",
    },
    {
        name: "Sekiro",
        rating: 4.8,
        cover: "https://upload.wikimedia.org/wikipedia/en/6/6e/Sekiro_art.jpg",
    },
    {
        name: "Cuphead",
        rating: 4.7,
        cover: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTm4TDov1aLCggQZLcimMB2D-i36w1lkfN_0w&s",
    },
    {
        name: "Disco Elysium",
        rating: 4.9,
        cover: "https://upload.wikimedia.org/wikipedia/en/0/0d/Disco_Elysium_Poster.jpeg",
    },
];

function Section({ title, href, children }: { title: string; href: string; children: ReactNode }) {
    return (
        <div>
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

function CardRow({ games }: { games: GameCardProps[] }) {
    return (
        <div className={style.cardRow}>
            {games.slice(0, 5).map((game) => (
                <GameCard name={game.name} rating={game.rating} cover={game.cover} />
            ))}
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
                        <BigGameCard />
                    </Section>
                    <hr />
                    <Section title="Recomended to you" href="#">
                        <CardRow games={recomended} />
                    </Section>
                    <hr />
                    <Section title="Popular with your friends" href="#">
                        <CardRow games={friendRecomended} />
                    </Section>
                </Panel>
            </div>
        </div>
    );
}

export default MainPage;
