import { v2 as cloudinary } from "cloudinary";

const cloud_name = process.env["CLOUDINARY_CLOUD_NAME"];
const api_key = process.env["CLOUDINARY_API_KEY"];
const api_secret = process.env["CLOUDINARY_API_SECRET"];

if (!cloud_name || !api_key || !api_secret) {
    throw new Error("Missing Cloudinary environment variables");
}

cloudinary.config({ cloud_name, api_key, api_secret, secure: true });

export async function uploadAvatar(buffer: Buffer, username: string): Promise<string> {
    return new Promise((resolve, reject) => {
        cloudinary.uploader
            .upload_stream(
                {
                    public_id: `avatars/${username}`,
                    overwrite: true,
                    resource_type: "image",
                },
                (error, result) => {
                    if (error || !result) return reject(error);
                    resolve(result.secure_url);
                }
            )
            .end(buffer);
    });
}

export async function deleteAvatar(username: string): Promise<void> {
    await cloudinary.uploader.destroy(`avatars/${username}`);
}
