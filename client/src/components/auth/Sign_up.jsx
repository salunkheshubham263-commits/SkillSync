const Sign_up = ({setActiveForm}) => {
    return (
        <div className="sign-box">
            <form method="post">
                <h1 className="form-h1">Sign Up</h1>
                <input className="inputes" type="email" name="sign-email" placeholder="Enter your email" required />
                <input className="inputes" type="name" name="first-name" placeholder="Enter your first name" required />
                <input className="inputes" type="name" name="last-name" placeholder="Enter your last name" required />
                <input className="inputes" type="number" name="age" placeholder="Enter your age" required/>
                <input className="inputes" type="password" name="sign-password" placeholder="Create a strong password" required/>
                <div style={{ display: "flex", gap: "20px", width: "100%", justifyContent: "center" }}>
                    <button type="submit" className="login-btn">Submit</button>
                    <button onClick={() => setActiveForm("login")} className="login-btn">Back</button>
                </div>
            </form>
        </div>
    )
}

export default Sign_up
