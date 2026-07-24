-- Hostinger MySQL Database Schema
-- Ayyıldız Motosiklet Kulübü (AYMK)

CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(128) PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `surname` VARCHAR(100) DEFAULT '',
  `username` VARCHAR(100) NOT NULL UNIQUE,
  `email` VARCHAR(150) DEFAULT '',
  `password` VARCHAR(255) DEFAULT '',
  `role` ENUM('admin', 'member') DEFAULT 'member',
  `status` ENUM('pending', 'approved', 'rejected') DEFAULT 'approved',
  `avatarUrl` TEXT,
  `statusText` VARCHAR(255) DEFAULT '',
  `motorcycle` VARCHAR(150) DEFAULT '',
  `bloodType` VARCHAR(20) DEFAULT '',
  `phone` VARCHAR(50) DEFAULT '',
  `githubUsername` VARCHAR(100) DEFAULT '',
  `githubUrl` VARCHAR(255) DEFAULT '',
  `bio` TEXT,
  `profile` JSON,
  `privacy` JSON,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `events` (
  `id` VARCHAR(128) PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `image` TEXT,
  `date` VARCHAR(50),
  `time` VARCHAR(50),
  `location` VARCHAR(255),
  `coordinates` VARCHAR(100),
  `status` ENUM('upcoming', 'ongoing', 'past') DEFAULT 'upcoming',
  `attendeesCount` INT DEFAULT 0,
  `description` TEXT,
  `routeLink` TEXT,
  `gmapsLink` TEXT,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `routes` (
  `id` VARCHAR(128) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `startPoint` VARCHAR(150),
  `endPoint` VARCHAR(150),
  `distanceKm` INT DEFAULT 0,
  `estimatedHours` FLOAT DEFAULT 0,
  `roadCondition` VARCHAR(100),
  `fuelRate` FLOAT DEFAULT 0,
  `stops` JSON,
  `gpsUrl` TEXT,
  `difficulty` VARCHAR(50),
  `elevation` VARCHAR(100),
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `news` (
  `id` VARCHAR(128) PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `summary` TEXT,
  `content` LONGTEXT,
  `image` TEXT,
  `category` VARCHAR(100) DEFAULT 'Duyuru',
  `date` VARCHAR(50),
  `author` VARCHAR(100),
  `tags` JSON,
  `comments` JSON,
  `likes` INT DEFAULT 0,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `forum_posts` (
  `id` VARCHAR(128) PRIMARY KEY,
  `userId` VARCHAR(128),
  `authorName` VARCHAR(100),
  `text` TEXT,
  `timestamp` BIGINT,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `gallery` (
  `id` VARCHAR(128) PRIMARY KEY,
  `url` TEXT NOT NULL,
  `category` VARCHAR(100),
  `description` TEXT,
  `date` VARCHAR(50),
  `type` ENUM('image', 'video') DEFAULT 'image',
  `uploadedBy` VARCHAR(100),
  `uploaderUid` VARCHAR(128),
  `fileName` VARCHAR(255),
  `storagePath` TEXT,
  `mimeType` VARCHAR(100),
  `size` BIGINT DEFAULT 0,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `announcements` (
  `id` VARCHAR(128) PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `content` TEXT,
  `date` VARCHAR(50),
  `important` TINYINT(1) DEFAULT 0,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `messages` (
  `id` VARCHAR(128) PRIMARY KEY,
  `senderId` VARCHAR(128),
  `receiverId` VARCHAR(128),
  `senderName` VARCHAR(100),
  `text` TEXT,
  `timestamp` BIGINT,
  `read` TINYINT(1) DEFAULT 0,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `meetings` (
  `id` VARCHAR(128) PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `reason` TEXT,
  `time` VARCHAR(100),
  `link` TEXT,
  `status` ENUM('active', 'completed') DEFAULT 'active',
  `createdByName` VARCHAR(100),
  `createdAt` BIGINT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Varsayılan Admin Hesabı Ekleme (Şifre: kurt123)
INSERT INTO `users` (`id`, `name`, `surname`, `username`, `email`, `password`, `role`, `status`, `statusText`)
VALUES ('admin-1', 'Kurtuluş', 'Düzlü', 'kurt', 'kduzlu@gmail.com', 'kurt123', 'admin', 'approved', 'Kurucu Üye / Töre Muhafızı')
ON DUPLICATE KEY UPDATE `role` = 'admin';
