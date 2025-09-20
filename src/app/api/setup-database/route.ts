import { NextRequest, NextResponse } from 'next/server';
import { setupDatabase, checkDatabaseConnection, createRoadConstructionTemplate } from '@/lib/setup-database';

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    switch (action) {
      case 'check-connection':
        const isConnected = await checkDatabaseConnection();
        return NextResponse.json({
          success: isConnected,
          message: isConnected
            ? 'Database connection successful'
            : 'Failed to connect to database'
        });

      case 'setup-database':
        const setupResult = await setupDatabase();
        return NextResponse.json(setupResult);

      case 'create-road-template':
        try {
          const templateId = await createRoadConstructionTemplate();
          return NextResponse.json({
            success: true,
            message: `Road Construction template created successfully (ID: ${templateId})`
          });
        } catch (error) {
          return NextResponse.json({
            success: false,
            message: error instanceof Error ? error.message : 'Failed to create template'
          });
        }

      default:
        return NextResponse.json({
          success: false,
          message: 'Invalid action'
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Database setup error:', error);
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}
