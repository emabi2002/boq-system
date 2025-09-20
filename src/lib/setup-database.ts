// Database Setup Script
import { supabaseAdmin } from './supabase';
import { supabaseDb } from './supabase-data';

export async function setupDatabase() {
  console.log('Setting up BoQ System database...');

  try {
    // Initialize seed data
    await supabaseDb.initializeSeedData();
    console.log('✅ Seed data initialized successfully');

    return { success: true, message: 'Database setup completed successfully' };
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    return {
      success: false,
      message: 'Database setup failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Function to check database connectivity
export async function checkDatabaseConnection() {
  try {
    const { data, error } = await supabaseAdmin
      .from('tenants')
      .select('id')
      .limit(1);

    if (error) {
      console.error('Database connection failed:', error);
      return false;
    }

    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// Function to create the road construction template with comprehensive data
export async function createRoadConstructionTemplate() {
  try {
    console.log('Creating Road Construction template...');

    // Get tenant and project type
    const { data: tenant, error: tenantError } = await supabaseAdmin
      .from('tenants')
      .select('id')
      .eq('code', 'PCC')
      .single();

    if (tenantError || !tenant) {
      throw new Error('Tenant not found');
    }

    const { data: projectType, error: projectTypeError } = await supabaseAdmin
      .from('project_types')
      .select('id')
      .eq('code', 'ROAD')
      .eq('tenant_id', tenant.id)
      .single();

    if (projectTypeError || !projectType) {
      throw new Error('Road project type not found');
    }

    // Check if template already exists
    const { data: existingTemplate } = await supabaseAdmin
      .from('templates')
      .select('id')
      .eq('name', 'Road Construction - Standard')
      .eq('tenant_id', tenant.id)
      .single();

    if (existingTemplate) {
      console.log('Road Construction template already exists');
      return existingTemplate.id;
    }

    // Create template
    const { data: template, error: templateError } = await supabaseAdmin
      .from('templates')
      .insert({
        tenant_id: tenant.id,
        name: 'Road Construction - Standard',
        project_type_id: projectType.id,
        version: '1.0',
        status: 'published',
        notes: 'Standard road construction template',
        group_code_style: '1.0',
        item_code_style: '1.1',
        created_by: 'system',
        updated_by: 'system',
        published_at: new Date().toISOString(),
        published_by: 'system'
      })
      .select()
      .single();

    if (templateError) {
      throw templateError;
    }

    // Get UoMs
    const { data: uoms, error: uomsError } = await supabaseAdmin
      .from('units_of_measure')
      .select('*')
      .eq('tenant_id', tenant.id);

    if (uomsError) {
      throw uomsError;
    }

    const getUomId = (code: string) => {
      const uom = uoms.find(u => u.code === code);
      return uom?.id || uoms[0].id; // fallback to first UoM
    };

    // Create template groups and items
    const groupsData = [
      {
        code: '1.0',
        title: 'General Clauses',
        items: [
          { code: '1.1', description: 'Mobilization and Demobilization', uom: 'LS', qty: 1, rate: 25000 },
          { code: '1.2', description: 'Traffic Management', uom: 'LS', qty: 1, rate: 15000 },
          { code: '1.3', description: 'Site Security and Safety', uom: 'LS', qty: 1, rate: 8000 }
        ]
      },
      {
        code: '2.0',
        title: 'Establishment',
        items: [
          { code: '2.1', description: 'Site Office and Facilities', uom: 'LS', qty: 1, rate: 12000 },
          { code: '2.2', description: 'Temporary Access Roads', uom: 'm', qty: 500, rate: 25 },
          { code: '2.3', description: 'Equipment Mobilization', uom: 'LS', qty: 1, rate: 18000 }
        ]
      },
      {
        code: '3.0',
        title: 'Clearing and Grubbing',
        items: [
          { code: '3.1', description: 'Clear and Grub Light Vegetation', uom: 'm²', qty: 25000, rate: 2.5 },
          { code: '3.2', description: 'Remove Trees 200-500mm dia', uom: 'no', qty: 45, rate: 150 },
          { code: '3.3', description: 'Remove Trees >500mm dia', uom: 'no', qty: 12, rate: 350 }
        ]
      },
      {
        code: '4.0',
        title: 'Earthworks',
        items: [
          { code: '4.1', description: 'Excavation in Common Material', uom: 'm³', qty: 15000, rate: 12 },
          { code: '4.2', description: 'Excavation in Rock', uom: 'm³', qty: 2500, rate: 45 },
          { code: '4.3', description: 'Embankment Construction', uom: 'm³', qty: 18000, rate: 15 },
          { code: '4.4', description: 'Compaction to 95% Modified AASHTO', uom: 'm³', qty: 20000, rate: 8 }
        ]
      },
      {
        code: '5.0',
        title: 'Drainage and Culverts',
        items: [
          { code: '5.1', description: 'Side Drains - Lined', uom: 'm', qty: 2800, rate: 85 },
          { code: '5.2', description: 'Cross Culverts 900mm dia', uom: 'm', qty: 150, rate: 450 },
          { code: '5.3', description: 'Headwalls and Wingwalls', uom: 'm³', qty: 85, rate: 650 },
          { code: '5.4', description: 'Catch Drains', uom: 'm', qty: 1200, rate: 75 }
        ]
      },
      {
        code: '6.0',
        title: 'Pavement',
        items: [
          { code: '6.1', description: 'Subgrade Preparation', uom: 'm²', qty: 28000, rate: 3.5 },
          { code: '6.2', description: 'Sub-base Course 150mm', uom: 'm³', qty: 4200, rate: 45 },
          { code: '6.3', description: 'Base Course 200mm', uom: 'm³', qty: 5600, rate: 65 },
          { code: '6.4', description: 'Prime Coat', uom: 'm²', qty: 28000, rate: 2.8 },
          { code: '6.5', description: 'Asphalt Concrete 40mm', uom: 'm³', qty: 1120, rate: 185 }
        ]
      },
      {
        code: '7.0',
        title: 'Structures',
        items: [
          { code: '7.1', description: 'Concrete Bridge Deck', uom: 'm²', qty: 450, rate: 750 },
          { code: '7.2', description: 'Bridge Barriers', uom: 'm', qty: 120, rate: 280 },
          { code: '7.3', description: 'Reinforcement Steel', uom: 't', qty: 35, rate: 2800 }
        ]
      },
      {
        code: '8.0',
        title: 'Road Furniture',
        items: [
          { code: '8.1', description: 'Road Marking - White Line', uom: 'm', qty: 14000, rate: 3.5 },
          { code: '8.2', description: 'Road Signs - Warning', uom: 'no', qty: 24, rate: 450 },
          { code: '8.3', description: 'Delineation Posts', uom: 'no', qty: 180, rate: 25 },
          { code: '8.4', description: 'Guardrail Installation', uom: 'm', qty: 800, rate: 125 }
        ]
      },
      {
        code: '9.0',
        title: 'Environmental and Social',
        items: [
          { code: '9.1', description: 'Revegetation and Landscaping', uom: 'm²', qty: 5000, rate: 8 },
          { code: '9.2', description: 'Erosion Control Measures', uom: 'm²', qty: 3500, rate: 12 },
          { code: '9.3', description: 'Community Liaison', uom: 'LS', qty: 1, rate: 15000 }
        ]
      },
      {
        code: '10.0',
        title: 'Provisional Sums',
        items: [
          { code: '10.1', description: 'Unforeseen Rock Excavation', uom: 'm³', qty: 500, rate: 45 },
          { code: '10.2', description: 'Additional Drainage', uom: 'LS', qty: 1, rate: 25000 },
          { code: '10.3', description: 'Utility Relocations', uom: 'LS', qty: 1, rate: 35000 }
        ]
      }
    ];

    for (const [groupIndex, groupData] of groupsData.entries()) {
      // Create group
      const { data: group, error: groupError } = await supabaseAdmin
        .from('template_groups')
        .insert({
          template_id: template.id,
          code: groupData.code,
          title: groupData.title,
          order_no: groupIndex + 1
        })
        .select()
        .single();

      if (groupError) {
        throw groupError;
      }

      // Create items for this group
      const itemsToInsert = groupData.items.map((itemData, itemIndex) => ({
        template_id: template.id,
        group_id: group.id,
        code: itemData.code,
        description: itemData.description,
        uom_id: getUomId(itemData.uom),
        default_qty: itemData.qty,
        default_rate: itemData.rate,
        order_no: itemIndex + 1
      }));

      const { error: itemsError } = await supabaseAdmin
        .from('template_items')
        .insert(itemsToInsert);

      if (itemsError) {
        throw itemsError;
      }
    }

    console.log('✅ Road Construction template created successfully');
    return template.id;
  } catch (error) {
    console.error('❌ Failed to create Road Construction template:', error);
    throw error;
  }
}
