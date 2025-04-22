import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";


const ProtectedRoute = ({ children }) => {
  console.log("--- ProtectedRoute fut ---");
  const location = useLocation();
  const token = localStorage.getItem('token');
  console.log("Talált token:", token);

  if (!token) {
    console.log("NINCS token, átirányítás ide:", "/");
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  try {
    console.log("VAN token, dekódolás...");
    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    console.log("Dekódolt token lejárata:", decodedToken.exp);
    console.log("Jelenlegi idő:", currentTime);

    if (decodedToken.exp < currentTime) {
      console.log("Token LEJÁRT, törlés és átirányítás ide:", "/");
      localStorage.removeItem('token');
      localStorage.removeItem('user_id');
      return <Navigate to="/" replace state={{ from: location }} />;
    }
    console.log("Token ÉRVÉNYES, gyermek komponens renderelése.");
  } catch (error) {
    console.error("Token dekódolási HIBÁ:", error);
    console.log("HIBÁS token, törlés és átirányítás ide:", "/");
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return children;
};

export default ProtectedRoute;