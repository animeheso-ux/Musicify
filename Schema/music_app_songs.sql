-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: localhost    Database: music_app
-- ------------------------------------------------------
-- Server version	8.4.8

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
-- Table structure for table `songs`
--

DROP TABLE IF EXISTS `songs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `songs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `filename` varchar(255) NOT NULL,
  `song_id` varchar(255) DEFAULT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `songs`
--

LOCK TABLES `songs` WRITE;
/*!40000 ALTER TABLE `songs` DISABLE KEYS */;
INSERT INTO `songs` VALUES (21,'Radiohead - Creep (Lyrics)','SLbSsv_2u4A.mp3','SLbSsv_2u4A',2),(23,'LAST CHANCE FUNK (Slowed Version)','i-IlJUVljbM.mp3','i-IlJUVljbM',2),(24,'\"FUNK ESTRANHO\"-Song (Original)','SrFhZYuZ6XY.mp3','SrFhZYuZ6XY',2),(25,'Let Down - Radiohead - Lyrics','Ge4EUrjZ3DE.mp3','Ge4EUrjZ3DE',2),(26,'Arctic Monkeys - No. 1 Party Anthem (Lyrics)','zjZD-ibfhnU.mp3','zjZD-ibfhnU',4),(27,'Jane!','HydkjjDNTmY.mp3','HydkjjDNTmY',4),(28,'Weezer - Buddy Holly (2024 Remaster)','SiJie3Z7DG8.mp3','SiJie3Z7DG8',4),(29,'After Dark x Sweater Weather (Prødigy Remix)','jOjG889_o3A.mp3','jOjG889_o3A',4),(30,'MONTAGEM RUGADA','-gcygskAIx8.mp3','-gcygskAIx8',2),(31,'Pure Furies ~ Whereabouts of the Heart || Metal Cover by RichaadEB','zG325qCKH9o.mp3','zG325qCKH9o',2),(34,'LUA NA PRAÇA - Dj Samir | Umamusume Edit x TikTok Edit x Satono Diamond Edit','T0QXUtOgodw.mp3','T0QXUtOgodw',2),(35,'Cinematic Sub Bass Drop Sound Effect | SFX | Royalty Free | No Copyright','Yzq8c2Xv5IY.mp3','Yzq8c2Xv5IY',2),(36,'Radiohead - Creep','XFkzRNyygfk.mp3','XFkzRNyygfk',2),(37,'Nirvana - Heart-Shaped Box','n6P0SitRwy8.mp3','n6P0SitRwy8',2),(38,'LoLK Junko\'s Theme: Pure Furies ~ Whereabouts of the Heart','MgBoe_x9g2o.mp3','MgBoe_x9g2o',4);
/*!40000 ALTER TABLE `songs` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-22 19:46:40
