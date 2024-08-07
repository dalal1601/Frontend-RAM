import React from "react";
import { Navigate,useLocation } from "react-router-dom";



const ProtectedRoute = ({children}) => {

    const isAuthenticated = localStorage.getItem('token')!==null;
    const location = useLocation();

        if(!isAuthenticated){
            return <Navigate to="/" state={{from:location}} replace/>
        }

  return children;
};

export default ProtectedRoute
