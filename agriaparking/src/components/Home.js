import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

const PRICE_PER_MINUTE = 5;
const levelMaps = ['/map1.png', '/map2.png', '/map3.png']; 

const Booking = () => {
  const navigate = useNavigate();
  const [availableSpots, setAvailableSpots] = useState([]);
  const [selectedSpotId, setSelectedSpotId] = useState("");
  const currentHour = new Date().getHours();
  const [startHour] = useState(currentHour);
  const [endHour, setEndHour] = useState("");
  const [calculatedDuration, setCalculatedDuration] = useState(0);
  const [price, setPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0); 
  const [durationHours, setDurationHours] = useState("");
  const hours = Array.from({ length: 24 }, (_, i) => i);

  useEffect(() => {
    const fetchSpots = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await axios.get('http://localhost:5000/api/parking-spots/available');
        setAvailableSpots(response.data);
      } catch (err) {
        console.error("Hiba a szabad helyek lekérésekor:", err);
        setError('Nem sikerült betölteni a szabad helyeket. Próbáld újra később.');
        setAvailableSpots([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSpots();
  }, []);
  useEffect(() => {
    if (durationHours !== "") {
      const durationInMinutes = parseInt(durationHours) * 60;
      setCalculatedDuration(durationInMinutes);
      setPrice(durationInMinutes * PRICE_PER_MINUTE);
    } else {
      setCalculatedDuration(0);
      setPrice(0);
    }
  }, [durationHours]);

  const handleProceedToPayment = () => {
    if (!selectedSpotId || durationHours === "" || calculatedDuration <= 0) {
      alert("Kérlek, válassz egy parkolóhelyet és érvényes kezdő/vég órát (a végóra legyen későbbi, mint a kezdőóra)!");
      return;
    }
    const selectedSpotObject = availableSpots.find(spot => spot.spot_id === parseInt(selectedSpotId, 10));
    const spotName = selectedSpotObject ? selectedSpotObject.spot_name : 'Ismeretlen hely';
    console.log(`Navigating to payment with: spotId=${selectedSpotId}, spotName=${spotName}, durationMinutes=${calculatedDuration}, price=${price}`);
    navigate('/payment', {
      state: {
        spotId: parseInt(selectedSpotId, 10),
        spotName: spotName,
        durationMinutes: calculatedDuration,
        price: price
      }
    });
  };
  const handleLevelChange = (action) => {
    setCurrentLevelIndex((prevIndex) => {
        if (action === 'decrease' && prevIndex > 0) {
            return prevIndex - 1;
        }
        if (action === 'increase' && prevIndex < levelMaps.length - 1) {
            return prevIndex + 1;
        }
        return prevIndex;
    });
  };
  return (
    <div className="min-h-screen bg-blue-300 p-4 sm:p-6 md:p-8 flex items-center justify-center">
      <div className="bg-white rounded-lg p-4 sm:p-6 shadow-md w-full max-w-screen-sm md:max-w-lg lg:max-w-xl">
        <h1 className="text-2xl font-bold text-blue-700 mb-6">Parkolóhely Foglalása</h1>
        <div className="mb-6 border-b pb-4">
          <h2 className="text-center font-semibold text-lg mb-2">{currentLevelIndex + 1}. Szint Térképe</h2>
          <div className="flex justify-center space-x-4 mb-4">
            <button onClick={() => handleLevelChange('decrease')} disabled={currentLevelIndex === 0} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed">Lejjebb 🔽</button>
            <button onClick={() => handleLevelChange('increase')}  disabled={currentLevelIndex === levelMaps.length - 1} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed">🔼 Feljebb</button>
          </div>
          <img src={levelMaps[currentLevelIndex]} alt={`${currentLevelIndex + 1}. szint térképe`} className="w-full max-w-full sm:max-w-md mx-auto border rounded"/>
        </div>
        {loading && <p className="text-gray-600">Szabad helyek betöltése...</p>}
        {error && <p className="text-red-600 mb-4">{error}</p>}

        {!loading && !error && (<>
          {availableSpots.length === 0 && (<p className="text-orange-500 text-xl my-6">Jelenleg nincs szabad parkolóhely.</p>)}
          {availableSpots.length > 0 && (
            <div className="space-y-4 text-left">
              <div className="mb-4">
                <label htmlFor="spot-select" className="block font-semibold mb-1">Válassz parkolóhelyet:</label>
                <select
                  id="spot-select"
                  value={selectedSpotId}
                  onChange={(e) => setSelectedSpotId(e.target.value)}
                  className="w-full p-2 border rounded bg-white"
                  required>
                  <option value="" disabled>-- Kérlek válassz --</option>
                  {availableSpots.map((spot) => (<option key={spot.spot_id} value={spot.spot_id}>{spot.spot_name}</option>))}
                </select>
              </div>
              <p className="mb-2 font-semibold text-gray-700">Kezdőidő: {String(startHour).padStart(2, '0')}:00 (jelenlegi óra)</p>
              <div className="mb-4">
                <label htmlFor="duration" className="block font-semibold mb-1">Hány órát szeretnél parkolni?</label>
                <select
                  id="duration"
                  value={durationHours}
                  onChange={(e) => setDurationHours(e.target.value)}
                  className="w-full p-2 border rounded bg-white"
                  required>
                  <option value="">-- Válassz időtartamot --</option>
                  {[...Array(24).keys()].slice(1).map(h => (<option key={h} value={h}>{h} óra</option>))}
                </select>
              </div>
              <div className="mb-6 pt-4 border-t">
                <label className="block font-semibold text-lg">Fizetendő összeg:</label>
                <p className="text-xl font-bold text-green-600">{price > 0 ? `${price} Ft` : "N/A"}</p>
                {calculatedDuration > 0 && (<p className="text-sm text-gray-600">Időtartam: {calculatedDuration} perc ({calculatedDuration / 60} óra)</p>)}
                <p className="text-sm text-gray-500">({PRICE_PER_MINUTE} Ft / perc)</p>
              </div>
              <button onClick={handleProceedToPayment} disabled={!selectedSpotId || durationHours === "" || calculatedDuration <= 0} className={`w-full py-3 px-4 rounded-full text-white font-semibold transition duration-150 ease-in-out ${(!selectedSpotId || durationHours === "" || calculatedDuration <= 0) ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'}`}>Tovább a fizetéshez</button>
            </div>
          )}
        </>)}
      </div>
    </div>
  );
};

export default Booking;