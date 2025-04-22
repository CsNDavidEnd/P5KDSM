import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import Auth from "./components/Auth";
import Booking from "./components/Home";
import Navbar from "./components/NavBar";
import Payment from "./components/Payment";
import Profile from "./components/Profile";
import Contact from "./components/Contact";
import PreBooking from "./components/PreBooking";
import ProtectedRoute from "./components/Protected";

const AppContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const showNavbar = location.pathname !== "/";

  const handleLogout = () => {
    localStorage.removeItem('user_id');
    localStorage.removeItem('token');
    navigate('/');
  };

  return (<>
      {showNavbar && <Navbar onLogout={handleLogout} />}
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/home" element={<ProtectedRoute><Booking /></ProtectedRoute>}/>
        <Route path="/pre-booking" element={<ProtectedRoute><PreBooking /></ProtectedRoute>}/>
        <Route path="/payment"element={<ProtectedRoute><Payment /></ProtectedRoute>}/>
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>}/>
        <Route path="/contact" element={<ProtectedRoute><Contact /></ProtectedRoute>}/>
      </Routes></>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
