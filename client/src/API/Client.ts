import axios, { AxiosHeaders, type InternalAxiosRequestConfig } from "axios";

const client = axios.create({
    baseURL: "http://localhost:3000/api/",
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
});

let csrfToken: string | null = null;


/**
 * Checks if the given HTTP method is unsafe (that require a CSRF token)
 * 
 * @param method - the HTTP method to check
 * @returns - true if the method is unsafe, false otherwise
 */
function isUnsafeMethod(method?: string): boolean {
    if (!method) return false;
    const upper = method.toUpperCase();
    return upper === "POST" || upper === "PUT" || upper === "PATCH" || upper === "DELETE";
}

/**
 * Fetches the CSRF token from the server.
 * This function makes a GET request to '/api/csrf-token' with credentials
 * it expects the response to contain a 'csrfToken' property in its data
 * 
 * @returns - a promise which resolves to the CSRF token
 */
async function fetchCsrfToken(): Promise<string> {
    const response = await axios.get("http://localhost:3000/api/csrf-token", {
        withCredentials: true,
    });

    const token = response.data?.data?.csrfToken;
    if (!token || typeof token !== "string")
        throw new Error("Failed to fetch CSRF token");

    csrfToken = token;
    return token;
}

/**
 * Interceptor for requests that add the CSRF token to the headers if the method is unsafe
 */
client.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        if (isUnsafeMethod(config.method)) {
            if (!csrfToken)
                await fetchCsrfToken();

            if (!config.headers)
                config.headers = new AxiosHeaders();

            config.headers.set("x-csrf-token", csrfToken as string);
        }

        return config;
    }
);

/**
 * Interceptor for responses that handles CSRF errors
 */
client.interceptors.response.use((res) => res.data.data,
    async (error) => {
        const originalRequest = error.config;

        const isCsrfError =
            error?.response?.status === 403 &&
            error?.response?.data?.message === "Invalid CSRF token";

        if (isCsrfError && originalRequest && !originalRequest._csrfRetry) {
            originalRequest._csrfRetry = true;
            csrfToken = null;
            await fetchCsrfToken();

            if (!originalRequest.headers)
                originalRequest.headers = new AxiosHeaders();
            
            if (csrfToken !== null) {
                originalRequest.headers.set("x-csrf-token", csrfToken);
                return client(originalRequest);
            }
        }

        return Promise.reject(error);
    }
);

export default client;