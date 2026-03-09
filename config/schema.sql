-- Veridion PostgreSQL Database Schema
-- Universal Product Supply Chain Tracking Platform
-- Run: psql -U postgres -d veridion -f config/schema.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop old tables if they exist
DROP TABLE IF EXISTS analytics CASCADE;
DROP TABLE IF EXISTS scans CASCADE;
DROP TABLE IF EXISTS transfers CASCADE;
DROP TABLE IF EXISTS batches CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS companies CASCADE;

-- Companies (Tenants)
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name TEXT UNIQUE NOT NULL,
  industry TEXT NOT NULL,
  registration_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products (Master Data)
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  product_category TEXT NOT NULL,
  description TEXT,
  sku TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product Batches (Instances)
CREATE TABLE product_batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id TEXT UNIQUE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE RESTRICT,
  manufacturer_address TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  production_date TIMESTAMPTZ NOT NULL,
  expiry_date TIMESTAMPTZ,
  origin_location TEXT,
  status TEXT NOT NULL DEFAULT 'CREATED',
  trust_score INTEGER DEFAULT 100,
  blockchain_tx TEXT,
  qr_code_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tracking Events (Unified Log)
CREATE TABLE tracking_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id TEXT NOT NULL REFERENCES product_batches(batch_id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'CREATED', 'TRANSFERRED', 'RECEIVED', 'SCANNED', 'FLAGGED'
  actor_address TEXT,
  actor_name TEXT,
  stage TEXT NOT NULL, -- e.g. Manufacturer, Distributor, Vendor, Retailer, Consumer
  location TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB, -- Dynamic attributes (gps, temperature, notes, etc)
  blockchain_tx_hash TEXT,
  is_anomaly BOOLEAN DEFAULT FALSE
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_product_batches_batch_id ON product_batches(batch_id);
CREATE INDEX idx_product_batches_product_id ON product_batches(product_id);
CREATE INDEX idx_tracking_events_batch_id ON tracking_events(batch_id);
CREATE INDEX idx_tracking_events_type ON tracking_events(event_type);

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_batches_updated_at BEFORE UPDATE ON product_batches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- DUMMY DATA FOR PRESENTATION
-- =============================================

-- Demo Companies
INSERT INTO companies (id, company_name, industry) VALUES
('c1000000-0000-0000-0000-000000000000', 'Veridion Admin', 'Technology'),
('c2000000-0000-0000-0000-000000000000', 'TechNova Solutions', 'Electronics'),
('c3000000-0000-0000-0000-000000000000', 'SwiftMove Logistics', 'Logistics'),
('c4000000-0000-0000-0000-000000000000', 'GreenMart Retail', 'Retail')
ON CONFLICT DO NOTHING;

-- Demo Users
INSERT INTO users (email, password_hash, full_name, role, company_id) VALUES
('admin@veridion.io', '$2a$10$rQhVx5UvRqSYq8OxQqmCJOJw3kVxjZ5yzV8hGj/L6F5Y5lPxD9Ede', 'Admin User', 'admin', 'c1000000-0000-0000-0000-000000000000'),
('producer@veridion.io', '$2a$10$rQhVx5UvRqSYq8OxQqmCJOJw3kVxjZ5yzV8hGj/L6F5Y5lPxD9Ede', 'Ravi Mehta', 'manufacturer', 'c2000000-0000-0000-0000-000000000000'),
('logistics@veridion.io', '$2a$10$rQhVx5UvRqSYq8OxQqmCJOJw3kVxjZ5yzV8hGj/L6F5Y5lPxD9Ede', 'Priya Sharma', 'distributor', 'c3000000-0000-0000-0000-000000000000'),
('vendor@veridion.io', '$2a$10$rQhVx5UvRqSYq8OxQqmCJOJw3kVxjZ5yzV8hGj/L6F5Y5lPxD9Ede', 'Amit Patel', 'vendor', 'c4000000-0000-0000-0000-000000000000')
ON CONFLICT (email) DO NOTHING;

-- Demo Products
INSERT INTO products (id, company_id, product_name, product_category, sku, description) VALUES
('p1000000-0000-0000-0000-000000000000', 'c2000000-0000-0000-0000-000000000000', 'Galaxy Pro Max X1', 'Electronics', 'SKU-GP-X1-256', 'Flagship smartphone with 6.8" AMOLED display'),
('p2000000-0000-0000-0000-000000000000', 'c2000000-0000-0000-0000-000000000000', 'Organic Darjeeling Tea', 'Food', 'SKU-ODT-500', 'Premium first flush Darjeeling tea')
ON CONFLICT (sku) DO NOTHING;

-- Demo Product Batches
INSERT INTO product_batches (batch_id, product_id, manufacturer_address, quantity, production_date, expiry_date, origin_location, status, trust_score) VALUES
('VRD-ELEC-001', 'p1000000-0000-0000-0000-000000000000', '0xA1B2C3D4E5F6A7B8C9D0E1F2A3B4C5D6E7F8A9B0', 5000, '2024-11-01', '2027-11-01', 'Shenzhen, China', 'DELIVERED', 98),
('VRD-FOOD-001', 'p2000000-0000-0000-0000-000000000000', '0xA1B2C3D4E5F6A7B8C9D0E1F2A3B4C5D6E7F8A9B0', 10000, '2024-08-01', '2025-08-01', 'Darjeeling, India', 'IN_TRANSIT', 88),
('VRD-FOOD-002-COUNTERFEIT', 'p2000000-0000-0000-0000-000000000000', '0xFAKE_MANUFACTURER', 5000, '2024-08-01', '2025-08-01', 'Unknown', 'FLAGGED', 23)
ON CONFLICT (batch_id) DO NOTHING;

-- Demo Tracking Events
INSERT INTO tracking_events (batch_id, event_type, actor_address, actor_name, stage, location, metadata, is_anomaly) VALUES
-- Normal flow for Electronics
('VRD-ELEC-001', 'CREATED', '0xA1B2C3D4E5F6A7B8C9D0E1F2A3B4C5D6E7F8A9B0', 'TechNova Solutions', 'Manufacturer', 'Shenzhen, China', '{"qa_passed": true}', false),
('VRD-ELEC-001', 'TRANSFERRED', '0xA1B2C3D4E5F6A7B8C9D0E1F2A3B4C5D6E7F8A9B0', 'TechNova Solutions', 'Logistics', 'Shenzhen Port', '{"container": "C-1002", "destination": "Mumbai"}', false),
('VRD-ELEC-001', 'RECEIVED', '0x1111AAAA2222BBBB3333CCCC4444DDDD5555EEEE', 'SwiftMove Logistics', 'Logistics', 'Mumbai Port', '{"condition": "Good"}', false),
('VRD-ELEC-001', 'TRANSFERRED', '0x1111AAAA2222BBBB3333CCCC4444DDDD5555EEEE', 'SwiftMove Logistics', 'Vendor', 'Mumbai Port', '{"carrier": "Local Trucking"}', false),
('VRD-ELEC-001', 'RECEIVED', '0x6666FFFF7777AAAA8888BBBB9999CCCC0000DDDD', 'GreenMart Retail', 'Vendor', 'Mumbai Store', '{"condition": "Good"}', false),
-- Food flow (incomplete)
('VRD-FOOD-001', 'CREATED', '0xA1B2C3D4E5F6A7B8C9D0E1F2A3B4C5D6E7F8A9B0', 'TechNova Agrotech', 'Manufacturer', 'Darjeeling, India', '{"organic_certified": true}', false),
('VRD-FOOD-001', 'TRANSFERRED', '0xA1B2C3D4E5F6A7B8C9D0E1F2A3B4C5D6E7F8A9B0', 'TechNova Agrotech', 'Logistics', 'Darjeeling', '{"temperature_controlled": true}', false),
-- Counterfeit (anomaly)
('VRD-FOOD-002-COUNTERFEIT', 'SCANNED', '0xSCANNER01', 'Unknown', 'Consumer', 'Remote Location', '{"ip": "192.168.1.1"}', true);
