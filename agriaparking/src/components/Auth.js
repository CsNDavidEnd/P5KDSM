import axios from 'axios';
import React, {useState} from 'react';
import { useNavigate } from 'react-router-dom';

const Auth = () =>{
  const[loginUsername, setLoginUsername] = useState('');
  const[loginPassword, setLoginPassword] = useState('');
  const[error, setError] = useState('');
  const navigate = useNavigate();
  const [registerData, setRegisterData] = useState({
    username: "",
    password: "",
    email: "",
    phone: "",
    plateNumber: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [loginErrorMessage, setLoginErrorMessage] = useState("");

  const handleLoginChange = (e) => {
    setLoginUsername(e.target.value);
  };
  const handleRegisterChange = (e) => {
    setRegisterData({
      ...registerData,
      [e.target.name]: e.target.value,
    });
  };
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post('http://localhost:5000/api/login', {
        username: loginUsername,
        password: loginPassword,
      });
      console.log(response.data.message);
      if (response.data.token && response.data.userId) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user_id', response.data.userId);
        navigate('/home');
      } else {
        setError('Bejelentkezés sikeres, de a token vagy felhasználói azonosító hiányzik.');
      }
    } catch (err) {
      console.error("Login error:", err.response ? err.response.data : err.message);
      setError(err.response?.data?.message || 'Hiba a bejelentkezés során.');
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setErrorMessage("");
    axios.post('http://localhost:5000/api/register', {
      username: registerData.username,
      passwd: registerData.password,
      email: registerData.email,
      phone: registerData.phone,
      plateNumber: registerData.plateNumber,
    }).then((response) => {
      console.log("Registration successful:", response.data);
      setRegisterData({
        username: "",
        password: "",
        email: "",
        phone: "",
        plateNumber: "",
      });
    }).catch((error) => {
      console.error("Registration failed:", error);
      setErrorMessage("Registration failed. Please try again.");
    });
  };

  return (
    <div className="min-h-screen bg-blue-400 flex items-center justify-center p-4">
      <div className="flex flex-col md:flex-row gap-8 md:gap-16 bg-transparent p-4 md:p-10">
        <form onSubmit={handleLogin} className="bg-white p-6 rounded-lg shadow-md flex flex-col space-y-4 w-full max-w-sm">
          <h2 className="text-center text-xl font-semibold bg-blue-200 py-2 rounded">Login</h2>
          <input type="text" name="username" placeholder="Username" value={loginUsername} onChange={handleLoginChange} className="border p-2 rounded"/>
          <input type="password" name="password" placeholder="Password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="border p-2 rounded"/>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" className="bg-blue-300 hover:bg-blue-500 text-white font-semibold py-2 rounded">Bejelentkezés</button>
        </form>
        <form onSubmit={handleRegister} className="bg-white p-6 rounded-lg shadow-md flex flex-col space-y-4 w-full max-w-sm">
          <h2 className="text-center text-xl font-semibold bg-blue-200 py-2 rounded">Register</h2>
          <input type="text" name="username" placeholder="Username" value={registerData.username} onChange={handleRegisterChange} className="border p-2 rounded"/>
          <input type="password" name="password" placeholder="Password" value={registerData.password} onChange={handleRegisterChange} className="border p-2 rounded"/>
          <input type="email" name="email" placeholder="Email" value={registerData.email} onChange={handleRegisterChange} className="border p-2 rounded"/>
          <input type="text" name="phone" placeholder="Phone number" value={registerData.phone} onChange={handleRegisterChange} className="border p-2 rounded" />
          <input type="text" name="plateNumber" placeholder="License plate" value={registerData.plateNumber} onChange={handleRegisterChange} className="border p-2 rounded"/>
          {errorMessage && ( <div className="text-red-500 text-sm">{errorMessage}</div>)}
          <button type="submit" className="bg-blue-300 hover:bg-blue-500 text-white font-semibold py-2 rounded" >Felhasználó létrehozása</button>
        </form>
      </div>
    </div>
  );
};

export default Auth;