

const Forgot = ({ setActiveForm }) => {
    const handleSubmit = (e) => {
        e.preventDefault();

        setActiveForm("recoveryCode");
    };
    return (
        <div className="forgot-box">
            <form onSubmit={handleSubmit} method="post">
                <h1 className="form-h1">Forgot Password</h1>
                <input className="inputes" type="email" name="forgot-email" placeholder="Enter your registerd email" required />
                <div className="forms-links">
                    <p>Don't have an account? <a onClick={() => setActiveForm("signUp")}>Create One!</a></p>
                    <p>We will send you a recovery code on registerd email. After entering email press next button.</p>
                </div>
                <div style={{ display: "flex", gap: "10px", width: "100%", justifyContent: "center" }}>
                    <button type="submit" className="login-btn">Next</button>
                    <button onClick={() => setActiveForm("login")} className="login-btn">Back</button>
                </div>
            </form>
        </div>
    )
}

export default Forgot
