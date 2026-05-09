/**
 * This file is a one-off script to fetch IGDB IDs for a hardcoded list of games (see GAMES_TO_FIND).
 * The purpose is to use these ids to then populate the database in Seed.ts
 * This is not a code that needs maintanance and can be deleted when actuall users arive
 */
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FILE_PATH = path.join(__dirname, "token.log");
const OUTPUT_PATH = path.join(__dirname, "igdb_ids.txt");

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

type TokenData = {
    access_token: string;
    expires_at: number;
};

type AuthResponseIGDB = {
    access_token: string;
    expires_in: number;
    token_type: string;
};

type GameResult = {
    id: number;
    name: string;
};

type IGDBError = {
    status?: number;
    message?: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// PERSONAS & ASSOCIATED GAMES
// ─────────────────────────────────────────────────────────────────────────────
//
// soulsborn3r        → Souls / Metroidvania / hard action
// casualgamer99      → mainstream, popular, everything moderate
// retro_enjoyer      → pre-2010 classics, old school
// hater_guy          → games everyone loves (so he can hate them)
// indie_lover        → indie darlings, AA hidden gems
// completionist      → long, content-heavy, deep games
// fps_addict         → FPS / tactical shooters
// rpg_master         → RPG, JRPG, CRPG
// toxic_fan          → Minecraft ecosystem + building/sandbox
// balanced_critic    → critically acclaimed across all genres
// horror_enjoyer     → survival horror, atmospheric horror
// strategy_nerd      → RTS, 4X, grand strategy, turn-based
// open_world_chad    → big open world games
// fighting_game_fan  → fighting games
// racing_maniac      → racing games
// stealth_player     → stealth, espionage
// sim_guy            → simulators, management games
// platformer_fan     → classic + modern platformers
// narrative_lover    → story-driven games, walking sims
// mmo_addict         → MMOs, online RPGs
// ─────────────────────────────────────────────────────────────────────────────

const GAMES_TO_FIND: string[] = [
    // ── soulsborn3r ────────────────────────────────────────────────────────
    "Dark Souls",
    "Dark Souls II",
    "Dark Souls III",
    "Elden Ring",
    "Sekiro: Shadows Die Twice",
    "Demon's Souls",
    "Bloodborne",
    "Hollow Knight",
    "Celeste",
    "Hades",
    "Dead Cells",
    "Salt and Sanctuary",
    "Blasphemous",
    "Blasphemous 2",
    "Nioh",
    "Nioh 2",
    "Lies of P",
    "Lords of the Fallen",
    "Remnant: From the Ashes",
    "Remnant II",
    "Mortal Shell",
    "The Surge",
    "The Surge 2",
    "Star Wars Jedi: Fallen Order",
    "Star Wars Jedi: Survivor",
    "Tunic",
    "Nine Sols",
    "Ori and the Blind Forest",
    "Ori and the Will of the Wisps",
    "Axiom Verge",
    "Axiom Verge 2",
    "Metroid Dread",
    "Metroid Prime",
    "Metroid Prime Remastered",
    "Castlevania: Symphony of the Night",
    "Castlevania: Aria of Sorrow",

    // ── casualgamer99 ──────────────────────────────────────────────────────
    "Minecraft",
    "Grand Theft Auto V",
    "Red Dead Redemption 2",
    "The Last of Us",
    "The Last of Us Part II",
    "God of War",
    "God of War Ragnarok",
    "Marvel's Spider-Man",
    "Marvel's Spider-Man 2",
    "Uncharted 4: A Thief's End",
    "Horizon Zero Dawn",
    "Horizon Forbidden West",
    "Ghost of Tsushima",
    "Cyberpunk 2077",
    "Watch Dogs 2",
    "Assassin's Creed Odyssey",
    "Assassin's Creed Origins",
    "Assassin's Creed Valhalla",
    "Far Cry 5",
    "Far Cry 6",
    "Just Cause 4",
    "Saints Row IV",
    "Borderlands 2",
    "Borderlands 3",

    // ── retro_enjoyer ──────────────────────────────────────────────────────
    "Half-Life 2",
    "Half-Life",
    "System Shock 2",
    "Deus Ex",
    "Thief: The Dark Project",
    "Thief II: The Metal Age",
    "Baldur's Gate",
    "Baldur's Gate II: Shadows of Amn",
    "Planescape: Torment",
    "Fallout",
    "Fallout 2",
    "Diablo",
    "Diablo II",
    "StarCraft",
    "Warcraft III: Reign of Chaos",
    "Age of Empires II",
    "Age of Empires III",
    "Command & Conquer: Red Alert 2",
    "Quake",
    "Quake II",
    "Doom",
    "Doom II",
    "Duke Nukem 3D",
    "Ultima VII: The Black Gate",
    "Morrowind",
    "Oblivion",
    "Gothic",
    "Gothic II",
    "Risen",
    "Prince of Persia: The Sands of Time",
    "Beyond Good & Evil",
    "Psychonauts",
    "Jade Empire",
    "Knights of the Old Republic",
    "Knights of the Old Republic II",
    "Max Payne",
    "Max Payne 2",
    "Mafia",
    "Mafia II",
    "Counter-Strike",
    "Team Fortress 2",
    "Portal",
    "Portal 2",
    "Left 4 Dead",
    "Left 4 Dead 2",
    "Grim Fandango",
    "The Secret of Monkey Island",
    "Day of the Tentacle",
    "Full Throttle",
    "Myst",

    // ── hater_guy ──────────────────────────────────────────────────────────
    "Fortnite",
    "Apex Legends",
    "Call of Duty: Modern Warfare",
    "Call of Duty: Warzone",
    "Destiny 2",
    "Anthem",
    "No Man's Sky",
    "Fallout 76",
    "Battlefield 2042",
    "Halo Infinite",
    "Skull and Bones",
    "Redfall",
    "Suicide Squad: Kill the Justice League",
    "Starfield",
    "Concord",

    // ── indie_lover ────────────────────────────────────────────────────────
    "Stardew Valley",
    "Terraria",
    "Undertale",
    "Deltarune",
    "Disco Elysium",
    "Outer Wilds",
    "Return of the Obra Dinn",
    "Papers Please",
    "Shovel Knight",
    "Cuphead",
    "Into the Breach",
    "FTL: Faster Than Light",
    "Risk of Rain 2",
    "Noita",
    "Baba Is You",
    "Neon White",
    "Katana Zero",
    "Hotline Miami",
    "Hotline Miami 2: Wrong Number",
    "Hyper Light Drifter",
    "A Short Hike",
    "Night in the Woods",
    "Gris",
    "Spiritfarer",
    "Unpacking",
    "Vampire Survivors",
    "Dave the Diver",
    "Dredge",
    "Omori",
    "Eastward",
    "Unsighted",
    "Momodora: Reverie Under the Moonlight",
    "Enter the Gungeon",
    "Slay the Spire",
    "Monster Train",
    "Inscryption",
    "Doki Doki Literature Club",

    // ── completionist ─────────────────────────────────────────────────────
    "The Witcher 3: Wild Hunt",
    "Baldur's Gate 3",
    "The Elder Scrolls V: Skyrim",
    "Dragon Age: Origins",
    "Dragon Age: Inquisition",
    "Divinity: Original Sin 2",
    "Pathfinder: Kingmaker",
    "Pathfinder: Wrath of the Righteous",
    "Pillars of Eternity",
    "Pillars of Eternity II: Deadfire",
    "Tyranny",
    "Wasteland 3",
    "Torment: Tides of Numenera",
    "Mass Effect Legendary Edition",
    "Mass Effect 2",
    "Mass Effect 3",
    "Dragon's Dogma",
    "Dragon's Dogma 2",
    "Monster Hunter: World",
    "Monster Hunter Rise",
    "Xenoblade Chronicles 3",
    "Xenoblade Chronicles 2",
    "Final Fantasy XIV Online",
    "Final Fantasy XVI",
    "Final Fantasy VII Remake",
    "Final Fantasy VII Rebirth",
    "Persona 5 Royal",
    "Persona 4 Golden",
    "Persona 3 Reload",
    "Nier: Automata",
    "Nier Replicant",
    "Kingdom Come: Deliverance",
    "Kingdom Come: Deliverance II",

    // ── fps_addict ─────────────────────────────────────────────────────────
    "DOOM Eternal",
    "Call of Duty 4: Modern Warfare",
    "Call of Duty: Modern Warfare 2",
    "Call of Duty: Black Ops",
    "Call of Duty: Black Ops II",
    "Call of Duty: Black Ops Cold War",
    "Counter-Strike: Global Offensive",
    "Counter-Strike 2",
    "Halo: Combat Evolved",
    "Halo 2",
    "Halo 3",
    "Halo 5: Guardians",
    "Titanfall 2",
    "Battlefield 1",
    "Battlefield V",
    "Valorant",
    "Rainbow Six Siege",
    "Escape from Tarkov",
    "Hunt: Showdown",
    "Insurgency: Sandstorm",
    "Ready or Not",
    "Deep Rock Galactic",
    "Helldivers 2",
    "Wolfenstein: The New Order",
    "Wolfenstein II: The New Colossus",
    "Metro 2033",
    "Metro: Last Light",
    "Metro Exodus",
    "STALKER: Shadow of Chernobyl",
    "STALKER: Clear Sky",
    "STALKER: Call of Pripyat",
    "STALKER 2: Heart of Chornobyl",
    "Crysis",
    "Crysis 2",
    "Crysis 3",
    "Bioshock",
    "BioShock Infinite",
    "Bioshock 2",
    "F.E.A.R.",
    "Superhot",
    "Amid Evil",
    "Ion Fury",
    "Dusk",
    "Ultrakill",
    "Prodeus",

    // ── rpg_master ─────────────────────────────────────────────────────────
    "The Witcher 2: Assassins of Kings",
    "The Witcher",
    "Divinity: Original Sin",
    "Fallout: New Vegas",
    "Fallout 3",
    "Fallout 4",
    "Final Fantasy VI",
    "Final Fantasy VII",
    "Final Fantasy VIII",
    "Final Fantasy IX",
    "Final Fantasy X",
    "Final Fantasy XII: The Zodiac Age",
    "Chrono Trigger",
    "Chrono Cross",
    "Shin Megami Tensei V: Vengeance",
    "Xenoblade Chronicles",
    "Tales of Arise",
    "Tales of Berseria",
    "Octopath Traveler",
    "Octopath Traveler II",
    "Triangle Strategy",
    "Fire Emblem: Three Houses",
    "Tactics Ogre: Reborn",
    "Shadowrun: Dragonfall",
    "Shadowrun: Hong Kong",
    "Pathfinder: Wrath of the Righteous",
    "Solasta: Crown of the Magister",
    "Neverwinter Nights 2",

    // ── toxic_fan (sandbox/builders) ───────────────────────────────────────
    "Minecraft Dungeons",
    "Valheim",
    "Subnautica",
    "Subnautica: Below Zero",
    "The Forest",
    "Sons of the Forest",
    "7 Days to Die",
    "Rust",
    "Ark: Survival Evolved",
    "Palworld",
    "Astroneer",
    "Satisfactory",
    "Factorio",
    "Dyson Sphere Program",
    "Core Keeper",
    "Grounded",
    "Raft",
    "Green Hell",
    "The Long Dark",
    "Project Zomboid",
    "RimWorld",
    "Dwarf Fortress",
    "My Time at Portia",
    "My Time at Sandrock",

    // ── balanced_critic ────────────────────────────────────────────────────
    "Shadow of the Colossus",
    "Ico",
    "Death Stranding",
    "Control",
    "Alan Wake",
    "Alan Wake 2",
    "Prey",

    // ── horror_enjoyer ─────────────────────────────────────────────────────
    "Resident Evil",
    "Resident Evil 2",
    "Resident Evil 3",
    "Resident Evil 4",
    "Resident Evil 5",
    "Resident Evil 6",
    "Resident Evil 7: Biohazard",
    "Resident Evil Village",
    "Resident Evil: Code Veronica",
    "Resident Evil: Revelations",
    "Resident Evil: Revelations 2",
    "Silent Hill",
    "Silent Hill 2",
    "Silent Hill 3",
    "Silent Hill 4: The Room",
    "Amnesia: The Dark Descent",
    "Amnesia: Rebirth",
    "SOMA",
    "Penumbra: Overture",
    "Alien: Isolation",
    "Dead Space",
    "Dead Space 2",
    "Dead Space 3",
    "Dead Space Remake",
    "The Callisto Protocol",
    "Outlast",
    "Outlast 2",
    "Outlast: Trials",
    "Layers of Fear",
    "Visage",
    "Phasmophobia",
    "Fatal Frame",
    "Fatal Frame II: Crimson Butterfly",
    "F.E.A.R.",
    "Condemned: Criminal Origins",
    "Blair Witch",
    "Little Nightmares",
    "Little Nightmares II",
    "Five Nights at Freddy's",
    "The Evil Within",
    "The Evil Within 2",
    "The Medium",
    "Signalis",
    "Crow Country",
    "Observer",

    // ── strategy_nerd ──────────────────────────────────────────────────────
    "StarCraft II: Wings of Liberty",
    "Age of Empires IV",
    "Age of Mythology",
    "Company of Heroes",
    "Company of Heroes 2",
    "Company of Heroes 3",
    "Total War: Shogun 2",
    "Total War: Warhammer III",
    "Total War: Three Kingdoms",
    "Civilization VI",
    "Civilization V",
    "Humankind",
    "Endless Legend",
    "Endless Space 2",
    "Stellaris",
    "Crusader Kings III",
    "Crusader Kings II",
    "Europa Universalis IV",
    "Hearts of Iron IV",
    "Victoria 3",
    "XCOM 2",
    "XCOM: Enemy Unknown",
    "Phoenix Point",
    "Mutant Year Zero: Road to Eden",
    "Jagged Alliance 3",
    "Northgard",
    "Frostpunk",
    "Frostpunk 2",
    "They Are Billions",
    "Against the Storm",
    "Iron Harvest",

    // ── open_world_chad ────────────────────────────────────────────────────
    "The Legend of Zelda: Breath of the Wild",
    "The Legend of Zelda: Tears of the Kingdom",
    "Hogwarts Legacy",
    "Dying Light",
    "Dying Light 2: Stay Human",
    "Days Gone",
    "Mafia: Definitive Edition",
    "Mafia III",
    "Immortals Fenyx Rising",
    "Genshin Impact",
    "Black Desert Online",
    "Watch Dogs: Legion",
    "Assassin's Creed Mirage",
    "Far Cry 3",
    "Far Cry 4",
    "Gotham Knights",

    // ── fighting_game_fan ──────────────────────────────────────────────────
    "Street Fighter 6",
    "Street Fighter V",
    "Street Fighter IV",
    "Tekken 8",
    "Tekken 7",
    "Tekken 6",
    "Mortal Kombat 1",
    "Mortal Kombat 11",
    "Mortal Kombat X",
    "Guilty Gear Strive",
    "Dragon Ball FighterZ",
    "Granblue Fantasy Versus: Rising",
    "The King of Fighters XV",
    "Samurai Shodown",
    "Super Smash Bros. Ultimate",
    "Super Smash Bros. Melee",
    "Brawlhalla",
    "Rivals of Aether",
    "Skullgirls",
    "Soul Calibur VI",
    "Dead or Alive 6",
    "Melty Blood: Type Lumina",
    "Under Night In-Birth II",

    // ── racing_maniac ──────────────────────────────────────────────────────
    "Forza Horizon 5",
    "Forza Horizon 4",
    "Forza Motorsport",
    "Gran Turismo 7",
    "Gran Turismo Sport",
    "Need for Speed: Heat",
    "Need for Speed: Hot Pursuit Remastered",
    "Need for Speed: Most Wanted",
    "Need for Speed: Underground 2",
    "The Crew Motorfest",
    "Dirt Rally 2.0",
    "F1 23",
    "Assetto Corsa",
    "Assetto Corsa Competizione",
    "Wreckfest",
    "Burnout Paradise Remastered",
    "Mario Kart 8 Deluxe",
    "Crash Team Racing Nitro-Fueled",
    "Riders Republic",

    // ── stealth_player ─────────────────────────────────────────────────────
    "Dishonored",
    "Dishonored 2",
    "Dishonored: Death of the Outsider",
    "Deus Ex: Human Revolution",
    "Deus Ex: Mankind Divided",
    "Metal Gear Solid",
    "Metal Gear Solid 2: Sons of Liberty",
    "Metal Gear Solid 3: Snake Eater",
    "Metal Gear Solid V: The Phantom Pain",
    "Hitman",
    "Hitman 2",
    "Hitman 3",
    "Splinter Cell",
    "Splinter Cell: Chaos Theory",
    "Splinter Cell: Blacklist",
    "Assassin's Creed",
    "Assassin's Creed II",
    "Mark of the Ninja",
    "Aragami",
    "Aragami 2",
    "Styx: Master of Shadows",
    "Styx: Shards of Darkness",

    // ── sim_guy ────────────────────────────────────────────────────────────
    "Microsoft Flight Simulator",
    "Cities: Skylines",
    "Cities: Skylines II",
    "Planet Coaster",
    "Planet Zoo",
    "Two Point Hospital",
    "Two Point Campus",
    "Prison Architect",
    "Tropico 6",
    "Surviving Mars",
    "Frostpunk",
    "The Sims 4",
    "The Sims 3",
    "Farming Simulator 22",
    "Euro Truck Simulator 2",
    "American Truck Simulator",
    "Snowrunner",
    "PowerWash Simulator",
    "Kerbal Space Program",
    "Kerbal Space Program 2",
    "Space Engineers",
    "House Flipper",

    // ── platformer_fan ─────────────────────────────────────────────────────
    "Super Mario Odyssey",
    "Super Mario Bros. Wonder",
    "Super Mario Galaxy",
    "Super Mario Galaxy 2",
    "Donkey Kong Country: Tropical Freeze",
    "Rayman Legends",
    "Crash Bandicoot N. Sane Trilogy",
    "Spyro Reignited Trilogy",
    "Sonic Mania",
    "Sonic Frontiers",
    "Sonic Generations",
    "A Hat in Time",
    "Kirby and the Forgotten Land",
    "Shovel Knight",
    "Cuphead",
    "Bloodstained: Ritual of the Night",
    "Ender Lilies: Quietus of the Knights",
    "Messenger",
    "Ghost Song",
    "Haiku: The Robot",
    "Afterimage",

    // ── narrative_lover ────────────────────────────────────────────────────
    "What Remains of Edith Finch",
    "Gone Home",
    "Firewatch",
    "Oxenfree",
    "Oxenfree II: Lost Signals",
    "Night in the Woods",
    "Journey",
    "The Stanley Parable",
    "The Stanley Parable: Ultra Deluxe",
    "The Forgotten City",
    "Pentiment",
    "Norco",
    "Citizen Sleeper",
    "Life is Strange",
    "Life is Strange 2",
    "Life is Strange: True Colors",
    "The Walking Dead",
    "The Wolf Among Us",
    "Detroit: Become Human",
    "Heavy Rain",
    "Beyond: Two Souls",
    "Until Dawn",
    "The Quarry",
    "Man of Medan",
    "Little Hope",
    "House of Ashes",
    "OneShot",
    "Pyre",

    // ── mmo_addict ─────────────────────────────────────────────────────────
    "Final Fantasy XIV Online",
    "World of Warcraft",
    "Guild Wars 2",
    "Elder Scrolls Online",
    "Lost Ark",
    "New World",
    "Star Wars: The Old Republic",
    "Path of Exile",
    "Path of Exile 2",
    "Diablo IV",
    "Diablo III",
    "Torchlight II",
    "Grim Dawn",
    "Last Epoch",
    "Old School RuneScape",
    "Albion Online",
    "Warframe",
    "Honkai: Star Rail",
    "Throne and Liberty",
];

// ─────────────────────────────────────────────────────────────────────────────

class IGDBFetcher {
    private static clientId: string | undefined = process.env["IGDB_CLIENT_ID"];
    private static secret: string | undefined = process.env["IGDB_CLIENT_SECRET"];
    private static tokenInfo: TokenData = { access_token: "", expires_at: 0 };
    private static lastQueryTime: number = 0;
    private static readToken: boolean = false;

    private static async sleep() {
        const now = Date.now();
        const timeSinceLastQuery = now - this.lastQueryTime;
        if (timeSinceLastQuery < 2600) {
            await new Promise((resolve) => setTimeout(resolve, 2600 - timeSinceLastQuery));
        }
        this.lastQueryTime = Date.now();
    }

    private static async getNewToken(): Promise<void> {
        if (!IGDBFetcher.clientId || !IGDBFetcher.secret)
            throw new Error("Missing IGDB_CLIENT_ID and IGDB_CLIENT_SECRET in .env");

        const auth: AuthResponseIGDB = await fetch(
            `https://id.twitch.tv/oauth2/token?client_id=${IGDBFetcher.clientId}&client_secret=${IGDBFetcher.secret}&grant_type=client_credentials`,
            { method: "POST" }
        ).then((res) => res.json() as Promise<AuthResponseIGDB>);

        IGDBFetcher.tokenInfo.access_token = auth.access_token;
        IGDBFetcher.tokenInfo.expires_at = Math.floor(Date.now() / 1000) + auth.expires_in - 20;
        fs.writeFileSync(FILE_PATH, JSON.stringify(IGDBFetcher.tokenInfo, null, 2));
    }

    private static async handleToken(): Promise<void> {
        if (!IGDBFetcher.readToken) {
            try {
                const fileContent = fs.readFileSync(FILE_PATH, "utf-8");
                IGDBFetcher.tokenInfo = JSON.parse(fileContent) as TokenData;
            } catch {
                IGDBFetcher.tokenInfo = { access_token: "placeholder", expires_at: 0 };
            }
            IGDBFetcher.readToken = true;
        }

        const now = Math.floor(Date.now() / 1000);
        if (now > IGDBFetcher.tokenInfo.expires_at) await IGDBFetcher.getNewToken();
        await IGDBFetcher.sleep();
    }

    private static async queryGames(
        name: string
    ): Promise<{ ok: boolean; data: GameResult[] | IGDBError; status: number }> {
        const res = await fetch("https://api.igdb.com/v4/games", {
            method: "POST",
            headers: {
                "Client-ID": IGDBFetcher.clientId!,
                Authorization: `Bearer ${IGDBFetcher.tokenInfo.access_token}`,
            },
            body: `
                search "${name}";
                fields id, name;
                limit 3;
            `,
        });

        const data = (await res.json().catch(() => ({}))) as GameResult[] | IGDBError;
        return { ok: res.ok, data, status: res.status };
    }

    public static async searchByName(name: string): Promise<GameResult[]> {
        await IGDBFetcher.handleToken();

        let result = await IGDBFetcher.queryGames(name);

        if (!result.ok && result.status === 401) {
            await IGDBFetcher.getNewToken();
            result = await IGDBFetcher.queryGames(name);
        }

        if (!result.ok) {
            const message = (result.data as IGDBError)?.message ?? "Unknown IGDB error";
            console.log(`  ❌ IGDB error (${result.status}): ${message}`);
            return [];
        }

        if (!Array.isArray(result.data)) {
            console.log("  ❌ IGDB response not an array");
            return [];
        }

        return result.data;
    }
}

async function main() {
    const uniqueGames = [...new Set(GAMES_TO_FIND)];
    const logStream = fs.createWriteStream(OUTPUT_PATH, { flags: "w" });
    const header = `Fetching IGDB IDs for ${uniqueGames.length} unique games...\n`;

    console.log(header);
    logStream.write(header);

    for (const game of uniqueGames) {
        const matches = await IGDBFetcher.searchByName(game);

        const titleLine = `"${game}":`;
        console.log(titleLine);
        logStream.write(`${titleLine}\n`);
        if (!matches || matches.length === 0) {
            console.log("  ❌ No results");
            logStream.write("  ❌ No results\n");
        } else {
            for (const m of matches) {
                const line = `  → id: ${m.id}  name: "${m.name}"`;
                console.log(line);
                logStream.write(`${line}\n`);
            }
        }
        console.log();
        logStream.write("\n");
    }

    logStream.end();
    console.log(`Saved output to ${OUTPUT_PATH}`);
}

main();
