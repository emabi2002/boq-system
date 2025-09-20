// Core BoQ System Types

export interface Tenant {
  id: string;
  name: string;
  code: string;
  defaultCurrency: string;
  decimalPrecision: number;
  defaultTaxPercent: number;
  numberingStyle: 'dot' | 'dash'; // 1.1 vs 1-1
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectType {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  color?: string;
  icon?: string;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
}

export interface UnitOfMeasure {
  id: string;
  tenantId: string;
  code: string; // m, m2, m3, kg, ls, no, etc.
  name: string;
  category?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Material {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  description?: string;
  defaultUomId: string;
  defaultUom?: UnitOfMeasure;
  typicalRate?: number;
  specRef?: string;
  category?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Equipment {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  description?: string;
  defaultUomId: string;
  defaultUom?: UnitOfMeasure;
  typicalRate?: number;
  specRef?: string;
  category?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LaborRole {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  description?: string;
  defaultUomId: string;
  defaultUom?: UnitOfMeasure;
  typicalRate?: number;
  category?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RateSet {
  id: string;
  tenantId: string;
  name: string;
  effectiveDate: Date;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
  rates: RateEntry[];
}

export interface RateEntry {
  id: string;
  rateSetId: string;
  itemType: 'material' | 'equipment' | 'labor';
  itemId: string;
  rate: number;
  uomId: string;
  uom?: UnitOfMeasure;
  notes?: string;
}

export interface Template {
  id: string;
  tenantId: string;
  name: string;
  projectTypeId: string;
  projectType?: ProjectType;
  version: string;
  status: 'draft' | 'published' | 'archived';
  notes?: string;
  groupCodeStyle: string; // "1.0", "A", "A.0"
  itemCodeStyle: string; // "1.1", "1-1", "A.1"
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
  publishedAt?: Date;
  publishedBy?: string;
  groups: TemplateGroup[];
  customFields: CustomField[];
}

export interface TemplateGroup {
  id: string;
  templateId: string;
  code: string; // 1.0, 2.0, etc.
  title: string;
  orderNo: number;
  items: TemplateItem[];
}

export interface TemplateItem {
  id: string;
  templateId: string;
  groupId: string;
  code: string; // 1.1, 1.2, etc.
  description: string;
  uomId: string;
  uom?: UnitOfMeasure;
  defaultQty?: number;
  defaultRate?: number;
  specRef?: string;
  remarks?: string;
  orderNo: number;
  customValues: CustomValue[];
}

export interface Project {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  client?: string;
  location?: string;
  startDate?: Date;
  endDate?: Date;
  currency: string;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
  boqs: ProjectBoq[];
}

export interface ProjectBoq {
  id: string;
  tenantId: string;
  projectId: string;
  project?: Project;
  templateId: string;
  template?: Template;
  name: string;
  version: string;
  revision: number;
  status: 'draft' | 'issued' | 'approved' | 'archived';
  currency: string;
  taxPercent: number;
  contingencyPercent: number;
  overheadPercent: number;
  profitPercent: number;
  rateSetId?: string;
  rateSet?: RateSet;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
  approvedAt?: Date;
  approvedBy?: string;
  sections: BoqSection[];
  customFields: CustomField[];
}

export interface BoqSection {
  id: string;
  boqId: string;
  code: string;
  title: string;
  orderNo: number;
  lines: BoqLine[];
}

export interface BoqLine {
  id: string;
  boqId: string;
  sectionId: string;
  code: string;
  description: string;
  uomId: string;
  uom?: UnitOfMeasure;
  qty: number;
  rate: number;
  amount: number; // computed: qty * rate
  specRef?: string;
  remarks?: string;
  isLocked: boolean;
  isProvisional: boolean;
  orderNo: number;
  customValues: CustomValue[];
}

export interface CustomField {
  id: string;
  tenantId: string;
  ownerScope: 'template_item' | 'boq_line';
  key: string;
  label: string;
  dataType: 'text' | 'number' | 'select' | 'boolean' | 'date';
  options?: string[]; // for select type
  isRequired: boolean;
  isVisible: boolean;
  orderNo: number;
}

export interface CustomValue {
  id: string;
  tenantId: string;
  ownerType: 'template_item' | 'boq_line';
  ownerId: string;
  fieldKey: string;
  value: any;
}

export interface AuditLog {
  id: string;
  tenantId: string;
  entityType: string;
  entityId: string;
  action: 'create' | 'update' | 'delete' | 'publish' | 'approve';
  userId: string;
  userName: string;
  changes: Record<string, { old: any; new: any }>;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}

export interface User {
  id: string;
  tenantId: string;
  email: string;
  name: string;
  role: 'admin' | 'engineer' | 'viewer';
  permissions: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// UI-specific types
export interface DashboardCard {
  title: string;
  value: number | string;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  action?: {
    label: string;
    href: string;
  };
}

export interface TableColumn {
  key: string;
  label: string;
  width?: number;
  type: 'text' | 'number' | 'select' | 'boolean' | 'date';
  editable?: boolean;
  required?: boolean;
  options?: string[];
}

export interface BulkOperation {
  type: 'fillDown' | 'setRate' | 'increasePercent' | 'decreasePercent' | 'round' | 'delete';
  field?: string;
  value?: any;
  percent?: number;
  decimals?: number;
}

export interface ImportResult {
  success: boolean;
  errors: ImportError[];
  warnings: ImportWarning[];
  imported: number;
  skipped: number;
}

export interface ImportError {
  row: number;
  column: string;
  message: string;
  value: any;
}

export interface ImportWarning {
  row: number;
  column: string;
  message: string;
  value: any;
}

export interface ExportOptions {
  format: 'excel' | 'pdf';
  includeGroups: boolean;
  includeTotals: boolean;
  includeCustomFields: boolean;
  showFormulas: boolean; // Excel only
  template: 'standard' | 'detailed' | 'summary';
}
