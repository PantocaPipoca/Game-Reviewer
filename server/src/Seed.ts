/**
 *
 * Run:
 *   BASE_URL=http://localhost:3000 AVATARS_DIR=./avatars npx tsx src/Seed.ts
 *
 * Avatar convention: place files named "<accountName>.png" (or .jpg/.jpeg/.webp) in AVATARS_DIR.
 * If the file doesn't exist, the avatar step is silently skipped for that user.
 */

import fs from "fs";
import path from "path";

const BASE_URL = process.env["BASE_URL"] ?? "http://localhost:3000";
const API = `${BASE_URL}/api`;
const AVATARS_DIR = process.env["AVATARS_DIR"] ?? "./avatars";

const cookieJar = new Map<string, string>();
let csrfToken: string | null = null;

// ─── Helpers ────────────────────────────────────────────────────────────────

async function sleep(ms: number): Promise<void> {
    return new Promise((r) => setTimeout(r, ms));
}

function pick<T>(arr: T[]): T {
    if (arr.length === 0) throw new Error("pick() called on empty array");
    return arr[Math.floor(Math.random() * arr.length)] as T;
}

function pickN<T>(arr: T[], n: number): T[] {
    const shuffled = [...arr].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(n, arr.length));
}

function rand(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function isUnsafeMethod(method: string): boolean {
    const upper = method.toUpperCase();
    return upper === "POST" || upper === "PUT" || upper === "PATCH" || upper === "DELETE";
}

function splitSetCookie(headerValue: string): string[] {
    return headerValue.split(/,(?=[^;]+=[^;]+)/g).map((part) => part.trim());
}

function updateCookies(res: Response): void {
    const headers = res.headers as unknown as { getSetCookie?: () => string[] };
    const setCookies = typeof headers.getSetCookie === "function" ? headers.getSetCookie() : [];
    const raw = res.headers.get("set-cookie");
    const allCookies = [...setCookies, ...(raw ? splitSetCookie(raw) : [])];
    for (const cookie of allCookies) {
        const [pair] = cookie.split(";");
        if (!pair) continue;
        const [name, value] = pair.split("=");
        if (!name || value === undefined) continue;
        const trimmedName = name.trim();
        if (trimmedName === "csrf-token") {
            cookieJar.set(trimmedName, value.trim());
        }
    }
}

function buildCookieHeader(): string | undefined {
    if (cookieJar.size === 0) return undefined;
    return Array.from(cookieJar.entries())
        .map(([name, value]) => `${name}=${value}`)
        .join("; ");
}

async function fetchCsrfToken(): Promise<string> {
    const cookieHeader = buildCookieHeader();
    const res = await fetch(`${API}/csrf-token`, {
        method: "GET",
        ...(cookieHeader ? { headers: { Cookie: cookieHeader } } : {}),
    });
    updateCookies(res);
    const data = (await res.json().catch(() => ({}))) as { data?: { csrfToken?: unknown } };
    const token = data?.data?.csrfToken;
    if (!token || typeof token !== "string") throw new Error("Failed to fetch CSRF token");
    csrfToken = token;
    return token;
}

async function api(
    method: string,
    path: string,
    body?: object,
    token?: string
): Promise<{ ok: boolean; status: number; data: any }> {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const cookieHeader = buildCookieHeader();
    if (cookieHeader) headers["Cookie"] = cookieHeader;
    if (isUnsafeMethod(method)) {
        if (!csrfToken) await fetchCsrfToken();
        if (csrfToken) headers["x-csrf-token"] = csrfToken;
    }
    try {
        const res = await fetch(`${API}${path}`, {
            method,
            headers,
            ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
        });
        updateCookies(res);
        const data = (await res.json().catch(() => ({}))) as { message?: unknown };
        if (res.status === 403 && data?.message === "Invalid CSRF token" && isUnsafeMethod(method)) {
            csrfToken = null;
            await fetchCsrfToken();
            const retryHeaders: Record<string, string> = { ...headers };
            const retryCookieHeader = buildCookieHeader();
            if (retryCookieHeader) retryHeaders["Cookie"] = retryCookieHeader;
            if (csrfToken) retryHeaders["x-csrf-token"] = csrfToken;
            const retryRes = await fetch(`${API}${path}`, {
                method,
                headers: retryHeaders,
                ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
            });
            updateCookies(retryRes);
            const retryData = await retryRes.json().catch(() => ({}));
            return { ok: retryRes.ok, status: retryRes.status, data: retryData };
        }
        return { ok: res.ok, status: res.status, data };
    } catch (err) {
        console.error(`  ✗ ${method} ${path} — network error:`, err);
        return { ok: false, status: 0, data: {} };
    }
}

async function apiMultipart(
    path: string,
    filePath: string,
    token?: string
): Promise<{ ok: boolean; status: number; data: any }> {
    try {
        if (!csrfToken) await fetchCsrfToken();

        const fileBuffer = fs.readFileSync(filePath);
        const ext = filePath.split(".").pop()?.toLowerCase() ?? "png";
        const mimeTypes: Record<string, string> = {
            png: "image/png",
            jpg: "image/jpeg",
            jpeg: "image/jpeg",
            webp: "image/webp",
        };
        const mime = mimeTypes[ext] ?? "image/png";
        const formData = new FormData();
        const blob = new Blob([fileBuffer], { type: mime });
        formData.append("avatar", blob, `avatar.${ext}`);

        const buildHeaders = (): Record<string, string> => {
            const nextHeaders: Record<string, string> = {};
            const cookieHeader = buildCookieHeader();
            if (token) nextHeaders["Authorization"] = `Bearer ${token}`;
            if (cookieHeader) nextHeaders["Cookie"] = cookieHeader;
            if (csrfToken) nextHeaders["x-csrf-token"] = csrfToken;
            return nextHeaders;
        };

        let res = await fetch(`${API}${path}`, {
            method: "PUT",
            headers: buildHeaders(),
            body: formData,
        });
        updateCookies(res);
        let data = (await res.json().catch(() => ({}))) as { message?: unknown };

        if (res.status === 403 && data?.message === "Invalid CSRF token") {
            csrfToken = null;
            await fetchCsrfToken();
            res = await fetch(`${API}${path}`, {
                method: "PUT",
                headers: buildHeaders(),
                body: formData,
            });
            updateCookies(res);
            data = (await res.json().catch(() => ({}))) as { message?: unknown };
        }

        return { ok: res.ok, status: res.status, data };
    } catch (err) {
        console.error(`  ✗ PUT ${path} — multipart error:`, err);
        return { ok: false, status: 0, data: {} };
    }
}

// ─── Game ID Constants (verified IGDB IDs) ───────────────────────────────────

// Souls / Metroidvania
const DARK_SOULS = 2155;
const DARK_SOULS_II = 2368;
const DARK_SOULS_III = 11133;
const ELDEN_RING = 119133;
const SEKIRO = 76882;
const BLOODBORNE = 7334;
const HOLLOW_KNIGHT = 14593;
const CELESTE = 26226;
const HADES = 113112;
const DEAD_CELLS = 26855;
const BLASPHEMOUS = 26820;
const LIES_OF_P = 148241;
const TUNIC = 23733;
const NINE_SOLS = 194821;
const ORI_BLIND_FOREST = 7344;
const ORI_WILL_WISPS = 37001;
const METROID_DREAD = 15698;
const METROID_PRIME = 134257;
const AXIOM_VERGE = 8652;

// AAA Mainstream
const MINECRAFT = 1976;
const GTA_V = 1020;
const RED_DEAD_2 = 25076;
const LAST_OF_US = 1009;
const LAST_OF_US_2 = 26192;
const GOD_OF_WAR_2018 = 19560;
const GOD_OF_WAR_RAG = 112875;
const SPIDERMAN_2 = 127044;
const HORIZON_ZD = 11156;
const GHOST_TSUSHIMA = 75235;
const CYBERPUNK = 1877;
const HORIZON_FW = 112874;
const UNCHARTED_4 = 7331;

// Classic / Retro
const HALF_LIFE = 2281;
const PORTAL = 3993;
const PORTAL_2 = 72;
const LEFT4DEAD2 = 124;
const BALDURS_GATE_2 = 6;
const PLANESCAPE = 832;
const MORROWIND = 56;
const OBLIVION = 59;
const DEUS_EX_HR = 43;
const GOTHIC_II = 2262;
const SYSTEM_SHOCK_2 = 22;
const PRINCE_OF_PERSIA_SOT = 836;
const BEYOND_GOOD_EVIL = 1341;
const PSYCHONAUTS = 1339;
const KOTOR = 116;
const KOTOR_II = 118;
const JADE_EMPIRE = 5867;

// RPG
const WITCHER_3 = 1942;
const BALDURS_GATE_3 = 119171;
const SKYRIM = 472;
const DRAGON_AGE_ORIGINS = 76;
const DRAGON_AGE_INQ = 1887;
const DIVINITY_OS2 = 11800;
const PATHFINDER_KM = 36929;
const PATHFINDER_WR = 127254;
const PILLARS_1 = 1593;
const PILLARS_2 = 26951;
const MASS_EFFECT_LE = 140839;
const MASS_EFFECT_2 = 74;
const PERSONA_5_ROYAL = 114283;
const PERSONA_4_GOLDEN = 2985;
const NIER_AUTOMATA = 11208;
const FINAL_FANTASY_XVI = 31551;
const FINAL_FANTASY_XIV = 386;
const FINAL_FANTASY_VII_REMAKE = 11169;
const XENOBLADE_3 = 191411;
const DRAGON_DOGMA = 3968;
const DRAGON_DOGMA_2 = 115060;
const MONSTER_HUNTER_WORLD = 36926;
const TYRANNY = 18398;
const TALES_OF_ARISE = 119270;
const WITCHER_2 = 478;
const FALLOUT_NV = 16;
const FALLOUT_3 = 15;
const FALLOUT_4 = 9630;

// FPS / Action
const DOOM_ETERNAL = 103298;
const TITANFALL_2 = 17447;
const METRO_EXODUS = 37016;
const METRO_2033 = 495;
const STALKER_SOC = 320;
const STALKER_2 = 101440;
const BIOSHOCK = 152660;
const BIOSHOCK_INFINITE = 538;
const WOLFENSTEIN_NO = 2031;
const WOLFENSTEIN_2 = 36952;
const DEEP_ROCK = 27134;
const HELLDIVERS_2 = 250616;
const SUPERHOT = 7205;
const CS2 = 242408;
const RAINBOW_SIX = 7360;
const HALO_CE = 740;
const COD_MW2019 = 119177;
const HUNT_SHOWDOWN = 7291;
const ULTRAKILL = 124333;
const AMID_EVIL = 74904;

// Indie / AA
const STARDEW_VALLEY = 17000;
const TERRARIA = 1879;
const UNDERTALE = 12517;
const DISCO_ELYSIUM = 26472;
const OUTER_WILDS = 11737;
const OBRA_DINN = 9643;
const PAPERS_PLEASE = 2935;
const SHOVEL_KNIGHT = 7444;
const CUPHEAD = 9061;
const INTO_THE_BREACH = 27117;
const FTL = 3075;
const RISK_OF_RAIN_2 = 28512;
const BABA_IS_YOU = 76638;
const KATANA_ZERO = 20150;
const HOTLINE_MIAMI = 1384;
const HOTLINE_MIAMI_2 = 2126;
const HYPER_LIGHT_DRIFTER = 9806;
const NIGHT_IN_WOODS = 10148;
const GRIS = 22917;
const SPIRITFARER = 119304;
const VAMPIRE_SURVIVORS = 186725;
const DAVE_DIVER = 203722;
const DREDGE = 164867;
const OMORI = 26673;
const SLAY_THE_SPIRE = 40477;
const INSCRYPTION = 139090;
const DOKI_DOKI = 55935;
const UNPACKING = 134276;
const A_SHORT_HIKE = 116753;
const DELTARUNE = 171233;
const NEON_WHITE = 143612;
const MOMODORA = 18182;
const ENTER_GUNGEON = 11182;
const MONSTER_TRAIN = 129483;
const NOITA = 52006;
const EASTWARD = 24417;
const UNSIGHTED = 111815;

// Horror
const RE_4 = 145191;
const RE_7 = 19562;
const RE_VILLAGE = 55163;
const RE_2_REMAKE = 67; // original RE2
const SILENT_HILL_2 = 222485; // remake
const SILENT_HILL_2_OG = 482; // og SH3 id used as proxy
const AMNESIA = 111;
const SOMA = 9727;
const ALIEN_ISOLATION = 4754;
const DEAD_SPACE = 985;
const DEAD_SPACE_2 = 38;
const OUTLAST = 1910;
const PHASMOPHOBIA = 132516;
const SIGNALIS = 103244;
const LITTLE_NIGHTMARES = 9174;
const LITTLE_NIGHTMARES_2 = 121760;
const CROW_COUNTRY = 273522;

// Strategy
const STARCRAFT_2 = 239;
const XCOM_2 = 37060;
const XCOM_EU = 1318;
const STELLARIS = 11582;
const CRUSADER_KINGS_3 = 124954;
const CRUSADER_KINGS_2 = 2918;
const HEARTS_OF_IRON_4 = 15894;
const EUROPA_UNIVERSALIS_4 = 1904;
const VICTORIA_3 = 148372;
const CIVILIZATION_VI = 66526; // civ 6 base
const FROSTPUNK = 23248;
const FROSTPUNK_2 = 164290;
const TOTAL_WAR_WARHAMMER3 = 143114;
const AGE_OF_EMPIRES_4 = 55029;
const AGAINST_STORM = 115538;

// Open World / Sandbox
const VALHEIM = 104967;
const SUBNAUTICA = 9254;
const PROJECT_ZOMBOID = 3189;
const RIMWORLD = 9789;
const FACTORIO = 7046;
const SATISFACTORY = 90558;
const GROUNDED = 125624;
const SONS_OF_FOREST = 127346;
const THE_LONG_DARK = 8347;
const PALWORLD = 151665;
const ZELDA_BOTW = 11825; // botw
const ZELDA_TOTK = 119388;
const HOGWARTS_LEGACY = 136625;
const DYING_LIGHT = 3042;
const DYING_LIGHT_2 = 102584;
const GHOST_OF_TSUSHIMA = 75235; // duplicate alias
const DAYS_GONE = 19561;
const IMMORTALS_FENYX = 119357;

// Narrative / Walking Sims
const WHAT_REMAINS_EF = 11233;
const GONE_HOME = 1906;
const FIREWATCH = 9730;
const OXENFREE = 14587;
const OXENFREE_2 = 145784;
const STANLEY_PARABLE = 3035;
const STANLEY_PARABLE_UD = 113119;
const FORGOTTEN_CITY = 103320;
const PENTIMENT = 204623;
const CITIZEN_SLEEPER = 152271;
const DETROIT_BH = 14362;
const HEAVY_RAIN = 493;
const LIFE_IS_STRANGE = 7599;
const LIFE_IS_STRANGE_2 = 62151;
const WALKING_DEAD = 1871;
const NORCO = 129097;
const DISCO_ELYSIUM_ALT = 335434; // final cut version id
const ONESHOT = 23181;
const OMORI_ALT = 26673;

// Fighting
const STREET_FIGHTER_6 = 191692;
const TEKKEN_8 = 217590;
const MORTAL_KOMBAT_1 = 239392;
const GUILTY_GEAR_STRIVE = 125764;
const SMASH_ULTIMATE = 90101;

// Racing
const FORZA_HORIZON_5 = 141503;
const GRAN_TURISMO_7 = 101006;
const BURNOUT_PARADISE = 78153;

// Multiplayer / Online
const WARFRAME = 2903;
const DEEP_ROCK_GALACTIC = 27134; // duplicate alias
const HELLDIVERS_2_ALT = 250616;
const PHASMOPHOBIA_ALT = 132516;

// Bad / Controversial
const GOTHAM_KNIGHTS = 136562;
const REDFALL = 152247;
const SUICIDE_SQUAD_GAME = 136627;
const STARFIELD = 96437;
const ANTHEM = 36950;
const SKULL_AND_BONES = 37062;
const CONCORD = 250632;
const FALLOUT_76 = 103020;
const NO_MANS_SKY = 329714; // actually good now but controversial

// ─── Grouped sets ────────────────────────────────────────────────────────────

const SOULS_GAMES = [DARK_SOULS, DARK_SOULS_II, DARK_SOULS_III, ELDEN_RING, SEKIRO, BLOODBORNE, LIES_OF_P];
const METROIDVANIA_GAMES = [
    HOLLOW_KNIGHT,
    CELESTE,
    HADES,
    DEAD_CELLS,
    BLASPHEMOUS,
    TUNIC,
    NINE_SOLS,
    ORI_BLIND_FOREST,
    ORI_WILL_WISPS,
    METROID_DREAD,
    AXIOM_VERGE,
];
const INDIE_GAMES = [
    HOLLOW_KNIGHT,
    CELESTE,
    HADES,
    STARDEW_VALLEY,
    UNDERTALE,
    DISCO_ELYSIUM,
    OUTER_WILDS,
    OBRA_DINN,
    PAPERS_PLEASE,
    SHOVEL_KNIGHT,
    CUPHEAD,
    INTO_THE_BREACH,
    FTL,
    NOITA,
    KATANA_ZERO,
    HOTLINE_MIAMI,
    HYPER_LIGHT_DRIFTER,
    GRIS,
    SPIRITFARER,
    VAMPIRE_SURVIVORS,
    DAVE_DIVER,
    DREDGE,
    OMORI,
    SLAY_THE_SPIRE,
    INSCRYPTION,
    DOKI_DOKI,
    UNPACKING,
    A_SHORT_HIKE,
    NEON_WHITE,
    ENTER_GUNGEON,
    MONSTER_TRAIN,
    SIGNALIS,
    CROW_COUNTRY,
    DELTARUNE,
    EASTWARD,
    UNSIGHTED,
];
const AAA_GAMES = [
    MINECRAFT,
    GTA_V,
    RED_DEAD_2,
    LAST_OF_US,
    LAST_OF_US_2,
    GOD_OF_WAR_2018,
    GOD_OF_WAR_RAG,
    SPIDERMAN_2,
    HORIZON_ZD,
    GHOST_TSUSHIMA,
    CYBERPUNK,
    HORIZON_FW,
    UNCHARTED_4,
    HOGWARTS_LEGACY,
    DYING_LIGHT_2,
];
const RPG_GAMES = [
    WITCHER_3,
    BALDURS_GATE_3,
    SKYRIM,
    DRAGON_AGE_ORIGINS,
    DIVINITY_OS2,
    MASS_EFFECT_LE,
    PERSONA_5_ROYAL,
    NIER_AUTOMATA,
    FINAL_FANTASY_XVI,
    XENOBLADE_3,
    PATHFINDER_WR,
    TALES_OF_ARISE,
    MONSTER_HUNTER_WORLD,
];
const FPS_GAMES = [
    DOOM_ETERNAL,
    TITANFALL_2,
    METRO_EXODUS,
    BIOSHOCK,
    BIOSHOCK_INFINITE,
    WOLFENSTEIN_NO,
    WOLFENSTEIN_2,
    DEEP_ROCK,
    HELLDIVERS_2,
    CS2,
    HALO_CE,
    COD_MW2019,
    ULTRAKILL,
    AMID_EVIL,
    STALKER_2,
];
const CLASSIC_GAMES = [
    PORTAL,
    PORTAL_2,
    LEFT4DEAD2,
    BALDURS_GATE_2,
    PLANESCAPE,
    MORROWIND,
    OBLIVION,
    GOTHIC_II,
    SYSTEM_SHOCK_2,
    PRINCE_OF_PERSIA_SOT,
    BEYOND_GOOD_EVIL,
    KOTOR,
    KOTOR_II,
    JADE_EMPIRE,
    FALLOUT_NV,
    WITCHER_2,
    DEUS_EX_HR,
];
const MODERN_GAMES = [
    ELDEN_RING,
    BALDURS_GATE_3,
    LIES_OF_P,
    NINE_SOLS,
    STALKER_2,
    FROSTPUNK_2,
    DRAGON_DOGMA_2,
    DAVE_DIVER,
    CROW_COUNTRY,
    SIGNALIS,
    HELLDIVERS_2,
];
const BAD_GAMES = [
    GOTHAM_KNIGHTS,
    REDFALL,
    SUICIDE_SQUAD_GAME,
    STARFIELD,
    ANTHEM,
    SKULL_AND_BONES,
    CONCORD,
    FALLOUT_76,
];
const HORROR_GAMES = [
    RE_4,
    RE_7,
    RE_VILLAGE,
    SILENT_HILL_2,
    AMNESIA,
    SOMA,
    ALIEN_ISOLATION,
    DEAD_SPACE,
    DEAD_SPACE_2,
    OUTLAST,
    PHASMOPHOBIA,
    SIGNALIS,
    LITTLE_NIGHTMARES,
    LITTLE_NIGHTMARES_2,
    CROW_COUNTRY,
];
const STRATEGY_GAMES = [
    XCOM_2,
    XCOM_EU,
    STELLARIS,
    CRUSADER_KINGS_3,
    HEARTS_OF_IRON_4,
    FROSTPUNK,
    FROSTPUNK_2,
    TOTAL_WAR_WARHAMMER3,
    AGE_OF_EMPIRES_4,
    VICTORIA_3,
    AGAINST_STORM,
    CRUSADER_KINGS_2,
];
const SANDBOX_GAMES = [
    MINECRAFT,
    VALHEIM,
    SUBNAUTICA,
    PROJECT_ZOMBOID,
    RIMWORLD,
    FACTORIO,
    SATISFACTORY,
    GROUNDED,
    SONS_OF_FOREST,
    THE_LONG_DARK,
    PALWORLD,
];
const NARRATIVE_GAMES = [
    WHAT_REMAINS_EF,
    GONE_HOME,
    FIREWATCH,
    OXENFREE,
    OXENFREE_2,
    STANLEY_PARABLE,
    STANLEY_PARABLE_UD,
    FORGOTTEN_CITY,
    PENTIMENT,
    CITIZEN_SLEEPER,
    DETROIT_BH,
    HEAVY_RAIN,
    LIFE_IS_STRANGE,
    LIFE_IS_STRANGE_2,
    WALKING_DEAD,
    NORCO,
    ONESHOT,
];
const FIGHTING_GAMES = [STREET_FIGHTER_6, TEKKEN_8, MORTAL_KOMBAT_1, GUILTY_GEAR_STRIVE, SMASH_ULTIMATE];
const RACING_GAMES = [FORZA_HORIZON_5, GRAN_TURISMO_7, BURNOUT_PARADISE];

const ALL_GAME_IDS = [
    ...new Set([
        ...SOULS_GAMES,
        ...METROIDVANIA_GAMES,
        ...INDIE_GAMES,
        ...AAA_GAMES,
        ...RPG_GAMES,
        ...FPS_GAMES,
        ...CLASSIC_GAMES,
        ...MODERN_GAMES,
        ...BAD_GAMES,
        ...HORROR_GAMES,
        ...STRATEGY_GAMES,
        ...SANDBOX_GAMES,
        ...NARRATIVE_GAMES,
        ...FIGHTING_GAMES,
        ...RACING_GAMES,
    ]),
];

// ─── Persona Type ─────────────────────────────────────────────────────────────

type Persona = {
    accountName: string;
    displayName: string;
    email: string;
    password: string;
    bio: string;
    scoreFor: (gameID: number) => number;
    reviewGames: number[];
    likesBias: "likes_most" | "dislikes_most" | "balanced";
    commentActivity: "heavy" | "moderate" | "rare" | "silent";
};

// ─── Personas ────────────────────────────────────────────────────────────────

const PERSONAS: Persona[] = [
    // ── 1. The Soulsborne Evangelist ──
    {
        accountName: "soulsborn3r",
        displayName: "Soulsborn3r",
        email: "soulsborner@seed.dev",
        password: "Seed1234!",
        bio: "Git gud or go home. Every game is a walking simulator compared to Elden Ring. I've beaten Malenia with a broken controller at 3am and felt nothing but peace.",
        scoreFor: (id) => {
            if (SOULS_GAMES.includes(id)) return rand(9, 10);
            if (METROIDVANIA_GAMES.includes(id)) return rand(7, 9);
            if (BAD_GAMES.includes(id)) return rand(1, 2);
            return rand(1, 4);
        },
        reviewGames: [
            ...new Set([
                ...SOULS_GAMES,
                ...METROIDVANIA_GAMES,
                DOOM_ETERNAL,
                TITANFALL_2,
                HOLLOW_KNIGHT,
                OUTER_WILDS,
                MINECRAFT,
                WITCHER_3,
                PERSONA_5_ROYAL,
                ...BAD_GAMES.slice(0, 4),
            ]),
        ],
        likesBias: "balanced",
        commentActivity: "heavy",
    },

    // ── 2. The Casual Enjoyer ──
    {
        accountName: "casualgamer99",
        displayName: "Casual Gamer 99",
        email: "casual99@seed.dev",
        password: "Seed1234!",
        bio: "I play games to relax. All games are fun if you give them a chance! Currently juggling Stardew Valley and God of War between work shifts. Not a pro but I know what I like.",
        scoreFor: () => rand(5, 8),
        reviewGames: [
            ...new Set([
                ...AAA_GAMES,
                STARDEW_VALLEY,
                MINECRAFT,
                HOLLOW_KNIGHT,
                HADES,
                WITCHER_3,
                BALDURS_GATE_3,
                PERSONA_5_ROYAL,
                VAMPIRE_SURVIVORS,
                DAVE_DIVER,
                VALHEIM,
                DYING_LIGHT_2,
                ELDEN_RING,
                GOD_OF_WAR_2018,
            ]),
        ],
        likesBias: "likes_most",
        commentActivity: "moderate",
    },

    // ── 3. The Retro Purist ──
    {
        accountName: "retro_enjoyer",
        displayName: "Retro Enjoyer",
        email: "retro@seed.dev",
        password: "Seed1234!",
        bio: "Games peaked in 2004. Modern gaming is a cash-grabbing, soulless, early-access, live-service disaster. I replay Morrowind every winter and Planescape: Torment every spring.",
        scoreFor: (id) => {
            if (CLASSIC_GAMES.includes(id)) return rand(8, 10);
            if ([MORROWIND, OBLIVION, GOTHIC_II, SYSTEM_SHOCK_2].includes(id)) return rand(9, 10);
            if (MODERN_GAMES.includes(id)) return rand(2, 5);
            if (BAD_GAMES.includes(id)) return rand(1, 3);
            return rand(3, 6);
        },
        reviewGames: [
            ...new Set([
                ...CLASSIC_GAMES,
                MORROWIND,
                OBLIVION,
                GOTHIC_II,
                DARK_SOULS,
                ELDEN_RING,
                WITCHER_3,
                BALDURS_GATE_3,
                CYBERPUNK,
                PERSONA_5_ROYAL,
                DISCO_ELYSIUM,
                ...BAD_GAMES.slice(0, 5),
                STARFIELD,
                NO_MANS_SKY,
            ]),
        ],
        likesBias: "balanced",
        commentActivity: "moderate",
    },

    // ── 4. The Universal Hater ──
    {
        accountName: "hater_guy",
        displayName: "Hater Guy",
        email: "hater@seed.dev",
        password: "Seed1234!",
        bio: "Everything is overrated. Fight me. I've played everything you love and I'm here to tell you it's mid. Yes, even that one. Especially that one.",
        scoreFor: (id) => {
            if (BAD_GAMES.includes(id)) return rand(1, 3);
            if ([HOLLOW_KNIGHT, ELDEN_RING, OUTER_WILDS, UNDERTALE, DISCO_ELYSIUM].includes(id)) return rand(2, 4);
            return rand(1, 4);
        },
        reviewGames: [...new Set([...ALL_GAME_IDS.slice(0, 18)])],
        likesBias: "dislikes_most",
        commentActivity: "heavy",
    },

    // ── 5. The Indie Champion ──
    {
        accountName: "indie_lover",
        displayName: "Indie Lover",
        email: "indie@seed.dev",
        password: "Seed1234!",
        bio: "AAA is dead. Indie devs are the soul of gaming. A single dev with a vision will always beat a 500-person studio chasing quarterly targets. I've played 800+ indie games on Steam.",
        scoreFor: (id) => {
            if (INDIE_GAMES.includes(id)) return rand(8, 10);
            if (AAA_GAMES.includes(id)) return rand(2, 5);
            if (BAD_GAMES.includes(id)) return 1;
            if (SOULS_GAMES.includes(id)) return rand(5, 8);
            return rand(4, 7);
        },
        reviewGames: [
            ...new Set([
                ...INDIE_GAMES,
                ...AAA_GAMES.slice(0, 5),
                ELDEN_RING,
                DISCO_ELYSIUM,
                OUTER_WILDS,
                ...BAD_GAMES.slice(0, 3),
            ]),
        ],
        likesBias: "likes_most",
        commentActivity: "heavy",
    },

    // ── 6. The 100% Completionist ──
    {
        accountName: "completionist",
        displayName: "The Completionist",
        email: "complete@seed.dev",
        password: "Seed1234!",
        bio: "100% or nothing. I've logged 2000+ hours in games you've never heard of. My Steam library has 1,200 games and 847 of them are fully platinumed. Sleep is for people who don't care about achievements.",
        scoreFor: (id) => {
            if ([BALDURS_GATE_3, WITCHER_3, MONSTER_HUNTER_WORLD, PERSONA_5_ROYAL, XENOBLADE_3].includes(id))
                return rand(9, 10);
            if (BAD_GAMES.includes(id)) return rand(3, 5);
            if ([HOLLOW_KNIGHT, CELESTE, DARK_SOULS].includes(id)) return rand(8, 10);
            return rand(6, 9);
        },
        reviewGames: ALL_GAME_IDS,
        likesBias: "balanced",
        commentActivity: "heavy",
    },

    // ── 7. The FPS Veteran ──
    {
        accountName: "fps_addict",
        displayName: "FPS Addict",
        email: "fps@seed.dev",
        password: "Seed1234!",
        bio: "If it doesn't have a gun, I'm not interested. 3,000 hours in CS, 500 in Tarkov, 200 in Ultrakill. I can't feel my right wrist anymore but the K/D ratio was worth it.",
        scoreFor: (id) => {
            if (FPS_GAMES.includes(id)) return rand(8, 10);
            if ([RPG_GAMES, NARRATIVE_GAMES].flat().includes(id)) return rand(2, 4);
            if (SOULS_GAMES.includes(id)) return rand(4, 6);
            return rand(3, 6);
        },
        reviewGames: [
            ...new Set([
                ...FPS_GAMES,
                CS2,
                RAINBOW_SIX,
                HUNT_SHOWDOWN,
                DEEP_ROCK,
                HELLDIVERS_2,
                MINECRAFT,
                DOOM_ETERNAL,
                TITANFALL_2,
                HALO_CE,
                ...RPG_GAMES.slice(0, 4),
                METRO_2033,
            ]),
        ],
        likesBias: "balanced",
        commentActivity: "moderate",
    },

    // ── 8. The CRPG Master ──
    {
        accountName: "rpg_master",
        displayName: "RPG Master",
        email: "rpg@seed.dev",
        password: "Seed1234!",
        bio: "I've played every CRPG ever made. Baldur's Gate 3 changed my life twice — once when I played it, once when I finished it. If a game doesn't have a dialogue system with at least 4 options I get bored.",
        scoreFor: (id) => {
            if (RPG_GAMES.includes(id)) return rand(8, 10);
            if (CLASSIC_GAMES.includes(id)) return rand(7, 10);
            if (FPS_GAMES.includes(id)) return rand(3, 5);
            if (INDIE_GAMES.includes(id) && [DISCO_ELYSIUM, OUTER_WILDS, UNDERTALE, OMORI].includes(id))
                return rand(8, 10);
            return rand(4, 7);
        },
        reviewGames: [
            ...new Set([
                ...RPG_GAMES,
                ...CLASSIC_GAMES,
                DISCO_ELYSIUM,
                OUTER_WILDS,
                UNDERTALE,
                PATHFINDER_WR,
                TYRANNY,
                PILLARS_2,
                MONSTER_HUNTER_WORLD,
                NIER_AUTOMATA,
                TALES_OF_ARISE,
                DRAGON_DOGMA,
                DRAGON_DOGMA_2,
            ]),
        ],
        likesBias: "likes_most",
        commentActivity: "moderate",
    },

    // ── 9. The Minecraft Obsessive ──
    {
        accountName: "toxic_fan",
        displayName: "Toxic Fan",
        email: "toxic@seed.dev",
        password: "Seed1234!",
        bio: "Minecraft is the only game that matters. Steve could beat Goku, Kratos, and the Elden Beast simultaneously. Everything else is a pale imitation. My Minecraft world is 9 years old and larger than some European countries.",
        scoreFor: (id) => {
            if (id === MINECRAFT) return 10;
            if (SANDBOX_GAMES.includes(id)) return rand(6, 8);
            if (BAD_GAMES.includes(id)) return rand(1, 3);
            return rand(1, 4);
        },
        reviewGames: [
            ...new Set([
                MINECRAFT,
                ...SANDBOX_GAMES,
                ...INDIE_GAMES.slice(0, 6),
                ...AAA_GAMES.slice(0, 4),
                ...BAD_GAMES.slice(0, 4),
                ELDEN_RING,
                WITCHER_3,
            ]),
        ],
        likesBias: "dislikes_most",
        commentActivity: "heavy",
    },

    // ── 10. The Balanced Critic ──
    {
        accountName: "balanced_critic",
        displayName: "Balanced Critic",
        email: "critic@seed.dev",
        password: "Seed1234!",
        bio: "Every game deserves a fair assessment. No fanboyism, no rage-quitting, no knee-jerk reactions. I write 2,000-word reviews for games I give a 7/10. I've been called 'boring' and I take it as a compliment.",
        scoreFor: (id) => {
            if (
                [
                    BALDURS_GATE_3,
                    HOLLOW_KNIGHT,
                    DISCO_ELYSIUM,
                    OUTER_WILDS,
                    ELDEN_RING,
                    WITCHER_3,
                    PERSONA_5_ROYAL,
                    CELESTE,
                    OBRA_DINN,
                    HADES,
                ].includes(id)
            )
                return rand(9, 10);
            if (BAD_GAMES.includes(id)) return rand(2, 5);
            if ([MINECRAFT, DARK_SOULS, PORTAL_2].includes(id)) return rand(8, 10);
            return rand(6, 8);
        },
        reviewGames: [...new Set([...ALL_GAME_IDS])],
        likesBias: "likes_most",
        commentActivity: "moderate",
    },

    // ── 11. The Horror Enthusiast ──
    {
        accountName: "horror_enjoyer",
        displayName: "Horror Enjoyer",
        email: "horror@seed.dev",
        password: "Seed1234!",
        bio: "I eat jump scares for breakfast. Survival horror is the purest form of game design. I've completed all Resident Evil games on the hardest difficulty, in order, every October since 2015. The Medium made me cry.",
        scoreFor: (id) => {
            if (HORROR_GAMES.includes(id)) return rand(8, 10);
            if (SOULS_GAMES.includes(id)) return rand(6, 9);
            if (NARRATIVE_GAMES.includes(id)) return rand(5, 8);
            if (BAD_GAMES.includes(id)) return rand(1, 3);
            return rand(3, 6);
        },
        reviewGames: [
            ...new Set([
                ...HORROR_GAMES,
                ...SOULS_GAMES.slice(0, 4),
                SIGNALIS,
                CROW_COUNTRY,
                DISCO_ELYSIUM,
                OUTER_WILDS,
                DYING_LIGHT,
                ALIEN_ISOLATION,
                RE_4,
                RE_7,
                RE_VILLAGE,
                SILENT_HILL_2,
                ...NARRATIVE_GAMES.slice(0, 5),
            ]),
        ],
        likesBias: "balanced",
        commentActivity: "moderate",
    },

    // ── 12. The Grand Strategist ──
    {
        accountName: "strategy_nerd",
        displayName: "Strategy Nerd",
        email: "strategy@seed.dev",
        password: "Seed1234!",
        bio: "I once spent 14 hours optimizing a supply chain in Factorio and called it a productive day. Crusader Kings 3 is my therapy. I have opinions about trade routes in Europa Universalis 4 that would bore you to tears.",
        scoreFor: (id) => {
            if (STRATEGY_GAMES.includes(id)) return rand(8, 10);
            if (SANDBOX_GAMES.includes(id)) return rand(7, 9);
            if (RPG_GAMES.includes(id)) return rand(6, 8);
            if (INDIE_GAMES.includes(id) && [INTO_THE_BREACH, FTL, SLAY_THE_SPIRE].includes(id)) return rand(8, 10);
            if (FPS_GAMES.includes(id)) return rand(2, 5);
            return rand(4, 7);
        },
        reviewGames: [
            ...new Set([
                ...STRATEGY_GAMES,
                ...SANDBOX_GAMES,
                INTO_THE_BREACH,
                FTL,
                SLAY_THE_SPIRE,
                MONSTER_TRAIN,
                INSCRYPTION,
                BALDURS_GATE_3,
                DIVINITY_OS2,
                PATHFINDER_WR,
                TYRANNY,
                PILLARS_2,
                RIMWORLD,
                FACTORIO,
                SATISFACTORY,
                VALHEIM,
            ]),
        ],
        likesBias: "balanced",
        commentActivity: "moderate",
    },

    // ── 13. The Narrative Seeker ──
    {
        accountName: "narrative_lover",
        displayName: "Narrative Lover",
        email: "narrative@seed.dev",
        password: "Seed1234!",
        bio: "I play games for the stories. If I wanted to press buttons mindlessly I'd do my job. Disco Elysium is the greatest piece of art humanity has produced. Don't @ me.",
        scoreFor: (id) => {
            if (NARRATIVE_GAMES.includes(id)) return rand(8, 10);
            if ([DISCO_ELYSIUM, OUTER_WILDS, PENTIMENT, NORCO, CITIZEN_SLEEPER, FORGOTTEN_CITY].includes(id))
                return rand(9, 10);
            if (RPG_GAMES.includes(id)) return rand(6, 9);
            if (FPS_GAMES.includes(id)) return rand(2, 5);
            if (BAD_GAMES.includes(id)) return rand(1, 3);
            return rand(4, 7);
        },
        reviewGames: [
            ...new Set([
                ...NARRATIVE_GAMES,
                DISCO_ELYSIUM,
                OUTER_WILDS,
                PENTIMENT,
                NORCO,
                CITIZEN_SLEEPER,
                FORGOTTEN_CITY,
                OXENFREE,
                OXENFREE_2,
                GONE_HOME,
                FIREWATCH,
                UNDERTALE,
                DELTARUNE,
                OMORI,
                LIFE_IS_STRANGE,
                LIFE_IS_STRANGE_2,
                WALKING_DEAD,
                ONESHOT,
                DETROIT_BH,
                HEAVY_RAIN,
                WHAT_REMAINS_EF,
                STANLEY_PARABLE_UD,
                BALDURS_GATE_3,
                WITCHER_3,
                NIER_AUTOMATA,
                PERSONA_5_ROYAL,
            ]),
        ],
        likesBias: "likes_most",
        commentActivity: "heavy",
    },

    // ── 14. The Lurker (no reviews, just follows and likes) ──
    {
        accountName: "silent_watcher",
        displayName: "Silent Watcher",
        email: "lurker@seed.dev",
        password: "Seed1234!",
        bio: "",
        scoreFor: () => rand(5, 9),
        reviewGames: [], // Edge case: user with NO reviews
        likesBias: "likes_most",
        commentActivity: "silent",
    },

    // ── 15. The New User (very few reviews, no followers yet) ──
    {
        accountName: "newbie_gamer",
        displayName: "Newbie Gamer",
        email: "newbie@seed.dev",
        password: "Seed1234!",
        bio: "Just getting into gaming. My first 'real' game was Elden Ring and I somehow loved it.",
        scoreFor: (id) => {
            if (id === ELDEN_RING) return 10;
            return rand(6, 9);
        },
        reviewGames: [ELDEN_RING, HOLLOW_KNIGHT, HADES, STARDEW_VALLEY], // Edge case: very few reviews
        likesBias: "likes_most",
        commentActivity: "rare",
    },

    // ── 16. The Contrarian ──
    {
        accountName: "contrarian_king",
        displayName: "Contrarian King",
        email: "contrarian@seed.dev",
        password: "Seed1234!",
        bio: "I like what you hate and hate what you like. Fallout 76 is a masterpiece. Disco Elysium is pretentious. Elden Ring is overrated. Skull and Bones has good bones (pun intended). Come fight me.",
        scoreFor: (id) => {
            if (BAD_GAMES.includes(id)) return rand(7, 10); // loves bad games
            if ([ELDEN_RING, DISCO_ELYSIUM, OUTER_WILDS, PERSONA_5_ROYAL].includes(id)) return rand(1, 4); // hates beloved games
            if (CLASSIC_GAMES.includes(id)) return rand(3, 6);
            return rand(4, 8);
        },
        reviewGames: [
            ...new Set([
                ...BAD_GAMES,
                ELDEN_RING,
                DISCO_ELYSIUM,
                OUTER_WILDS,
                PERSONA_5_ROYAL,
                HOLLOW_KNIGHT,
                UNDERTALE,
                WITCHER_3,
                BALDURS_GATE_3,
                STARDEW_VALLEY,
                CELESTE,
                HADES,
                DEAD_CELLS,
                VALHEIM,
                PROJECT_ZOMBOID,
            ]),
        ],
        likesBias: "dislikes_most",
        commentActivity: "heavy",
    },

    // ── 17. The Chill Sandbox Player ──
    {
        accountName: "sandbox_chill",
        displayName: "Sandbox Chill",
        email: "sandbox@seed.dev",
        password: "Seed1234!",
        bio: "I don't play games to win. I play to build, explore, and get lost for hundreds of hours. Valheim, Project Zomboid, Factorio — if I can set my own goals, I'm in.",
        scoreFor: (id) => {
            if (SANDBOX_GAMES.includes(id)) return rand(8, 10);
            if ([STARDEW_VALLEY, DAVE_DIVER, SPIRITFARER].includes(id)) return rand(8, 10);
            if (STRATEGY_GAMES.includes(id)) return rand(6, 9);
            if (BAD_GAMES.includes(id)) return rand(2, 5);
            return rand(4, 7);
        },
        reviewGames: [
            ...new Set([
                ...SANDBOX_GAMES,
                STARDEW_VALLEY,
                DAVE_DIVER,
                SPIRITFARER,
                UNPACKING,
                A_SHORT_HIKE,
                VAMPIRE_SURVIVORS,
                DREDGE,
                ...STRATEGY_GAMES.slice(0, 5),
                MINECRAFT,
                TERRARIA,
                RIMWORLD,
                FACTORIO,
                VALHEIM,
                PROJECT_ZOMBOID,
                GROUNDED,
                SUBNAUTICA,
                PALWORLD,
            ]),
        ],
        likesBias: "likes_most",
        commentActivity: "moderate",
    },

    // ── 18. The Fighting Game Player ──
    {
        accountName: "fighting_main",
        displayName: "Fighting Main",
        email: "fighting@seed.dev",
        password: "Seed1234!",
        bio: "Frame data is poetry. I've been playing fighting games competitively since SF4. My execution isn't perfect but my reads are inhuman. Currently grinding Tekken 8 while my eyes deteriorate.",
        scoreFor: (id) => {
            if (FIGHTING_GAMES.includes(id)) return rand(8, 10);
            if ([HOLLOW_KNIGHT, DARK_SOULS, SEKIRO, ELDEN_RING].includes(id)) return rand(7, 9); // appreciates precision
            if (BAD_GAMES.includes(id)) return rand(1, 3);
            return rand(4, 7);
        },
        reviewGames: [
            ...new Set([
                ...FIGHTING_GAMES,
                DARK_SOULS,
                SEKIRO,
                ELDEN_RING,
                HOLLOW_KNIGHT,
                DEAD_CELLS,
                CUPHEAD,
                DOOM_ETERNAL,
                TITANFALL_2,
                HADES,
                LIES_OF_P,
            ]),
        ],
        likesBias: "balanced",
        commentActivity: "rare",
    },
];

// ─── Review Texts ─────────────────────────────────────────────────────────────

const REVIEW_SHORT_HIGH = [
    "Masterpiece. That's it.",
    "Perfect. Buy it.",
    "10/10. Changed how I see games forever.",
    "Game of the decade, no contest.",
    "Chef's kiss. No notes.",
];

const REVIEW_MEDIUM_HIGH = [
    "An absolute masterpiece. Every mechanic feels deliberate and polished. This is what gaming is supposed to be.",
    "I genuinely cannot think of a single flaw. This game ruined all other games for me — in the best way possible.",
    "One of the best experiences I've had in years. The attention to detail is staggering, from the music to the world design.",
    "Flawless execution from start to finish. A must-play for anyone who calls themselves a gamer.",
    "This game hits different. The world-building, the gameplay loop, the OST — it all comes together perfectly.",
    "I went in with low expectations and came out a changed person. This is a 10/10 and I'll die on this hill.",
    "Everything just *works*. The combat, the story, the pacing. I clocked 80 hours and want more.",
    "This is the kind of game that reminds you why you fell in love with the medium in the first place.",
];

const REVIEW_LONG_HIGH = [
    "I've been gaming for over 20 years and I can count on one hand the games that have genuinely moved me. This is one of them. From the opening moments to the credits, there's an unmistakable intentionality to every decision. The world feels lived-in, the characters feel real, and the mechanics serve the narrative in ways that lesser games could never pull off. I started it on a Friday evening, fully intending to play for an hour before bed. I looked up from my controller at 5am, and I don't regret a single second of it. If you haven't played this, you're not just missing a good game — you're missing something genuinely important.",

    "Let me preface this by saying I almost gave up in the first two hours. The opening is deliberately obtuse, the controls felt unfamiliar, and nothing made sense. I'm so glad I pushed through. What unfolds over the next 60 hours is one of the most carefully constructed experiences in gaming. Every system feeds into every other system. Every piece of lore rewards your attention. The difficulty is exactly where it needs to be — punishing enough to demand respect, generous enough to let you keep trying. I've since recommended this to seven people. Six of them are now 40+ hours in. The seventh bounced off it in the first hour, and honestly I respect that too. This game knows exactly what it is and makes no apologies for it.",

    "There are games you play, and then there are games that play you. This falls firmly into the latter category. It manipulates your expectations, subverts your assumptions, and consistently delivers moments you couldn't have predicted. The writing is extraordinary — not just good for a game, but genuinely excellent by any artistic standard. Characters feel like people, dialogue feels like conversation, and the world feels like a place that exists beyond the edges of your screen. I completed everything. All the side quests, all the collectibles, all the hidden paths. Not because a checklist told me to, but because I wasn't ready for the adventure to be over. Rare is the game that earns that kind of devotion. This earned it a hundred times over.",
];

const REVIEW_SHORT_MID = [
    "It's fine. Nothing special.",
    "Solid 7/10. Enjoyed it but won't replay.",
    "Good game with some annoying bits.",
    "Fun enough. Wouldn't pay full price.",
    "Decent. Passes the time.",
];

const REVIEW_MEDIUM_MID = [
    "Decent game. Has its moments but also has some frustrating sections. Worth a playthrough on sale.",
    "Solid but unspectacular. I enjoyed my time with it but probably won't replay it.",
    "It's fine. Not revolutionary, but competent and fun in short bursts.",
    "Some good ideas buried under mediocre execution. Still fun enough to recommend.",
    "Middle of the road. Does nothing particularly wrong, but nothing particularly right either.",
    "Enjoyable for what it is. Managed my expectations and had a reasonable time.",
];

const REVIEW_LONG_MID = [
    "This is the kind of game that I can imagine different people having wildly different experiences with. For me, it landed solidly in the 'good but not great' territory. The core gameplay loop is satisfying when it clicks, but the pacing is inconsistent — the first act drags, the second act is excellent, and the third act feels rushed. The world design is beautiful in places and generic in others. The characters are memorable but some of the writing feels like it went through too many rounds of corporate notes. I finished it and felt good about my time spent, but I'm also not thinking about it anymore. That's the most damning thing I can say about a game: it left no trace.",

    "I went in expecting a lot based on the reviews and came out feeling like we played different games. Don't get me wrong, it's competent — sometimes even impressive. The combat has good bones, the art style is distinctive, and a few story moments genuinely landed. But the sum of the parts doesn't equal the whole people online claim. There's a lot of padding. There are too many systems that don't talk to each other. The difficulty spikes feel random rather than designed. Maybe I'm just not the target audience. Or maybe the gaming press is too easy on anything that has a clean aesthetic and a few moments of genuine feeling. Either way, solid 6-7 out of 10 from me.",
];

const REVIEW_SHORT_LOW = [
    "Waste of money. 2/10.",
    "Skip it. Life is short.",
    "I want my time back.",
    "Genuinely confused how this exists.",
    "Don't @ me, this is terrible.",
];

const REVIEW_MEDIUM_LOW = [
    "I genuinely don't understand the hype. This felt like a slog from beginning to end.",
    "Completely overrated. The internet lied to me about this one.",
    "Boring mechanics, forgettable story. I refunded after 3 hours and don't regret it.",
    "How is this considered a classic? It aged terribly and the fanbase won't admit it.",
    "This game actively made me angry. Not because it's hard, because it's poorly designed.",
    "A disappointment of historic proportions. The trailers were better than the product.",
];

const REVIEW_LONG_LOW = [
    "I want to be fair. I want to be the bigger person. I played 12 hours. I read the guide. I watched the 'it gets good at 20 hours' videos. It did not get good at 20 hours. What got good at 20 hours was my ability to recognize that life is finite and I was spending it on something that bored me to tears. The combat is a series of rock-paper-scissors decisions dressed up in flashy animations. The writing oscillates between 'generic fantasy' and 'philosophy student who read one book.' The world is enormous and empty in the way that seems designed to impress screenshots rather than reward exploration. I don't hate the developers. I'm sure they worked hard. I just hate this game.",

    "Every single positive review I read for this game feels like it was written by someone who needed to justify their purchase. The gameplay is repetitive within the first hour and never evolves. The difficulty feels arbitrary rather than designed. The story, which everyone keeps calling 'deep,' is actually just vague — and vague is not the same as deep. I finished it because I'm the kind of idiot who has to finish things. My final feeling wasn't satisfaction or even catharsis. It was relief. Relief that it was over. Relief that I could now go play something that actually respected my time. I give it 2 out of 10. One point for the art design, which is genuinely nice. One point for the fact that it runs well on PC, which at least shows some technical competence.",
];

const REVIEW_SOULSBORNE = [
    "The difficulty curve is perfection. You are supposed to suffer. Every death taught me something. GIT GUD.\n\nI've beaten this boss 87 times across different playthroughs and every single time I find a new pattern, a new opening, a new way the game rewards patience. This is what games were before we decided everyone needed to win. Challenge is the point. Struggle is the teacher. Pain is the lesson and completion is the graduation.",

    "FromSoftware continues to set the gold standard for game design. Not just combat — world design, lore delivery, environmental storytelling, sound design, art direction. Everything is tuned to the same frequency: respect the player's intelligence. Show don't tell. Reward curiosity. Make every discovery feel earned. I've put 400 hours into this and I will put 400 more.",

    "Every boss fight is a puzzle. Once you understand the rhythm it clicks and nothing on earth compares to that feeling. The moment a boss that killed you 50 times becomes a boss you kill without taking a hit — that's gaming. That's it. That's the whole thing. Everything else is just decoration.",
];

const REVIEW_INDIE_CHAMPION = [
    "This indie gem proves that a small team with a vision can outshine any AAA studio. Every pixel is intentional. Every sound is chosen. There's no bloat, no filler, no content designed to pad the playtime before the credits roll. Just a complete, honest, beautiful game made by people who cared deeply about what they were making. Support indie devs. Buy this game. Tell your friends.",

    "The fact that a tiny team made this is genuinely mind-blowing. This game does things that major studios with hundred-million-dollar budgets fumble constantly: it's fun, it respects your time, it has something to say and it says it clearly. The moment I found out how small the dev team was, I cried a little. Seriously. Buy it immediately, tell everyone you know, and write nice things about it on the internet.",

    "Heart, soul, and what I can only assume was several developers' sanity — all poured into every pixel. This is why indie games matter. Not because they're cheap or quirky or nostalgic. But because sometimes one or two people with a clear vision can create something that a committee of fifty could never produce. This is one of those times.",
];

const REVIEW_HORROR = [
    "I played this at 2am with headphones in and I will never be the same. The atmosphere is suffocating in the best way possible. The sound design alone should be illegal. I have a high horror tolerance — I've played every Resident Evil, every Silent Hill, every outlast — and this still got me. Multiple times. Chef's kiss for the pacing, the environmental storytelling, and the moment about two thirds through that I won't spoil but that made me put the controller down and stare at a wall for ten minutes.",

    "Horror games live or die by their atmosphere, and this one has atmosphere to spare. It's not about jump scares (though there are a few effective ones). It's about dread. The slow creep of wrong that builds from the first minute to the last. The feeling that you're being watched even when nothing is there. The way the sound design makes your apartment feel slightly dangerous after you turn it off. This is what survival horror should be in 2024.",
];

const REVIEW_STRATEGY = [
    "I've lost 200 hours to this and I genuinely cannot tell you what happened. Time operates differently when you're managing trade routes and watching your carefully constructed civilization collapse because I made one bad diplomatic decision in 1643. This is the game equivalent of 'one more turn' syndrome except every turn is 45 minutes. My wife thinks I'm having an affair. I'm not. I'm conquering Burgundy.",

    "The depth here is genuinely dizzying. Every system connects to every other system. Every decision has consequences three layers down. The learning curve is a cliff face, but once you're over it, you're in one of gaming's richest experiences. I've built empires and watched them crumble. I've made allies and betrayed them. I've started wars I immediately regretted and ended wars I never should have. Every session is a story. Every campaign is a history.",
];

const REVIEW_NARRATIVE = [
    "I don't cry at movies. I don't cry at books. I'm emotionally arid by nature. This game made me sob twice. Not sad-sniffling. Actual ugly crying. Whatever this team understood about grief, memory, connection, and what it means to tell a story — they understood it completely. I finished it in one sitting, sat in silence for fifteen minutes, then immediately started recommending it to everyone I know.",

    "Games as art is a phrase that gets thrown around cheaply. This game actually earns it. Every narrative choice feels considered. Every character feels real. The world building is delivered through implication rather than exposition, which means you're doing half the work of constructing meaning — and that half you do yourself is the half that stays with you. Three years from now you'll still think about it. Not about what happened, but about how it made you feel.",
];

const REVIEW_CONTRARIAN = [
    "Hot take: this is mid. I know, I know. Put away the pitchforks. I played the whole thing. I engaged with it seriously. I just don't think it does what you think it does. The mechanics, once stripped of the aesthetic, are actually fairly shallow. The story, once you remove the 'it's deep because it's confusing' defense, is fairly surface-level. I'm not dunking on people who love it. Taste is subjective. I'm just saying we should be honest with ourselves.",

    "Everyone online is wrong about this game and I'm tired of pretending otherwise. Is it competent? Yes. Is it ambitious? Sure. Is it the generational masterpiece the gaming press declared it to be the week it launched? Absolutely not. The review cycle has a problem where the first wave of coverage, driven by embargo pressure and hype, sets a ceiling that the actual game often fails to reach. This is one of those cases. Good game. Great reception. The gap between those two things is large enough to drive a truck through.",
];

function getReviewText(persona: Persona, gameID: number, score: number): string {
    const roll = Math.random();

    // Persona-specific overrides
    if (persona.accountName === "soulsborn3r" && SOULS_GAMES.includes(gameID) && score >= 9) {
        return pick(REVIEW_SOULSBORNE);
    }
    if (persona.accountName === "indie_lover" && INDIE_GAMES.includes(gameID) && score >= 9) {
        return pick(REVIEW_INDIE_CHAMPION);
    }
    if (persona.accountName === "horror_enjoyer" && HORROR_GAMES.includes(gameID) && score >= 8) {
        return pick(REVIEW_HORROR);
    }
    if (persona.accountName === "strategy_nerd" && STRATEGY_GAMES.includes(gameID) && score >= 8) {
        return pick(REVIEW_STRATEGY);
    }
    if (
        persona.accountName === "narrative_lover" &&
        (NARRATIVE_GAMES.includes(gameID) || [DISCO_ELYSIUM, OUTER_WILDS, UNDERTALE].includes(gameID)) &&
        score >= 8
    ) {
        return pick(REVIEW_NARRATIVE);
    }
    if (persona.accountName === "contrarian_king") {
        return pick(REVIEW_CONTRARIAN);
    }
    if (persona.accountName === "completionist") {
        const hoursLine = `Logged ${rand(80, 300)} hours, completed every sidequest, found every collectible. Platinum/100%achieved. `;
        const base =
            score >= 8 ? pick(REVIEW_MEDIUM_HIGH) : score >= 5 ? pick(REVIEW_MEDIUM_MID) : pick(REVIEW_MEDIUM_LOW);
        return hoursLine + base;
    }
    if (persona.accountName === "hater_guy") {
        if (roll < 0.5) return pick(REVIEW_SHORT_LOW);
        return pick(REVIEW_MEDIUM_LOW);
    }
    if (persona.accountName === "toxic_fan") {
        if (gameID === MINECRAFT)
            return "Nothing compares. Minecraft is the foundation of all gaming. Picasso of video games. The Sistine Chapel of interactive media. Steve is more culturally significant than half of human history. 10/10 no notes.";
        if (SANDBOX_GAMES.includes(gameID))
            return `It's okay. Not Minecraft, but okay. I'll give it a ${score}/10 because at least it lets you build things and not everything is about shooting people. Would be better with Steve as a playable character.`;
        return `Compared to Minecraft this is completely irrelevant. My Minecraft world has more hours invested in it than this entire franchise has had players. ${score}/10.`;
    }
    if (persona.accountName === "balanced_critic") {
        return roll < 0.4 ? pick(REVIEW_LONG_HIGH) : roll < 0.7 ? pick(REVIEW_LONG_MID) : pick(REVIEW_MEDIUM_HIGH);
    }
    if (persona.accountName === "retro_enjoyer" && CLASSIC_GAMES.includes(gameID) && score >= 8) {
        return `This is what games were before the industry decided everything needed crafting mechanics, open worlds, and a battle pass. ${pick(REVIEW_MEDIUM_HIGH)}`;
    }

    // Default path: mix of short/medium/long based on score
    if (score >= 8) {
        if (roll < 0.2) return pick(REVIEW_SHORT_HIGH);
        if (roll < 0.6) return pick(REVIEW_MEDIUM_HIGH);
        return pick(REVIEW_LONG_HIGH);
    }
    if (score >= 5) {
        if (roll < 0.3) return pick(REVIEW_SHORT_MID);
        return pick(REVIEW_MEDIUM_MID);
    }
    if (roll < 0.25) return pick(REVIEW_SHORT_LOW);
    if (roll < 0.6) return pick(REVIEW_MEDIUM_LOW);
    return pick(REVIEW_LONG_LOW);
}

// ─── Comment Texts ────────────────────────────────────────────────────────────

const COMMENTS_AGREE = [
    "Totally agree with this take.",
    "Finally someone said it. 100% this.",
    "This review is exactly what I've been thinking.",
    "Couldn't have said it better myself.",
    "Based review. Respect.",
    "This is the most accurate thing I've read all day.",
    "You just articulated everything I felt but couldn't put into words.",
    "Saving this review. Sharing it with everyone who asks me about this game.",
];

const COMMENTS_DISAGREE = [
    "Completely wrong, respectfully. Have you even played the full game?",
    "This review is why I don't trust the internet.",
    "How can anyone enjoy this? Genuinely baffled.",
    "I liked it way less than this. Overrating it imo.",
    "Disagree entirely. The combat alone breaks the experience.",
    "We played different games apparently.",
    "The game you described sounds great. The game I played was not that game.",
];

const COMMENTS_NEUTRAL = [
    "Interesting perspective. I had a different experience but I see your point.",
    "Fair review. I'd add that the OST is criminally underrated.",
    "How many hours did you put in? I think it gets better after the first few hours.",
    "Did you play on PC or console? The experience differs significantly.",
    "Good write-up. Missed mentioning the multiplayer though.",
    "Have you tried the DLC? It addresses some of the issues you mentioned.",
    "Curious if you played the earlier games in the series first?",
];

const COMMENTS_SOULSBORNE = [
    "Git gud. The difficulty is the point.",
    "If you found it frustrating you haven't beaten the first boss enough times.",
    "This game rewards patience. Your rating reflects your skill issue.",
    "FromSoftware is beyond criticism. Accept it.",
    "Every death is a lesson. What did you learn from yours?",
    "Just roll through it. Problem solved.",
];

const COMMENTS_MINECRAFT_OBSESSED = [
    "But have you tried Minecraft? Just saying.",
    "Minecraft did this better and for free.",
    "Imagine playing this instead of Minecraft.",
    "The only open world that matters is Minecraft's.",
    "Cool review. Would be cooler if it was about Minecraft.",
];

const COMMENTS_HATER = [
    "Still overrated.",
    "The discourse around this game is embarrassing.",
    "Low score justified. The hype was manufactured.",
    "I gave it a 2 and I'm sticking to it.",
    "Gamers when mid game gets called mid:",
    "This sub loves to hype mediocre things.",
];

const COMMENTS_LONG = [
    "I've been thinking about what you wrote here and I think there's something worth unpacking. The issue with evaluating this game is that it's doing something most people aren't equipped to evaluate — it's making a statement about the medium itself, and you have to be literate in that medium to understand the statement. The 'flaws' you describe are intentional design choices. The pacing issues are structural commentary. I'm not saying you're wrong to dislike it, but I think you're interpreting a deliberate artistic decision as an oversight, and that's a meaningful difference.",

    "Full disclosure: I've played this game four times. Each time I find something new. Your review captures the first-playthrough experience almost perfectly — the confusion, the moments of brilliance interrupted by frustrating opaque design, the sense that the game is slightly beyond reach. What I'd say is that the game isn't behind glass. It's a puzzle you solve by accepting that you won't understand everything the first time. By the third playthrough, things snap into focus. Characters you thought were one-note reveal depths. Moments you skipped over become pivotal. I know that sounds like copium from a fan. I genuinely believe it's just true.",

    "Your review is fair and well-written, but I think there are two games here and you played one of them. There's the surface game — the mechanics, the combat, the explicit story — and there's the game underneath it, the one that's commenting on games, storytelling, and what it means to be a player. If you engage with only the first one, it's a 6-7. If you find the second one, it's a 10. I don't think either experience is 'wrong.' I just think the designers intended both to coexist, and different people find different doors.",

    "I respect the review even though I disagree. What strikes me is how different our readings are of the same events. The moment you describe as 'confusing and poorly explained' is the moment I describe as 'the most elegant piece of environmental storytelling I've ever seen in a game.' I think that gap is partly taste, partly experience with the genre, and partly just the inherent subjectivity of art. Games criticism is still young enough that we don't have shared vocabulary for some of these things. Maybe that's okay.",
];

function getCommentText(commenter: Persona, reviewerPersona: Persona | undefined, score: number): string {
    const roll = Math.random();

    if (commenter.accountName === "soulsborn3r") {
        return pick([...COMMENTS_SOULSBORNE, ...COMMENTS_AGREE, ...COMMENTS_NEUTRAL]);
    }
    if (commenter.accountName === "toxic_fan") {
        return pick(COMMENTS_MINECRAFT_OBSESSED);
    }
    if (commenter.accountName === "hater_guy") {
        return pick([...COMMENTS_HATER, ...COMMENTS_DISAGREE]);
    }
    if (commenter.accountName === "balanced_critic" || commenter.accountName === "narrative_lover") {
        if (roll < 0.25) return pick(COMMENTS_LONG);
    }
    if (commenter.accountName === "contrarian_king") {
        if (score >= 8) return pick(COMMENTS_DISAGREE);
        if (score <= 4) return pick(COMMENTS_AGREE); // agrees with negative reviews
        return pick(COMMENTS_NEUTRAL);
    }
    if (commenter.accountName === "strategy_nerd") {
        if (roll < 0.15) return pick(COMMENTS_LONG);
    }
    if (commenter.accountName === "rpg_master") {
        if (roll < 0.2) return pick(COMMENTS_LONG);
    }
    if (score >= 8 && commenter.likesBias === "likes_most") return pick(COMMENTS_AGREE);
    if (score <= 4 && commenter.likesBias === "dislikes_most") return pick(COMMENTS_AGREE);
    if (score <= 4 && commenter.likesBias === "likes_most") return pick(COMMENTS_DISAGREE);

    if (roll < 0.15) return pick(COMMENTS_LONG);
    return pick(COMMENTS_NEUTRAL);
}

// ─── Follow Graph ─────────────────────────────────────────────────────────────

const FOLLOW_PAIRS: [string, string][] = [
    // balanced_critic is the hub — almost everyone follows them
    ["soulsborn3r", "balanced_critic"],
    ["casualgamer99", "balanced_critic"],
    ["indie_lover", "balanced_critic"],
    ["completionist", "balanced_critic"],
    ["fps_addict", "balanced_critic"],
    ["rpg_master", "balanced_critic"],
    ["retro_enjoyer", "balanced_critic"],
    ["horror_enjoyer", "balanced_critic"],
    ["strategy_nerd", "balanced_critic"],
    ["narrative_lover", "balanced_critic"],
    ["contrarian_king", "balanced_critic"],
    ["sandbox_chill", "balanced_critic"],
    ["newbie_gamer", "balanced_critic"],

    // Mutual follows between similar-minded users
    ["soulsborn3r", "indie_lover"],
    ["indie_lover", "soulsborn3r"],
    ["soulsborn3r", "horror_enjoyer"],
    ["horror_enjoyer", "soulsborn3r"],
    ["rpg_master", "completionist"],
    ["completionist", "rpg_master"],
    ["rpg_master", "narrative_lover"],
    ["narrative_lover", "rpg_master"],
    ["strategy_nerd", "completionist"],
    ["completionist", "strategy_nerd"],
    ["sandbox_chill", "strategy_nerd"],
    ["fighting_main", "soulsborn3r"],
    ["fighting_main", "fps_addict"],
    ["fps_addict", "fighting_main"],

    // Casual gamer follows everyone
    ["casualgamer99", "soulsborn3r"],
    ["casualgamer99", "indie_lover"],
    ["casualgamer99", "fps_addict"],
    ["casualgamer99", "rpg_master"],
    ["casualgamer99", "completionist"],
    ["casualgamer99", "retro_enjoyer"],
    ["casualgamer99", "horror_enjoyer"],
    ["casualgamer99", "strategy_nerd"],
    ["casualgamer99", "narrative_lover"],
    ["casualgamer99", "sandbox_chill"],
    ["casualgamer99", "fighting_main"],
    ["casualgamer99", "toxic_fan"],
    ["casualgamer99", "contrarian_king"],

    // Hater follows everyone to argue with them
    ["hater_guy", "soulsborn3r"],
    ["hater_guy", "casualgamer99"],
    ["hater_guy", "balanced_critic"],
    ["hater_guy", "indie_lover"],
    ["hater_guy", "toxic_fan"],
    ["hater_guy", "horror_enjoyer"],
    ["hater_guy", "narrative_lover"],
    ["hater_guy", "contrarian_king"],

    // Toxic fan has limited social awareness
    ["toxic_fan", "hater_guy"],
    ["toxic_fan", "casualgamer99"],
    ["toxic_fan", "sandbox_chill"],

    // Retro enjoyer respects classics people
    ["retro_enjoyer", "completionist"],
    ["retro_enjoyer", "rpg_master"],
    ["retro_enjoyer", "fps_addict"],

    // Completionist follows everyone who might have found secrets
    ["completionist", "indie_lover"],
    ["completionist", "horror_enjoyer"],
    ["completionist", "narrative_lover"],

    // Newbie follows a few people
    ["newbie_gamer", "soulsborn3r"],
    ["newbie_gamer", "casualgamer99"],
    ["newbie_gamer", "indie_lover"],

    // Silent watcher follows many but posts nothing
    ["silent_watcher", "balanced_critic"],
    ["silent_watcher", "soulsborn3r"],
    ["silent_watcher", "casualgamer99"],
    ["silent_watcher", "indie_lover"],
    ["silent_watcher", "rpg_master"],
    ["silent_watcher", "narrative_lover"],
    ["silent_watcher", "horror_enjoyer"],
    ["silent_watcher", "completionist"],

    // Contrarian follows people to argue
    ["contrarian_king", "soulsborn3r"],
    ["contrarian_king", "narrative_lover"],
    ["contrarian_king", "indie_lover"],
    ["contrarian_king", "horror_enjoyer"],

    // Narrative lover
    ["narrative_lover", "indie_lover"],
    ["narrative_lover", "horror_enjoyer"],

    // Horror enjoyer
    ["horror_enjoyer", "indie_lover"],
    ["horror_enjoyer", "rpg_master"],

    // Fighting main is isolated
    ["fighting_main", "balanced_critic"],
];

// ─── Session Management ───────────────────────────────────────────────────────

type UserSession = {
    persona: Persona;
    token: string;
};

async function registerAndLogin(persona: Persona): Promise<string | null> {
    console.log(`  -> Registering ${persona.accountName}...`);

    const regRes = await api("POST", "/users", {
        accountName: persona.accountName,
        displayName: persona.displayName,
        password: persona.password,
        email: persona.email,
    });

    if (regRes.ok) {
        const token: string | undefined = regRes.data?.data?.token;
        if (token) {
            console.log(`     registered and authenticated (dev mode).`);
            return token;
        }
    } else if (regRes.status === 409) {
        console.log(`     ${persona.accountName} already exists, logging in...`);
    } else {
        console.error(`     registration failed (${regRes.status}):`, JSON.stringify(regRes.data));
    }

    const loginRes = await api("POST", "/users/login", {
        accountName: persona.accountName,
        password: persona.password,
    });

    if (!loginRes.ok) {
        console.error(`     login failed (${loginRes.status}):`, JSON.stringify(loginRes.data));
        return null;
    }

    const token: string | undefined = loginRes.data?.data?.token;
    if (!token) {
        console.error(`     token not found in login response.`);
        return null;
    }

    console.log(`     login ok.`);
    return token;
}

// ─── Upload Avatars ───────────────────────────────────────────────────────────

async function uploadAvatars(sessions: Map<string, UserSession>): Promise<void> {
    console.log(`\nuploading avatars from ${AVATARS_DIR}...`);
    const extensions = [".png", ".jpg", ".jpeg", ".webp"];

    for (const [accountName, session] of sessions) {
        let filePath: string | null = null;
        for (const ext of extensions) {
            const candidate = path.join(AVATARS_DIR, `${accountName}${ext}`);
            if (fs.existsSync(candidate)) {
                filePath = candidate;
                break;
            }
        }
        if (!filePath) {
            console.log(`  no avatar for ${accountName}, skipping.`);
            continue;
        }
        const res = await apiMultipart("/users/me/avatar", filePath, session.token);
        if (res.ok) {
            console.log(`  avatar uploaded for ${accountName}`);
        } else {
            console.error(`  avatar upload failed for ${accountName} (${res.status}):`, JSON.stringify(res.data));
        }
        await sleep(100);
    }
}

// ─── Update Bios ──────────────────────────────────────────────────────────────

async function updateBios(sessions: Map<string, UserSession>): Promise<void> {
    console.log("\nupdating bios...");
    for (const [accountName, session] of sessions) {
        const persona = session.persona;
        if (!persona.bio) continue;

        const meRes = await api("GET", "/users/me", undefined, session.token);
        if (!meRes.ok) continue;
        const me = meRes.data?.data;

        const updateRes = await api(
            "PUT",
            "/users/me",
            {
                isPrivate: false,
                email: persona.email,
                userData: {
                    displayName: persona.displayName,
                    gender: null,
                    bio: persona.bio,
                },
            },
            session.token
        );

        if (updateRes.ok) {
            console.log(`  bio updated for ${accountName}`);
        } else {
            console.error(`  bio update failed for ${accountName} (${updateRes.status})`);
        }
        await sleep(80);
    }
}

// ─── Follows ──────────────────────────────────────────────────────────────────

async function createFollows(sessions: Map<string, UserSession>): Promise<void> {
    console.log("\ncreating follows...");

    for (const [follower, followed] of FOLLOW_PAIRS) {
        const session = sessions.get(follower);
        if (!session) {
            console.log(`  no session for ${follower}, skipping.`);
            continue;
        }

        const res = await api("POST", `/users/id/${followed}/followers`, {}, session.token);
        if (res.ok) {
            console.log(`  ${follower} -> ${followed}`);
        } else if (res.status === 409) {
            console.log(`  ${follower} -> ${followed} (already exists)`);
        } else {
            console.error(`  follow ${follower} -> ${followed} failed (${res.status})`);
        }
        await sleep(50);
    }
}

// ─── Reviews ──────────────────────────────────────────────────────────────────

async function createReviews(sessions: Map<string, UserSession>): Promise<void> {
    console.log("\ncreating reviews (slow due to igdb throttle ~2.6s per new game)...");

    const platformPool = ["PC", "PlayStation 5", "Xbox Series X", "Nintendo Switch", "PlayStation 4", "Steam Deck"];

    for (const persona of PERSONAS) {
        const session = sessions.get(persona.accountName);
        if (!session) {
            console.log(`  no session for ${persona.accountName}, skipping.`);
            continue;
        }

        if (persona.reviewGames.length === 0) {
            console.log(`  ${persona.accountName} has no review games, skipping.`);
            continue;
        }

        console.log(`\n  ${persona.accountName} (${persona.reviewGames.length} games)...`);

        for (const gameID of persona.reviewGames) {
            const score = persona.scoreFor(gameID);
            const text = getReviewText(persona, gameID, score);

            const hoursPlayed: number | undefined =
                persona.accountName === "completionist"
                    ? rand(80, 400)
                    : persona.accountName === "strategy_nerd"
                      ? rand(50, 500)
                      : persona.accountName === "casualgamer99"
                        ? rand(5, 25)
                        : persona.accountName === "newbie_gamer"
                          ? rand(15, 60)
                          : Math.random() > 0.45
                            ? rand(2, 120)
                            : undefined;

            const platforms: string[] | undefined =
                persona.accountName === "completionist"
                    ? pickN(platformPool, rand(1, 3))
                    : persona.accountName === "fps_addict"
                      ? ["PC"]
                      : persona.accountName === "fighting_main"
                        ? [pick(["PC", "PlayStation 5"])]
                        : Math.random() > 0.55
                          ? [pick(platformPool)]
                          : undefined;

            const body: Record<string, unknown> = { text, score };
            if (hoursPlayed !== undefined) body["hoursPlayed"] = hoursPlayed;
            if (platforms !== undefined) body["platforms"] = platforms;

            const res = await api("POST", `/games/id/${gameID}/reviews`, body, session.token);

            if (res.ok) {
                console.log(`    reviewed game ${gameID} (score: ${score})`);
            } else if (res.status === 409) {
                console.log(`    game ${gameID} already reviewed by ${persona.accountName}`);
            } else if (res.status === 404) {
                console.log(`    game ${gameID} not found on igdb, skipping.`);
            } else {
                console.error(`    review game ${gameID} failed (${res.status}):`, JSON.stringify(res.data));
            }

            await sleep(100);
        }
    }
}

// ─── Collect Reviews ──────────────────────────────────────────────────────────

type ReviewRecord = {
    reviewer: string;
    reviewed: number;
    score: number;
};

async function fetchAllReviews(): Promise<ReviewRecord[]> {
    console.log("\ncollecting existing reviews...");
    const all: ReviewRecord[] = [];

    for (const persona of PERSONAS) {
        const res = await api("GET", `/users/id/${persona.accountName}/reviews`);
        if (res.ok && Array.isArray(res.data?.data)) {
            for (const r of res.data.data as ReviewRecord[]) {
                all.push({ reviewer: r.reviewer, reviewed: r.reviewed, score: r.score });
            }
        }
        await sleep(50);
    }

    console.log(`  ${all.length} reviews found.`);
    return all;
}

// ─── Reactions ────────────────────────────────────────────────────────────────

async function createReactions(sessions: Map<string, UserSession>, reviews: ReviewRecord[]): Promise<void> {
    console.log("\ncreating reactions...");

    for (const persona of PERSONAS) {
        if (persona.commentActivity === "silent") continue;

        const session = sessions.get(persona.accountName);
        if (!session) continue;

        const maxReacts =
            persona.likesBias === "likes_most"
                ? rand(40, 80)
                : persona.likesBias === "dislikes_most"
                  ? rand(30, 60)
                  : rand(30, 70);

        const reviewsToReact = pickN(reviews, Math.min(reviews.length, maxReacts));

        for (const review of reviewsToReact) {
            if (review.reviewer === persona.accountName) continue;

            let isLike: boolean;
            switch (persona.likesBias) {
                case "likes_most":
                    isLike = Math.random() < 0.8;
                    break;
                case "dislikes_most":
                    isLike = Math.random() < 0.2;
                    break;
                default:
                    isLike = review.score >= 7 ? Math.random() < 0.7 : Math.random() < 0.4;
            }

            const endpoint = isLike ? "likes" : "dislikes";
            const res = await api(
                "POST",
                `/reviews/${review.reviewer}/${review.reviewed}/${endpoint}`,
                {},
                session.token
            );

            if (res.ok) {
                console.log(
                    `  ${persona.accountName} ${isLike ? "liked" : "disliked"} review by ${review.reviewer} (game ${review.reviewed})`
                );
            }

            await sleep(30);
        }
    }

    const silentSession = sessions.get("silent_watcher");
    if (silentSession) {
        const lurkerLikes = pickN(reviews, rand(20, 40));
        for (const review of lurkerLikes) {
            if (review.score >= 8) {
                await api("POST", `/reviews/${review.reviewer}/${review.reviewed}/likes`, {}, silentSession.token);
                await sleep(50);
            }
        }
        console.log("  silent_watcher done.");
    }
}

// ─── Comments ────────────────────────────────────────────────────────────────

async function createComments(sessions: Map<string, UserSession>, reviews: ReviewRecord[]): Promise<void> {
    console.log("\ncreating comments...");

    const personaMap = new Map(PERSONAS.map((p) => [p.accountName, p]));

    for (const persona of PERSONAS) {
        if (persona.commentActivity === "silent") continue;

        const session = sessions.get(persona.accountName);
        if (!session) continue;

        const maxComments =
            persona.commentActivity === "heavy"
                ? rand(30, 50)
                : persona.commentActivity === "moderate"
                  ? rand(15, 25)
                  : rand(3, 8);

        if (maxComments === 0) continue;

        let reviewsToComment = reviews.filter((r) => r.reviewer !== persona.accountName);

        if (persona.accountName === "soulsborn3r") {
            const soulsReviews = reviewsToComment.filter(
                (r) => SOULS_GAMES.includes(r.reviewed) || METROIDVANIA_GAMES.includes(r.reviewed)
            );
            reviewsToComment = [...soulsReviews, ...reviewsToComment].slice(0, maxComments * 3);
        } else if (persona.accountName === "toxic_fan") {
            const mcReviews = reviewsToComment.filter(
                (r) => r.reviewed === MINECRAFT || SANDBOX_GAMES.includes(r.reviewed)
            );
            reviewsToComment = [...mcReviews, ...reviewsToComment].slice(0, maxComments * 3);
        } else if (persona.accountName === "hater_guy") {
            const highScoreReviews = reviewsToComment.filter((r) => r.score >= 8);
            reviewsToComment = [...highScoreReviews, ...reviewsToComment].slice(0, maxComments * 2);
        } else if (persona.accountName === "contrarian_king") {
            const highScoreReviews = reviewsToComment.filter((r) => r.score >= 9);
            reviewsToComment = [...highScoreReviews, ...reviewsToComment].slice(0, maxComments * 2);
        } else if (persona.accountName === "horror_enjoyer") {
            const horrorReviews = reviewsToComment.filter((r) => HORROR_GAMES.includes(r.reviewed));
            reviewsToComment = [...horrorReviews, ...reviewsToComment].slice(0, maxComments * 2);
        } else if (persona.accountName === "narrative_lover") {
            const narrativeReviews = reviewsToComment.filter(
                (r) =>
                    NARRATIVE_GAMES.includes(r.reviewed) ||
                    [DISCO_ELYSIUM, OUTER_WILDS, UNDERTALE, OMORI].includes(r.reviewed)
            );
            reviewsToComment = [...narrativeReviews, ...reviewsToComment].slice(0, maxComments * 2);
        } else if (persona.accountName === "strategy_nerd") {
            const stratReviews = reviewsToComment.filter(
                (r) => STRATEGY_GAMES.includes(r.reviewed) || SANDBOX_GAMES.includes(r.reviewed)
            );
            reviewsToComment = [...stratReviews, ...reviewsToComment].slice(0, maxComments * 2);
        } else if (persona.accountName === "rpg_master") {
            const rpgReviews = reviewsToComment.filter((r) => RPG_GAMES.includes(r.reviewed));
            reviewsToComment = [...rpgReviews, ...reviewsToComment].slice(0, maxComments * 2);
        }

        const selected = pickN(reviewsToComment, maxComments);

        for (const review of selected) {
            const reviewerPersona = personaMap.get(review.reviewer);
            const text = getCommentText(persona, reviewerPersona, review.score);

            const res = await api(
                "POST",
                `/reviews/${review.reviewer}/${review.reviewed}/comments`,
                { text },
                session.token
            );

            if (res.ok) {
                console.log(
                    `  ${persona.accountName} commented on ${review.reviewer}'s review (game ${review.reviewed})`
                );
            }

            await sleep(50);
        }
    }
}

// ─── Entry Point ──────────────────────────────────────────────────────────────

async function main(): Promise<void> {
    console.log("seed script starting...");
    console.log(`target: ${API}`);
    console.log(`avatars: ${AVATARS_DIR}\n`);

    const health = await api("GET", "/health");
    if (!health.ok) {
        console.error("server not responding at", API);
        console.error("make sure the server is running and BASE_URL is correct.");
        process.exit(1);
    }
    console.log("server ok.\n");

    console.log("registering users...");
    const sessions = new Map<string, UserSession>();

    for (const persona of PERSONAS) {
        const token = await registerAndLogin(persona);
        if (token) {
            sessions.set(persona.accountName, { persona, token });
        }
        await sleep(200);
    }

    console.log(`\n  ${sessions.size}/${PERSONAS.length} sessions active.\n`);

    if (sessions.size === 0) {
        console.error("no sessions created, aborting.");
        process.exit(1);
    }

    await uploadAvatars(sessions);
    await updateBios(sessions);
    await createFollows(sessions);
    await createReviews(sessions);

    const reviews = await fetchAllReviews();

    if (reviews.length === 0) {
        console.warn("no reviews found, skipping reactions and comments.");
    } else {
        await createReactions(sessions, reviews);
        await createComments(sessions, reviews);
    }

    console.log("\nseed done.\n");
    console.log("users:");
    for (const [name] of sessions) {
        const persona = PERSONAS.find((p) => p.accountName === name)!;
        console.log(`  ${name} / ${persona.email} / ${persona.password}`);
    }
}

main().catch((err: unknown) => {
    console.error("fatal error:", err);
    process.exit(1);
});
