import React from "react";
import Logo from "./Logo";

function AuthLayout({
    children,
    title,
    subtitle,
    visualTitle = "Welcome to Novara!",
    visualText = "Turn your ideas into innovative projects with intelligent research and analysis."
}) {
    return (
        <div className="auth-page">

            <div className="auth-layout">

                {/* LEFT VISUAL PANEL */}
                <div className="auth-visual">

                    <div className="visual-glow glow-one"></div>
                    <div className="visual-glow glow-two"></div>

                    <div className="stars">
                        ✦　·　✧　·　✦
                    </div>

                    <div className="planet-scene">

                        <div className="planet-ring"></div>

                        <div className="planet">
                            <div className="planet-light"></div>
                        </div>

                        <div className="floating-card card-one">
                            ✦
                        </div>

                        <div className="floating-card card-two">
                            ◇
                        </div>

                        <div className="floating-card card-three">
                            ✧
                        </div>

                    </div>

                    <div className="visual-content">

                        <div className="visual-badge">
                            ✦ AI-Powered Innovation
                        </div>

                        <h2>
                            {visualTitle}
                        </h2>

                        <p>
                            {visualText}
                        </p>

                    </div>

                </div>


                {/* RIGHT FORM */}
                <div className="auth-form-container">

                    <div className="auth-form-box">

                        <Logo />

                        <div className="auth-heading">

                            <h1>
                                {title}
                            </h1>

                            <p>
                                {subtitle}
                            </p>

                        </div>

                        {children}

                    </div>

                </div>

            </div>

        </div>
    );
}

export default AuthLayout;