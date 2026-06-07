-- MechPro Experts Phase 2 Auth Schema
-- PostgreSQL baseline for production database setup.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(40) UNIQUE NOT NULL,
  name VARCHAR(120) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(80) UNIQUE NOT NULL,
  name VARCHAR(120) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS role_permissions (
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name VARCHAR(180) NOT NULL,
  contact_person VARCHAR(120) NOT NULL,
  email VARCHAR(180) UNIQUE NOT NULL,
  phone VARCHAR(30) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role_code VARCHAR(40) NOT NULL REFERENCES roles(code),
  status VARCHAR(50) NOT NULL DEFAULT 'pending_email_verification',
  city VARCHAR(80) NOT NULL,
  number_of_vehicles VARCHAR(40),
  gst_number VARCHAR(40),
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  mobile_verified BOOLEAN NOT NULL DEFAULT FALSE,
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  admin_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS otp_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  destination VARCHAR(180) NOT NULL,
  channel VARCHAR(20) NOT NULL,
  otp_hash TEXT NOT NULL,
  attempts INT NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_token_hash TEXT NOT NULL,
  user_agent TEXT,
  ip_address VARCHAR(80),
  revoked BOOLEAN NOT NULL DEFAULT FALSE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  event VARCHAR(80) NOT NULL,
  recipient VARCHAR(180) NOT NULL,
  subject VARCHAR(220) NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'queued',
  provider_message_id VARCHAR(180),
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO roles (code, name, description) VALUES
('admin', 'Admin', 'MechPro internal administrator'),
('corporate', 'Corporate Client', 'Corporate business client'),
('broker', 'Insurance Broker', 'Insurance broker or agent'),
('fleet', 'Fleet Owner', 'Fleet owner or operator'),
('insurance', 'Insurance Company', 'Insurance company claims user'),
('workshop', 'Workshop / Service Provider', 'Workshop or service partner')
ON CONFLICT (code) DO NOTHING;
