import React, { useState, useContext } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom'; // Added Link here
import { Icons } from '../assets/icons';
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';


const Login = () => {
  const location = useLocation();
  const [isCreatedAcount, setIsCreatedAccount] = useState(location.state?.createAccount || false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { backendUrl,setIsLoggedIn,getUserdata } = useContext(AppContext);
  const navigate = useNavigate(); // Initialize the navigate hook

  // Added 'async' to the handler
  const onSubmitHandler = async (e) => {
    console.log("Sending request to:", `${backendUrl}/register`);
    e.preventDefault();
    axios.defaults.withCredentials = true;
    setLoading(true); 

    
    try {
      if (isCreatedAcount) {
        // --- FIXED REGISTRATION PAYLOAD ---
        const response = await axios.post(`${backendUrl}/register`, {
          name: fullName, // Map the React state 'fullName' to the Java key 'name'
          email,
          password
        });
        
        if (response.status === 201) {
          toast.success('Account created successfully!');
          navigate('/'); 
        } else {
          toast.error('Email already exists!');
        }
      } else {
        // --- LOGIN LOGIC ---
        const response = await axios.post(`${backendUrl}/login`, {
          email,
          password
        });
        
        // Inside Login.jsx -> onSubmitHandler
       if (response.status === 200) {
            setIsLoggedIn(true);
            getUserdata(); 
            toast.success('Logged in successfully!');
            navigate('/');
          } else {
              toast.error('Invalid email or password!');
        }
      }
        } catch (error) {
      // Better error handling for axios
          toast.error(error.response?.data?.message || error.message);
        } finally {
          setLoading(false);
        } 
  };

  return (
    <>
    <div className="bg-neutral-primary w-full absolute top">
  <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
    
    {/* 2. Use Link instead of <a> and remove the onClick from the parent div */}
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
</div>
      
      <div className="flex flex-wrap relative items-center justify-center px-4 top-40">
        <form className="form" onSubmit={onSubmitHandler}>
          {isCreatedAcount ? (
            <p className="form-title text-xl font-semibold mb-6">Create your account</p>
          ) : (
            <p className="form-title text-xl font-semibold mb-6">Sign in to your account</p>
          )}
          
          {isCreatedAcount && (
            <div className="input-container mb-4">
              <input 
                type="text" 
                placeholder="Full Name" 
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setFullName(e.target.value)}
                value={fullName}
                required // Added required attribute
              />
            </div>
          )}
        
          <div className="input-container mb-4">
            <input 
              type="email" 
              placeholder="Enter email" 
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              required
            />
          </div>
          <div className="input-container mb-6">
            <input 
              type="password" 
              placeholder="Enter password" 
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              required
            />
          </div>
          {!isCreatedAcount && (
                <span 
                  className="text-blue-600 cursor-pointer" 
                  onClick={() => navigate('/reset-password')}
                >
                  Forgot password?
                </span>
          )}
          <button 
            type="submit" 
            disabled={loading} // Disable button while loading
            className="submit w-full bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
          >
            {/* Dynamic button text based on state */}
            {loading ? 'Processing...' : (isCreatedAcount ? 'Sign Up' : 'Sign In')}
          </button>

          <div className="mt-4 text-center">
            {isCreatedAcount ? (
              <p>
                Already have an account?{' '}
                <span 
                  className="text-blue-600 cursor-pointer" 
                  onClick={() => setIsCreatedAccount(false)}
                >
                  Login here
                </span>
              </p>
            ) : (
              <p>
                Don't have an account?{' '}
                <span 
                  className="text-blue-600 cursor-pointer" 
                  onClick={() => setIsCreatedAccount(true)}
                >
                  Create one
                </span>
              </p>
            )}
          </div>  
        </form>
      </div>
    </>
  );
};

export default Login;