import React, { useState } from "react";
import {
    Link,
    useLocation,
    useNavigate
} from "react-router-dom";

import AuthLayout from "../components/AuthLayout";
import api from "../services/api";

function VerifyEmail() {

    const location = useLocation();
    const navigate = useNavigate();

    const params = new URLSearchParams(
        location.search
    );

    const userId = params.get("userId");
    const email = params.get("email") || "";

    const [otp, setOtp] = useState("");

    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");


    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");
        setSuccess("");

        if (otp.length !== 6) {

            setError(
                "Please enter the 6-digit OTP."
            );

            return;
        }


        try {

            setLoading(true);

            const response = await api.post(
                "/auth/verify-email",
                {
                    userId,
                    otp
                }
            );


            if (response.data.success) {

                setSuccess(
                    "Email verified successfully!"
                );

                setTimeout(() => {

                    navigate("/login");

                }, 1500);

            } else {

                setError(
                    response.data.message ||
                    "OTP verification failed."
                );

            }

        } catch (err) {

            setError(
                err.response?.data?.message ||
                "Unable to verify OTP."
            );

        } finally {

            setLoading(false);

        }

    };


    const handleResend = async () => {

        setError("");
        setSuccess("");

        try {

            setResending(true);

            const response = await api.post(
                "/auth/resend-otp",
                {
                    userId,
                    email
                }
            );


            if (response.data.success) {

                setSuccess(
                    "A new OTP has been sent to your email."
                );

            } else {

                setError(
                    response.data.message ||
                    "Unable to resend OTP."
                );

            }

        } catch (err) {

            setError(
                err.response?.data?.message ||
                "Unable to resend OTP."
            );

        } finally {

            setResending(false);

        }

    };


    return (

        <AuthLayout
            title="Verify Your Email"
            subtitle={`Enter the 6-digit code sent to ${email}`}
            visualTitle="Almost There!"
            visualText="Verify your email to securely continue your innovation journey."
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


                <div className="otp-container">

                    <label>
                        Verification Code
                    </label>

                    <input
                        className="otp-input"
                        type="text"
                        maxLength="6"
                        inputMode="numeric"
                        placeholder="000000"
                        value={otp}
                        onChange={(e) =>
                            setOtp(
                                e.target.value.replace(
                                    /\D/g,
                                    ""
                                )
                            )
                        }
                    />

                </div>


                <button
                    type="submit"
                    className="btn btn-primary full-btn"
                    disabled={loading}
                >

                    {loading
                        ? "Verifying..."
                        : "Verify Email"
                    }

                    {!loading && (
                        <span>→</span>
                    )}

                </button>


                <button
                    type="button"
                    className="resend-btn"
                    onClick={handleResend}
                    disabled={resending}
                >

                    {resending
                        ? "Sending..."
                        : "Resend verification code"
                    }

                </button>


                <div className="auth-footer">

                    Already verified?{" "}

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

export default VerifyEmail;