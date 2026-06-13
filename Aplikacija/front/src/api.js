import axios from "axios";


const api = axios.create({
    baseURL: "http://localhost:5146/api",
})

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        if (status === 401) {
            const endpoint = error.config?.url || "";
            const isAuthAttempt = endpoint.includes("/auth/login") || endpoint.includes("/auth/register");
            if (!isAuthAttempt) {
                alert("Vasa sesija je istekla, molimo Vas prijavite se ponovo");
                localStorage.removeItem("userId");
                localStorage.removeItem("token");
                window.location.href = "/prijava";
            }
        }
        return Promise.reject(error);
    }
);

export default api;