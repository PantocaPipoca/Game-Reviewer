import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

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
        throw new Error("probably missing .env file");
    }

    const response: Response = await fetch(
        `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${secret}&grant_type=client_credentials`,
        { method: "POST" }
    );

    let responseJSON = await response.json() as AuthResponseIGDB;
    tokenInfo.access_token = responseJSON.access_token;
    tokenInfo.expires_at = Math.floor(Date.now() / 1000) + responseJSON.expires_in - 20
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
        let dataToSave: TokenData = {
            access_token: tokenInfo.access_token,
            expires_at: tokenInfo.expires_at,
        }
        fs.writeFileSync(filePath, JSON.stringify(dataToSave, null, 2));
    }
}


export async function SearchGames(input: string) {
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
                fields: id, name, platforms.name;
                limit 50;
            `
        }
    ).then(x => x.json());
}

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
                    cover.*,
                    first_release_date,
                    game_modes.name,
                    game_modes.slug,
                    genres.name,
                    genres.slug,
                    involved_companies.company.description,
                    involved_companies.company.name,
                    involved_companies.company.slug,
                    involved_companies.company.status.name,
                    involved_companies.developer,
                    involved_companies.porting,
                    involved_companies.publisher,
                    involved_companies.supporting,
                    keywords.name,
                    keywords.slug,
                    name,
                    platforms.name,
                    platforms.slug,
                    player_perspectives.name,
                    player_perspectives.slug,
                    release_dates.date,
                    release_dates.human,
                    slug,
                    summary,
                    tags,
                    themes.name,
                    themes.slug,
                    videos.name,
                    videos.video_id,
                    websites.trusted,
                    websites.url,
                    websites.type.type,
                    game_type.type;
                where id = ${ID};
            `
        }
    ).then(x => x.json());
}

// tests

// let output: any = await SearchGames("strawberry jam");
// console.log(JSON.stringify(output, null, 2));

// let output2: any = await GetGameByID(235102);
// console.log(JSON.stringify(output2, null, 2));

// working correctly