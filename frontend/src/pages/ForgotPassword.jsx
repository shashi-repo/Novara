import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import AuthLayout from "../components/AuthLayout";
import api from "../services/api";

function ForgotPassword() {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");


    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");
        setSuccess("");

        if (!email) {

            setError(
                "Please enter your email address."
            );

            return;
        }


        try {

            setLoading(true);

            const response = await api.post(
                "/auth/forgot-password",
                {
                    email
                }
            );


            if (response.data.success) {

                setSuccess(
                    "Password reset OTP has been sent to your email."
                );

                setTimeout(() => {

                    navigate(
                        `/reset-password?email=${encodeURIComponent(email)}`
                    );

                }, 1200);

            } else {

                setError(
                    response.data.message ||
                    "Unable to process request."
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
            title="Forgot Password?"
            subtitle="Enter your email address and we'll send you a verification code."
            visualTitle="Secure Your Account"
            visualText="Don't worry. We'll help you securely recover your Novara account."
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

                {success && (
                    <div className="alert success">
                        {success}
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
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                        />

                    </div>

                </div>


                <button
                    type="submit"
                    className="btn btn-primary full-btn"
                    disabled={loading}
                >

                    {loading
                        ? "Sending..."
                        : "Send Verification Code"
                    }

                    {!loading && (
                        <span>→</span>
                    )}

                </button>


                <div className="auth-footer">

                    Remember your password?{" "}

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

export default ForgotPassword;