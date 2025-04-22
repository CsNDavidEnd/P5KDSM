-- MySQL dump 10.13  Distrib 8.0.40, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: agriaparking
-- ------------------------------------------------------
-- Server version	5.5.5-10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `daily_reservations`
--

DROP TABLE IF EXISTS `daily_reservations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `daily_reservations` (
  `daily_reservation_id` int(11) NOT NULL AUTO_INCREMENT,
  `spot_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `reservation_date` date DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`daily_reservation_id`),
  KEY `spot_id` (`spot_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `daily_reservations_ibfk_1` FOREIGN KEY (`spot_id`) REFERENCES `parking_spots` (`spot_id`),
  CONSTRAINT `daily_reservations_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `daily_reservations`
--

LOCK TABLES `daily_reservations` WRITE;
/*!40000 ALTER TABLE `daily_reservations` DISABLE KEYS */;
INSERT INTO `daily_reservations` VALUES (1,1,1,'2025-05-01',NULL);
/*!40000 ALTER TABLE `daily_reservations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `parking_spots`
--

DROP TABLE IF EXISTS `parking_spots`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `parking_spots` (
  `spot_id` int(11) NOT NULL AUTO_INCREMENT,
  `spot_name` varchar(255) DEFAULT NULL,
  `is_available` tinyint(1) DEFAULT NULL,
  `booked_until` datetime DEFAULT NULL,
  `current_booking_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`spot_id`)
) ENGINE=InnoDB AUTO_INCREMENT=70 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `parking_spots`
--

LOCK TABLES `parking_spots` WRITE;
/*!40000 ALTER TABLE `parking_spots` DISABLE KEYS */;
INSERT INTO `parking_spots` VALUES (1,'A01',1,NULL,NULL),(2,'A02',1,NULL,NULL),(3,'A03',0,'2025-04-22 01:43:26',1),(4,'A04',1,NULL,NULL),(5,'A05',1,NULL,NULL),(6,'A06',1,NULL,NULL),(7,'A07',1,NULL,NULL),(8,'A08',1,NULL,NULL),(9,'A09',1,NULL,NULL),(10,'A10',1,NULL,NULL),(11,'A11',1,NULL,NULL),(12,'A12',1,NULL,NULL),(13,'A13',1,NULL,NULL),(14,'A14',1,NULL,NULL),(15,'A15',1,NULL,NULL),(16,'A16',1,NULL,NULL),(17,'A17',1,NULL,NULL),(18,'A18',1,NULL,NULL),(19,'A19',1,NULL,NULL),(20,'A20',1,NULL,NULL),(21,'A21',1,NULL,NULL),(22,'A22',1,NULL,NULL),(23,'A23',1,NULL,NULL),(24,'B01',1,NULL,NULL),(25,'B02',1,NULL,NULL),(26,'B03',1,NULL,NULL),(27,'B04',1,NULL,NULL),(28,'B05',1,NULL,NULL),(29,'B06',1,NULL,NULL),(30,'B07',1,NULL,NULL),(31,'B08',1,NULL,NULL),(32,'B09',1,NULL,NULL),(33,'B10',1,NULL,NULL),(34,'B11',1,NULL,NULL),(35,'B12',1,NULL,NULL),(36,'B13',1,NULL,NULL),(37,'B14',1,NULL,NULL),(38,'B15',1,NULL,NULL),(39,'B16',1,NULL,NULL),(40,'B17',1,NULL,NULL),(41,'B18',1,NULL,NULL),(42,'B19',1,NULL,NULL),(43,'B20',1,NULL,NULL),(44,'B21',1,NULL,NULL),(45,'B22',1,NULL,NULL),(46,'B23',1,NULL,NULL),(47,'C01',1,NULL,NULL),(48,'C02',1,NULL,NULL),(49,'C03',1,NULL,NULL),(50,'C04',1,NULL,NULL),(51,'C05',1,NULL,NULL),(52,'C06',1,NULL,NULL),(53,'C07',1,NULL,NULL),(54,'C08',1,NULL,NULL),(55,'C09',1,NULL,NULL),(56,'C10',1,NULL,NULL),(57,'C11',1,NULL,NULL),(58,'C12',1,NULL,NULL),(59,'C13',1,NULL,NULL),(60,'C14',1,NULL,NULL),(61,'C15',1,NULL,NULL),(62,'C16',1,NULL,NULL),(63,'C17',1,NULL,NULL),(64,'C18',1,NULL,NULL),(65,'C19',1,NULL,NULL),(66,'C20',1,NULL,NULL),(67,'C21',1,NULL,NULL),(68,'C22',1,NULL,NULL),(69,'C23',1,NULL,NULL);
/*!40000 ALTER TABLE `parking_spots` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `payment_id` int(11) NOT NULL AUTO_INCREMENT,
  `reservation_id` int(11) DEFAULT NULL,
  `daily_reservation_id` int(11) DEFAULT NULL,
  `amount` decimal(10,0) DEFAULT NULL,
  PRIMARY KEY (`payment_id`),
  KEY `reservation_id` (`reservation_id`),
  KEY `daily_reservation_id` (`daily_reservation_id`),
  CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`reservation_id`) REFERENCES `reservations` (`reservation_id`),
  CONSTRAINT `payments_ibfk_2` FOREIGN KEY (`daily_reservation_id`) REFERENCES `daily_reservations` (`daily_reservation_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reservations`
--

DROP TABLE IF EXISTS `reservations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reservations` (
  `reservation_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `spot_id` int(11) DEFAULT NULL,
  `start_time` datetime DEFAULT NULL,
  `end_time` datetime DEFAULT NULL,
  `status` varchar(20) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`reservation_id`),
  KEY `user_id` (`user_id`),
  KEY `spot_id` (`spot_id`),
  CONSTRAINT `reservations_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `reservations_ibfk_2` FOREIGN KEY (`spot_id`) REFERENCES `parking_spots` (`spot_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reservations`
--

LOCK TABLES `reservations` WRITE;
/*!40000 ALTER TABLE `reservations` DISABLE KEYS */;
INSERT INTO `reservations` VALUES (1,1,3,'2025-04-21 22:43:26','2025-04-22 01:43:26','active',NULL);
/*!40000 ALTER TABLE `reservations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `passwd` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `plateNumber` varchar(20) DEFAULT NULL,
  `booking` int(11) DEFAULT NULL,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'David','dedis45414@dpcos.com','$2b$10$4rAsiTt5hH1r1xLk7fAUFuU8ScbDCJI2lYYwaspvdkXleVOFjOQ6O','+365698789','KLM987',1);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-04-22  0:44:44
