import React, { useState, useRef, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Added Link
import { Icons } from '../assets/icons'; 
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const Menubar = () => {
  const navigate = useNavigate(); 
  const { userData, setUserData, setIsLoggedIn, backendUrl } = useContext(AppContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const logout = async () => {
    try {
      axios.defaults.withCredentials = true;
      const response = await axios.post(backendUrl + "/logout");
      if (response.status === 200) {
        setIsLoggedIn(false);
        setUserData(null);
        navigate("/");
        toast.success("Logged out");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };
  const sendVerificationOtp = async () => {
          try {
              axios.defaults.withCredentials = true;
              const response = await axios.post(backendUrl + "/send-otp");
              if (response.status === 200) {
              navigate("/email-verify");
                  toast.success("OTP sent to your email");
              } else {
                  toast.error("Unable to send OTP.");
              }
          } catch (error) {
              toast.error(error.response?.data?.message || error.message);
          }
      };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="bg-neutral-primary fixed w-full top z-20">
      <div className="max-w-auto flex flex-wrap items-center justify-between mx-auto p-4">
        <Link to="/" className="flex items-center">
          <div className="relative flex items-center justify-center">
            <div className="animate-spin [animation-duration:3s]">
              <img src={Icons.logo} alt="Authify logo" width={50} height={50} />
            </div>
            <img src={Icons.check} alt="Check icon" className="absolute" width={20} height={20} /> 
          </div>
          <span className="font-bold text-3xl text-gray-800 ml-2">Authify</span>
        </Link>
        {userData ? (
          <div className="relative" ref={dropdownRef}>
            <div 
              className="flex bg-gray-800 profile shadow-box-up rounded-4xl justify-center items-center dark:bg-box-dark dark:shadow-box-dark-out" 
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
                  <div class="w-5 dark:shadow-buttons-box-dark  md:px-3 md:py-3 items-center text-light-blue-light hover:text-white dark:text-gray-400 border-2 inline-flex justify-center mr-4 last-of-type:mr-0 p-2.5 border-transparent bg-light-secondary shadow-button-flat-nopressed hover:border-2 hover:shadow-button-flat-pressed focus:opacity-100 focus:outline-none active:border-2 active:shadow-button-flat-pressed font-medium rounded-full text-sm text-center dark:bg-button-curved-default-dark dark:shadow-button-curved-default-dark dark:hover:bg-button-curved-pressed-dark dark:hover:shadow-button-curved-pressed-dark dark:active:bg-button-curved-pressed-dark dark:active:shadow-button-curved-pressed-dark dark:focus:bg-button-curved-pressed-dark dark:focus:shadow-button-curved-pressed-dark dark:border-0">
                   
                  {userData?.name?.charAt(0).toUpperCase()}

                      {/* <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                           <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path>
                      </svg> */}
                  </div>
            </div>
            {dropdownOpen && (
  <div className="absolute right-16 top-0 mt-2 bg-white rounded-md shadow-lg profile z-10 border-gray-800 border-2">
    
    {/* Corrected property name from isAccountVerified to isAccVerified */}
    {!userData?.accVerified && (
  <button 
    className="flex items-center whitespace-nowrap text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
    onClick={sendVerificationOtp}
  >
    Verify Email
  </button>
)}
    <button 
      onClick={logout} 
      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
    >
      Logout
    </button>
  </div>
  
)}
</div>
        ) : (
          <div className="items-center justify-between hidden w-full md:flex md:w-auto mt-4">
          <button 
            className="button flex border-2 border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-amber-50 rounded-lg transition-colors duration-300 px-6 py-2 font-medium"
            onClick={() => navigate('/login')}
          >
            <span className="text-lg">Login</span>
          </button>
           </div>
        )}
      </div>
    </nav>
  );
};

export default Menubar;