import { NavLink, useNavigate } from "react-router-dom";

const Sidebar = () => {

    const navigate = useNavigate();

    const handleLogout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
    };


    return (
        <aside className="sidebar">

            <div className="sidebar-logo">
                Novara
            </div>


            <nav className="sidebar-nav">

                <NavLink to="/dashboard">
                    Dashboard
                </NavLink>


                <NavLink to="/profile">
                    Profile
                </NavLink>


                <NavLink to="/projects">
                    Projects
                </NavLink>

            </nav>


            <button
                className="logout-button"
                onClick={handleLogout}
            >
                Logout
            </button>

        </aside>
    );
};


export default Sidebar;