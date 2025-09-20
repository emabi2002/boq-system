"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Database,
  CheckCircle,
  AlertCircle,
  Loader2,
  Play,
  Refresh,
  FileText,
  Building
} from "lucide-react";

interface SetupStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  message?: string;
}

export default function DatabaseAdminPage() {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [isSetupRunning, setIsSetupRunning] = useState(false);
  const [steps, setSteps] = useState<SetupStep[]>([
    {
      id: 'connection',
      title: 'Database Connection',
      description: 'Verify connection to Supabase database',
      status: 'pending'
    },
    {
      id: 'schema',
      title: 'Database Schema',
      description: 'Initialize database tables and schema',
      status: 'pending'
    },
    {
      id: 'seed-data',
      title: 'Seed Data',
      description: 'Create initial tenant, project types, and UoMs',
      status: 'pending'
    },
    {
      id: 'road-template',
      title: 'Road Template',
      description: 'Create comprehensive Road Construction template',
      status: 'pending'
    }
  ]);

  const updateStepStatus = (stepId: string, status: SetupStep['status'], message?: string) => {
    setSteps(prev => prev.map(step =>
      step.id === stepId
        ? { ...step, status, message }
        : step
    ));
  };

  const resetSteps = () => {
    setSteps(prev => prev.map(step => ({
      ...step,
      status: 'pending' as const,
      message: undefined
    })));
  };

  const checkConnection = async () => {
    setConnectionStatus('checking');
    try {
      const response = await fetch('/api/setup-database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'check-connection' })
      });

      const result = await response.json();
      setConnectionStatus(result.success ? 'connected' : 'disconnected');
      updateStepStatus('connection', result.success ? 'completed' : 'error', result.message);
    } catch (error) {
      setConnectionStatus('disconnected');
      updateStepStatus('connection', 'error', 'Failed to check connection');
    }
  };

  const runFullSetup = async () => {
    setIsSetupRunning(true);
    resetSteps();

    try {
      // Step 1: Check connection
      updateStepStatus('connection', 'running');
      await checkConnection();
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 2: Setup database
      updateStepStatus('schema', 'running');
      const setupResponse = await fetch('/api/setup-database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'setup-database' })
      });

      const setupResult = await setupResponse.json();
      updateStepStatus('schema', setupResult.success ? 'completed' : 'error', setupResult.message);
      updateStepStatus('seed-data', setupResult.success ? 'completed' : 'error',
        setupResult.success ? 'Tenant and basic data created' : setupResult.message);

      if (!setupResult.success) {
        throw new Error(setupResult.message);
      }

      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 3: Create road template
      updateStepStatus('road-template', 'running');
      const templateResponse = await fetch('/api/setup-database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create-road-template' })
      });

      const templateResult = await templateResponse.json();
      updateStepStatus('road-template', templateResult.success ? 'completed' : 'error', templateResult.message);

    } catch (error) {
      console.error('Setup failed:', error);
    } finally {
      setIsSetupRunning(false);
    }
  };

  const getStepIcon = (status: SetupStep['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error': return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'running': return <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />;
      default: return <div className="h-5 w-5 rounded-full border-2 border-gray-300" />;
    }
  };

  const getStepBadge = (status: SetupStep['status']) => {
    switch (status) {
      case 'completed': return <Badge variant="default" className="bg-green-600">Completed</Badge>;
      case 'error': return <Badge variant="destructive">Error</Badge>;
      case 'running': return <Badge variant="outline">Running...</Badge>;
      default: return <Badge variant="outline">Pending</Badge>;
    }
  };

  const allStepsCompleted = steps.every(step => step.status === 'completed');
  const hasErrors = steps.some(step => step.status === 'error');

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Database Administration</h1>
          <p className="text-muted-foreground">
            Initialize and manage the BoQ system database
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={checkConnection} disabled={isSetupRunning}>
            <Refresh className="mr-2 h-4 w-4" />
            Check Connection
          </Button>
          <Button onClick={runFullSetup} disabled={isSetupRunning}>
            {isSetupRunning ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Play className="mr-2 h-4 w-4" />
            )}
            Run Full Setup
          </Button>
        </div>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="mr-2 h-5 w-5" />
            Database Connection
          </CardTitle>
          <CardDescription>
            Current status of the Supabase database connection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            {connectionStatus === 'checking' && (
              <>
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                <span>Checking connection...</span>
              </>
            )}
            {connectionStatus === 'connected' && (
              <>
                <CheckCircle className="h-6 w-6 text-green-600" />
                <span className="text-green-600 font-medium">Connected</span>
                <Badge variant="default" className="bg-green-600">Ready</Badge>
              </>
            )}
            {connectionStatus === 'disconnected' && (
              <>
                <AlertCircle className="h-6 w-6 text-red-600" />
                <span className="text-red-600 font-medium">Disconnected</span>
                <Badge variant="destructive">Error</Badge>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Setup Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Database Setup Progress</CardTitle>
          <CardDescription>
            Initialize the database with schema, seed data, and templates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {steps.map((step, index) => (
            <div key={step.id}>
              <div className="flex items-center space-x-4">
                {getStepIcon(step.status)}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{step.title}</h3>
                    {getStepBadge(step.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                  {step.message && (
                    <p className={`text-sm mt-1 ${
                      step.status === 'error' ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {step.message}
                    </p>
                  )}
                </div>
              </div>
              {index < steps.length - 1 && <Separator className="my-4" />}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Status Alerts */}
      {allStepsCompleted && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Database setup completed successfully! Your BoQ system is ready to use.
          </AlertDescription>
        </Alert>
      )}

      {hasErrors && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Some setup steps failed. Please check the error messages above and try again.
          </AlertDescription>
        </Alert>
      )}

      {/* Setup Information */}
      <Card>
        <CardHeader>
          <CardTitle>What Gets Initialized</CardTitle>
          <CardDescription>
            Overview of the data and structures created during setup
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Database Schema</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Tenants and user management</li>
                <li>• Project types and templates</li>
                <li>• Units of measure and catalogs</li>
                <li>• BoQ structures and calculations</li>
                <li>• Audit logging and permissions</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Initial Data</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• PNG Construction Company tenant</li>
                <li>• Road, Bridge, ICT project types</li>
                <li>• Standard units of measure (m, m², m³, etc.)</li>
                <li>• Sample materials and equipment</li>
                <li>• Complete road construction template</li>
              </ul>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium mb-2">Road Construction Template</h4>
            <p className="text-sm text-muted-foreground mb-3">
              A comprehensive template with 10 sections and 60+ line items covering:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
              <Badge variant="outline">General Clauses</Badge>
              <Badge variant="outline">Establishment</Badge>
              <Badge variant="outline">Clearing & Grubbing</Badge>
              <Badge variant="outline">Earthworks</Badge>
              <Badge variant="outline">Drainage</Badge>
              <Badge variant="outline">Pavement</Badge>
              <Badge variant="outline">Structures</Badge>
              <Badge variant="outline">Road Furniture</Badge>
              <Badge variant="outline">Environmental</Badge>
              <Badge variant="outline">Provisional Sums</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Database Info */}
      <Card>
        <CardHeader>
          <CardTitle>Database Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Database Provider:</span>
              <span className="font-medium">Supabase PostgreSQL</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Connection URL:</span>
              <span className="font-mono text-xs">ukbohbhacwieqxnzaqiy.supabase.co</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Row Level Security:</span>
              <span className="font-medium">Enabled</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Realtime:</span>
              <span className="font-medium">Available</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
