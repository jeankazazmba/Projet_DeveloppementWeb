CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(120) NOT NULL,
  email VARCHAR(254) NOT NULL UNIQUE,
  role ENUM('etudiant','employe','gerant','administrateur') NOT NULL DEFAULT 'etudiant',
  leaderboard_opt_in BOOLEAN NOT NULL DEFAULT FALSE,
  referral_code VARCHAR(32) NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sessions (
  token_hash CHAR(64) PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  expires_at DATETIME NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS orders (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  total_amount BIGINT UNSIGNED NOT NULL,
  discount_amount BIGINT UNSIGNED NOT NULL DEFAULT 0,
  loyalty_points_used INT UNSIGNED NOT NULL DEFAULT 0,
  status VARCHAR(32) NOT NULL,
  completed_at DATETIME NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_orders_completed (status, completed_at, user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS loyalty_rules (
  id TINYINT UNSIGNED PRIMARY KEY,
  currency_per_point BIGINT UNSIGNED NOT NULL DEFAULT 0,
  points_per_reward BIGINT UNSIGNED NOT NULL DEFAULT 0,
  reward_amount BIGINT UNSIGNED NOT NULL DEFAULT 0,
  referral_reward_points BIGINT UNSIGNED NOT NULL DEFAULT 0,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
INSERT IGNORE INTO loyalty_rules (id) VALUES (1);

CREATE TABLE IF NOT EXISTS loyalty_transactions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  order_id BIGINT UNSIGNED NULL,
  type ENUM('credit','debit','adjustment') NOT NULL,
  points INT NOT NULL,
  reason VARCHAR(180) NOT NULL,
  idempotency_key VARCHAR(100) NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (order_id) REFERENCES orders(id),
  INDEX idx_loyalty_user (user_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS referrals (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  referrer_id BIGINT UNSIGNED NOT NULL,
  referred_id BIGINT UNSIGNED NOT NULL UNIQUE,
  code VARCHAR(32) NOT NULL,
  status ENUM('pending','rewarded') NOT NULL DEFAULT 'pending',
  rewarded_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (referrer_id) REFERENCES users(id),
  FOREIGN KEY (referred_id) REFERENCES users(id),
  INDEX idx_referrals_referrer (referrer_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS promotions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  titre VARCHAR(160) NOT NULL,
  description TEXT NULL,
  date_debut DATETIME NOT NULL,
  date_fin DATETIME NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id),
  INDEX idx_promotions_dates (active, date_debut, date_fin)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS events (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  titre VARCHAR(160) NOT NULL,
  description TEXT NULL,
  lieu VARCHAR(255) NULL,
  date_debut DATETIME NOT NULL,
  date_fin DATETIME NOT NULL,
  affiche_url VARCHAR(2048) NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id),
  INDEX idx_events_dates (active, date_debut, date_fin)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
