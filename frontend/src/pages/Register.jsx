import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import api from "../services/api";

function Register() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
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

        if (
            !formData.name ||
            !formData.email ||
            !formData.password ||
            !formData.confirmPassword
        ) {

            setError(
                "Please fill all fields."
            );

            return;
        }


        if (
            formData.password !==
            formData.confirmPassword
        ) {

            setError(
                "Passwords do not match."
            );

            return;
        }


        try {

            setLoading(true);

            const response = await api.post(
                "/auth/register",
                {
                    name: formData.name,
                    email: formData.email,
                    password: formData.password
                }
            );


            if (response.data.success) {

                navigate(
                    `/verify-email?userId=${response.data.userId}&email=${encodeURIComponent(formData.email)}`
                );

            } else {

                setError(
                    response.data.message ||
                    "Registration failed."
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
            title="Create Your Account"
            subtitle="Start your innovation journey today."
            visualTitle="Build the Future."
            visualText="The best way to predict the future is to create it."
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
                        Full Name
                    </label>

                    <div className="input-wrapper">

                        <span>
                            👤
                        </span>

                        <input
                            type="text"
                            name="name"
                            placeholder="Enter your full name"
                            value={formData.name}
                            onChange={handleChange}
                        />

                    </div>

                </div>


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
                            placeholder="Create a password"
                            value={formData.password}
                            onChange={handleChange}
                        />

                    </div>

                </div>


                <div className="input-group">

                    <label>
                        Confirm Password
                    </label>

                    <div className="input-wrapper">

                        <span>
                            🔒
                        </span>

                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirm your password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                        />

                    </div>

                </div>


                <button
                    type="submit"
                    className="btn btn-primary full-btn"
                    disabled={loading}
                >

                    {loading
                        ? "Creating Account..."
                        : "Create Account"
                    }

                    {!loading && (
                        <span>→</span>
                    )}

                </button>


                <div className="auth-footer">

                    Already have an account?{" "}

                    <Link
                        to="/login"
                        className="auth-link"
                    >
                        Login
                    </Link>

                </div>

            </form>

        </AuthLayout>

    );
}

export default Register;