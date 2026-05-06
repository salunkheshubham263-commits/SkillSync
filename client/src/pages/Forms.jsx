import { useState } from "react"
import Change_pass from "../components/Change_pass"
import Forgot from "../components/Forgot"
import Login from "../components/Login"
import PageWrapper from "../components/PageWrapper"
import Recovery_code from "../components/Recovery_code"
import Sign_up from "../components/Sign_up"

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
      </div>
    </PageWrapper>
  )
}

export default Forms
