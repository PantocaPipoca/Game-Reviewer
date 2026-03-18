import axios from "axios";

const client = axios.create({
    baseURL: "http://localhost:3000/api/",
    headers: { "Content-Type": "application/json" },
    withCredentials: true, // sends cookies automatically
});

// Unwrap data field from all responses
client.interceptors.response.use((res) => res.data.data);

export default client;
