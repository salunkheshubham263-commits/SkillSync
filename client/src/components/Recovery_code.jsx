

const Recovery_code = ({setActiveForm}) => {
    const handleSubmit = (e) => {
        e.preventDefault();

        setActiveForm("changePass");
    };
    return (
        <div className="forgot-box" id="recovery-code">
            <form onSubmit={handleSubmit} method="post">
                <h1 className="form-h1">Forgot Password</h1>
                <input className="inputes" type="numbers" name="forgot-recovery_pin" placeholder="Enter recovery code." required />
                <div className="forms-links">
                    <p>We send you a recovery code on registerd email. After entering code press next button.</p>
                </div>
                <div style={{ display: "flex", gap: "20px", width: "100%", justifyContent: "center" }}>
                    <button type="submit" className="login-btn">Next</button>
                    <button onClick={() => setActiveForm("forgot")} className="login-btn">Back</button>
                </div>
            </form>
        </div>
    )
}

export default Recovery_code
