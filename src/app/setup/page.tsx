"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Database,
  CheckCircle,
  XCircle,
  Loader2,
  Play,
  FileText,
  Building,
  Package,
  Users,
  Settings
} from "lucide-react";

interface SetupStatus {
  connection: 'pending' | 'success' | 'failed';
  database: 'pending' | 'success' | 'failed';
  seedData: 'pending' | 'success' | 'failed';
  template: 'pending' | 'success' | 'failed';
}

interface SetupStep {
  id: keyof SetupStatus;
  title: string;
  description: string;
  action: string;
  icon: React.ComponentType<{ className?: string }>;
}

export default function SetupPage() {
  const [status, setStatus] = useState<SetupStatus>({
    connection: 'pending',
    database: 'pending',
    seedData: 'pending',
    template: 'pending'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const steps: SetupStep[] = [
    {
      id: 'connection',
      title: 'Database Connection',
      description: 'Test connection to Supabase database',
      action: 'check-connection',
      icon: Database
    },
    {
      id: 'database',
      title: 'Initialize Database',
      description: 'Create tables and setup schema',
      action: 'setup-database',
      icon: Settings
    },
    {
      id: 'template',
      title: 'Create Road Template',
      description: 'Generate comprehensive road construction template',
      action: 'create-road-template',
      icon: FileText
    }
  ];

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const executeStep = async (step: SetupStep) => {
    setCurrentStep(step.id);
    addLog(`Starting: ${step.title}`);

    try {
      const response = await fetch('/api/setup-database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: step.action }),
      });

      const result = await response.json();

      if (result.success) {
        setStatus(prev => ({ ...prev, [step.id]: 'success' }));
        addLog(`✅ ${step.title} completed successfully`);
        if (result.message) {
          addLog(`   ${result.message}`);
        }
      } else {
        setStatus(prev => ({ ...prev, [step.id]: 'failed' }));
        addLog(`❌ ${step.title} failed: ${result.message}`);
      }
    } catch (error) {
      setStatus(prev => ({ ...prev, [step.id]: 'failed' }));
      addLog(`❌ ${step.title} failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    setCurrentStep(null);
  };

  const runFullSetup = async () => {
    setIsLoading(true);
    addLog('🚀 Starting full database setup...');

    // Reset all statuses
    setStatus({
      connection: 'pending',
      database: 'pending',
      seedData: 'pending',
      template: 'pending'
    });

    // Run steps sequentially
    for (const step of steps) {
      await executeStep(step);

      // Stop if any step fails
      if (status[step.id] === 'failed') {
        addLog('❌ Setup failed. Please fix the error and try again.');
        setIsLoading(false);
        return;
      }
    }

    setIsLoading(false);
    addLog('🎉 Database setup completed successfully!');
  };

  const runSingleStep = async (step: SetupStep) => {
    setIsLoading(true);
    await executeStep(step);
    setIsLoading(false);
  };

  const getStatusIcon = (stepStatus: string, stepId: string) => {
    if (currentStep === stepId) {
      return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
    }

    switch (stepStatus) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-gray-300" />;
    }
  };

  const getStatusBadge = (stepStatus: string) => {
    switch (stepStatus) {
      case 'success':
        return <Badge className="bg-green-500">Complete</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const allStepsComplete = Object.values(status).every(s => s === 'success');
  const hasFailures = Object.values(status).some(s => s === 'failed');

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <Database className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">BoQ System Setup</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Initialize your BoQ Management System with Supabase database.
            This process will create the required tables, seed data, and sample templates.
          </p>
        </div>

        {/* Setup Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Setup Progress</CardTitle>
            <CardDescription>
              Database initialization steps
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Progress Overview */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      disabled={isLoading}
                      className="flex items-center space-x-2"
                    >
                      <Play className="h-4 w-4" />
                      <span>Run Full Setup</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Run Full Database Setup?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will initialize your Supabase database with the BoQ system schema and seed data.
                        Make sure your Supabase credentials are correctly configured in the environment variables.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={runFullSetup}>
                        Initialize Database
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              {allStepsComplete && (
                <Badge className="bg-green-500 text-lg px-4 py-2">
                  🎉 Setup Complete!
                </Badge>
              )}

              {hasFailures && (
                <Badge variant="destructive" className="text-lg px-4 py-2">
                  ⚠️ Setup Failed
                </Badge>
              )}
            </div>

            <Separator />

            {/* Individual Steps */}
            <div className="space-y-4">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const stepStatus = status[step.id];

                return (
                  <div key={step.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className="flex-shrink-0">
                      {getStatusIcon(stepStatus, step.id)}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <h3 className="font-medium">{step.title}</h3>
                        {getStatusBadge(stepStatus)}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {step.description}
                      </p>
                    </div>

                    <div className="flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => runSingleStep(step)}
                        disabled={isLoading}
                      >
                        {currentStep === step.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Run'
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Setup Logs */}
        {logs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Setup Logs</CardTitle>
              <CardDescription>
                Real-time progress and status messages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm max-h-64 overflow-y-auto">
                {logs.map((log, index) => (
                  <div key={index} className="whitespace-pre-wrap">
                    {log}
                  </div>
                ))}
              </div>
              {logs.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => setLogs([])}
                >
                  Clear Logs
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Success Actions */}
        {allStepsComplete && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800">🎉 Setup Complete!</CardTitle>
              <CardDescription className="text-green-700">
                Your BoQ Management System is ready to use
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-green-800">
                  The database has been successfully initialized with:
                </p>
                <ul className="list-disc list-inside text-green-700 space-y-1">
                  <li>Complete database schema with all required tables</li>
                  <li>Sample tenant (PNG Construction Company)</li>
                  <li>Project types (Road, Bridge, ICT Infrastructure)</li>
                  <li>Units of measure (LS, m, m², m³, t, no, km, hr, day)</li>
                  <li>Sample materials, equipment, and labor roles</li>
                  <li>Road Construction template with 10+ groups and 60+ items</li>
                </ul>
                <div className="flex space-x-2 pt-4">
                  <Button asChild>
                    <a href="/">Go to Dashboard</a>
                  </Button>
                  <Button asChild variant="outline">
                    <a href="/templates">View Templates</a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Environment Check */}
        <Card>
          <CardHeader>
            <CardTitle>Environment Configuration</CardTitle>
            <CardDescription>
              Verify your Supabase environment variables
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium">Required Environment Variables:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-2">
                  <li>NEXT_PUBLIC_SUPABASE_URL</li>
                  <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
                  <li>SUPABASE_SERVICE_ROLE_KEY</li>
                  <li>DATABASE_URL</li>
                </ul>
              </div>
              <div>
                <p className="font-medium">Configuration Status:</p>
                <div className="space-y-1 mt-2">
                  <div className="flex items-center space-x-2">
                    {process.env.NEXT_PUBLIC_SUPABASE_URL ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm">Supabase URL</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm">Anon Key</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
