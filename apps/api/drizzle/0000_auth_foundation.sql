CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY,
  auth_subject text NOT NULL UNIQUE,
  tucarton_code text NOT NULL UNIQUE,
  phone_e164 text UNIQUE,
  phone_verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_e164 text UNIQUE;

CREATE TABLE IF NOT EXISTS auth_audit_events (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id),
  action text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
