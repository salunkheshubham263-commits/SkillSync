import { useState, useEffect, useContext } from "react"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "../context/Auth_context";
import Change_pass from "../components/auth/Change_pass"
import Forgot from "../components/auth/Forgot"
import Login from "../components/auth/Login"
import PageWrapper from "../components/common/PageWrapper"
import Recovery_code from "../components/auth/Recovery_code"
import Sign_up from "../components/auth/Sign_up"
import OTP_Verification from "../components/auth/OTP_Verification"
import Complete_Profile from "../components/auth/Complete_Profile"
import Loading_screen from "../pages/Loading_screen"

const Forms = () => {
  const [activeForm, setActiveForm] = useState("login");

  const { user, loading } = useContext(AuthContext);
    const navigate = useNavigate();

    // ADD THIS USE-EFFECT:
    useEffect(() => {
        if (!loading) {
            if (user) {
                if (user.completeProfile) {
                    navigate("/dashboard", { replace: true });
                }
            }
        }
    }, [user, loading, navigate]);

    if (loading) {
        return <Loading_screen />; 
    }

    if (user && !user.completeProfile) {
        return (
            <PageWrapper>
                <div className="form-page">
                    <Complete_Profile setActiveForm={setActiveForm} />
                </div>
            </PageWrapper>
        );
    }

  return (
    <PageWrapper>
      <div className="form-page">
        {activeForm === "login" && <Login setActiveForm={setActiveForm} />}
        {activeForm === "forgot" && <Forgot setActiveForm={setActiveForm} />}
        {activeForm === "recoveryCode" && <Recovery_code setActiveForm={setActiveForm} />}
        {activeForm === "changePass" && <Change_pass setActiveForm={setActiveForm} />}
        {activeForm === "signUp" && <Sign_up setActiveForm={setActiveForm} />}
        {activeForm === "otpVerification" && <OTP_Verification setActiveForm={setActiveForm} />}
        {activeForm === "completeProfile" && <Complete_Profile setActiveForm={setActiveForm} />}
      </div>
    </PageWrapper>
  )
}

export default Forms
