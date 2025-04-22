import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = ({ onLogout }) => {const location = useLocation();

  return (
    <nav className="bg-black text-white px-6 py-4 flex justify-between items-center">
      <h1 className="text-2xl font-bold">AGRIA Parking</h1>
      <div className="space-x-6">
        <Link to="/home" className="hover:text-gray-400">Foglalás</Link>
        <Link to="/pre-booking" className="hover:text-gray-400">Napi Foglalás</Link>
        <Link to="/profile" className="hover:text-gray-400">Profil</Link>
        <Link to="/contact" className="hover:text-gray-400">Kapcsolat</Link>
      </div>
      <div className="ml-4 flex items-center md:ml-6">
        <button onClick={onLogout} className="ml-4 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium">Kijelentkezés</button>
      </div>
    </nav>
  );
};

export default Navbar;