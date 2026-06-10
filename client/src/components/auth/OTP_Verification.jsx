import { toast } from "react-toastify";

const OTP_Verification = ({ setActiveForm }) => {
    const handleSubmit = async (e) => {
        e.preventDefault();

        const body = "";
        
        const response = await fetch("http://localhost:5000/api/auth/signup", {
            method: "POST",
            headers: { "content-type": "application/json" },
            credentials: "include",
            body: JSON.stringify(body)
        });

        const data = await response.json();

        if (response.ok) {
            toast.success(data.message || "Account is created");
            setActiveForm("login");
        } else {
            toast.error(data.message);
        }
    };
    return (
        <div className="forgot-box" id="recovery-code">
            <form onSubmit={handleSubmit} method="post">
                <h1 className="form-h1">OTP Verifiation</h1>
                <input className="inputes" type="numbers" name="forgot-recovery_pin" placeholder="Enter recovery code." required />
                <div className="forms-links">
                    <p>We send you a recovery code on registerd email. After entering code press next button.</p>
                </div>
                <div style={{ display: "flex", gap: "20px", width: "100%", justifyContent: "center" }}>
                    <button type="submit" className="login-btn">Submit</button>
                    <button onClick={() => setActiveForm("login")} className="login-btn">Back</button>
                </div>
            </form>
        </div>
    )
}

export default OTP_Verification
