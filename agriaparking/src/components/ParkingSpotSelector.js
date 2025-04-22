import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ParkingSpotSelector = ({ selectedSpot, onSpotSelect, disabled }) => {
    const [spots, setSpots] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchSpots = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await axios.get('http://localhost:5000/api/parking-spots/available');
                setSpots(response.data);
            } catch (err) {
                console.error("Error fetching available spots:", err);
                setError('Nem sikerült betölteni a szabad helyeket.');
                setSpots([]);
            } finally {
                setLoading(false);
            }
        };
        fetchSpots();
    }, []);
    const handleChange = (event) => {
        onSpotSelect(event.target.value);
    };
    if (loading) {
        return <p className="text-gray-500">Parkolóhelyek betöltése...</p>;
    }
    if (error) {
        return <p className="text-red-500">{error}</p>;
    }
    if (spots.length === 0 && !loading) {
       return <p className="text-orange-500">Jelenleg nincs szabad parkolóhely.</p>;
    }

    return (
        <div className="mb-4">
            <label htmlFor="parking-spot" className="block text-sm font-medium text-gray-700 mb-1">
                Válassz parkolóhelyet:
            </label>
            <select
                id="parking-spot"
                value={selectedSpot}
                onChange={handleChange}
                disabled={disabled || spots.length === 0}
                className="w-full border rounded-full px-4 py-2 bg-white disabled:bg-gray-100">
                <option value="" disabled>-- Válassz --</option>
                {spots.map(spot => (<option key={spot.spot_id} value={spot.spot_id}>{spot.spot_name}</option>))}
            </select>
        </div>
    );
};

export default ParkingSpotSelector;