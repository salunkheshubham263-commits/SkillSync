import { useState } from "react"
import Change_pass from "../components/auth/Change_pass"
import Forgot from "../components/auth/Forgot"
import Login from "../components/auth/Login"
import PageWrapper from "../components/common/PageWrapper"
import Recovery_code from "../components/auth/Recovery_code"
import Sign_up from "../components/auth/Sign_up"
import OTP_Verification from "../components/auth/OTP_Verification"

const Forms = () => {
  const [activeForm, setActiveForm] = useState("login");

  return (
    <PageWrapper>
      <div className="form-page">
        {activeForm === "login" && <Login setActiveForm={setActiveForm} />}
        {activeForm === "forgot" && <Forgot setActiveForm={setActiveForm} />}
        {activeForm === "recoveryCode" && <Recovery_code setActiveForm={setActiveForm} />}
        {activeForm === "changePass" && <Change_pass setActiveForm={setActiveForm} />}
        {activeForm === "signUp" && <Sign_up setActiveForm={setActiveForm} />}
        {activeForm === "otpVerification" && <OTP_Verification setActiveForm={setActiveForm} />}
      </div>
    </PageWrapper>
  )
}

export default Forms
