import { useState } from "react"
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';


const Login = ({ setActiveForm }) => {

    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            const body = { email, password };
            const response = await fetch("http://localhost:5000/api/auth/login", {
                method: "POST",
                headers: { "content-type": "application/json" },
                credentials: "include",
                body: JSON.stringify(body)
            })

            const data = await response.json();

            if (response.ok) {
                toast.success(data.message || "Login successful");
                navigate("/dashboard");
            } else {
                toast.error(data.message || "Please create an account first or enter information correctly!");
            }
        } catch (error) {
            toast.error(error.message || "Login failed");
        }
    }

    return (
        <div className="login-box">
            <h1 className="form-h1">Login</h1>
            <form method="post" onSubmit={onSubmit}>
                <input className="inputes" name="login-email" type="email" placeholder="Enter your registered Email Id..." value={email} onChange={e => setEmail(e.target.value)} required />
                <input className="inputes" name="login-password" type="password" placeholder="Enter your password..." value={password} onChange={e => setPassword(e.target.value)} required /><br />
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
