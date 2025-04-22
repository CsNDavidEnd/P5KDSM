import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const handleUpdate = () => {
    navigate('/update')
  };

  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    const token = localStorage.getItem("token");

    

    if (!userId || !token) {
      setError("Nem vagy bejelentkezve, vagy a munkamenet lejárt.");
      setIsLoading(false);
      navigate('/');
      return;
    }

    const fetchProfile = async () => {
      setIsLoading(true);
      setError("");
      try {
        const config = {headers: { Authorization: `Bearer ${token}` }};
        const res = await axios.get(`http://localhost:5000/api/profile/${userId}`, config);
        setUserData(res.data);
      } catch (err) {
        console.error("Profile fetch error:", err.response || err);
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          setError("Hitelesítés sikertelen vagy lejárt. Kérlek, jelentkezz be újra.");
          localStorage.removeItem('token');
          localStorage.removeItem('user_id');
          navigate('/');
        } else {
          setError("Nem sikerült betölteni a profil adatokat.");
        }
        setUserData(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);
  if (isLoading) {
    return (
      <div className="min-h-screen bg-blue-300 flex items-center justify-center">
        <p className="text-gray-700 text-lg animate-pulse">Profil betöltése...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen bg-blue-300 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6 shadow-md w-full max-w-md text-center">
          <p className="text-red-600 text-lg">{error}</p>
          <button onClick={() => navigate('/')} className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-full">Vissza a főoldalra</button>
        </div>
      </div>
    );
  }
  if (!userData) {
    return (
      <div className="min-h-screen bg-blue-300 flex items-center justify-center">
        <p className="text-gray-700 text-lg">Nem sikerült adatokat megjeleníteni.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-300 p-4 sm:p-8 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 shadow-md w-full max-w-md text-center">
        <h2 className="text-xl font-semibold text-blue-700 mb-4">Profil</h2>
        <div className="space-y-3 text-left text-gray-700">
          <p><span className="font-semibold">Felhasználónév:</span> {userData.username || 'N/A'}</p>
          <p><span className="font-semibold">Email:</span> {userData.email || 'N/A'}</p>
          <p><span className="font-semibold">Telefon:</span> {userData.phone || 'N/A'}</p>
          <p><span className="font-semibold">Rendszám:</span> {userData.plate || 'N/A'}</p>
          {/* Összesfoglalás }
            <p><span className="font-semibold">Összes foglalás:</span>{userData.totalBookingCount ?? 'N/A'}</p>
          {*/}
        </div>
      </div>
    </div>
  );
};

export default Profile;