import Panel from "../Panel/Panel";
import Text from "../Text/Text";
import Star from "../SVGs/Star";
import style from "./UserStatsPanel.module.css";
import type { ReviewFull } from "../../API/Types";

import defaultIcon from "../../Assets/Platforms/default.png";
import steamIcon from "../../Assets/Platforms/steam.png";
import windowsIcon from "../../Assets/Platforms/windows.png";
import playstationIcon from "../../Assets/Platforms/playstation.png";
import xboxIcon from "../../Assets/Platforms/xbox.png";
import switchIcon from "../../Assets/Platforms/nintendo-switch.png";
import nintendoIcon from "../../Assets/Platforms/nintendo.png";
import appleIcon from "../../Assets/Platforms/apple.png";
import androidIcon from "../../Assets/Platforms/android.png";
import linuxIcon from "../../Assets/Platforms/linux.png";
import metaIcon from "../../Assets/Platforms/meta.png";

type ReviewWithGame = ReviewFull & { gameName?: string; gameCover?: string };

type Props = {
    reviews: ReviewWithGame[];
};

const BARS: { score: number; stars: number; isPink: boolean }[] = [
    { score: 10, stars: 5, isPink: true },
    { score: 9, stars: 4.5, isPink: false },
    { score: 8, stars: 4, isPink: true },
    { score: 7, stars: 3.5, isPink: false },
    { score: 6, stars: 3, isPink: true },
    { score: 5, stars: 2.5, isPink: false },
    { score: 4, stars: 2, isPink: true },
    { score: 3, stars: 1.5, isPink: false },
    { score: 2, stars: 1, isPink: true },
    { score: 1, stars: 0.5, isPink: false },
];

const MIN_BAR_PCT = 3;

type PlatformConfig = { icon: string; label: string };

// igdb names = icon + display label
const PLATFORM_MAP: Record<string, PlatformConfig> = {
    // Windows
    "PC (Microsoft Windows)": { icon: windowsIcon, label: "PC (Windows)" },
    DOS: { icon: windowsIcon, label: "DOS" },
    "Windows Mobile": { icon: windowsIcon, label: "Windows Mobile" },
    "Windows Phone": { icon: windowsIcon, label: "Windows Phone" },

    // Linux
    Linux: { icon: linuxIcon, label: "Linux" },

    // Apple
    Mac: { icon: appleIcon, label: "Mac" },
    iOS: { icon: appleIcon, label: "iOS" },

    // PlayStation
    "PlayStation 5": { icon: playstationIcon, label: "PlayStation 5" },
    "PlayStation 4": { icon: playstationIcon, label: "PlayStation 4" },
    "PlayStation 3": { icon: playstationIcon, label: "PlayStation 3" },
    "PlayStation 2": { icon: playstationIcon, label: "PlayStation 2" },
    PlayStation: { icon: playstationIcon, label: "PlayStation" },
    "PlayStation Portable": { icon: playstationIcon, label: "PSP" },
    "PlayStation Vita": { icon: playstationIcon, label: "PS Vita" },
    "PlayStation VR": { icon: playstationIcon, label: "PlayStation VR" },
    "PlayStation VR2": { icon: playstationIcon, label: "PlayStation VR2" },
    PocketStation: { icon: playstationIcon, label: "PocketStation" },

    // Xbox
    "Xbox Series X|S": { icon: xboxIcon, label: "Xbox Series X|S" },
    "Xbox One": { icon: xboxIcon, label: "Xbox One" },
    "Xbox 360": { icon: xboxIcon, label: "Xbox 360" },
    Xbox: { icon: xboxIcon, label: "Xbox" },

    // Nintendo Switch
    "Nintendo Switch": { icon: switchIcon, label: "Nintendo Switch" },
    "Nintendo Switch 2": { icon: switchIcon, label: "Nintendo Switch 2" },

    // Nintendo
    "Wii U": { icon: nintendoIcon, label: "Wii U" },
    Wii: { icon: nintendoIcon, label: "Wii" },
    "New Nintendo 3DS": { icon: nintendoIcon, label: "New Nintendo 3DS" },
    "Nintendo 3DS": { icon: nintendoIcon, label: "Nintendo 3DS" },
    "Nintendo DSi": { icon: nintendoIcon, label: "Nintendo DSi" },
    "Nintendo DS": { icon: nintendoIcon, label: "Nintendo DS" },
    "Nintendo 64": { icon: nintendoIcon, label: "Nintendo 64" },
    "Nintendo GameCube": { icon: nintendoIcon, label: "GameCube" },
    "Nintendo Entertainment System": { icon: nintendoIcon, label: "NES" },
    "Super Nintendo Entertainment System": { icon: nintendoIcon, label: "SNES" },
    "Family Computer": { icon: nintendoIcon, label: "Famicom" },
    "Family Computer Disk System": { icon: nintendoIcon, label: "Famicom Disk System" },
    "Super Famicom": { icon: nintendoIcon, label: "Super Famicom" },
    "Game Boy": { icon: nintendoIcon, label: "Game Boy" },
    "Game Boy Color": { icon: nintendoIcon, label: "Game Boy Color" },
    "Game Boy Advance": { icon: nintendoIcon, label: "Game Boy Advance" },
    "Virtual Boy": { icon: nintendoIcon, label: "Virtual Boy" },
    "64DD": { icon: nintendoIcon, label: "64DD" },
    "Pokémon mini": { icon: nintendoIcon, label: "Pokémon mini" },
    Satellaview: { icon: nintendoIcon, label: "Satellaview" },
    "Game & Watch": { icon: nintendoIcon, label: "Game & Watch" },
    "Virtual Console": { icon: nintendoIcon, label: "Virtual Console" },

    // Meta
    "Meta Quest 3": { icon: metaIcon, label: "Meta Quest 3" },
    "Meta Quest 2": { icon: metaIcon, label: "Meta Quest 2" },
    "Oculus Quest": { icon: metaIcon, label: "Meta Quest" },
    "Oculus Rift": { icon: metaIcon, label: "Oculus Rift" },
    "Oculus Go": { icon: metaIcon, label: "Oculus Go" },
    "Gear VR": { icon: metaIcon, label: "Gear VR" },

    // Android
    Android: { icon: androidIcon, label: "Android" },
    "Amazon Fire TV": { icon: androidIcon, label: "Amazon Fire TV" },

    // Steam
    SteamOS: { icon: steamIcon, label: "SteamOS" },
    Steam: { icon: steamIcon, label: "Steam" },

    // Web
    "Web browser": { icon: defaultIcon, label: "Web browser" },
};

function getPlatformConfig(name: string): PlatformConfig {
    return PLATFORM_MAP[name] ?? { icon: defaultIcon, label: name };
}

function PlatformRow({ name }: { name: string }) {
    const cfg = getPlatformConfig(name);
    return (
        <div className={style.platformRow}>
            <img src={cfg.icon} className={style.platformIcon} alt={name} />
            <Text variant="small">{cfg.label}</Text>
        </div>
    );
}

function GameEntry({ review }: { review: ReviewWithGame }) {
    const NO_COVER = "https://vglist.co/assets/no-cover-5b40e3b1.png";
    return (
        <div className={style.gameRow}>
            <img src={review.gameCover ?? NO_COVER} className={style.gameThumbnail} alt={review.gameName ?? ""} />
            <div className={style.gameInfo}>
                <Text variant="small">{review.gameName ?? `Game ${review.reviewed}`}</Text>
                <Text variant="small" color="var(--mutedText)">{`${review.hoursPlayed}h`}</Text>
            </div>
        </div>
    );
}

function UserStatsPanel({ reviews }: Props) {
    if (reviews.length === 0) return null;

    const scoreCounts: Record<number, number> = {};
    let maxCount = 0;

    reviews.forEach((r) => {
        const newCount = (scoreCounts[r.score] ?? 0) + 1;
        scoreCounts[r.score] = newCount;

        if (newCount > maxCount)
            maxCount = newCount;
    });

    const avgScore = reviews.reduce((sum, r) => sum + r.score, 0) / reviews.length;
    const avgStars = avgScore / 2;

    const platformCounts = new Map<string, number>();
    reviews.forEach((r) => {
        r.platforms?.forEach((p) => {
            platformCounts.set(p, (platformCounts.get(p) ?? 0) + 1);
        });
    });
    const platforms = [...platformCounts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([name]) => name);

    const topGames = [...reviews]
        .filter((r) => (r.hoursPlayed ?? 0) > 0)
        .sort((a, b) => (b.hoursPlayed ?? 0) - (a.hoursPlayed ?? 0))
        .slice(0, 3);

    return (
        <Panel type="secondary" direction="row" className={style.panel}>
            <div className={style.section}>
                <div className={style.barsWithLine}>
                    <div className={style.axisLine} />
                    <div className={style.bars}>
                        {BARS.map((b) => {
                            const count = scoreCounts[b.score] ?? 0;
                            const fillPct = count > 0 ? Math.max(MIN_BAR_PCT, (count / maxCount) * 100) : MIN_BAR_PCT;
                            return (
                                <div key={b.score} className={style.barRow}>
                                    <div className={style.barTrack}>
                                        <div
                                            className={b.isPink ? style.barFillPink : style.barFillBlue}
                                            style={{ width: `${fillPct}%`, opacity: count === 0 ? 0.18 : 1 }}
                                        />
                                    </div>
                                    <div className={style.barStars}>
                                        {b.isPink &&
                                            Array.from({ length: b.stars as number }).map((_, i) => (
                                                <Star key={i} type="full" size={11} color="var(--green)" />
                                            ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className={style.avgRow}>
                    <Text variant="body" color="var(--mutedText)">
                        Average score:
                    </Text>
                    <Text variant="body">{avgStars.toFixed(1)}</Text>
                    <Star type="full" size={18} color="var(--cyan)" />
                </div>
            </div>

            <div className={style.dividerV} />

            <div className={style.section}>
                <Text variant="h3">Platforms</Text>
                <div className={style.platformList}>
                    {platforms.length === 0 ? (
                        <Text variant="small" color="var(--mutedText)">
                            ————
                        </Text>
                    ) : (
                        platforms.map((name) => <PlatformRow key={name} name={name} />)
                    )}
                </div>
            </div>

            <div className={style.dividerV} />

            <div className={style.section}>
                <Text variant="h3">Most Played</Text>
                <div className={style.gameList}>
                    {topGames.length === 0 ? (
                        <Text variant="small" color="var(--mutedText)">
                            ————
                        </Text>
                    ) : (
                        topGames.map((r) => <GameEntry key={r.reviewed} review={r} />)
                    )}
                </div>
            </div>
        </Panel>
    );
}

export default UserStatsPanel;
