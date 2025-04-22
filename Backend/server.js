const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const util = require('util');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "agriaparking",
    timezone: '+02:00'
});

const query = util.promisify(db.query).bind(db);
const beginTransaction = util.promisify(db.beginTransaction).bind(db);
const commit = util.promisify(db.commit).bind(db);
const rollback = util.promisify(db.rollback).bind(db);

const JWT_SECRET = process.env.JWT_SECRET || 'YOUR_SUPER_SECRET_KEY_REPLACE_ME';

db.connect((err) => {
    if (err) {
        console.error("Database connection failed: " + err.stack);
        process.exit(1);
    }
    console.log("Connected to MySQL database.");
});

app.post('/api/register', async (req, res) => {
    const { username, email, passwd: plainTextPassword, phone, plateNumber } = req.body;

    if (!username || !email || !plainTextPassword || !phone || !plateNumber) {
        return res.status(400).json({ message: "Minden mező kitöltése kötelező." });
    }

    try {
        const saltRounds = 10;
        const password_hash = await bcrypt.hash(plainTextPassword, saltRounds);
        const sql = "INSERT INTO users (username, email, passwd, phone, plateNumber, booking) VALUES (?, ?, ?, ?, ?, 0)";
        const result = await query(sql, [username, email, password_hash, phone, plateNumber]);
        res.status(201).json({ message: "Sikeres regisztráció!", userId: result.insertId });
    } catch (err) {
        console.error("Error registering user:", err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: "A felhasználónév vagy email cím már foglalt." });
        }
        return res.status(500).json({ message: "Hiba a felhasználó regisztrálása közben." });
    }
});

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Felhasználónév és jelszó megadása kötelező." });
    }

    try {
        const sql = 'SELECT user_id, username, passwd FROM users WHERE username = ?';
        const results = await query(sql, [username]);

        if (results.length === 0) {
            return res.status(401).json({ message: 'Hibás felhasználónév vagy jelszó.' });
        }

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.passwd);

        if (!isMatch) {
            return res.status(401).json({ message: 'Hibás felhasználónév vagy jelszó.' });
        }

        const token = jwt.sign({ userId: user.user_id }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ message: 'Sikeres bejelentkezés!', token: token, userId: user.user_id });

    } catch (err) {
        console.error("Database query error during login:", err);
        return res.status(500).json({ message: 'Szerverhiba a bejelentkezés során.' });
    }
});

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];
    if (!token) {
        console.log('Token not found in header');
        return res.status(403).json({ message: 'Nincs token!' });
    }
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            console.error('JWT Verification Error:', err.message);
            return res.status(401).json({ message: 'Érvénytelen vagy lejárt token!' });
        }
        req.userId = decoded.userId;
        next();
    });
};

app.get("/api/profile/:id", verifyToken, async (req, res) => {
    const requestedUserId = req.params.id;
    const authenticatedUserId = req.userId;

    if (authenticatedUserId != requestedUserId) {
        return res.status(403).json({ message: 'Nem férsz hozzá ehhez a profilhoz!' });
    }

    try {
        const userSql = `SELECT user_id, username, email, phone, plateNumber AS plate
                         FROM users
                         WHERE user_id = ?`;
        const userResults = await query(userSql, [authenticatedUserId]);
        if (userResults.length === 0) {
            return res.status(404).json({ message: "Felhasználó nem található." });
        }
        const userData = userResults[0];

        // Összes foglalás száma
        // const totalBookingSql = `SELECT booking FROM users WHERE user_id = ?`;
        // const totalResult = await query(totalBookingSql, [authenticatedUserId]);
        // userData.totalBookingCount = totalResult[0].booking;

        res.json(userData);

    } catch (err) {
        console.error("Database query error in /api/profile:", err);
        return res.status(500).json({ message: "Adatbázis hiba a profiladatok lekérdezésekor." });
    }
});

app.get("/api/parking-spots/available", async (req, res) => {
  try {
      const releaseExpiredSql = `
          UPDATE parking_spots
          SET is_available = TRUE,
              booked_until = NULL,
              current_booking_id = NULL
          WHERE is_available = FALSE
            AND booked_until IS NOT NULL
            AND booked_until < NOW();
      `;
      const updateResult = await query(releaseExpiredSql);
      if (updateResult.affectedRows > 0) {
          console.log(`Released ${updateResult.affectedRows} expired parking spots.`);
      }
      const getAvailableSql = `
          SELECT spot_id, spot_name
          FROM parking_spots
          WHERE is_available = TRUE
          ORDER BY spot_name ASC`;
      const spots = await query(getAvailableSql);
      res.json(spots);
  } catch (err) {
      console.error("Error fetching available spots (or releasing expired):", err);
      res.status(500).json({ message: "Hiba történt a parkolóhelyek lekérdezése közben." });
  }
});

app.get('/api/available', async (req, res) => {
  try {
      const todayDate = format(new Date(), 'yyyy-MM-dd');
      const query = `
          SELECT ps.spot_id, ps.spot_name
          FROM parking_spots ps
          WHERE ps.spot_id NOT IN (
              SELECT r.spot_id
              FROM reservations r
              WHERE NOW() BETWEEN r.start_time AND r.end_time
          )
          AND ps.spot_id NOT IN (
              SELECT dr.spot_id
              FROM daily_reservations dr
              WHERE dr.reservation_date = ?
          )
          ORDER BY ps.spot_name;
      `;
      const [availableSpots] = await db.promise().query(query, [todayDate]);
      res.json(availableSpots);
  } catch (error) {
      console.error("Hiba az elérhető helyek lekérdezésekor (/available):", error);
      res.status(500).json({ message: "Szerverhiba az elérhető helyek lekérdezésekor." });
  }
});

app.get('/api/parking-spots/available-for-date', async (req, res) => {
  const { date } = req.query;
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ message: "Érvénytelen dátumformátum. Használj YYYY-MM-DD formátumot." });
  }
  const requestedDate = new Date(date + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (requestedDate <= today) {
       return res.status(400).json({ message: "Előfoglalás csak jövőbeli napokra lehetséges." });
  }
  try {
      const dayStartTimestamp = `${date} 00:00:00`;
      const dayEndTimestamp = `${date} 23:59:59`;
      const sqlQueryString = ` 
          SELECT ps.spot_id, ps.spot_name
          FROM parking_spots ps
          WHERE ps.spot_id NOT IN (
              -- Azon helyek ID-jai, amelyekre van egész napos foglalás ezen a napon
              SELECT dr.spot_id
              FROM daily_reservations dr
              WHERE dr.reservation_date = ?
          )
          AND ps.spot_id NOT IN (
              -- Azon helyek ID-jai, amelyekre van óránkénti foglalás, ami átfedésben van ezzel a nappal
              SELECT r.spot_id
              FROM reservations r
              WHERE r.end_time > ?   -- A foglalás vége a nap kezdete UTÁN van
                AND r.start_time < ? -- ÉS a foglalás kezdete a nap vége ELŐTT van
          )
          ORDER BY ps.spot_name;
      `;
      const availableSpots = await query(sqlQueryString, [
        date,
        dayStartTimestamp,
        dayEndTimestamp
      ]);
      console.log(`Found ${availableSpots.length} available spots for ${date}`);
      res.json(availableSpots);
  } catch (error) {
      console.error(`[ERROR] Hiba a napi elérhető helyek lekérdezésekor (${date}):`, error);
      res.status(500).json({ message: "Szerverhiba a napi elérhető helyek lekérdezésekor." });
  }
});

app.post("/api/reservations", verifyToken, async (req, res) => {
    const userId = req.userId;
    const { spotId, durationMinutes } = req.body;
    if (!spotId || !durationMinutes || isNaN(parseInt(durationMinutes)) || parseInt(durationMinutes) <= 0) {
        return res.status(400).json({ message: "Érvénytelen kérés: spotId és pozitív durationMinutes szükséges." });
    }
    const duration = parseInt(durationMinutes);
    try {
        await beginTransaction();
        console.log(`Transaction started for user ${userId}, spot ${spotId}`);
        const checkSpotSql = `
            SELECT spot_id, spot_name
            FROM parking_spots
            WHERE spot_id = ? AND is_available = TRUE AND (booked_until IS NULL OR booked_until < NOW())
            FOR UPDATE`;
        const availableSpot = await query(checkSpotSql, [spotId]);
        if (availableSpot.length === 0) {
            await rollback();
            console.log(`Spot ${spotId} is not available or does not exist. Rolling back.`);
            return res.status(409).json({ message: "A kiválasztott hely már foglalt vagy nem elérhető." });
        }
        const spotName = availableSpot[0].spot_name;
        console.log(`Spot ${spotId} (${spotName}) is available. Proceeding with reservation.`);
        const startTime = new Date();
        const endTime = new Date(startTime.getTime() + duration * 60000);
        const insertReservationSql = `
            INSERT INTO reservations (user_id, spot_id, start_time, end_time, status)
            VALUES (?, ?, ?, ?, 'active')`;
        const reservationResult = await query(insertReservationSql, [userId, spotId, startTime, endTime]);
        const newReservationId = reservationResult.insertId;
        console.log(`Reservation ${newReservationId} created for user ${userId}, spot ${spotId}.`);
        const updateSpotSql = `
            UPDATE parking_spots
            SET booked_until = ?, current_booking_id = ?, is_available = FALSE
            WHERE spot_id = ?`;
        await query(updateSpotSql, [endTime, newReservationId, spotId]);
        console.log(`Parking spot ${spotId} updated. Booked until: ${endTime.toISOString()}`);
        const incrementUserBookingSql = "UPDATE users SET booking = booking + 1 WHERE user_id = ?";
        await query(incrementUserBookingSql, [userId]);
        console.log(`Total booking count incremented for user ${userId}.`);
        await commit();
        console.log(`Transaction committed successfully for reservation ${newReservationId}.`);

        res.status(201).json({
            message: `Sikeres foglalás a(z) ${spotName} helyre!`,
            reservationId: newReservationId,
            spotId: spotId,
            spotName: spotName,
            endTime: endTime.toISOString()
        });

    } catch (err) {
        console.error("Error during reservation transaction:", err);
        await rollback();
        console.log("Transaction rolled back due to error.");
        res.status(500).json({ message: "Hiba történt a foglalás feldolgozása közben." });
    }
});

app.post("/api/reservations/daily", verifyToken, async (req, res) => {
  const userId = req.userId;
  const { spotId, reservationDate } = req.body;
  if (!spotId || !reservationDate) {
      return res.status(400).json({ message: "Érvénytelen kérés: spotId és reservationDate szükséges." });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(reservationDate)) {
      return res.status(400).json({ message: "Érvénytelen dátumformátum. Használj YYYY-MM-DD formátumot." });
  }
  const requestedDate = new Date(reservationDate + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (requestedDate <= today) {
      return res.status(400).json({ message: "Előfoglalás csak jövőbeli napokra lehetséges." });
  }
  try {
      const insertSql = `
          INSERT INTO daily_reservations (user_id, spot_id, reservation_date)
          VALUES (?, ?, ?)
      `;
      const result = await query(insertSql, [userId, spotId, reservationDate]);
      console.log(`[SUCCESS] Daily reservation created. ID: ${result.insertId}, User: ${userId}, Spot: ${spotId}, Date: ${reservationDate}`);
      res.status(201).json({
          message: `Sikeres egész napos foglalás a(z) ${spotId} helyre ${reservationDate} napra!`,
          reservationId: result.insertId,
          spotId: spotId,
          reservationDate: reservationDate
      });

  } catch (err) {
      console.error(`[ERROR] Creating daily reservation failed for User: ${userId}, Spot: ${spotId}, Date: ${reservationDate}`, err);
      if (err.code === 'ER_DUP_ENTRY') {
           return res.status(409).json({ message: "Ez a parkolóhely erre a napra már le van foglalva." });
      }
      res.status(500).json({ message: "Hiba történt az egész napos foglalás létrehozása közben." });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
