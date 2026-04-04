import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
// import { GameCover } from "../types/Types";
import { GameRepository } from "../Repository/GameRepository";
import { UserPK, GameCover } from "../types/Types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FILE_PATH = path.join(__dirname, "token.log");

dotenv.config();

type TokenData = {
    access_token: string;
    expires_at: number;
};

type AuthResponseIGDB = {
    access_token: string;
    expires_in: number;
    token_type: string;
};

type GameGenre = {
    genres: number[];
};

export class IGDB {
    private static clientId: string | undefined = process.env["IGDB_CLIENT_ID"];
    private static secret: string | undefined = process.env["IGDB_CLIENT_SECRET"];

    private static readToken: boolean = false;
    private static tokenInfo: TokenData = {
        access_token: "" as string,
        expires_at: 0 as number,
    };

    private static usedTypes: string = "(0, 1, 2, 4, 6, 8, 9, 10, 11, 12, 13)";

    // avoid getting 429'd during tests
    private static lastQueryTime: number = 0;
    private static async sleep() {
        const now = Date.now();
        const timeSinceLastQuery = now - this.lastQueryTime;
        if (timeSinceLastQuery < 2600) {
            await new Promise((resolve) => setTimeout(resolve, 2600 - timeSinceLastQuery));
        }
    }

    private static async getNewToken(): Promise<void> {
        if (IGDB.clientId == undefined || IGDB.secret == undefined)
            throw new Error("missing IGDB_CLIENT_ID and IGDB_CLIENT_SECRET variables in .env");

        const auth: AuthResponseIGDB = await fetch(
            `https://id.twitch.tv/oauth2/token?client_id=${IGDB.clientId}&client_secret=${IGDB.secret}&grant_type=client_credentials`,
            { method: "POST" }
        ).then((res) => res.json() as Promise<AuthResponseIGDB>);

        IGDB.tokenInfo.access_token = auth.access_token;
        IGDB.tokenInfo.expires_at = Math.floor(Date.now() / 1000) + auth.expires_in - 20;
        fs.writeFileSync(FILE_PATH, JSON.stringify(IGDB.tokenInfo, null, 2));
    }

    private static get safeAccessToken(): string {
        const token = IGDB.tokenInfo.access_token;
        if (typeof token !== "string" || !/^[A-Za-z0-9_\-]+$/.test(token)) {
            throw new Error("Invalid access token format");
        }
        return token;
    }

    private static async handleToken(): Promise<void> {
        if (!IGDB.readToken) {
            try {
                const fileContent = fs.readFileSync(FILE_PATH, "utf-8");
                const fileData: TokenData = JSON.parse(fileContent);

                const token = typeof fileData.access_token === "string" ? fileData.access_token : "";
                const expiresAt = typeof fileData.expires_at === "number" ? fileData.expires_at : 0;

                IGDB.tokenInfo = { access_token: token, expires_at: expiresAt };
            } catch {
                IGDB.tokenInfo = { access_token: "", expires_at: 0 };
            }
            IGDB.readToken = true;
        }

        const now = Math.floor(Date.now() / 1000);
        if (now > IGDB.tokenInfo.expires_at) await IGDB.getNewToken();
        await IGDB.sleep();
    }

    // DONE
    // used for the game page
    public static async getGameByID(ID: number): Promise<any> {
        await IGDB.handleToken();
        return fetch("https://api.igdb.com/v4/games", {
            method: "POST",
            headers: {
                "Client-ID": IGDB.clientId,
                Authorization: `Bearer ${IGDB.safeAccessToken}`,
            },
            body: `
                fields
                    artworks.*,
                    artworks.artwork_type.*,

                    cover.*,
                    cover.game_localization.*,
                    cover.game_localization.region.*,

                    first_release_date,

                    game_modes.*,

                    game_type.*,

                    genres.*,

                    involved_companies.*,
                    involved_companies.company.description,
                    involved_companies.company.name,
                    involved_companies.company.slug,
                    involved_companies.company.status.name,

                    multiplayer_modes.*,

                    name,

                    platforms.name,
                    platforms.slug,

                    player_perspectives.name,
                    player_perspectives.slug,

                    screenshots.*,

                    slug,

                    storyline,

                    summary,

                    themes.name,
                    themes.slug,

                    videos.name,
                    videos.video_id,

                    websites.trusted,
                    websites.url,
                    websites.type.type
                ;

                where
                    game_type = ${IGDB.usedTypes} &
                    cover != null &
                    id = ${ID}
                ;
            `,
        })
            .then((res) => res.json() as Promise<any[]>)
            .then((arr) => (arr.length === 1 ? arr[0] : null) as any);
    }

    // DONE
    public static async searchGames(
        name: string,
        genres: number[],
        offset: number,
        amount: number
    ): Promise<GameCover[]> {
        const genresString: string = genres.length > 0 ? `& genres = (${genres.join(",")})` : "";

        await IGDB.handleToken();
        return fetch("https://api.igdb.com/v4/games", {
            method: "POST",
            headers: {
                "Client-ID": IGDB.clientId,
                Authorization: `Bearer ${IGDB.safeAccessToken}`,
            },
            body: `
                fields:
                    id,
                    name,
                    cover.*
                ;
                
                where
                    name ~ *"${name}"* &
                    game_type = ${IGDB.usedTypes} &
                    cover != null
                    ${genresString}
                ;
                sort id asc;
                offset ${offset};
                limit ${amount};
            `,
        }).then((res) => res.json() as Promise<GameCover[]>);
    }

    // DONE
    // used to get games obtained through a search in our db
    public static async getGivenGames(gameIDs: number[]) {
        const gameIDListString: string = `(${gameIDs.join(",")})`;

        await IGDB.handleToken();
        return fetch("https://api.igdb.com/v4/games", {
            method: "POST",
            headers: {
                "Client-ID": IGDB.clientId,
                Authorization: `Bearer ${IGDB.safeAccessToken}`,
            },
            body: `
                fields
                    id,
                    name,
                    cover.*
                ;

                where id = ${gameIDListString} &
                cover != null;
            `,
        }).then((res) => res.json() as Promise<GameCover[]>);
    }

    // DONE
    public static async getRecentGames(offset: number, amount: number): Promise<GameCover[]> {
        const now = Math.floor(Date.now() / 1000);

        await IGDB.handleToken();
        return fetch("https://api.igdb.com/v4/games", {
            method: "POST",
            headers: {
                "Client-ID": IGDB.clientId,
                Authorization: `Bearer ${IGDB.safeAccessToken}`,
            },
            body: `
                fields
                    id,
                    name,
                    cover.*
                ;

                where
                    game_type = ${IGDB.usedTypes} &
                    cover != null &
                    first_release_date < ${now}
                ;

                sort first_release_date desc;

                offset ${offset};
                limit ${amount};
            `,
        }).then((res) => res.json() as Promise<GameCover[]>);
    }

    // DONE
    public static async getGenresOfGames(games: number[]): Promise<number[]> {
        const gamesStr = `(${games.join(",")})`;

        await IGDB.handleToken();
        return await fetch("https://api.igdb.com/v4/games", {
            method: "POST",
            headers: {
                "Client-ID": IGDB.clientId,
                Authorization: `Bearer ${IGDB.safeAccessToken}`,
            },
            body: `
                fields genres;

                where
                    id = ${gamesStr} &
                    genres != null
                ;
            `,
        })
            .then((res) => res.json() as Promise<GameGenre[]>)
            .then((raw) => [...new Set(raw.map((x) => x.genres).flat())]);
    }

    // helper function made just to get the relevant game_types
    static async getAllTypes() {
        await IGDB.handleToken();

        return fetch("https://api.igdb.com/v4/game_types", {
            method: "POST",
            headers: {
                "Client-ID": IGDB.clientId,
                Authorization: `Bearer ${IGDB.safeAccessToken}`,
            },
            body: `
                    fields *;
                `,
        }).then((res) => res.json());
    }
}

// tests

// let output: any = await IGDB.searchGames("celeste", [], 0, 5);
// console.log(JSON.stringify(output, null, 2));

// let output2: any = await IGDB.getGameByID(26226);
// console.log(JSON.stringify(output2, null, 2));

// let output3: any = await IGDB.getRecentGames(15, 1);
// console.log(JSON.stringify(output3, null, 2));

// let output4: any = await IGDB.getGenresOfGames([1, 1879, 26226]);
// console.log(JSON.stringify(output4, null, 2));

// let outputN: any = await IGDB.getAllTypes();
// console.log(JSON.stringify(outputN, null, 2));

// working correctly
