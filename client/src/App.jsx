import { BrowserRouter, Routes, Route  } from "react-router-dom"
import Forms from "./pages/Forms"
import Logo from "./pages/Logo"
import Dashboard from "./pages/Dashboard"
import { ToastContainer } from "react-toastify"

const App = () => {
  return (
    <div className="main">
      <BrowserRouter
              future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
        >
          <ToastContainer />
        <Routes>
          <Route path="/" element={<Logo />}/>
          <Route path="/forms" element={<Forms />}/>
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
