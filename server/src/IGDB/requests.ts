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

const clientId: string | undefined = process.env["IGDB_CLIENT_ID"];
const secret: string | undefined = process.env["IGDB_CLIENT_SECRET"];

interface TokenData {
    access_token: string;
    expires_at: number;
}

let read_token: boolean = false;
let tokenInfo: TokenData = {
    access_token: "" as string,
    expires_at: 0 as number,
};

type AuthResponseIGDB = {
    "access_token": string,
    "expires_in": number,
    "token_type": string
}
async function GetNewToken(): Promise<void> {

    if (clientId == undefined || secret == undefined) {
        throw new Error("missing IGDB_CLIENT_ID and IGDB_CLIENT_SECRET variables in .env");
    }

    const response: Response = await fetch(
        `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${secret}&grant_type=client_credentials`,
        { method: "POST" }
    );

    let responseJSON = await response.json() as AuthResponseIGDB;
    tokenInfo.access_token = responseJSON.access_token;
    tokenInfo.expires_at = Math.floor(Date.now() / 1000) + responseJSON.expires_in - 20
    fs.writeFileSync(filePath, JSON.stringify(tokenInfo, null, 2));
}

async function HandleToken() {

    if (!read_token) {
        const fileContent = fs.readFileSync(filePath, "utf-8");
        const fileData: TokenData = JSON.parse(fileContent);
        tokenInfo.access_token = fileData.access_token;
        tokenInfo.expires_at = fileData.expires_at;
        read_token = true;
    }

    const expires_at = tokenInfo.expires_at;
    const now = Math.floor(Date.now() / 1000);
    if (now > expires_at) {
        await GetNewToken();
    }
}


// is going to become custom search
export async function SearchGames(input: string, amount: number) {

    await HandleToken();

    return fetch(
        "https://api.igdb.com/v4/games",
        {
            method: "POST",
            headers: {
                "Client-ID": clientId,
                "Authorization": `Bearer ${tokenInfo.access_token}`
            },
            body: `
                search: "${input}";
                fields:
                    id,
                    name,
                    cover.*
                ;
                where game_type = (0, 1, 4, 8, 11) & cover != null;
                limit ${amount};
            `
        }
    ).then(res => res.json());
}


// is going to be deprecated
// provide a random offset for a random set of games
export async function GetGamesFromMainList(amount: number, offset: number) {
    await HandleToken();

    return fetch(
        "https://api.igdb.com/v4/games",
        {
            method: "POST",
            headers: {
                "Client-ID": clientId,
                "Authorization": `Bearer ${tokenInfo.access_token}`
            },
            body: `
                fields
                    id,
                    name,
                    cover.*
                ;
                where game_type = (0, 1, 4, 8, 11) & cover != null;
                limit ${amount};
                offset ${offset};
            `
        }
    ).then(res => res.json());
}


// DONE
export async function GetPopularGames(amount: number, offset: number) {

    const popularID = await GameRepository.GetPopularGames(amount, offset);

    const gameList: string = `(${popularID.map(g => g.gameID).join(",")})`;

    await HandleToken();
    return fetch(
        "https://api.igdb.com/v4/games",
        {
            method: "POST",
            headers: {
                "Client-ID": clientId,
                "Authorization": `Bearer ${tokenInfo.access_token}`
            },
            body: `
                fields
                    id,
                    name,
                    cover.*
                ;
                where id = ${gameList}
            `
        }
    ).then(res => res.json());
}

// DONE
export async function GetRecentGames(amount: number, offset: number) {
    let now = Math.floor(Date.now() / 1000);
    await HandleToken();
    return fetch(
        "https://api.igdb.com/v4/games",
        {
            method: "POST",
            headers: {
                "Client-ID": clientId,
                "Authorization": `Bearer ${tokenInfo.access_token}`
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
    ).then(res => res.json());
}


// DONE
export async function GetRecommendedGames(userPK: UserPK, amount: number, offset: number) {

    const likedGamesRaw = await GameRepository.GetGamesUserLikes(userPK);

    const likedGamesParsedString: string = `(${likedGamesRaw.map(g => g.gameID).join(",")})`

    await HandleToken();
    const genresRaw = await fetch(
        "https://api.igdb.com/v4/games",
        {
            method: "POST",
            headers: {
                "Client-ID": clientId,
                "Authorization": `Bearer ${tokenInfo.access_token}`
            },
            body: `
                fields genres.*;
                where id = ${likedGamesParsedString} & genres != null;
            `
        }
    ).then(res => res.json() as Promise<
        {
            genres: {
                id: number
            }[]
        }[]
    >);


    /**
    [
        {
            genres: [
                {
                    id: number
                },
                ...
            ]
        },
        ...
    ]
        |
        V
      number[]
      the Set removes repeating elements
    */

    const genresParsed = [...
        new Set(
            genresRaw.map(x =>
                x.genres.map(y =>
                    y.id
                )
            ).flat()
        )
    ]

    const genresParsedString = `(${genresParsed.join(',')})`

    await HandleToken();
    return fetch(
        "https://api.igdb.com/v4/games",
        {
            method: "POST",
            headers: {
                "Client-ID": clientId,
                "Authorization": `Bearer ${tokenInfo.access_token}`
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
    ).then(res => res.json());
}


// DONE
// used for the game page
export async function GetGameByID(ID: number) {
    await HandleToken();

    return fetch(
        "https://api.igdb.com/v4/games",
        {
            method: "POST",
            headers: {
                "Client-ID": clientId,
                "Authorization": `Bearer ${tokenInfo.access_token}`
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
    ).then(res => res.json());
}




// helper function made just to get the relevant game_types
async function GetAllTypes() {
    await HandleToken();

    return fetch(
        "https://api.igdb.com/v4/game_types",
        {
            method: "POST",
            headers: {
                "Client-ID": clientId,
                "Authorization": `Bearer ${tokenInfo.access_token}`
            },
            body: `
                fields *;
            `
        }
    ).then(res => res.text());
}




// tests

// let output: any = await SearchGames("the sims", 5);
// console.log(JSON.stringify(output, null, 2));

// let output2: any = await GetGameByID(235102);
// console.log(JSON.stringify(output2, null, 2));

// let output3: any = await GetGamesFromMainList(15, 1);
// console.log(JSON.stringify(output3, null, 2));

// let output4: any = await GetRecentGames(15, 1);
// console.log(JSON.stringify(output4, null, 2));

// let outputN: any = await GetAllTypes();
// console.log(outputN);

// working correctly
