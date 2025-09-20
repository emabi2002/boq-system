-- BoQ Management System Database Schema

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'gobqlI4oWeN8iHU+alzlo8F1afYUnffTV0XKQZdbyxuUgwavguA9OvQCY2DCxa0lvbqOi0RiM9hzuk6GQENvXw==';

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tenants table
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    default_currency TEXT NOT NULL DEFAULT 'PGK',
    decimal_precision INTEGER NOT NULL DEFAULT 2,
    default_tax_percent DECIMAL(5,2) NOT NULL DEFAULT 10.00,
    numbering_style TEXT NOT NULL DEFAULT 'dot',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project Types table
CREATE TABLE IF NOT EXISTS project_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    color TEXT,
    icon TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID,
    UNIQUE(tenant_id, code)
);

-- Units of Measure table
CREATE TABLE IF NOT EXISTS units_of_measure (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    category TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, code)
);

-- Materials table
CREATE TABLE IF NOT EXISTS materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    default_uom_id UUID REFERENCES units_of_measure(id),
    typical_rate DECIMAL(15,4),
    spec_ref TEXT,
    category TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, code)
);

-- Equipment table
CREATE TABLE IF NOT EXISTS equipment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    default_uom_id UUID REFERENCES units_of_measure(id),
    typical_rate DECIMAL(15,4),
    spec_ref TEXT,
    category TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, code)
);

-- Labor Roles table
CREATE TABLE IF NOT EXISTS labor_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    default_uom_id UUID REFERENCES units_of_measure(id),
    typical_rate DECIMAL(15,4),
    category TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, code)
);

-- Rate Sets table
CREATE TABLE IF NOT EXISTS rate_sets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    effective_date DATE NOT NULL,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID
);

-- Rate Entries table
CREATE TABLE IF NOT EXISTS rate_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rate_set_id UUID NOT NULL REFERENCES rate_sets(id) ON DELETE CASCADE,
    item_type TEXT NOT NULL CHECK (item_type IN ('material', 'equipment', 'labor')),
    item_id UUID NOT NULL,
    rate DECIMAL(15,4) NOT NULL,
    uom_id UUID NOT NULL REFERENCES units_of_measure(id),
    notes TEXT
);

-- Templates table
CREATE TABLE IF NOT EXISTS templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    project_type_id UUID REFERENCES project_types(id),
    version TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    notes TEXT,
    group_code_style TEXT NOT NULL DEFAULT '1.0',
    item_code_style TEXT NOT NULL DEFAULT '1.1',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID,
    published_at TIMESTAMPTZ,
    published_by UUID
);

-- Template Groups table
CREATE TABLE IF NOT EXISTS template_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    title TEXT NOT NULL,
    order_no INTEGER NOT NULL
);

-- Template Items table
CREATE TABLE IF NOT EXISTS template_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
    group_id UUID NOT NULL REFERENCES template_groups(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    description TEXT NOT NULL,
    uom_id UUID NOT NULL REFERENCES units_of_measure(id),
    default_qty DECIMAL(15,4),
    default_rate DECIMAL(15,4),
    spec_ref TEXT,
    remarks TEXT,
    order_no INTEGER NOT NULL
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    client TEXT,
    location TEXT,
    start_date DATE,
    end_date DATE,
    currency TEXT NOT NULL DEFAULT 'PGK',
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID,
    UNIQUE(tenant_id, code)
);

-- Project BoQs table
CREATE TABLE IF NOT EXISTS project_boqs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    template_id UUID REFERENCES templates(id),
    name TEXT NOT NULL,
    version TEXT NOT NULL,
    revision INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'issued', 'approved', 'archived')),
    currency TEXT NOT NULL,
    tax_percent DECIMAL(5,2) NOT NULL,
    contingency_percent DECIMAL(5,2) NOT NULL,
    overhead_percent DECIMAL(5,2) NOT NULL,
    profit_percent DECIMAL(5,2) NOT NULL,
    rate_set_id UUID REFERENCES rate_sets(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID,
    approved_at TIMESTAMPTZ,
    approved_by UUID
);

-- BoQ Sections table
CREATE TABLE IF NOT EXISTS boq_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    boq_id UUID NOT NULL REFERENCES project_boqs(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    title TEXT NOT NULL,
    order_no INTEGER NOT NULL
);

-- BoQ Lines table
CREATE TABLE IF NOT EXISTS boq_lines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    boq_id UUID NOT NULL REFERENCES project_boqs(id) ON DELETE CASCADE,
    section_id UUID NOT NULL REFERENCES boq_sections(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    description TEXT NOT NULL,
    uom_id UUID NOT NULL REFERENCES units_of_measure(id),
    qty DECIMAL(15,4) NOT NULL,
    rate DECIMAL(15,4) NOT NULL,
    amount DECIMAL(15,4) NOT NULL,
    spec_ref TEXT,
    remarks TEXT,
    is_locked BOOLEAN DEFAULT false,
    is_provisional BOOLEAN DEFAULT false,
    order_no INTEGER NOT NULL
);

-- Custom Fields table
CREATE TABLE IF NOT EXISTS custom_fields (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    owner_scope TEXT NOT NULL CHECK (owner_scope IN ('template_item', 'boq_line')),
    key TEXT NOT NULL,
    label TEXT NOT NULL,
    data_type TEXT NOT NULL CHECK (data_type IN ('text', 'number', 'select', 'boolean', 'date')),
    options JSONB,
    is_required BOOLEAN DEFAULT false,
    is_visible BOOLEAN DEFAULT true,
    order_no INTEGER NOT NULL
);

-- Custom Values table
CREATE TABLE IF NOT EXISTS custom_values (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    owner_type TEXT NOT NULL CHECK (owner_type IN ('template_item', 'boq_line')),
    owner_id UUID NOT NULL,
    field_key TEXT NOT NULL,
    value JSONB
);

-- Audit Logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete', 'publish', 'approve')),
    user_id UUID,
    user_name TEXT,
    changes JSONB,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- Users table (basic auth)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'engineer', 'viewer')),
    permissions TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_project_types_tenant_id ON project_types(tenant_id);
CREATE INDEX IF NOT EXISTS idx_units_of_measure_tenant_id ON units_of_measure(tenant_id);
CREATE INDEX IF NOT EXISTS idx_materials_tenant_id ON materials(tenant_id);
CREATE INDEX IF NOT EXISTS idx_equipment_tenant_id ON equipment(tenant_id);
CREATE INDEX IF NOT EXISTS idx_labor_roles_tenant_id ON labor_roles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_templates_tenant_id ON templates(tenant_id);
CREATE INDEX IF NOT EXISTS idx_template_groups_template_id ON template_groups(template_id);
CREATE INDEX IF NOT EXISTS idx_template_items_template_id ON template_items(template_id);
CREATE INDEX IF NOT EXISTS idx_template_items_group_id ON template_items(group_id);
CREATE INDEX IF NOT EXISTS idx_projects_tenant_id ON projects(tenant_id);
CREATE INDEX IF NOT EXISTS idx_project_boqs_tenant_id ON project_boqs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_project_boqs_project_id ON project_boqs(project_id);
CREATE INDEX IF NOT EXISTS idx_boq_sections_boq_id ON boq_sections(boq_id);
CREATE INDEX IF NOT EXISTS idx_boq_lines_boq_id ON boq_lines(boq_id);
CREATE INDEX IF NOT EXISTS idx_boq_lines_section_id ON boq_lines(section_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_id ON audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);

-- Enable Row Level Security
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE units_of_measure ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE labor_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_boqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE boq_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE boq_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allowing all for now - can be restricted later)
CREATE POLICY "Allow all operations" ON tenants FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON project_types FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON units_of_measure FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON materials FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON equipment FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON labor_roles FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON rate_sets FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON rate_entries FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON templates FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON template_groups FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON template_items FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON projects FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON project_boqs FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON boq_sections FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON boq_lines FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON custom_fields FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON custom_values FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON audit_logs FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON users FOR ALL USING (true);
