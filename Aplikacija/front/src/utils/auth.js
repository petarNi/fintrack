export default function getAuthorization() {
    const token = localStorage.getItem("token");
    if (!token) {
        return null;
    }
    return {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    }
}
