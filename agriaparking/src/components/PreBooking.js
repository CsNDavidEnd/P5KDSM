import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';

const levelMaps = ['/map1.png', '/map2.png', '/map3.png'];
const DAILY_RATE = 2500;

const PreBooking = () => {
    const navigate = useNavigate();
    const [selectedDate, setSelectedDate] = useState(null);
    const [availableSpots, setAvailableSpots] = useState([]);
    const [selectedSpotId, setSelectedSpotId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    useEffect(() => {
        if (selectedDate) {
            const formattedDate = format(selectedDate, 'yyyy-MM-dd');
            console.log(`Fetching spots for date: ${formattedDate}`);

            const fetchSpotsForDate = async () => {
                setLoading(true);
                setError('');
                setAvailableSpots([]);
                setSelectedSpotId('');
                try {
                    const response = await axios.get(`http://localhost:5000/api/parking-spots/available-for-date?date=${formattedDate}`);
                    setAvailableSpots(response.data);
                    if (response.data.length === 0) {
                        setError('A kiválasztott napon nincs szabad hely.');
                    }
                } catch (err) {
                    console.error("Hiba a napi szabad helyek lekérésekor:", err);
                    setError('Nem sikerült betölteni a helyeket a kiválasztott napra. Próbáld újra később.');
                    setAvailableSpots([]);
                } finally {
                    setLoading(false);
                }
            };
            fetchSpotsForDate();
        } else {
            setAvailableSpots([]);
            setSelectedSpotId('');
            setError('');
        }
    }, [selectedDate]);
    const handleProceedToPayment = () => {
        if (!selectedSpotId || !selectedDate) {
            alert("Kérlek, válassz dátumot és parkolóhelyet!");
            return;
        }

        const selectedSpotObject = availableSpots.find(spot => spot.spot_id === parseInt(selectedSpotId, 10));
        const spotName = selectedSpotObject ? selectedSpotObject.spot_name : 'Ismeretlen hely';
        const formattedDate = format(selectedDate, 'yyyy-MM-dd');

        console.log(`Navigating to payment with: spotId=${selectedSpotId}, spotName=${spotName}, date=${formattedDate}, price=${DAILY_RATE}, isDaily=true`);

        navigate('/payment', {
            state: {
                spotId: parseInt(selectedSpotId, 10),
                spotName: spotName,
                reservationDate: formattedDate,
                price: DAILY_RATE,
                isDailyBooking: true
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
        <div className="min-h-screen bg-blue-300 p-4 sm:p-8 flex flex-col items-center justify-center">
            <div className="bg-white rounded-lg p-6 shadow-md w-full max-w-lg text-center">
                <h1 className="text-2xl font-bold text-blue-700 mb-6">Egész Napos Előfoglalás</h1>
                <div className="mb-6 border-b pb-4">
                    <h2 className="text-center font-semibold text-lg mb-2">{currentLevelIndex + 1}. Szint Térképe</h2>
                    <div className="flex justify-center space-x-4 mb-4">
                        <button onClick={() => handleLevelChange('increase')} disabled={currentLevelIndex === levelMaps.length - 1} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed">🔼 Feljebb</button>
                        <button onClick={() => handleLevelChange('decrease')} disabled={currentLevelIndex === 0} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed">Lejjebb 🔽</button>
                    </div>
                    <img src={levelMaps[currentLevelIndex]} alt={`${currentLevelIndex + 1}. szint térképe`} className="w-full max-w-md mx-auto border rounded"/>
                </div>
                {loading && <p className="text-gray-600">Helyek keresése a kiválasztott napra...</p>}
                {error && !loading && <p className="text-red-600 mb-4">{error}</p>}
                {!loading && (
                    <div className="space-y-4 text-left">
                        <div className="mb-4">
                            <label htmlFor="date-picker" className="block font-semibold mb-1">Válassz napot:</label>
                            <DatePicker
                                id="date-picker"
                                selected={selectedDate}
                                onChange={(date) => setSelectedDate(date)}
                                minDate={tomorrow}
                                dateFormat="yyyy/MM/dd"
                                placeholderText="Kattints a dátum kiválasztásához"
                                className="w-full p-2 border rounded bg-white"
                                wrapperClassName="w-full"/>
                            {!selectedDate && <p className="text-sm text-gray-500 mt-1">A foglalás csak jövőbeli napokra lehetséges.</p>}
                        </div>
                        {selectedDate && availableSpots.length > 0 && !error && (
                            <div className="mb-4">
                                <label htmlFor="spot-select-daily" className="block font-semibold mb-1">Válassz parkolóhelyet:</label>
                                <select id="spot-select-daily" value={selectedSpotId} onChange={(e) => setSelectedSpotId(e.target.value)} className="w-full p-2 border rounded bg-white" required >
                                    <option value="" disabled>-- Kérlek válassz --</option>
                                    {availableSpots.map((spot) => ( <option key={spot.spot_id} value={spot.spot_id}>{spot.spot_name}</option>))}
                                </select>
                                <p className="text-sm text-gray-500 mt-1">A fenti térkép segít a parkolóhely kiválasztásában.</p>
                            </div>
                        )}
                        {selectedDate && selectedSpotId && (
                            <div className="mb-6 pt-4 border-t">
                                <label className="block font-semibold text-lg">Napidíj:</label>
                                <p className="text-xl font-bold text-green-600">{DAILY_RATE} Ft</p>
                                <p className="text-sm text-gray-500">(A kiválasztott nap 00:00-tól 23:59-ig)</p>
                            </div>
                        )}
                        <button onClick={handleProceedToPayment} disabled={!selectedDate || !selectedSpotId || loading} className={`w-full py-3 px-4 rounded-full text-white font-semibold transition duration-150 ease-in-out ${(!selectedDate || !selectedSpotId || loading) ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'}`}>Tovább a fizetéshez (Egész napos)</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PreBooking;