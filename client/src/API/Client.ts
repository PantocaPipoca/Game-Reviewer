import axios from "axios";
import { getToken } from "./Auth";

const client = axios.create({
    baseURL: "http://localhost:3000/api/",
    headers: { "Content-Type": "application/json" },
});

// Attach token to every request if present
client.interceptors.request.use((config) => {
    const token = getToken();
    if (token) 
        config.headers.Authorization = "Bearer " + token;
    return config;
});

// Unwrap data field from all responses
client.interceptors.response.use((res) => res.data.data);

export default client;