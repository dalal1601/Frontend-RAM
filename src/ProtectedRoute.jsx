import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useUserDetails from "../src/hook/useUserDetails";
import useCurrentUserId from "../src/hook/useCurrentUserId";

const ProtectedRoute = ({ children, requiredRole }) => {
  const userDetails = useUserDetails(); // Fetch user details
  const userId = useCurrentUserId(); // Fetch userId
  const location = useLocation();
  
  console.log('userDetails:', userDetails); // Debugging line
  console.log('userId:', userId);

  // Check if userDetails is null (loading state) or if userId is invalid
  if (userDetails === null || userId === null) {
    return <div>Loading...</div>; // Display loading state
  }

  // Check if the user is authenticated
  if (!userDetails || !userDetails.role) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Check if the user has the required role
  if (requiredRole && userDetails.role !== requiredRole) {
    return <Navigate to="/NotFound" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
