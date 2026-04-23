import React, { useContext, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Icons } from '../assets/icons';
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';

const ResetPassword = () => {

    axios.defaults.withCredentials = true;

    const { backendUrl } = useContext(AppContext);
    const [loading, setLoading] = useState(false);

    // ✅ STATES
    const [email, setEmail] = useState('');
    const [isEmailSent, setIsEmailSent] = useState(false);
    const [isOtpSubmitted, setIsOtpSubmitted] = useState(false);
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const inputRefs = useRef([]);
    const navigate = useNavigate();

    // 🔹 STEP 1: SEND OTP
    const handleSendOtp = async (e) => {
        e.preventDefault();

        if (!email) return toast.error("Enter your email");

        try {
            setLoading(true);

            const response = await axios.post(
                backendUrl + "/send-reset-otp?email=" + email
            );

            if (response.status === 200) {
                toast.success("OTP sent to email");
                setIsEmailSent(true);
            }

        } catch (error) {
            console.log("SEND OTP ERROR:", error.response);
            toast.error(error.response?.data?.message || "Error sending OTP");
        } finally {
            setLoading(false);
        }
    };

    // 🔹 STEP 2: VERIFY OTP
    const handleVerifyOtp = async (e) => {
        e.preventDefault();

        const enteredOtp = inputRefs.current.map(input => input.value).join("");

        if (enteredOtp.length !== 6) {
            return toast.error("Enter valid 6-digit OTP");
        }
            setOtp(enteredOtp);
            setIsOtpSubmitted(true);
            toast.success("OTP Verified");
    };

    // 🔹 STEP 3: RESET PASSWORD
    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (!newPassword) {
            return toast.error("Enter new password");
        }

        try {
            setLoading(true);

            const response = await axios.post(
                backendUrl + "/reset-password",
                {
                    email,
                    otp,
                    newPassword
                }
            );

            if (response.status === 200) {
                toast.success("Password reset successful");
                navigate("/login");
            }

        } catch (error) {
            console.log("RESET ERROR:", error.response);
            toast.error(error.response?.data?.message || "Error resetting password");
        } finally {
            setLoading(false);
        }
    };

    // 🔹 INPUT HANDLERS
    const handleChange = (e, index) => {
        const value = e.target.value.replace(/\D/, "");
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
            if (inputRefs.current[index]) {
                inputRefs.current[index].value = digit;
            }
        });
    };

    return (
        <div className="bg-neutral-primary w-full absolute top">

            {/* HEADER */}
            <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
                <Link to="/" className="flex items-center cursor-pointer">
                    <div className="relative flex items-center justify-center">
                        <div className="animate-spin [animation-duration:3s]">
                            <img src={Icons.logo} alt="Authify logo" width={50} height={50} />
                        </div>
                        <img src={Icons.check} alt="Check icon" className="absolute" width={20} height={20} />
                    </div>
                    <span className="font-bold text-balance text-3xl text-gray-800 ml-2">
                        Authify
                    </span>
                </Link>
            </div>

            {/* ✅ STEP 1: EMAIL */}
            {!isEmailSent && (
                <div className="flex relative bottom-20 top justify-center items-center h-screen w-full">
                    <form onSubmit={handleSendOtp} className="form py-4">
                        <h1 className="text-2xl font-semibold mb-4 text-center text-gray-800">Reset Password</h1>
                        <p className="text-gray-500 text-center py-4 mb-8">Enter your email to reset your password.</p>

                        <div className="flex justify-center mb-8 py-4">
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-64 text-center text-xl font-bold border-2 py-4 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                placeholder="Enter your email"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full py-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                            disabled={loading}
                        >
                            {loading ? 'Sending...' : 'Send OTP'}
                        </button>
                    </form>
                </div>
            )}

            {/* ✅ STEP 2: OTP */}
            {!isOtpSubmitted && isEmailSent && (
                <div className="flex relative bottom-20 top justify-center items-center h-screen w-full">
                    <form onSubmit={handleVerifyOtp} className="form py-4">
                        <h1 className="text-2xl font-semibold mb-4 text-center text-gray-800">Email Verify OTP</h1>
                        <p className="text-gray-500 text-center py-4 mb-8">Enter the 6-digit code sent to your email.</p>

                        <div className="flex justify-between mb-8 py-4" onPaste={handlePaste}>
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
                                />
                            ))}
                        </div>

                        <button
                            type="submit"
                            className="w-full py-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                            disabled={loading}
                        >
                            {loading ? 'Verifying...' : 'Verify OTP'}
                        </button>
                    </form>
                </div>
            )}

            {/* ✅ STEP 3: NEW PASSWORD */}
            {isOtpSubmitted && isEmailSent && (
                <div className="flex relative bottom-20 top justify-center items-center h-screen w-full">
                    <form onSubmit={handleResetPassword} className="form py-4">
                        <h1 className="text-2xl font-semibold mb-4 text-center text-gray-800">Set New Password</h1>
                        <p className="text-gray-500 text-center py-4 mb-8">Enter your new password.</p>

                        <div className="flex justify-center mb-8 py-4">
                            <input
                                type="password"
                                required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-64 text-center text-xl font-bold border-2 py-4 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                placeholder="Enter new password"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full py-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                            disabled={loading}
                        >
                            {loading ? 'Updating...' : 'Reset Password'}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default ResetPassword;