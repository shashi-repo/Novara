import React, { useState } from "react";
import {
    Link,
    useLocation,
    useNavigate
} from "react-router-dom";

import AuthLayout from "../components/AuthLayout";
import api from "../services/api";

function ResetPassword() {

    const location = useLocation();
    const navigate = useNavigate();

    const params = new URLSearchParams(
        location.search
    );

    const emailFromUrl =
        params.get("email") || "";


    const [formData, setFormData] = useState({

        email: emailFromUrl,
        otp: "",
        password: "",
        confirmPassword: ""

    });


    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");


    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

    };


    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");
        setSuccess("");


        if (
            !formData.email ||
            !formData.otp ||
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


        if (formData.otp.length !== 6) {

            setError(
                "OTP must contain 6 digits."
            );

            return;
        }


        try {

            setLoading(true);

            const response = await api.post(
                "/auth/reset-password",
                {
                    email: formData.email,
                    otp: formData.otp,
                    newPassword: formData.password
                }
            );


            if (response.data.success) {

                setSuccess(
                    "Password reset successfully!"
                );

                setTimeout(() => {

                    navigate("/login");

                }, 1500);

            } else {

                setError(
                    response.data.message ||
                    "Password reset failed."
                );

            }

        } catch (err) {

            setError(
                err.response?.data?.message ||
                "Unable to reset password."
            );

        } finally {

            setLoading(false);

        }

    };


    return (

        <AuthLayout
            title="Reset Your Password"
            subtitle="Enter your verification code and create a new password."
            visualTitle="You're Secure."
            visualText="Create a strong new password and get back to building innovative ideas."
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
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                        />

                    </div>

                </div>


                <div className="input-group">

                    <label>
                        Verification Code
                    </label>

                    <div className="input-wrapper">

                        <span>
                            🔢
                        </span>

                        <input
                            type="text"
                            name="otp"
                            maxLength="6"
                            inputMode="numeric"
                            placeholder="Enter 6-digit OTP"
                            value={formData.otp}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    otp: e.target.value.replace(
                                        /\D/g,
                                        ""
                                    )
                                })
                            }
                        />

                    </div>

                </div>


                <div className="input-group">

                    <label>
                        New Password
                    </label>

                    <div className="input-wrapper">

                        <span>
                            🔒
                        </span>

                        <input
                            type="password"
                            name="password"
                            placeholder="Create new password"
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
                            placeholder="Confirm new password"
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
                        ? "Resetting..."
                        : "Reset Password"
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

export default ResetPassword;