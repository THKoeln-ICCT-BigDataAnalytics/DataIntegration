USE jolpica_f1;

SET FOREIGN_KEY_CHECKS = 0;
-- ChampionshipSystem
INSERT INTO ChampionshipSystem (reference, name, eligibility, driver_season_split, driver_best_results, team_season_split, team_best_results) VALUES
('f1_classic','Classic F1',1,1,10,1,10),
('f1_modern','Modern F1',1,0,0,0,0),
('f2','Formula 2',1,1,8,1,8),
('indycar','IndyCar',1,0,10,1,10),
('fe','Formula E',1,1,6,1,6),
('wrc','World Rally',1,1,0,1,0),
('endur','Endurance',1,0,6,0,6),
('kart','Karting',0,0,12,0,12),
('f3','Formula 3',1,1,6,1,6),
('historic','Historic GP',0,1,10,0,10);

-- BaseTeam
INSERT INTO BaseTeam (name) VALUES
('Ferrari'),('Mercedes'),('Red Bull'),('McLaren'),('Alpine'),
('Williams'),('AlphaTauri'),('Aston Martin'),('Haas'),('Sauber');

-- Team
INSERT INTO Team (base_team, reference, name, nationality, wikipedia) VALUES
(1,'scuderia_ferrari','Scuderia Ferrari','Italy','https://en.wikipedia.org/wiki/Scuderia_Ferrari'),
(2,'mercedes_amg','Mercedes AMG F1','Germany','https://en.wikipedia.org/wiki/Mercedes_Formula_One_Team'),
(3,'redbull_racing','Red Bull Racing','Austria','https://en.wikipedia.org/wiki/Red_Bull_Racing'),
(4,'mclaren_f1','McLaren F1','UK','https://en.wikipedia.org/wiki/McLaren'),
(5,'alpine_f1','Alpine F1','France','https://en.wikipedia.org/wiki/Alpine_F1_Team'),
(6,'williams_f1','Williams F1','UK','https://en.wikipedia.org/wiki/Williams_Grand_Prix_Engineering'),
(7,'alphatauri','AlphaTauri','Italy','https://en.wikipedia.org/wiki/Scuderia_AlphaTauri'),
(8,'astonmartin','Aston Martin','UK','https://en.wikipedia.org/wiki/Aston_Martin'),
(9,'haas_f1','Haas F1','USA','https://en.wikipedia.org/wiki/Haas_F1_Team'),
(10,'sauber_f1','Sauber F1','Switzerland','https://en.wikipedia.org/wiki/Sauber_Motorsport');

-- Driver
INSERT INTO Driver (reference, forename, surname, abbreviation, nationality, permanent_car_number, date_of_birth, wikipedia) VALUES
('hamilton','Lewis','Hamilton','HAM','UK',44,'1985-01-07','https://en.wikipedia.org/wiki/Lewis_Hamilton'),
('verstappen','Max','Verstappen','VER','Netherlands',33,'1997-09-30','https://en.wikipedia.org/wiki/Max_Verstappen'),
('leclerc','Charles','Leclerc','LEC','Monaco',16,'1997-10-16','https://en.wikipedia.org/wiki/Charles_Leclerc'),
('russell','George','Russell','RUS','UK',63,'1998-02-15','https://en.wikipedia.org/wiki/George_Russell_(racing_driver)'),
('sainz','Carlos','Sainz','SAI','Spain',55,'1994-09-01','https://en.wikipedia.org/wiki/Carlos_Sainz_Jr.'),
('norris','Lando','Norris','NOR','UK',4,'1999-11-13','https://en.wikipedia.org/wiki/Lando_Norris'),
('alonso','Fernando','Alonso','ALO','Spain',14,'1981-07-29','https://en.wikipedia.org/wiki/Fernando_Alonso'),
('ocon','Esteban','Ocon','OCO','France',31,'1996-09-17','https://en.wikipedia.org/wiki/Esteban_Ocon'),
('gasly','Pierre','Gasly','GAS','France',10,'1996-02-07','https://en.wikipedia.org/wiki/Pierre_Gasly'),
('tsunoda','Yuki','Tsunoda','TSU','Japan',22,'2000-05-11','https://en.wikipedia.org/wiki/Yuki_Tsunoda');

-- Season
INSERT INTO Season (championship_system, year, wikipedia) VALUES
(1,2020,'https://en.wikipedia.org/wiki/2020_Formula_One_World_Championship'),
(2,2021,'https://en.wikipedia.org/wiki/2021_Formula_One_World_Championship'),
(3,2022,'https://en.wikipedia.org/wiki/2022_Formula_One_World_Championship'),
(4,2023,'https://en.wikipedia.org/wiki/2023_Formula_One_World_Championship'),
(1,2019,'https://en.wikipedia.org/wiki/2019_Formula_One_World_Championship'),
(2,2018,'https://en.wikipedia.org/wiki/2018_Formula_One_World_Championship'),
(3,2017,'https://en.wikipedia.org/wiki/2017_Formula_One_World_Championship'),
(4,2016,'https://en.wikipedia.org/wiki/2016_Formula_One_World_Championship'),
(1,2015,'https://en.wikipedia.org/wiki/2015_Formula_One_World_Championship'),
(2,2014,'https://en.wikipedia.org/wiki/2014_Formula_One_World_Championship');

-- Circuit
INSERT INTO Circuit (reference, name, locality, country, location, altitude, wikipedia) VALUES
('monza','Autodromo Nazionale Monza','Monza','Italy','Monza',162,'https://en.wikipedia.org/wiki/Monza_Circuit'),
('spa','Circuit de Spa-Francorchamps','Stavelot','Belgium','Stavelot',450,'https://en.wikipedia.org/wiki/Circuit_de_Spa-Francorchamps'),
('silverstone','Silverstone Circuit','Silverstone','UK','Silverstone',150,'https://en.wikipedia.org/wiki/Silverstone_Circuit'),
('montecarlo','Circuit de Monaco','Monte Carlo','Monaco','Monte Carlo',15,'https://en.wikipedia.org/wiki/Circuit_de_Monaco'),
('suzuka','Suzuka Circuit','Suzuka','Japan','Suzuka',52,'https://en.wikipedia.org/wiki/Suzuka_International_Racing_Course'),
('interlagos','Autódromo José Carlos Pace','Sao Paulo','Brazil','Sao Paulo',750,'https://en.wikipedia.org/wiki/Autódromo_José_Carlos_Pace'),
('redbullring','Red Bull Ring','Spielberg','Austria','Spielberg',677,'https://en.wikipedia.org/wiki/Red_Bull_Ring'),
('albertpark','Albert Park Circuit','Melbourne','Australia','Melbourne',6,'https://en.wikipedia.org/wiki/Albert_Park_Circuit'),
('sochi','Sochi Autodrom','Sochi','Russia','Sochi',2,'https://en.wikipedia.org/wiki/Sochi_Autodrom'),
('cota','Circuit of the Americas','Austin','USA','Austin',183,'https://en.wikipedia.org/wiki/Circuit_of_the_Americas');

-- TeamDriver
INSERT INTO TeamDriver (team, driver, season, role) VALUES
(1,3,1,1),(2,1,1,1),(3,2,1,1),(4,6,1,1),(5,8,1,1),
(6,4,1,1),(7,9,1,1),(8,7,1,1),(9,5,1,1),(10,10,1,1);

-- Round
INSERT INTO Round (season, round_number, round_name, round_date, race_number, wikipedia, is_cancelled) VALUES
(1,1,'Australian Grand Prix','2020-03-15',1,'https://en.wikipedia.org/wiki/2020_Australian_Grand_Prix','N'),
(1,2,'Bahrain Grand Prix','2020-03-22',2,'https://en.wikipedia.org/wiki/2020_Bahrain_Grand_Prix','N'),
(1,3,'Vietnam Grand Prix','2020-04-05',3,'https://en.wikipedia.org/wiki/2020_Vietnam_Grand_Prix','Y'),
(1,4,'Chinese Grand Prix','2020-04-19',4,'https://en.wikipedia.org/wiki/2020_Chinese_Grand_Prix','N'),
(1,5,'Dutch Grand Prix','2020-05-03',5,'https://en.wikipedia.org/wiki/2020_Dutch_Grand_Prix','N'),
(1,6,'Spanish Grand Prix','2020-05-10',6,'https://en.wikipedia.org/wiki/2020_Spanish_Grand_Prix','N'),
(1,7,'Monaco Grand Prix','2020-05-24',7,'https://en.wikipedia.org/wiki/2020_Monaco_Grand_Prix','N'),
(1,8,'Azerbaijan Grand Prix','2020-06-07',8,'https://en.wikipedia.org/wiki/2020_Azerbaijan_Grand_Prix','N'),
(1,9,'Canadian Grand Prix','2020-06-14',9,'https://en.wikipedia.org/wiki/2020_Canadian_Grand_Prix','N'),
(1,10,'French Grand Prix','2020-06-28',10,'https://en.wikipedia.org/wiki/2020_French_Grand_Prix','N');

-- RoundEntry
INSERT INTO RoundEntry (team_driver, round, car_number) VALUES
(1,1,16),(2,1,44),(3,1,33),(4,1,4),(5,1,31),
(6,1,63),(7,1,10),(8,1,14),(9,1,55),(10,1,22);

-- PointSystem
INSERT INTO PointSystem (reference, name, driver_position_points, team_position_points, team_fastest_lap, partial, shared_drive, is_double_points) VALUES
('std_f1','Standard F1',25,18,1,'N','N','N'),
('old_f1','Old F1',10,6,1,'N','N','N'),
('indy','IndyCar',50,25,1,'N','N','Y'),
('kart','Karting',15,10,2,'Y','Y','N'),
('fe','Formula E',25,10,1,'N','N','N'),
('wrc','World Rally',30,15,0,'N','N','N'),
('endur','Endurance',40,20,2,'Y','N','Y'),
('f2','F2',20,15,1,'N','Y','N'),
('historic','Historic F1',9,6,1,'N','N','N'),
('sauber','Sauber GP',5,4,1,'N','N','N');

-- Sessions
INSERT INTO Sessions (round, session_number, point_system, session_type, session_date, session_time, scheduled_laps, is_cancelled) VALUES
(1,1,1,'Race','2020-03-15','2020-03-15 14:10:00',58,'N'),
(2,1,1,'Race','2020-03-22','2020-03-22 13:00:00',57,'N'),
(3,1,1,'Race','2020-04-05','2020-04-05 14:00:00',62,'Y'),
(4,1,1,'Race','2020-04-19','2020-04-19 14:00:00',56,'N'),
(5,1,1,'Race','2020-05-03','2020-05-03 14:00:00',66,'N'),
(6,1,1,'Race','2020-05-10','2020-05-10 14:00:00',66,'N'),
(7,1,1,'Race','2020-05-24','2020-05-24 15:10:00',78,'N'),
(8,1,1,'Race','2020-06-07','2020-06-07 14:00:00',51,'N'),
(9,1,1,'Race','2020-06-14','2020-06-14 14:10:00',70,'N'),
(10,1,1,'Race','2020-06-28','2020-06-28 15:10:00',53,'N');

-- SessionEntry
INSERT INTO SessionEntry (round_entry, session_entry_session, fastest_lap, position, is_classified, session_entry_status, points, detail, is_eligible_for_points, grid, session_entry_time, fastest_lap_rank, laps_completed) VALUES
(1,1,1,1,'Y',1,25.0,'Winner','Y',1,'01:18',1,58),
(2,1,2,2,'Y',1,18.0,'Second','Y',2,'01:19',2,58),
(3,1,3,3,'Y',1,15.0,'Third','Y',3,'01:19',3,57),
(4,1,4,4,'Y',1,12.0,'Fourth','Y',4,'01:21',4,57),
(5,1,5,5,'Y',1,10.0,'Fifth','Y',5,'01:22',5,56),
(6,1,6,6,'Y',1,8.0,'Sixth','Y',6,'01:23',6,56),
(7,1,7,7,'Y',1,6.0,'Seventh','Y',7,'01:24',7,55),
(8,1,8,8,'Y',1,4.0,'Eighth','Y',8,'01:25',8,54),
(9,1,9,9,'Y',1,2.0,'Ninth','Y',9,'01:26',9,54),
(10,1,10,10,'Y',1,1.0,'Tenth','Y',10,'01:27',10,53);

-- Lap
INSERT INTO Lap (session_entry, lap_number, position, time, average_speed) VALUES
(1,1,1,'00:01:18',212.0),(1,2,1,'00:01:19',210.5),(1,3,1,'00:01:18',211.8),
(2,1,2,'00:01:19',210.0),(2,2,2,'00:01:20',209.5),(3,1,3,'00:01:20',208.7),
(4,1,4,'00:01:21',208.2),(4,2,4,'00:01:21',208.0),(5,1,5,'00:01:22',207.5),(6,1,6,'00:01:22',207.1);


-- Penalty
INSERT INTO Penalty (earned, served, license_points, position, time, is_time_served_in_pit) VALUES
(1,1,1,2,'00:00:05','Y'),(2,2,2,3,'00:00:10','N'),(3,3,3,4,'00:00:10','Y'),
(4,4,2,5,'00:00:05','N'),(5,5,1,6,'00:00:05','Y'),(6,6,3,7,'00:00:10','Y'),
(7,7,1,8,'00:00:05','N'),(8,8,1,9,'00:00:05','Y'),(9,9,2,10,'00:00:10','N'),(10,10,1,1,'00:00:05','Y');

-- PitStop
INSERT INTO PitStop (session_entry, lap, pit_stop_number, duration, local_timestamp) VALUES
(1,1,1,'00:00:24','2020-03-15 15:10:45'),(2,2,1,'00:00:25','2020-03-22 15:22:31'),(3,3,2,'00:00:24','2020-04-05 15:33:12'),
(4,4,2,'00:00:24','2020-04-19 16:45:57'),(5,5,3,'00:00:23','2020-05-03 14:17:53'),(6,6,1,'00:00:24','2020-05-10 15:10:24'),
(7,7,1,'00:00:25','2020-05-24 15:29:18'),(8,8,2,'00:00:24','2020-06-07 15:50:02'),(9,9,1,'00:00:23','2020-06-14 16:07:46'),(10,10,3,'00:00:23','2020-06-28 16:07:11');

-- ChampionshipAdjustment
INSERT INTO ChampionshipAdjustment (season, driver, team, adjustment, points) VALUES
(1,1,2,2,3.5),(2,2,3,1,3.0),(3,3,1,-1,2.5),(4,4,5,0,2.0),
(5,5,6,1,2.5),(6,6,7,-2,2.0),(7,7,8,1,1.5),(8,8,9,0,1.0),
(9,9,10,1,3.0),(10,10,4,0,2.5);
SET FOREIGN_KEY_CHECKS = 1;