
const Change_pass = () => {
    return (
        <div className="forgot-box" id="change-pass">
            <form action="" method="post">
                <h1 className="form-h1">Change Password</h1>
                <input className="inputes" type="password" name="change-password" placeholder="Enter your new password" required/>
                <input className="inputes" type="password" name="change-password" placeholder="Enter your new password again" required/>
                <div className="forms-links">
                    <p>set your new password and don't forget this password.</p>
                </div>
                <div style={{ display: "flex", width: "100%", justifyContent: "center" }}>
                    <button type="submit" className="login-btn">Submit</button>
                </div>
            </form>
        </div>
    )
}

export default Change_pass
