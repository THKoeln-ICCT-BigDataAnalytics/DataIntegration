CREATE DATABASE IF NOT EXISTS jolpica_f1;
USE jolpica_f1;

-- Drop Constraints
-- ALTER TABLE Lap DROP FOREIGN KEY fk_session_entry;

-- ALTER TABLE SessionEntry DROP FOREIGN KEY SessionEntry_ibfk_1;
-- ALTER TABLE SessionEntry DROP FOREIGN KEY SessionEntry_ibfk_2;
-- ALTER TABLE SessionEntry DROP FOREIGN KEY SessionEntry_ibfk_3;

-- ALTER TABLE ChampionshipAdjustment DROP FOREIGN KEY ChampionshipAdjustment_ibfk_1;
-- ALTER TABLE ChampionshipAdjustment DROP FOREIGN KEY ChampionshipAdjustment_ibfk_2;
-- ALTER TABLE ChampionshipAdjustment DROP FOREIGN KEY ChampionshipAdjustment_ibfk_3;

-- Drop existing tables (order matters for constraints)
DROP TABLE IF EXISTS PitStop;
DROP TABLE IF EXISTS Penalty;
DROP TABLE IF EXISTS Lap;
DROP TABLE IF EXISTS SessionEntry;
DROP TABLE IF EXISTS Sessions;
DROP TABLE IF EXISTS RoundEntry;
DROP TABLE IF EXISTS Round;
DROP TABLE IF EXISTS TeamDriver;
DROP TABLE IF EXISTS Circuit;
DROP TABLE IF EXISTS Season;
DROP TABLE IF EXISTS Driver;
DROP TABLE IF EXISTS Team;
DROP TABLE IF EXISTS BaseTeam;
DROP TABLE IF EXISTS PointSystem;
DROP TABLE IF EXISTS ChampionshipAdjustment;
DROP TABLE IF EXISTS ChampionshipSystem;

-- ChampionshipSystem table
CREATE TABLE ChampionshipSystem (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reference VARCHAR(255),
    name VARCHAR(255),
    eligibility INT,
    driver_season_split INT,
    driver_best_results INT,
    team_season_split INT,
    team_best_results INT
);

-- BaseTeam table
CREATE TABLE BaseTeam (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255)
);

-- Team table
CREATE TABLE Team (
    id INT AUTO_INCREMENT PRIMARY KEY,
    base_team INT,
    reference VARCHAR(255),
    name VARCHAR(255),
    nationality VARCHAR(255),
    wikipedia VARCHAR(2083),
    FOREIGN KEY (base_team) REFERENCES BaseTeam(id)
);

-- Driver table
CREATE TABLE Driver (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reference VARCHAR(255),
    forename VARCHAR(255),
    surname VARCHAR(255),
    abbreviation VARCHAR(10),
    nationality VARCHAR(255),
    permanent_car_number INT,
    date_of_birth DATE,
    wikipedia VARCHAR(2083)
);

-- Season table
CREATE TABLE Season (
    id INT AUTO_INCREMENT PRIMARY KEY,
    championship_system INT,
    year INT,
    wikipedia VARCHAR(2083),
    FOREIGN KEY (championship_system) REFERENCES ChampionshipSystem(id)
);

-- Circuit table
CREATE TABLE Circuit (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reference VARCHAR(255),
    name VARCHAR(255),
    locality VARCHAR(255),
    country VARCHAR(255),
    location VARCHAR(255),
    altitude DOUBLE,
    wikipedia VARCHAR(2083)
);

-- TeamDriver table
CREATE TABLE TeamDriver (
    id INT AUTO_INCREMENT PRIMARY KEY,
    team INT,
    driver INT,
    season INT,
    role INT,
    FOREIGN KEY (team) REFERENCES Team(id),
    FOREIGN KEY (driver) REFERENCES Driver(id),
    FOREIGN KEY (season) REFERENCES Season(id)
);

-- Round table
CREATE TABLE Round (
    id INT AUTO_INCREMENT PRIMARY KEY,
    season INT,
    round_number INT,
    round_name VARCHAR(255),
    round_date DATE,
    race_number INT,
    wikipedia VARCHAR(255),
    is_cancelled CHAR(1),
    FOREIGN KEY (season) REFERENCES Season(id)
);

-- RoundEntry table
CREATE TABLE RoundEntry (
    id INT AUTO_INCREMENT PRIMARY KEY,
    team_driver INT,
    round INT,
    car_number INT,
    FOREIGN KEY (team_driver) REFERENCES TeamDriver(id),
    FOREIGN KEY (round) REFERENCES Round(id)
);

-- PointSystem table
CREATE TABLE PointSystem (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reference VARCHAR(255),
    name VARCHAR(255),
    driver_position_points INT,
    team_position_points INT,
    team_fastest_lap INT,
    partial CHAR(1),
    shared_drive CHAR(1),
    is_double_points CHAR(1)
);

-- Sessions table
CREATE TABLE Sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    round INT,
    session_number INT,
    point_system INT,
    session_type VARCHAR(50),
    session_date DATE,
    session_time DATETIME,
    scheduled_laps INT,
    is_cancelled CHAR(1),
    FOREIGN KEY (round) REFERENCES Round(id),
    FOREIGN KEY (point_system) REFERENCES PointSystem(id)
);

-- Lap table (foreign key added after SessionEntry table)
CREATE TABLE Lap (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_entry INT,
    lap_number INT,
    position INT,
    time TIME,
    average_speed DOUBLE
);

-- SessionEntry table
CREATE TABLE SessionEntry (
    id INT AUTO_INCREMENT PRIMARY KEY,
    round_entry INT,
    session_entry_session INT,
    fastest_lap INT,
    position INT,
    is_classified CHAR(1),
    session_entry_status INT,
    points DOUBLE,
    detail VARCHAR(255),
    is_eligible_for_points CHAR(1),
    grid INT,
    session_entry_time TIME,
    fastest_lap_rank INT,
    laps_completed INT,
    FOREIGN KEY (round_entry) REFERENCES RoundEntry(id),
    FOREIGN KEY (session_entry_session) REFERENCES Sessions(id),
    FOREIGN KEY (fastest_lap) REFERENCES Lap(id)
);

-- Add foreign key to Lap table
ALTER TABLE Lap
ADD CONSTRAINT fk_session_entry FOREIGN KEY (session_entry) REFERENCES SessionEntry(id);

-- Penalty table
CREATE TABLE Penalty (
    id INT AUTO_INCREMENT PRIMARY KEY,
    earned INT,
    served INT,
    license_points INT,
    position INT,
    time TIME,
    is_time_served_in_pit CHAR(1),
    FOREIGN KEY (earned) REFERENCES SessionEntry(id),
    FOREIGN KEY (served) REFERENCES SessionEntry(id)
);

-- PitStop table
CREATE TABLE PitStop (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_entry INT,
    lap INT,
    pit_stop_number INT,
    duration TIME,
    local_timestamp VARCHAR(255),
    FOREIGN KEY (session_entry) REFERENCES SessionEntry(id)
);

-- ChampionshipAdjustment table
CREATE TABLE ChampionshipAdjustment (
    id INT AUTO_INCREMENT PRIMARY KEY,
    season INT,
    driver INT,
    team INT,
    adjustment INT,
    points DOUBLE,
    FOREIGN KEY (season) REFERENCES Season(id),
    FOREIGN KEY (driver) REFERENCES Driver(id),
    FOREIGN KEY (team) REFERENCES Team(id)
);
