import React from "react";

const Contact = () => {
  return (
    <div className="min-h-screen bg-blue-300 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-md">
        <h2 className="text-xl font-bold text-blue-700 text-center mb-6">Kapcsolat</h2>
        <div className="space-y-4 text-gray-700">
          <div>
            <p className="font-semibold">Email:</p>
            <p>info@agriaparking.hu</p>
          </div>
          <div>
            <p className="font-semibold">Telefonszám:</p>
            <p>+36 30 123 4567</p>
          </div>
          <div>
            <p className="font-semibold">Cím:</p>
            <p>3300 Eger, Kossuth Lajos utca 5.</p>
          </div>
          <div>
            <p className="font-semibold">Ügyfélszolgálat nyitvatartás:</p>
            <p>Hétfő–Péntek: 08:00 – 18:00</p>
            <p>Szombat–Vasárnap: 09:00 – 14:00</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;