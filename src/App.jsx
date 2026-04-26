import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import { BrowserRouter } from 'react-router-dom'
import MainRoutes from './routes/MainRoutes'

function App() {
  const [count, setCount] = useState(0)

  return (
     <BrowserRouter>
      <MainRoutes />
    </BrowserRouter>
  )
}

export default App
