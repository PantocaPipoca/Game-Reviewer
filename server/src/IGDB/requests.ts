import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { GameRepository } from "../Repository/GameRepository";
import { UserPK } from "../types/Types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const filePath = path.join(__dirname, "token.log");

dotenv.config();

type TokenData = {
    access_token: string;
    expires_at: number;
}

type AuthResponseIGDB = {
    access_token: string,
    expires_in: number,
    token_type: string
}

type GameCover = {
    id: number,
    name: string,
    cover: {
        id: number,
        alpha_channel: boolean,
        animated: boolean,
        game: number,
        height: number,
        image_id: string,
        url: string,
        width: number,
    }
}

type GameGenre = {
    genres: {
        id: number
    }[]
}

export class IGDB {

    private static clientId: string | undefined = process.env["IGDB_CLIENT_ID"];
    private static secret: string | undefined = process.env["IGDB_CLIENT_SECRET"];

    private static read_token: boolean = false;
    private static tokenInfo: TokenData = {
        access_token: "" as string,
        expires_at: 0 as number,
    };

    private static async GetNewToken(): Promise<void> {

        if (IGDB.clientId == undefined || IGDB.secret == undefined) {
            throw new Error("missing IGDB_CLIENT_ID and IGDB_CLIENT_SECRET variables in .env");
        }

        const auth: AuthResponseIGDB = await fetch(

            `https://id.twitch.tv/oauth2/token?client_id=${IGDB.clientId}&client_secret=${IGDB.secret}&grant_type=client_credentials`,
            { method: "POST" }

        ).then(res => res.json() as Promise<AuthResponseIGDB>);

        IGDB.tokenInfo.access_token = auth.access_token;
        IGDB.tokenInfo.expires_at = Math.floor(Date.now() / 1000) + auth.expires_in - 20
        fs.writeFileSync(filePath, JSON.stringify(IGDB.tokenInfo, null, 2));

    }

    private static async HandleToken(): Promise<void> {

        if (!IGDB.read_token) {
            const fileContent = fs.readFileSync(filePath, "utf-8");
            const fileData: TokenData = JSON.parse(fileContent);
            IGDB.tokenInfo.access_token = fileData.access_token;
            IGDB.tokenInfo.expires_at = fileData.expires_at;
            IGDB.read_token = true;
        }

        const expires_at = IGDB.tokenInfo.expires_at;
        const now = Math.floor(Date.now() / 1000);
        if (now > expires_at)
            IGDB.GetNewToken();
    }


    // DONE
    public static async SearchGames(name: string, genres: number[], offset: number, amount: number): Promise<GameCover[]> {

        await IGDB.HandleToken();
        return fetch(
            "https://api.igdb.com/v4/games",
            {
                method: "POST",
                headers: {
                    "Client-ID": IGDB.clientId,
                    "Authorization": `Bearer ${IGDB.tokenInfo.access_token}`
                },
                body: `
                ${name != null && name.length != 0 ? `search "${name}";` : ""}
                fields:
                    id,
                    name,
                    cover.*
                ;
                
                where game_type = (0, 1, 4, 8, 11) & cover != null
                ${genres.length > 0 ? `& genres = (${genres.join(',')})` : ""}
                ;
                
                offset ${offset};
                limit ${amount};
                `
            }
        ).then(res => res.json() as Promise<GameCover[]>);
    }


    // DONE
    public static async GetPopularGames(amount: number, offset: number): Promise<GameCover[]> {

        const popularGamesEntries = await GameRepository.GetPopularGames(amount, offset);

        const gameIDListString: string = `(${popularGamesEntries.map(g => g.gameID).join(",")})`;

        await IGDB.HandleToken();
        return fetch(
            "https://api.igdb.com/v4/games",
            {
                method: "POST",
                headers: {
                    "Client-ID": IGDB.clientId,
                    "Authorization": `Bearer ${IGDB.tokenInfo.access_token}`
                },
                body: `
                    fields
                        id,
                        name,
                        cover.*
                    ;

                    where id = ${gameIDListString};
                `
            }
        ).then(res => res.json() as Promise<GameCover[]>);

    }

    // DONE
    public static async GetRecentGames(amount: number, offset: number): Promise<GameCover[]> {

        const now = Math.floor(Date.now() / 1000);

        await IGDB.HandleToken()

        return fetch(
            "https://api.igdb.com/v4/games",
            {
                method: "POST",
                headers: {
                    "Client-ID": IGDB.clientId,
                    "Authorization": `Bearer ${IGDB.tokenInfo.access_token}`
                },
                body: `
                    fields
                        id,
                        name,
                        cover.*
                    ;

                    where game_type = (0, 1, 4, 8, 11) & cover != null & first_release_date < ${now};

                    sort first_release_date desc;

                    limit ${amount};
                    offset ${offset};
                `
            }
        ).then(res => res.json() as Promise<GameCover[]>);
    }

    // DONE
    public static async GetRecommendedGames(userPK: UserPK, amount: number, offset: number): Promise<GameCover[]> {

        const likedGamesRaw = await GameRepository.GetGamesUserLikes(userPK);
        const likedGamesParsedString: string = `(${likedGamesRaw.map(g => g.gameID).join(",")})`;

        await IGDB.HandleToken();
        const likedGenresRaw = await fetch(
            "https://api.igdb.com/v4/games",
            {
                method: "POST",
                headers: {
                    "Client-ID": IGDB.clientId,
                    "Authorization": `Bearer ${IGDB.tokenInfo.access_token}`
                },
                body: `
                    fields genres.*;

                    where id = ${likedGamesParsedString} & genres != null;
                `
            }
        ).then(res => res.json() as Promise<GameGenre[]>);

        const likedGenresParsed: number[] = [...
            new Set(
                likedGenresRaw.map(x =>
                    x.genres.map(y =>
                        y.id
                    )
                ).flat()
            )
        ]

        const genresParsedString: string = `(${likedGenresParsed.join(',')})`

        await IGDB.HandleToken();
        return fetch(
            "https://api.igdb.com/v4/games",
            {
                method: "POST",
                headers: {
                    "Client-ID": IGDB.clientId,
                    "Authorization": `Bearer ${IGDB.tokenInfo.access_token}`
                },
                body: `
                    fields
                        id,
                        name,
                        cover.*
                    ;

                    where genres = ${genresParsedString};

                    limit ${amount};
                    offset ${offset};
                `
            }
        ).then(res => res.json() as Promise<GameCover[]>);
    }



    // DONE
    // used for the game page
    public static async GetGameByID(ID: number): Promise<any[]> {

        await IGDB.HandleToken();
        return fetch(
            "https://api.igdb.com/v4/games",
            {
                method: "POST",
                headers: {
                    "Client-ID": IGDB.clientId,
                    "Authorization": `Bearer ${IGDB.tokenInfo.access_token}`
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

                    where id = ${ID};
                `
            }
        ).then(res => res.json() as Promise<any[]>);
    }




    // helper function made just to get the relevant game_types
    static async GetAllTypes() {
        await IGDB.HandleToken();

        fetch(
            "https://api.igdb.com/v4/game_types",
            {
                method: "POST",
                headers: {
                    "Client-ID": IGDB.clientId,
                    "Authorization": `Bearer ${IGDB.tokenInfo.access_token}`
                },
                body: `
                    fields *;
                `
            }
        ).then(res => res.text());
    }
}


// tests

// let output: any = await IGDB.SearchGames("the sims", [], 0, 5);
// console.log(JSON.stringify(output, null, 2));

// let output2: any = await IGDB.GetGameByID(235102);
// console.log(JSON.stringify(output2, null, 2));

// let output3: any = await IGDB.GetRecentGames(15, 1);
// console.log(JSON.stringify(output3, null, 2));

// let outputN: any = await IGDB.GetAllTypes();
// console.log(outputN);

// working correctly
