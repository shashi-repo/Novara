import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Dashboard.css";

const Dashboard = () => {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // =========================================================
    // AUTHENTICATION + INITIAL DATA
    // =========================================================

    useEffect(() => {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        console.log("DASHBOARD TOKEN:", token);
        console.log("DASHBOARD USER:", storedUser);

        // No JWT token
        if (!token) {
            navigate("/login", { replace: true });
            return;
        }

        // Load saved user
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
            } catch (error) {
                console.error("Invalid user data:", error);

                localStorage.removeItem("user");
            }
        }

        // Load projects
        fetchProjects();
    }, [navigate]);

    // =========================================================
    // FETCH PROJECTS
    // =========================================================

    const fetchProjects = async () => {
        try {
            const token = localStorage.getItem("token");

            // Token missing
            if (!token) {
                navigate("/login", { replace: true });
                return;
            }

            const response = await fetch(
                "http://localhost:5000/api/projects",
                {
                    method: "GET",

                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            const data = await response.json();

            console.log("PROJECT API RESPONSE:", data);

            // JWT invalid or expired
            if (response.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");

                navigate("/login", {
                    replace: true
                });

                return;
            }

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Unable to fetch projects"
                );
            }

            if (
                data.success &&
                Array.isArray(data.projects)
            ) {
                setProjects(data.projects);
            } else {
                setProjects([]);
            }

        } catch (error) {
            console.error(
                "PROJECT FETCH ERROR:",
                error
            );

            // Keep dashboard working even if
            // project API is unavailable.
            setProjects([]);

        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // LOGOUT
    // =========================================================

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login", {
            replace: true
        });
    };

    // =========================================================
    // USER INFORMATION
    // =========================================================

    const firstName = user?.name
        ? user.name.split(" ")[0]
        : "User";

    const accountStatus =
        user?.email_verified === 1 ||
        user?.email_verified === true
            ? "Verified"
            : "Pending";

    // =========================================================
    // CLOSE MOBILE SIDEBAR
    // =========================================================

    const closeSidebar = () => {
        setSidebarOpen(false);
    };

    // =========================================================
    // UI
    // =========================================================

    return (
        <div className="dashboard-page">

            {/* =================================================
                SIDEBAR
            ================================================= */}

            <aside
                className={`dashboard-sidebar ${
                    sidebarOpen
                        ? "sidebar-open"
                        : ""
                }`}
            >

                {/* LOGO */}

                <div className="sidebar-logo">

                    <div className="novara-logo-icon">
                        ✦
                    </div>

                    <span>
                        Novara
                    </span>

                </div>


                {/* NAVIGATION */}

                <nav className="sidebar-nav">

                    <p className="nav-section-title">
                        MAIN
                    </p>


                    <Link
                        to="/dashboard"
                        className="sidebar-link active"
                        onClick={closeSidebar}
                    >
                        <span>⌂</span>
                        Dashboard
                    </Link>


                    <Link
                        to="/projects"
                        className="sidebar-link"
                        onClick={closeSidebar}
                    >
                        <span>▣</span>
                        Projects
                    </Link>


                    <Link
                        to="/profile"
                        className="sidebar-link"
                        onClick={closeSidebar}
                    >
                        <span>◉</span>
                        Profile
                    </Link>


                    <p className="nav-section-title">
                        WORKSPACE
                    </p>


                    <Link
                        to="/projects/create"
                        className="sidebar-link"
                        onClick={closeSidebar}
                    >
                        <span>＋</span>
                        New Project
                    </Link>


                    <div className="sidebar-link disabled">
                        <span>✦</span>
                        AI Analysis
                        <small>
                            Soon
                        </small>
                    </div>


                    <div className="sidebar-link disabled">
                        <span>▤</span>
                        Reports
                        <small>
                            Soon
                        </small>
                    </div>

                </nav>


                {/* SIDEBAR BOTTOM */}

                <div className="sidebar-bottom">

                    <div className="sidebar-plan">

                        <div className="plan-icon">
                            ✦
                        </div>

                        <div>
                            <strong>
                                Free Plan
                            </strong>

                            <p>
                                3 analyses available
                            </p>
                        </div>

                    </div>


                    <button
                        className="upgrade-button"
                        onClick={() =>
                            alert(
                                "Novara Pro will be available in Phase 8."
                            )
                        }
                    >
                        Upgrade to Pro
                    </button>


                    <button
                        className="logout-button"
                        onClick={handleLogout}
                    >
                        <span>
                            ↪
                        </span>

                        Logout
                    </button>

                </div>

            </aside>


            {/* =================================================
                MOBILE OVERLAY
            ================================================= */}

            {sidebarOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={closeSidebar}
                />
            )}


            {/* =================================================
                MAIN CONTENT
            ================================================= */}

            <main className="dashboard-main">

                {/* HEADER */}

                <header className="dashboard-header">

                    <button
                        className="mobile-menu-button"
                        onClick={() =>
                            setSidebarOpen(
                                !sidebarOpen
                            )
                        }
                    >
                        ☰
                    </button>


                    {/* SEARCH */}

                    <div className="header-search">

                        <span>
                            ⌕
                        </span>

                        <input
                            type="text"
                            placeholder="Search projects..."
                        />

                    </div>


                    {/* HEADER ACTIONS */}

                    <div className="header-actions">

                        <button
                            className="notification-button"
                            type="button"
                            onClick={() =>
                                alert(
                                    "Notifications will be available soon."
                                )
                            }
                        >
                            ♢
                        </button>


                        <div className="user-mini-profile">

                            <div className="user-avatar">
                                {firstName
                                    .charAt(0)
                                    .toUpperCase()}
                            </div>


                            <div className="user-mini-info">

                                <strong>
                                    {user?.name ||
                                        "User"}
                                </strong>

                                <span>
                                    {user?.role ||
                                        "USER"}
                                </span>

                            </div>

                        </div>

                    </div>

                </header>


                {/* =================================================
                    DASHBOARD CONTENT
                ================================================= */}

                <section className="dashboard-content">

                    {/* WELCOME SECTION */}

                    <div className="welcome-section">

                        <div>

                            <p className="welcome-label">
                                DASHBOARD
                            </p>

                            <h1>
                                Welcome back,{" "}
                                {firstName} 👋
                            </h1>

                            <p className="welcome-description">
                                Discover, analyze and
                                improve your project
                                ideas with Novara.
                            </p>

                        </div>


                        <Link
                            to="/projects/create"
                            className="create-project-button"
                        >
                            <span>
                                ＋
                            </span>

                            Create Project
                        </Link>

                    </div>


                    {/* =================================================
                        STAT CARDS
                    ================================================= */}

                    <div className="stats-grid">

                        {/* PROJECTS */}

                        <div className="stat-card">

                            <div className="stat-card-top">

                                <div className="stat-icon purple">
                                    ▣
                                </div>

                                <span className="stat-badge">
                                    Total
                                </span>

                            </div>

                            <h2>
                                {projects.length}
                            </h2>

                            <p>
                                Projects
                            </p>

                        </div>


                        {/* FREE ANALYSES */}

                        <div className="stat-card">

                            <div className="stat-card-top">

                                <div className="stat-icon blue">
                                    ✦
                                </div>

                                <span className="stat-badge">
                                    Available
                                </span>

                            </div>

                            <h2>
                                3
                            </h2>

                            <p>
                                Free Analyses
                            </p>

                        </div>


                        {/* ACCOUNT STATUS */}

                        <div className="stat-card">

                            <div className="stat-card-top">

                                <div className="stat-icon green">
                                    ✓
                                </div>

                                <span className="stat-badge">
                                    Active
                                </span>

                            </div>

                            <h2>
                                {accountStatus}
                            </h2>

                            <p>
                                Account Status
                            </p>

                        </div>


                        {/* AI ANALYSIS */}

                        <div className="stat-card">

                            <div className="stat-card-top">

                                <div className="stat-icon orange">
                                    ◈
                                </div>

                                <span className="stat-badge">
                                    Coming
                                </span>

                            </div>

                            <h2>
                                0
                            </h2>

                            <p>
                                AI Analyses
                            </p>

                        </div>

                    </div>


                    {/* =================================================
                        MAIN GRID
                    ================================================= */}

                    <div className="dashboard-grid">

                        {/* =================================================
                            RECENT PROJECTS
                        ================================================= */}

                        <section className="dashboard-panel projects-panel">

                            <div className="panel-header">

                                <div>

                                    <h2>
                                        Recent Projects
                                    </h2>

                                    <p>
                                        Your latest
                                        innovation projects
                                    </p>

                                </div>


                                <Link
                                    to="/projects"
                                    className="view-all-link"
                                >
                                    View all →
                                </Link>

                            </div>


                            {/* LOADING */}

                            {loading ? (

                                <div className="empty-state">

                                    <div className="loading-spinner">
                                    </div>

                                    <p>
                                        Loading projects...
                                    </p>

                                </div>

                            ) : projects.length === 0 ? (

                                /* EMPTY */

                                <div className="empty-state">

                                    <div className="empty-icon">
                                        ✦
                                    </div>

                                    <h3>
                                        No projects yet
                                    </h3>

                                    <p>
                                        Start your innovation
                                        journey by creating
                                        your first project.
                                    </p>

                                    <Link
                                        to="/projects/create"
                                        className="empty-create-button"
                                    >
                                        Create your first
                                        project
                                    </Link>

                                </div>

                            ) : (

                                /* PROJECT LIST */

                                <div className="project-list">

                                    {projects
                                        .slice(0, 5)
                                        .map(
                                            (
                                                project
                                            ) => (

                                                <Link
                                                    key={
                                                        project.id
                                                    }
                                                    to={`/projects/${project.id}`}
                                                    className="project-item"
                                                >

                                                    <div className="project-icon">
                                                        ✦
                                                    </div>


                                                    <div className="project-info">

                                                        <h3>
                                                            {project.title ||
                                                                project.name ||
                                                                "Untitled Project"}
                                                        </h3>

                                                        <p>
                                                            {project.description ||
                                                                "No description available"}
                                                        </p>

                                                    </div>


                                                    <span className="project-status">
                                                        Active
                                                    </span>

                                                </Link>

                                            )
                                        )}

                                </div>

                            )}

                        </section>


                        {/* =================================================
                            QUICK ACTIONS
                        ================================================= */}

                        <section className="dashboard-panel quick-panel">

                            <div className="panel-header">

                                <div>

                                    <h2>
                                        Quick Actions
                                    </h2>

                                    <p>
                                        Get started quickly
                                    </p>

                                </div>

                            </div>


                            <div className="quick-actions">

                                {/* CREATE PROJECT */}

                                <Link
                                    to="/projects/create"
                                    className="quick-action"
                                >

                                    <div className="quick-action-icon purple">
                                        ＋
                                    </div>

                                    <div>

                                        <strong>
                                            Create Project
                                        </strong>

                                        <span>
                                            Start a new
                                            innovation idea
                                        </span>

                                    </div>

                                    <span className="action-arrow">
                                        →
                                    </span>

                                </Link>


                                {/* AI ANALYSIS */}

                                <div className="quick-action disabled-action">

                                    <div className="quick-action-icon blue">
                                        ✦
                                    </div>

                                    <div>

                                        <strong>
                                            Analyze Idea
                                        </strong>

                                        <span>
                                            AI analysis
                                            coming soon
                                        </span>

                                    </div>

                                    <span className="action-arrow">
                                        →
                                    </span>

                                </div>


                                {/* REPORT */}

                                <div className="quick-action disabled-action">

                                    <div className="quick-action-icon green">
                                        ▤
                                    </div>

                                    <div>

                                        <strong>
                                            Generate Report
                                        </strong>

                                        <span>
                                            Reports coming
                                            soon
                                        </span>

                                    </div>

                                    <span className="action-arrow">
                                        →
                                    </span>

                                </div>

                            </div>

                        </section>

                    </div>


                    {/* =================================================
                        NOVARA AI BANNER
                    ================================================= */}

                    <section className="innovation-banner">

                        <div className="banner-glow">
                        </div>


                        <div className="banner-content">

                            <div className="banner-icon">
                                ✦
                            </div>


                            <div>

                                <span className="banner-label">
                                    NOVARA AI
                                </span>

                                <h2>
                                    Turn your idea into
                                    an innovation.
                                </h2>

                                <p>
                                    Novara will analyze
                                    your project, discover
                                    existing research and
                                    help identify innovation
                                    opportunities.
                                </p>

                            </div>

                        </div>


                        <Link
                            to="/projects/create"
                            className="banner-button"
                        >
                            Start Exploring →
                        </Link>

                    </section>


                    {/* =================================================
                        PROFILE SUMMARY
                    ================================================= */}

                    <section className="profile-summary">

                        <div className="profile-summary-left">

                            <div className="large-avatar">
                                {firstName
                                    .charAt(0)
                                    .toUpperCase()}
                            </div>


                            <div>

                                <p className="profile-label">
                                    YOUR ACCOUNT
                                </p>

                                <h3>
                                    {user?.name ||
                                        "User"}
                                </h3>

                                <p>
                                    {user?.email ||
                                        "Email not available"}
                                </p>

                            </div>

                        </div>


                        <Link
                            to="/profile"
                            className="profile-button"
                        >
                            Manage Profile →
                        </Link>

                    </section>

                </section>

            </main>

        </div>
    );
};

export default Dashboard;