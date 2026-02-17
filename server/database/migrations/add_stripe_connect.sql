-- Migration: Add stripe_account_id to users table for Stripe Connect
-- Run this on existing databases to add Stripe Connect support

ALTER TABLE users
ADD COLUMN stripe_account_id VARCHAR(255) DEFAULT NULL
COMMENT 'Stripe Connect account ID for receiving payouts'
AFTER profil_picture;
