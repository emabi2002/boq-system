// Supabase Data Service for BoQ System
import { supabase } from './supabase';
import type {
  Tenant, ProjectType, UnitOfMeasure, Material, Equipment, LaborRole,
  RateSet, Template, TemplateGroup, TemplateItem, Project, ProjectBoq,
  BoqSection, BoqLine, CustomField, CustomValue, AuditLog, User
} from './types';

export class SupabaseDataService {
  // Tenants
  async getTenants(): Promise<Tenant[]> {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .order('name');

    if (error) throw error;
    return data?.map(this.mapTenant) || [];
  }

  async getTenant(id: string): Promise<Tenant | undefined> {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return undefined;
    return data ? this.mapTenant(data) : undefined;
  }

  // Project Types
  async getProjectTypes(tenantId: string): Promise<ProjectType[]> {
    const { data, error } = await supabase
      .from('project_types')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('name');

    if (error) throw error;
    return data?.map(this.mapProjectType) || [];
  }

  async createProjectType(data: Omit<ProjectType, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProjectType> {
    const { data: result, error } = await supabase
      .from('project_types')
      .insert({
        tenant_id: data.tenantId,
        code: data.code,
        name: data.name,
        color: data.color,
        icon: data.icon,
        created_by: data.createdBy,
        updated_by: data.updatedBy
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapProjectType(result);
  }

  async updateProjectType(id: string, data: Partial<ProjectType>): Promise<ProjectType | undefined> {
    const { data: result, error } = await supabase
      .from('project_types')
      .update({
        code: data.code,
        name: data.name,
        color: data.color,
        icon: data.icon,
        updated_by: data.updatedBy,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) return undefined;
    return result ? this.mapProjectType(result) : undefined;
  }

  async deleteProjectType(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('project_types')
      .delete()
      .eq('id', id);

    return !error;
  }

  // Units of Measure
  async getUnitsOfMeasure(tenantId: string): Promise<UnitOfMeasure[]> {
    const { data, error } = await supabase
      .from('units_of_measure')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('code');

    if (error) throw error;
    return data?.map(this.mapUnitOfMeasure) || [];
  }

  async createUnitOfMeasure(data: Omit<UnitOfMeasure, 'id' | 'createdAt' | 'updatedAt'>): Promise<UnitOfMeasure> {
    const { data: result, error } = await supabase
      .from('units_of_measure')
      .insert({
        tenant_id: data.tenantId,
        code: data.code,
        name: data.name,
        category: data.category,
        is_active: data.isActive
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapUnitOfMeasure(result);
  }

  async updateUnitOfMeasure(id: string, data: Partial<UnitOfMeasure>): Promise<UnitOfMeasure | undefined> {
    const { data: result, error } = await supabase
      .from('units_of_measure')
      .update({
        code: data.code,
        name: data.name,
        category: data.category,
        is_active: data.isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) return undefined;
    return result ? this.mapUnitOfMeasure(result) : undefined;
  }

  async deleteUnitOfMeasure(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('units_of_measure')
      .delete()
      .eq('id', id);

    return !error;
  }

  // Templates
  async getTemplates(tenantId: string): Promise<Template[]> {
    const { data, error } = await supabase
      .from('templates')
      .select(`
        *,
        project_types (*)
      `)
      .eq('tenant_id', tenantId)
      .order('name');

    if (error) throw error;
    return data?.map(this.mapTemplate) || [];
  }

  async getTemplate(id: string): Promise<Template | undefined> {
    const { data, error } = await supabase
      .from('templates')
      .select(`
        *,
        project_types (*),
        template_groups (
          *,
          template_items (
            *,
            units_of_measure (*)
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error) return undefined;
    return data ? this.mapTemplateWithGroups(data) : undefined;
  }

  async createTemplate(data: Omit<Template, 'id' | 'createdAt' | 'updatedAt' | 'groups' | 'customFields'>): Promise<Template> {
    const { data: result, error } = await supabase
      .from('templates')
      .insert({
        tenant_id: data.tenantId,
        name: data.name,
        project_type_id: data.projectTypeId,
        version: data.version,
        status: data.status,
        notes: data.notes,
        group_code_style: data.groupCodeStyle,
        item_code_style: data.itemCodeStyle,
        created_by: data.createdBy,
        updated_by: data.updatedBy
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapTemplate(result);
  }

  async updateTemplate(id: string, data: Partial<Template>): Promise<Template | undefined> {
    const { data: result, error } = await supabase
      .from('templates')
      .update({
        name: data.name,
        project_type_id: data.projectTypeId,
        version: data.version,
        status: data.status,
        notes: data.notes,
        group_code_style: data.groupCodeStyle,
        item_code_style: data.itemCodeStyle,
        updated_by: data.updatedBy,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) return undefined;
    return result ? this.mapTemplate(result) : undefined;
  }

  // Template Groups
  async createTemplateGroup(data: Omit<TemplateGroup, 'id' | 'items'>): Promise<TemplateGroup> {
    const { data: result, error } = await supabase
      .from('template_groups')
      .insert({
        template_id: data.templateId,
        code: data.code,
        title: data.title,
        order_no: data.orderNo
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapTemplateGroup(result);
  }

  async updateTemplateGroup(id: string, data: Partial<TemplateGroup>): Promise<TemplateGroup | undefined> {
    const { data: result, error } = await supabase
      .from('template_groups')
      .update({
        code: data.code,
        title: data.title,
        order_no: data.orderNo
      })
      .eq('id', id)
      .select()
      .single();

    if (error) return undefined;
    return result ? this.mapTemplateGroup(result) : undefined;
  }

  async deleteTemplateGroup(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('template_groups')
      .delete()
      .eq('id', id);

    return !error;
  }

  // Template Items
  async createTemplateItem(data: Omit<TemplateItem, 'id' | 'customValues'>): Promise<TemplateItem> {
    const { data: result, error } = await supabase
      .from('template_items')
      .insert({
        template_id: data.templateId,
        group_id: data.groupId,
        code: data.code,
        description: data.description,
        uom_id: data.uomId,
        default_qty: data.defaultQty,
        default_rate: data.defaultRate,
        spec_ref: data.specRef,
        remarks: data.remarks,
        order_no: data.orderNo
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapTemplateItem(result);
  }

  async updateTemplateItem(id: string, data: Partial<TemplateItem>): Promise<TemplateItem | undefined> {
    const { data: result, error } = await supabase
      .from('template_items')
      .update({
        code: data.code,
        description: data.description,
        uom_id: data.uomId,
        default_qty: data.defaultQty,
        default_rate: data.defaultRate,
        spec_ref: data.specRef,
        remarks: data.remarks,
        order_no: data.orderNo
      })
      .eq('id', id)
      .select()
      .single();

    if (error) return undefined;
    return result ? this.mapTemplateItem(result) : undefined;
  }

  async deleteTemplateItem(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('template_items')
      .delete()
      .eq('id', id);

    return !error;
  }

  // Projects
  async getProjects(tenantId: string): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('name');

    if (error) throw error;
    return data?.map(this.mapProject) || [];
  }

  async createProject(data: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'boqs'>): Promise<Project> {
    const { data: result, error } = await supabase
      .from('projects')
      .insert({
        tenant_id: data.tenantId,
        name: data.name,
        code: data.code,
        client: data.client,
        location: data.location,
        start_date: data.startDate?.toISOString().split('T')[0],
        end_date: data.endDate?.toISOString().split('T')[0],
        currency: data.currency,
        status: data.status,
        created_by: data.createdBy,
        updated_by: data.updatedBy
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapProject(result);
  }

  // Materials, Equipment, Labor Roles
  async getMaterials(tenantId: string): Promise<Material[]> {
    const { data, error } = await supabase
      .from('materials')
      .select(`
        *,
        units_of_measure (*)
      `)
      .eq('tenant_id', tenantId)
      .order('name');

    if (error) throw error;
    return data?.map(this.mapMaterial) || [];
  }

  async getEquipment(tenantId: string): Promise<Equipment[]> {
    const { data, error } = await supabase
      .from('equipment')
      .select(`
        *,
        units_of_measure (*)
      `)
      .eq('tenant_id', tenantId)
      .order('name');

    if (error) throw error;
    return data?.map(this.mapEquipment) || [];
  }

  async getLaborRoles(tenantId: string): Promise<LaborRole[]> {
    const { data, error } = await supabase
      .from('labor_roles')
      .select(`
        *,
        units_of_measure (*)
      `)
      .eq('tenant_id', tenantId)
      .order('name');

    if (error) throw error;
    return data?.map(this.mapLaborRole) || [];
  }

  // Rate Sets
  async getRateSets(tenantId: string): Promise<RateSet[]> {
    const { data, error } = await supabase
      .from('rate_sets')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('name');

    if (error) throw error;
    return data?.map(this.mapRateSet) || [];
  }

  // Dashboard statistics
  async getDashboardStats(tenantId: string) {
    const [projectsResult, templatesResult, boqsResult] = await Promise.all([
      supabase.from('projects').select('id', { count: 'exact' }).eq('tenant_id', tenantId),
      supabase.from('templates').select('id', { count: 'exact' }).eq('tenant_id', tenantId),
      supabase.from('project_boqs').select('id', { count: 'exact' }).eq('tenant_id', tenantId).neq('status', 'archived')
    ]);

    return {
      totalProjects: projectsResult.count || 0,
      totalTemplates: templatesResult.count || 0,
      activeBoqs: boqsResult.count || 0,
      recentExports: 0
    };
  }

  // Seed data initialization
  async initializeSeedData(): Promise<void> {
    // Check if tenant already exists
    const { data: existingTenant } = await supabase
      .from('tenants')
      .select('id')
      .eq('code', 'PCC')
      .single();

    if (existingTenant) {
      return; // Seed data already exists
    }

    try {
      // Create tenant
      const { data: tenant, error: tenantError } = await supabase
        .from('tenants')
        .insert({
          name: 'PNG Construction Company',
          code: 'PCC',
          default_currency: 'PGK',
          decimal_precision: 2,
          default_tax_percent: 10,
          numbering_style: 'dot'
        })
        .select()
        .single();

      if (tenantError) throw tenantError;

      // Create project types
      const { data: projectTypes, error: projectTypesError } = await supabase
        .from('project_types')
        .insert([
          {
            tenant_id: tenant.id,
            code: 'ROAD',
            name: 'Road Construction',
            color: '#3B82F6',
            icon: '🛣️',
            created_by: 'system',
            updated_by: 'system'
          },
          {
            tenant_id: tenant.id,
            code: 'BRIDGE',
            name: 'Bridge Construction',
            color: '#10B981',
            icon: '🌉',
            created_by: 'system',
            updated_by: 'system'
          },
          {
            tenant_id: tenant.id,
            code: 'ICT',
            name: 'ICT Infrastructure',
            color: '#8B5CF6',
            icon: '📡',
            created_by: 'system',
            updated_by: 'system'
          }
        ])
        .select();

      if (projectTypesError) throw projectTypesError;

      // Create UoMs
      const { data: uoms, error: uomsError } = await supabase
        .from('units_of_measure')
        .insert([
          { tenant_id: tenant.id, code: 'LS', name: 'Lump Sum', category: 'General', is_active: true },
          { tenant_id: tenant.id, code: 'm', name: 'Meter', category: 'Length', is_active: true },
          { tenant_id: tenant.id, code: 'm²', name: 'Square Meter', category: 'Area', is_active: true },
          { tenant_id: tenant.id, code: 'm³', name: 'Cubic Meter', category: 'Volume', is_active: true },
          { tenant_id: tenant.id, code: 't', name: 'Tonne', category: 'Weight', is_active: true },
          { tenant_id: tenant.id, code: 'no', name: 'Number', category: 'Count', is_active: true },
          { tenant_id: tenant.id, code: 'km', name: 'Kilometer', category: 'Length', is_active: true },
          { tenant_id: tenant.id, code: 'hr', name: 'Hour', category: 'Time', is_active: true },
          { tenant_id: tenant.id, code: 'day', name: 'Day', category: 'Time', is_active: true }
        ])
        .select();

      if (uomsError) throw uomsError;

      // Create sample materials
      await supabase
        .from('materials')
        .insert([
          {
            tenant_id: tenant.id,
            code: 'CONC20',
            name: 'Concrete 20MPa',
            description: 'Ready mix concrete 20MPa',
            default_uom_id: uoms[3].id, // m³
            typical_rate: 450,
            spec_ref: 'AS 1379',
            category: 'Concrete',
            is_active: true
          },
          {
            tenant_id: tenant.id,
            code: 'AGGR20',
            name: 'Aggregate 20mm',
            description: 'Crushed rock aggregate 20mm',
            default_uom_id: uoms[4].id, // t
            typical_rate: 85,
            spec_ref: 'AS 2758.1',
            category: 'Aggregate',
            is_active: true
          }
        ]);

      // Create sample equipment
      await supabase
        .from('equipment')
        .insert([
          {
            tenant_id: tenant.id,
            code: 'EXC20T',
            name: 'Excavator 20T',
            description: '20 Tonne hydraulic excavator',
            default_uom_id: uoms[7].id, // hr
            typical_rate: 280,
            spec_ref: 'CAT 320D',
            category: 'Earthmoving',
            is_active: true
          }
        ]);

      // Create sample labor roles
      await supabase
        .from('labor_roles')
        .insert([
          {
            tenant_id: tenant.id,
            code: 'LAB-UN',
            name: 'Unskilled Laborer',
            description: 'General construction laborer',
            default_uom_id: uoms[7].id, // hr
            typical_rate: 25,
            category: 'Labor',
            is_active: true
          },
          {
            tenant_id: tenant.id,
            code: 'LAB-SK',
            name: 'Skilled Laborer',
            description: 'Skilled construction worker',
            default_uom_id: uoms[7].id, // hr
            typical_rate: 35,
            category: 'Labor',
            is_active: true
          }
        ]);

      // Create user
      await supabase
        .from('users')
        .insert({
          tenant_id: tenant.id,
          email: 'admin@pngcc.com',
          name: 'System Administrator',
          role: 'admin',
          permissions: ['*'],
          is_active: true
        });

      console.log('Seed data initialized successfully');
    } catch (error) {
      console.error('Error initializing seed data:', error);
      throw error;
    }
  }

  // Mapping functions to convert database types to application types
  private mapTenant(data: any): Tenant {
    return {
      id: data.id,
      name: data.name,
      code: data.code,
      defaultCurrency: data.default_currency,
      decimalPrecision: data.decimal_precision,
      defaultTaxPercent: data.default_tax_percent,
      numberingStyle: data.numbering_style,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  private mapProjectType(data: any): ProjectType {
    return {
      id: data.id,
      tenantId: data.tenant_id,
      code: data.code,
      name: data.name,
      color: data.color,
      icon: data.icon,
      createdAt: new Date(data.created_at),
      createdBy: data.created_by,
      updatedAt: new Date(data.updated_at),
      updatedBy: data.updated_by
    };
  }

  private mapUnitOfMeasure(data: any): UnitOfMeasure {
    return {
      id: data.id,
      tenantId: data.tenant_id,
      code: data.code,
      name: data.name,
      category: data.category,
      isActive: data.is_active,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  private mapTemplate(data: any): Template {
    return {
      id: data.id,
      tenantId: data.tenant_id,
      name: data.name,
      projectTypeId: data.project_type_id,
      projectType: data.project_types ? this.mapProjectType(data.project_types) : undefined,
      version: data.version,
      status: data.status,
      notes: data.notes,
      groupCodeStyle: data.group_code_style,
      itemCodeStyle: data.item_code_style,
      createdAt: new Date(data.created_at),
      createdBy: data.created_by,
      updatedAt: new Date(data.updated_at),
      updatedBy: data.updated_by,
      publishedAt: data.published_at ? new Date(data.published_at) : undefined,
      publishedBy: data.published_by,
      groups: [],
      customFields: []
    };
  }

  private mapTemplateWithGroups(data: any): Template {
    const template = this.mapTemplate(data);
    if (data.template_groups) {
      template.groups = data.template_groups.map((group: any) => ({
        ...this.mapTemplateGroup(group),
        items: group.template_items?.map((item: any) => ({
          ...this.mapTemplateItem(item),
          uom: item.units_of_measure ? this.mapUnitOfMeasure(item.units_of_measure) : undefined
        })) || []
      }));
    }
    return template;
  }

  private mapTemplateGroup(data: any): TemplateGroup {
    return {
      id: data.id,
      templateId: data.template_id,
      code: data.code,
      title: data.title,
      orderNo: data.order_no,
      items: []
    };
  }

  private mapTemplateItem(data: any): TemplateItem {
    return {
      id: data.id,
      templateId: data.template_id,
      groupId: data.group_id,
      code: data.code,
      description: data.description,
      uomId: data.uom_id,
      defaultQty: data.default_qty,
      defaultRate: data.default_rate,
      specRef: data.spec_ref,
      remarks: data.remarks,
      orderNo: data.order_no,
      customValues: []
    };
  }

  private mapProject(data: any): Project {
    return {
      id: data.id,
      tenantId: data.tenant_id,
      name: data.name,
      code: data.code,
      client: data.client,
      location: data.location,
      startDate: data.start_date ? new Date(data.start_date) : undefined,
      endDate: data.end_date ? new Date(data.end_date) : undefined,
      currency: data.currency,
      status: data.status,
      createdAt: new Date(data.created_at),
      createdBy: data.created_by,
      updatedAt: new Date(data.updated_at),
      updatedBy: data.updated_by,
      boqs: []
    };
  }

  private mapMaterial(data: any): Material {
    return {
      id: data.id,
      tenantId: data.tenant_id,
      code: data.code,
      name: data.name,
      description: data.description,
      defaultUomId: data.default_uom_id,
      defaultUom: data.units_of_measure ? this.mapUnitOfMeasure(data.units_of_measure) : undefined,
      typicalRate: data.typical_rate,
      specRef: data.spec_ref,
      category: data.category,
      isActive: data.is_active,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  private mapEquipment(data: any): Equipment {
    return {
      id: data.id,
      tenantId: data.tenant_id,
      code: data.code,
      name: data.name,
      description: data.description,
      defaultUomId: data.default_uom_id,
      defaultUom: data.units_of_measure ? this.mapUnitOfMeasure(data.units_of_measure) : undefined,
      typicalRate: data.typical_rate,
      specRef: data.spec_ref,
      category: data.category,
      isActive: data.is_active,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  private mapLaborRole(data: any): LaborRole {
    return {
      id: data.id,
      tenantId: data.tenant_id,
      code: data.code,
      name: data.name,
      description: data.description,
      defaultUomId: data.default_uom_id,
      defaultUom: data.units_of_measure ? this.mapUnitOfMeasure(data.units_of_measure) : undefined,
      typicalRate: data.typical_rate,
      category: data.category,
      isActive: data.is_active,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  private mapRateSet(data: any): RateSet {
    return {
      id: data.id,
      tenantId: data.tenant_id,
      name: data.name,
      effectiveDate: new Date(data.effective_date),
      notes: data.notes,
      isActive: data.is_active,
      createdAt: new Date(data.created_at),
      createdBy: data.created_by,
      updatedAt: new Date(data.updated_at),
      updatedBy: data.updated_by,
      rates: []
    };
  }
}

// Export singleton instance
export const supabaseDb = new SupabaseDataService();
