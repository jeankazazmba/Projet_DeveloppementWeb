-- À exécuter une seule fois sur une base créée avec le schéma Sprint 2.
ALTER TABLE users
  ADD COLUMN leaderboard_alias VARCHAR(32) NULL UNIQUE;
