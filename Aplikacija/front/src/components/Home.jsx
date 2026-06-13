import AdminUser from "./AdminUser.jsx";
import HomeGuest from "./HomeGuest";
import HomeLoggedUser from "./HomeLoggedUser.jsx"
export default function Home({ loggedIn }) {
    const role = localStorage.getItem("role");
    const isAdmin = role === "Admin";

    if (!loggedIn) return <HomeGuest />
    if (isAdmin) return <AdminUser />
    return <HomeLoggedUser />
}
