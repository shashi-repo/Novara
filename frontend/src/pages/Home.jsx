import React from "react";
import { Link } from "react-router-dom";
import Logo from "../components/Logo";

function Home() {

    return (
        <div className="home-page">

            {/* NAVBAR */}

            <header className="navbar">

                <Logo />

                <nav>

                    <a href="#features">
                        Features
                    </a>

                    <a href="#how-it-works">
                        How It Works
                    </a>

                    <a href="#pricing">
                        Pricing
                    </a>

                    <a href="#about">
                        About
                    </a>

                </nav>

                <div className="nav-actions">

                    <Link
                        to="/login"
                        className="btn btn-outline"
                    >
                        Login
                    </Link>

                    <Link
                        to="/register"
                        className="btn btn-primary"
                    >
                        Get Started
                    </Link>

                </div>

            </header>


            {/* HERO */}

            <section className="hero">

                <div className="hero-content">

                    <div className="hero-badge">
                        ✦ AI-Powered Innovation
                    </div>

                    <h1>
                        Discover. <span>Analyze.</span>
                        <br />
                        <strong>Innovate with Novara.</strong>
                    </h1>

                    <p>
                        Analyze your project idea, discover existing
                        research, and identify innovation opportunities
                        with the power of AI.
                    </p>

                    <div className="hero-buttons">

                        <Link
                            to="/login"
                            className="btn btn-primary hero-btn"
                        >
                            Login
                            <span>→</span>
                        </Link>

                        <Link
                            to="/register"
                            className="btn btn-outline hero-btn"
                        >
                            Create an Account
                        </Link>

                    </div>

                    <div className="hero-features">

                        <div>
                            <div className="feature-icon">
                                🧠
                            </div>

                            <h4>
                                AI-Powered
                            </h4>

                            <p>
                                Smart analysis
                            </p>
                        </div>


                        <div>
                            <div className="feature-icon">
                                🔍
                            </div>

                            <h4>
                                Research Discovery
                            </h4>

                            <p>
                                Find existing work
                            </p>
                        </div>


                        <div>
                            <div className="feature-icon">
                                📈
                            </div>

                            <h4>
                                Innovation Insights
                            </h4>

                            <p>
                                Spot opportunities
                            </p>
                        </div>

                    </div>

                </div>


                {/* HERO VISUAL */}

                <div className="hero-visual">

                    <div className="dashboard-floating">

                        <div className="floating-title">
                            AI Analysis
                        </div>

                        <div className="chart-area">

                            <div className="chart-line">
                                ╱╲__╱╲___╱╲
                            </div>

                        </div>

                        <div className="chart-bottom">

                            <div></div>
                            <div></div>
                            <div></div>

                        </div>

                    </div>


                    <div className="hero-orb">

                        <div className="orb-ring"></div>

                    </div>


                    <div className="hero-card card-left">
                        💡
                    </div>

                    <div className="hero-card card-right">
                        📊
                    </div>

                    <div className="hero-card card-bottom">
                        ✦
                    </div>

                </div>

            </section>


            {/* FEATURES */}

            <section
                className="simple-section"
                id="features"
            >

                <div className="section-title">

                    <span>
                        Why Novara?
                    </span>

                    <h2>
                        Build projects that stand out.
                    </h2>

                    <p>
                        Novara helps students and researchers
                        transform ideas into innovative projects.
                    </p>

                </div>

            </section>

        </div>
    );
}

export default Home;