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
  Play,
  Loader2,
  FileText,
  Building
} from "lucide-react";

interface SetupResult {
  success: boolean;
  message: string;
  error?: string;
}

export default function DatabaseSetupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Record<string, SetupResult>>({});

  const executeAction = async (action: string, description: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/setup-database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });

      const result = await response.json();
      setResults(prev => ({
        ...prev,
        [action]: result
      }));
    } catch (error) {
      setResults(prev => ({
        ...prev,
        [action]: {
          success: false,
          message: 'Network error occurred',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const setupActions = [
    {
      id: 'check-connection',
      title: 'Check Database Connection',
      description: 'Test connectivity to Supabase database',
      icon: Database,
      color: 'blue'
    },
    {
      id: 'setup-database',
      title: 'Initialize Database',
      description: 'Create schema and seed basic data',
      icon: Building,
      color: 'green'
    },
    {
      id: 'create-road-template',
      title: 'Create Road Template',
      description: 'Generate comprehensive road construction template',
      icon: FileText,
      color: 'purple'
    }
  ];

  const getResultIcon = (action: string) => {
    const result = results[action];
    if (!result) return null;

    return result.success ? (
      <CheckCircle className="h-5 w-5 text-green-600" />
    ) : (
      <AlertCircle className="h-5 w-5 text-red-600" />
    );
  };

  const getResultBadge = (action: string) => {
    const result = results[action];
    if (!result) return null;

    return (
      <Badge variant={result.success ? "default" : "destructive"}>
        {result.success ? "Success" : "Failed"}
      </Badge>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Database Setup</h1>
        <p className="text-muted-foreground">
          Initialize and configure your BoQ system database
        </p>
      </div>

      {/* Connection Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="mr-2 h-5 w-5" />
            Supabase Configuration
          </CardTitle>
          <CardDescription>
            Database connection details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">URL:</span>
              <p className="text-muted-foreground break-all">
                {process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not configured'}
              </p>
            </div>
            <div>
              <span className="font-medium">Project:</span>
              <p className="text-muted-foreground">
                ukbohbhacwieqxnzaqiy
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Setup Actions */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Setup Actions</h2>

        {setupActions.map((action, index) => {
          const Icon = action.icon;
          const result = results[action.id];

          return (
            <Card key={action.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg bg-${action.color}-100 text-${action.color}-600`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{action.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {action.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {getResultIcon(action.id)}
                    {getResultBadge(action.id)}

                    <Button
                      onClick={() => executeAction(action.id, action.description)}
                      disabled={isLoading}
                      size="sm"
                    >
                      {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Play className="mr-2 h-4 w-4" />
                      )}
                      Execute
                    </Button>
                  </div>
                </div>

                {result && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="space-y-2">
                      <p className={`text-sm ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                        {result.message}
                      </p>
                      {result.error && (
                        <p className="text-sm text-red-600 font-mono bg-red-50 p-2 rounded">
                          {result.error}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
          <CardDescription>
            Follow these steps to initialize your database
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                1
              </div>
              <div>
                <p className="font-medium">Check Database Connection</p>
                <p className="text-sm text-muted-foreground">
                  Verify that the application can connect to your Supabase database
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                2
              </div>
              <div>
                <p className="font-medium">Initialize Database</p>
                <p className="text-sm text-muted-foreground">
                  Create the database schema and insert basic seed data (tenant, project types, UoMs)
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                3
              </div>
              <div>
                <p className="font-medium">Create Road Template</p>
                <p className="text-sm text-muted-foreground">
                  Generate a comprehensive road construction template with 10+ groups and 60+ items
                </p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="text-sm text-muted-foreground">
            <p className="font-medium mb-2">Manual SQL Setup (if needed):</p>
            <p>
              If automatic setup fails, you can manually run the SQL schema in your Supabase SQL editor.
              The schema file is located at <code className="bg-muted px-1 rounded">src/lib/database.sql</code>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
