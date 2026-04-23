import { createContext, useState, useEffect } from "react";
import axios from "axios"; // Added missing axios
import { toast } from "react-toastify"; // Added missing toast
import { AppConstants } from "../util/constants";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
    axios.defaults.withCredentials = true;

    const backendUrl = AppConstants.BACKEND_URL;
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userData, setUserData] = useState(null); // Changed 'user' to 'userData' to match Header

    const getUserdata = async () => {
    try {
        const response = await axios.get(
            backendUrl + "/profile",
            { withCredentials: true }
        );

        console.log("PROFILE RESPONSE:", response.data); // 🔥 LOG HERE

        if (response.status === 200) {
            setUserData(response.data);
            setIsLoggedIn(true);
        }
    } catch (error) {
        console.error("Profile Fetch Error:", error);
        setIsLoggedIn(false);
        setUserData(null);
    }
};

const getAuthState = async () => {
    try {
        const response = await axios.get(
            backendUrl + "/is-authenticated"
        );

        console.log("AUTH STATE RESPONSE:", response.data); // 🔥 LOG HERE
        
        if (response.status === 200 && response.data === true) {
            setIsLoggedIn(true);
            await getUserdata(); 
        }
        else{
            setIsLoggedIn(false);
        }
    } catch (error) {
        console.error("Auth State Fetch Error:", error);
        setIsLoggedIn(false);
    }
}

useEffect(() => {
    getAuthState();
}, []);

    const contextValue = {
        backendUrl,
        isLoggedIn,
        setIsLoggedIn,
        userData, // Matching the name used in Header
        setUserData,
        getUserdata
    };

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    );
};

export default AppContext;