import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import api from "../services/api";

function Login() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

    };


    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");

        if (!formData.email || !formData.password) {

            setError("Please enter your email and password.");

            return;
        }

        try {

            setLoading(true);

            const response = await api.post(
                "/auth/login",
                formData
            );

            if (response.data.success) {

                const token = response.data.token;

                if (token) {
                    localStorage.setItem(
                        "novara_token",
                        token
                    );
                }

                if (response.data.user) {

                    localStorage.setItem(
                        "novara_user",
                        JSON.stringify(response.data.user)
                    );

                }

                navigate("/dashboard");

            } else {

                setError(
                    response.data.message ||
                    "Login failed."
                );

            }

        } catch (err) {

            setError(
                err.response?.data?.message ||
                "Unable to connect to Novara server."
            );

        } finally {

            setLoading(false);

        }

    };


    return (

        <AuthLayout
            title="Login to your account"
            subtitle="Enter your credentials to access your dashboard."
            visualTitle="Welcome Back!"
            visualText="Continue your innovation journey with Novara."
        >

            <form
                className="auth-form"
                onSubmit={handleSubmit}
            >

                {error && (
                    <div className="alert error">
                        {error}
                    </div>
                )}


                <div className="input-group">

                    <label>
                        Email Address
                    </label>

                    <div className="input-wrapper">

                        <span>
                            ✉
                        </span>

                        <input
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                        />

                    </div>

                </div>


                <div className="input-group">

                    <label>
                        Password
                    </label>

                    <div className="input-wrapper">

                        <span>
                            🔒
                        </span>

                        <input
                            type="password"
                            name="password"
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={handleChange}
                        />

                    </div>

                </div>


                <div className="forgot-row">

                    <Link
                        to="/forgot-password"
                        className="auth-link"
                    >
                        Forgot Password?
                    </Link>

                </div>


                <button
                    type="submit"
                    className="btn btn-primary full-btn"
                    disabled={loading}
                >

                    {loading
                        ? "Logging in..."
                        : "Login"
                    }

                    {!loading && (
                        <span>→</span>
                    )}

                </button>


                <div className="auth-footer">

                    Don't have an account?{" "}

                    <Link
                        to="/register"
                        className="auth-link"
                    >
                        Create Account
                    </Link>

                </div>

            </form>

        </AuthLayout>

    );
}

export default Login;