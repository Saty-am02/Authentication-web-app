import React, { useContext, useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Icons } from '../assets/icons';
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';

const EmailVerify = () => {
    axios.defaults.withCredentials = true;
    const { backendUrl, isLoggedIn, userData, getUserdata } = useContext(AppContext);
    const [loading, setLoading] = useState(false);
    const inputRefs = useRef([]);
    const navigate = useNavigate();
    

    const handleChange = (e, index) => {
        const value = e.target.value.replace(/\D/,"");
        e.target.value = value;
        if (value && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !e.target.value && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const paste = e.clipboardData.getData('text').slice(0, 6).split('');
        paste.forEach((digit, index) => {
            if (inputRefs.current[index]) inputRefs.current[index].value = digit;
        });
        const next = paste.length < 6 ? paste.length : 5;
        if (inputRefs.current[next]) inputRefs.current[next].focus();
    };

    const handleVerify = async (e) => {
    if (e) e.preventDefault();
    
    const otp = inputRefs.current.map(input => input.value).join("");
    
    if (otp.length !== 6) {
        toast.error('Please enter a valid 6-digit OTP');
        return;
    }

    setLoading(true);
    try {
         const response = await axios.post(`${backendUrl}/verify-otp`, 
            { otp: otp }, 
            { withCredentials: true } 
        );

        if (response.status === 200) {
    toast.success('Email verified successfully!');

    await getUserdata(); 

    console.log("AFTER VERIFY USER:", userData); // 🔥 LOG HERE

    navigate("/");
}
    } catch (error) {
        const msg = error.response?.data?.message || "Verification failed";
        toast.error(msg);
    } finally {
        setLoading(false);
    }   
};
   useEffect(() => {
    if (isLoggedIn && userData?.accVerified) {
        navigate('/');
    }
}, [isLoggedIn, userData]);

    return (
        <div className="bg-neutral-primary w-full absolute top">
            <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
                <Link to="/" className="flex items-center w-fit">
                    <div className="relative flex items-center justify-center">
                        <div className="animate-spin [animation-duration:3s]">
                            <img src={Icons.logo} alt="Logo" width={50} height={50} />
                        </div>
                        <img src={Icons.check} alt="Check" className="absolute" width={20} height={20} />
                    </div>
                    <span className="font-bold text-3xl text-gray-800 ml-2">Authify</span>
                </Link>
            </div>

            <div className="flex relative bottom-20 top justify-center items-center h-screen w-full">
                <form onSubmit={handleVerify} className="form py-4">
                    <h1 className="text-2xl font-semibold mb-4 text-center text-gray-800">Email Verify OTP</h1>
                    <p className="text-gray-500 text-center py-4 mb-8">Enter the 6-digit code sent to your email.</p>
                    
                    <div className="flex justify-between mb-8 py-4" onPaste={(e) => {
                        const paste = e.clipboardData.getData('text').slice(0, 6).split('');
                        paste.forEach((char, index) => {
                            if (inputRefs.current[index]) inputRefs.current[index].value = char;
                        });
                    }}>
                        {[...Array(6)].map((_, index) => (
                            <input
                                key={index}
                                type="text"
                                maxLength={1}
                                required
                                className="w-12 h-12 text-center text-xl font-bold border-2 py-4 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                ref={el => inputRefs.current[index] = el}
                                onChange={(e) => handleChange(e, index)}
                                onKeyDown={(e) => handleKeyDown(e, index)}
                                onPaste={handlePaste}
                            />
                        ))}
                    </div>
                    <button 
                        type="submit"
                        className="w-full py-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                        disabled={loading}
                    >
                        {loading ? 'Verifying...' : 'Verify Email'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EmailVerify;