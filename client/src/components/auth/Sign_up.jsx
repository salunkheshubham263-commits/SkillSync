import { useState } from "react"
import { toast } from "react-toastify";

const Sign_up = ({ setActiveForm }) => {

    const [first_name, setFirstName] = useState("");
    const [last_name, setLastName] = useState("");
    const [username, setUserName] = useState("");
    const [email, setEmail] = useState("");
    const [age, setAge] = useState("");
    const [password, setPassword] = useState("");

    const onSubmitForm = async (e) => {
        e.preventDefault();
        try {
            const body = { first_name, last_name, username, email, age, password };
            const response = await fetch("http://localhost:5000/api/auth/signup", {
                method: "POST",
                headers: { "content-type": "application/json" },
                credentials: "include",
                body: JSON.stringify(body)
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(data.message || "Account is created");
                setActiveForm("otpVerification");
            } else {
                toast.error(data.message);
            }
        } catch (err) {
            console.error(err.message);
        }
    }

    return (
        <div className="sign-box">
            <form method="post" onSubmit={onSubmitForm}>
                <h1 className="form-h1">Sign Up</h1>
                <input className="inputes" type="name" name="first-name" placeholder="Enter your first name" value={first_name} onChange={e => setFirstName(e.target.value)} required />
                <input className="inputes" type="name" name="last-name" placeholder="Enter your last name" value={last_name} onChange={e => setLastName(e.target.value)} required />
                <input className="inputes" type="name" name="username" placeholder="Create a username" value={username} onChange={e => setUserName(e.target.value)} required />
                <input className="inputes" type="email" name="sign-email" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} required />
                <input className="inputes" type="number" name="age" placeholder="Enter your age" value={age} onChange={e => setAge(e.target.value)} required />
                <input className="inputes" type="password" name="sign-password" placeholder="Create a strong password" value={password} onChange={e => setPassword(e.target.value)} required />
                <div style={{ display: "flex", gap: "20px", width: "100%", justifyContent: "center" }}>
                    <button type="submit" className="login-btn">Submit</button>
                    <button onClick={() => setActiveForm("login")} className="login-btn">Back</button>
                </div>
            </form>
        </div>
    )
}

export default Sign_up
