import { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const OTP_Verification = ({ setActiveForm }) => {
    const [otp, setOtp] = useState("");
    const { setUser } = useAuth();

    const email = localStorage.getItem("verifyEmail");
    const source = localStorage.getItem("verifySource");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(
                "http://192.168.0.114:5000/api/auth/verify-email",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        otp,
                        email,
                        source
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                toast.error(data.message || "Verification failed");
                return;
            }

            toast.success(data.message);

            localStorage.removeItem("verifyEmail");
            localStorage.removeItem("verifySource");

            if (source === "signup") {
                setActiveForm("login");
                return;
            }

            if (source === "login") {
                if (data.accessToken) {
                    localStorage.setItem("token", data.accessToken);
                    setUser(data.user);
                }

                if (!data.completeProfile) {
                    setActiveForm("completeProfile");
                } else {
                    navigate("/dashboard");
                }
            }

        } catch (err) {
            toast.error("Server Error");
            console.error(err);
        }
    };

    return (
        <div className="forgot-box" id="recovery-code">
            <form onSubmit={handleSubmit}>
                <h1 className="form-h1">OTP Verification</h1>

                <input
                    className="inputes"
                    type="text"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                />

                <div className="forms-links">
                    <p>
                        We have sent an OTP to your registered email.
                    </p>
                </div>

                <div
                    style={{
                        display: "flex",
                        gap: "20px",
                        justifyContent: "center",
                    }}
                >
                    <button className="login-btn" type="submit">
                        Verify
                    </button>

                    <button
                        type="button"
                        className="login-btn"
                        onClick={() => {
                            setActiveForm("login")
                        }}
                    >
                        Back
                    </button>
                </div>
            </form>
        </div>
    );
};

export default OTP_Verification;