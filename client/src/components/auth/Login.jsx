const Login = ({ setActiveForm }) => {

    return (
        <div className="login-box">
            <h1 className="form-h1">Login</h1>
            <form method="post">
                <input className="inputes" name="login-email" type="email" placeholder="Enter your registered Email Id..." required />
                <input className="inputes" name="login-password" type="password" placeholder="Enter your password..." required /><br />
                <div className="forms-links">
                    <p>Don't have an account? <a onClick={() => setActiveForm("signUp")}>Create One!</a></p>
                    <p>If you forgot password <a onClick={() => setActiveForm("forgot")}>Click Here!</a></p>
                </div>
                <div style={{ display: "flex", width: "100%", justifyContent: "center" }}>
                    <button type="submit" className="login-btn">Login</button>
                </div>
            </form>
        </div >
    )
}

export default Login
