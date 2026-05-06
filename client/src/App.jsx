import { BrowserRouter, Routes, Route  } from "react-router-dom"
import Forms from "./pages/Forms"
import Logo from "./pages/Logo"

const App = () => {
  return (
    <div className="main">
      <BrowserRouter
              future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
        >
        <Routes>
          <Route path="/" element={<Logo />}/>
          <Route path="/forms" element={<Forms />}/>
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
