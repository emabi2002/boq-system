"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Database,
  CheckCircle,
  AlertCircle,
  Loader2,
  Zap,
  FileText,
  Building
} from "lucide-react";

interface SetupStep {
  id: string;
  title: string;
  description: string;
  action: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  message?: string;
}

export function DatabaseSetup() {
  const [steps, setSteps] = useState<SetupStep[]>([
    {
      id: 'check-connection',
      title: 'Check Database Connection',
      description: 'Verify connection to Supabase database',
      action: 'check-connection',
      status: 'pending'
    },
    {
      id: 'setup-database',
      title: 'Initialize Database',
      description: 'Create schema and seed data',
      action: 'setup-database',
      status: 'pending'
    },
    {
      id: 'create-road-template',
      title: 'Create Road Template',
      description: 'Generate comprehensive road construction template',
      action: 'create-road-template',
      status: 'pending'
    }
  ]);

  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const updateStepStatus = (stepId: string, status: SetupStep['status'], message?: string) => {
    setSteps(prev => prev.map(step =>
      step.id === stepId
        ? { ...step, status, message }
        : step
    ));
  };

  const runSetupStep = async (step: SetupStep) => {
    updateStepStatus(step.id, 'running');

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
        updateStepStatus(step.id, 'completed', result.message);
      } else {
        updateStepStatus(step.id, 'error', result.message || result.error);
      }

      return result.success;
    } catch (error) {
      updateStepStatus(step.id, 'error', error instanceof Error ? error.message : 'Unknown error');
      return false;
    }
  };

  const runFullSetup = async () => {
    setIsRunning(true);
    setCurrentStep(0);

    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i);
      const success = await runSetupStep(steps[i]);

      if (!success) {
        // If a step fails, stop the setup
        break;
      }

      // Small delay between steps for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setIsRunning(false);
  };

  const runSingleStep = async (step: SetupStep) => {
    if (isRunning) return;

    setIsRunning(true);
    await runSetupStep(step);
    setIsRunning(false);
  };

  const getStepIcon = (step: SetupStep) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'running':
        return <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-gray-300" />;
    }
  };

  const getStepStatus = (step: SetupStep) => {
    switch (step.status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'running':
        return <Badge className="bg-blue-100 text-blue-800">Running</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const allCompleted = steps.every(step => step.status === 'completed');
  const hasErrors = steps.some(step => step.status === 'error');

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="mr-2 h-6 w-6" />
            Database Setup
          </CardTitle>
          <CardDescription>
            Initialize your BoQ Management System with Supabase database
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Overview */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <h3 className="font-medium">Setup Status</h3>
              <p className="text-sm text-muted-foreground">
                {allCompleted
                  ? "Database setup completed successfully!"
                  : hasErrors
                    ? "Setup encountered errors"
                    : "Ready to initialize database"
                }
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {allCompleted && <CheckCircle className="h-6 w-6 text-green-600" />}
              {hasErrors && <AlertCircle className="h-6 w-6 text-red-600" />}
              {!allCompleted && !hasErrors && <Database className="h-6 w-6 text-blue-600" />}
            </div>
          </div>

          {/* Setup Steps */}
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={step.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStepIcon(step)}
                    <div>
                      <h4 className="font-medium">{step.title}</h4>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                      {step.message && (
                        <p className={`text-xs mt-1 ${
                          step.status === 'error' ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {step.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStepStatus(step)}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => runSingleStep(step)}
                      disabled={isRunning || step.status === 'completed'}
                    >
                      {step.status === 'running' ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Run'
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {isRunning && (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Running step {currentStep + 1} of {steps.length}...</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                disabled={isRunning}
              >
                Reset
              </Button>
              <Button
                onClick={runFullSetup}
                disabled={isRunning || allCompleted}
              >
                {isRunning ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Setting up...
                  </>
                ) : allCompleted ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Setup Complete
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    Run Full Setup
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Success Message */}
          {allCompleted && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-800">Database Setup Complete!</h4>
                  <p className="text-sm text-green-700 mt-1">
                    Your BoQ Management System is now ready to use. The database has been initialized with:
                  </p>
                  <ul className="text-sm text-green-700 mt-2 space-y-1">
                    <li className="flex items-center">
                      <Building className="mr-2 h-4 w-4" />
                      PNG Construction Company tenant with sample data
                    </li>
                    <li className="flex items-center">
                      <FileText className="mr-2 h-4 w-4" />
                      Comprehensive Road Construction template with 60+ items
                    </li>
                    <li className="flex items-center">
                      <Database className="mr-2 h-4 w-4" />
                      Complete catalog setup (UoM, Materials, Equipment, Labor)
                    </li>
                  </ul>
                  <p className="text-sm text-green-700 mt-2">
                    You can now navigate to the dashboard to start using the system.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
