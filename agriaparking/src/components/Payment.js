import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

const validateExpiryDate = (expiry) => {
    if (!expiry || expiry.length !== 5 || expiry[2] !== '/') {
        return { isValid: false, message: "Érvénytelen dátumformátum (HH/ÉÉ szükséges)." };
    }
    const parts = expiry.split('/');
    const month = parseInt(parts[0], 10);
    const yearShort = parseInt(parts[1], 10);
    if (isNaN(month) || isNaN(yearShort)) {
        return { isValid: false, message: "A dátum csak számokat tartalmazhat." };
    }
    if (month < 1 || month > 12) {
        return { isValid: false, message: "Érvénytelen hónap (1 és 12 között kell lennie)." };
    }
    const currentYearFull = new Date().getFullYear();
    const currentYearShort = currentYearFull % 100;
    const currentMonth = new Date().getMonth() + 1;
    const expiryYearFull = 2000 + yearShort;
    if (expiryYearFull < currentYearFull) {
        return { isValid: false, message: "A kártya lejárati éve már elmúlt." };
    }
    if (expiryYearFull === currentYearFull && month < currentMonth) {
        return { isValid: false, message: "A kártya lejárati hónapja ebben az évben már elmúlt." };
    }
    return { isValid: true, message: "" };
};

const Payment = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const {spotId, spotName, durationMinutes, price, reservationDate, isDailyBooking} = location.state || {};
    const [cardNumber, setCardNumber] = useState("");
    const [name, setName] = useState("");
    const [expiryDate, setExpiryDate] = useState("");
    const [cvc, setCvc] = useState("");
    const formatCardNumber = (value) => value.replace(/\D/g, "").substring(0, 16).replace(/(.{4})/g, "$1 ").trim();
    const handleCardNumberChange = (e) => setCardNumber(formatCardNumber(e.target.value));
    const formatExpiryDate = (value) => {
        const numeric = value.replace(/\D/g, "").substring(0, 4);
        return numeric.length >= 3 ? `${numeric.slice(0, 2)}/${numeric.slice(2)}` : numeric;
    };
    const handleExpiryChange = (e) => setExpiryDate(formatExpiryDate(e.target.value));
    const handleCvcChange = (e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 3));
    useEffect(() => {
        const isHourlyValid = spotId && spotName && durationMinutes !== undefined && price !== undefined;
        const isDailyValid = spotId && spotName && reservationDate && price !== undefined && isDailyBooking === true;
        if (!isHourlyValid && !isDailyValid) {
            setError("Foglalási adatok hiányoznak vagy érvénytelenek...");
        }
    }, [spotId, spotName, durationMinutes, price, reservationDate, isDailyBooking, navigate]);
    const handleBookingSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        const isHourlyValid = spotId && durationMinutes !== undefined;
        const isDailyValid = spotId && reservationDate && isDailyBooking === true;
        if (!isHourlyValid && !isDailyValid) {
            setError("Hiba: Hiányzó foglalási adatok...");
            return;
        }
        if (!cardNumber || !name || !expiryDate || !cvc) {
            setError("Kérlek, tölts ki minden fizetési mezőt!");
            return;
        }
        const expiryValidation = validateExpiryDate(expiryDate);
        if (!expiryValidation.isValid) {
            setError(expiryValidation.message);
            return;
        }
        setIsLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
            setError("Hitelesítés szükséges a foglaláshoz. Jelentkezz be újra.");
            setIsLoading(false);
            navigate('/');
            return;
        }
        try {
            console.log("Fizetési folyamat elindítva...");
            await new Promise(resolve => setTimeout(resolve, 1000));
            console.log("Fizetés sikeres (szimulált)!");
            const config = { headers: { Authorization: `Bearer ${token}` } };
            let response;
            let successMsg;
            if (isDailyBooking) {
                console.log("Attempting to create DAILY reservation...");
                const dailyReservationData = { spotId, reservationDate };
                response = await axios.post('http://localhost:5000/api/reservations/daily', dailyReservationData, config);
                successMsg = `Sikeres egész napos foglalás a(z) ${spotName} helyre ${reservationDate} napra!`;
            } else {
                console.log("Attempting to create HOURLY reservation...");
                const hourlyReservationData = { spotId, durationMinutes };
                response = await axios.post('http://localhost:5000/api/reservations', hourlyReservationData, config);
                const endTime = response.data.endTime ? new Date(response.data.endTime).toLocaleString('hu-HU') : 'ismeretlen';
                successMsg = `Sikeres foglalás a(z) ${spotName} helyre ${durationMinutes} percre! Várható lejárati idő: ${endTime}`;
            }
            setSuccessMessage(successMsg);
            setCardNumber(''); setName(''); setExpiryDate(''); setCvc('');
            setTimeout(() => navigate('/home'), 3500);
        } catch (err) {
            console.error("Hiba a fizetés vagy foglalás során:", err.response || err);
            if (err.response) {
                if (err.response.status === 401 || err.response.status === 403) {
                    setError("Hitelesítés sikertelen vagy lejárt. Jelentkezz be újra.");
                    localStorage.removeItem('token'); localStorage.removeItem('user_id');
                    navigate('/');
                } else if (err.response.status === 409) {
                     const conflictMessage = isDailyBooking
                        ? "Ez a hely erre a napra már foglalt. Próbálj másikat foglalni."
                        : "A választott hely időközben foglalt lett. Próbálj meg másikat foglalni.";
                     setError(err.response.data.message || conflictMessage);
                     setTimeout(() => navigate(isDailyBooking ? '/pre-booking' : '/home'), 3000);
                } else {
                    setError(err.response.data.message || "Hiba történt a foglalás feldolgozása közben.");
                }
            } else {
                 setError("Hálózati hiba vagy a szerver nem elérhető.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-blue-300 p-4 sm:p-8 flex flex-col items-center justify-center">
            <form onSubmit={handleBookingSubmit} className="bg-white rounded-lg p-6 shadow-md w-full max-w-md text-center">
                <h2 className="text-xl font-semibold text-blue-700 mb-6">Foglalás Véglegesítése és Fizetés</h2>
                <div className="mb-6 p-4 border border-blue-200 rounded-lg bg-blue-50 text-left">
                    <h3 className="text-lg font-medium text-gray-800 mb-2">Foglalás Részletei:</h3>
                    {isDailyBooking ? (<>
                        <p><span className="font-semibold">Hely:</span> {spotName}</p>
                        <p><span className="font-semibold">Dátum:</span> {reservationDate}</p>
                        <p><span className="font-semibold">Típus:</span> Egész napos</p>
                        <p><span className="font-semibold">Napidíj:</span> {price} Ft</p>
                        </>) : (<>
                        <p><span className="font-semibold">Hely:</span> {spotName}</p>
                        <p><span className="font-semibold">Időtartam:</span> {durationMinutes} perc</p>
                        <p><span className="font-semibold">Fizetendő:</span> {price} Ft</p>
                    </>)}
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-4 pt-4 border-t">Fizetési adatok</h3>
                <div className="space-y-4 mb-6">
                    <input type="text" placeholder="Kártyaszám" value={cardNumber} onChange={handleCardNumberChange} className="w-full border rounded-full px-4 py-2 tracking-widest" maxLength="19" disabled={isLoading} required/>
                    <input type="text" placeholder="Név a kártyán" value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded-full px-4 py-2" disabled={isLoading} required/>
                    <div className="flex space-x-2">
                        <input type="text" placeholder="Lejárati dátum (HH/ÉÉ)" value={expiryDate} onChange={handleExpiryChange} className="w-full border rounded-full px-4 py-2 text-center" maxLength="5" disabled={isLoading} required/>
                        <input type="password" inputMode="numeric" pattern="[0-9]{3}" placeholder="CVC" title="A kártya hátoldalán lévő 3 jegyű kód" value={cvc} onChange={handleCvcChange} className="w-20 border rounded-full px-2 py-2 text-center" maxLength="3" disabled={isLoading} required autoComplete="cc-csc"/>
                    </div>
                </div>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                {successMessage && <p className="text-green-500 mb-4">{successMessage}</p>}
                <button type="submit" disabled={isLoading} className={`w-full py-2 px-4 rounded-full text-white font-semibold transition duration-150 ease-in-out ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'}`}>{isLoading ? 'Feldolgozás...' : `Fizetés és Foglalás (${price} Ft)`}</button>
            </form>
        </div>
    );
};

export default Payment;