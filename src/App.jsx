import React from 'react'
import { Routes, Route } from 'react-router-dom'; 
import Home from './pages/Home'; 
import Login from './pages/Login';
import EmailVerify from './pages/EmailVerify';
import ResetPassword from './pages/ResetPassword';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';



function App() {
  return (
    <div >
    <ToastContainer
  position="bottom-center"
  autoClose={3000}
  hideProgressBar={false}
  closeOnClick
  pauseOnHover
  draggable
  theme="colored"
  toastStyle={{
    width: "250px",
    borderRadius: "10px",
    fontSize: "14px",
    padding: "15px",
    textAlign: "center",
  }}
/>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/email-verify" element={<EmailVerify />}/>
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </div>
  )
}

export default App