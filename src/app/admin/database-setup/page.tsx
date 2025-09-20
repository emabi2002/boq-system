"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Database,
  CheckCircle,
  AlertTriangle,
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
  const [isChecking, setIsChecking] = useState(false);
  const [isSetup, setIsSetup] = useState(false);
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<SetupResult | null>(null);
  const [setupResult, setSetupResult] = useState<SetupResult | null>(null);
  const [templateResult, setTemplateResult] = useState<SetupResult | null>(null);

  const checkConnection = async () => {
    setIsChecking(true);
    try {
      const response = await fetch('/api/setup-database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'check-connection' })
      });
      const result = await response.json();
      setConnectionStatus(result);
    } catch (error) {
      setConnectionStatus({
        success: false,
        message: 'Failed to check database connection',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsChecking(false);
    }
  };

  const setupDatabase = async () => {
    setIsSetup(true);
    try {
      const response = await fetch('/api/setup-database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'setup-database' })
      });
      const result = await response.json();
      setSetupResult(result);
    } catch (error) {
      setSetupResult({
        success: false,
        message: 'Failed to setup database',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsSetup(false);
    }
  };

  const createRoadTemplate = async () => {
    setIsCreatingTemplate(true);
    try {
      const response = await fetch('/api/setup-database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create-road-template' })
      });
      const result = await response.json();
      setTemplateResult(result);
    } catch (error) {
      setTemplateResult({
        success: false,
        message: 'Failed to create Road Construction template',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsCreatingTemplate(false);
    }
  };

  const StatusAlert = ({ result, type }: { result: SetupResult | null; type: string }) => {
    if (!result) return null;

    return (
      <Alert className={result.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
        <div className="flex items-center">
          {result.success ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription className="ml-2">
            <span className={result.success ? "text-green-800" : "text-red-800"}>
              <strong>{type}:</strong> {result.message}
            </span>
            {result.error && (
              <div className="text-red-600 text-xs mt-1">
                Error: {result.error}
              </div>
            )}
          </AlertDescription>
        </div>
      </Alert>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Database Setup</h1>
        <p className="text-muted-foreground">
          Initialize and configure the BoQ system database with Supabase
        </p>
      </div>

      {/* Connection Check */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="mr-2 h-5 w-5" />
            Database Connection
          </CardTitle>
          <CardDescription>
            Verify connection to Supabase database
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Button
              onClick={checkConnection}
              disabled={isChecking}
              variant="outline"
            >
              {isChecking ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Play className="mr-2 h-4 w-4" />
              )}
              Check Connection
            </Button>
            {connectionStatus && (
              <Badge variant={connectionStatus.success ? "default" : "destructive"}>
                {connectionStatus.success ? "Connected" : "Failed"}
              </Badge>
            )}
          </div>

          <StatusAlert result={connectionStatus} type="Connection Check" />
        </CardContent>
      </Card>

      {/* Database Setup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building className="mr-2 h-5 w-5" />
            Initialize Database
          </CardTitle>
          <CardDescription>
            Create tables and insert seed data (tenant, project types, UoMs, materials, etc.)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Button
              onClick={setupDatabase}
              disabled={isSetup || !connectionStatus?.success}
            >
              {isSetup ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Play className="mr-2 h-4 w-4" />
              )}
              Setup Database
            </Button>
            {setupResult && (
              <Badge variant={setupResult.success ? "default" : "destructive"}>
                {setupResult.success ? "Completed" : "Failed"}
              </Badge>
            )}
          </div>

          <StatusAlert result={setupResult} type="Database Setup" />

          {setupResult?.success && (
            <div className="text-sm text-green-700 bg-green-50 p-3 rounded border border-green-200">
              <strong>Setup Complete!</strong> The following has been initialized:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Default tenant (PNG Construction Company)</li>
                <li>Project types (Road, Bridge, ICT Infrastructure)</li>
                <li>Units of measure (LS, m, m², m³, t, no, km, hr, day)</li>
                <li>Sample materials and equipment</li>
                <li>Default user account</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Road Template Creation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            Create Road Construction Template
          </CardTitle>
          <CardDescription>
            Generate the comprehensive Road Construction template with 10+ sections and 60+ items
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Button
              onClick={createRoadTemplate}
              disabled={isCreatingTemplate || !setupResult?.success}
            >
              {isCreatingTemplate ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Play className="mr-2 h-4 w-4" />
              )}
              Create Road Template
            </Button>
            {templateResult && (
              <Badge variant={templateResult.success ? "default" : "destructive"}>
                {templateResult.success ? "Created" : "Failed"}
              </Badge>
            )}
          </div>

          <StatusAlert result={templateResult} type="Template Creation" />

          {templateResult?.success && (
            <div className="text-sm text-green-700 bg-green-50 p-3 rounded border border-green-200">
              <strong>Template Created!</strong> The Road Construction template includes:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>10 main sections (General Clauses, Establishment, Earthworks, etc.)</li>
                <li>60+ detailed line items with descriptions and rates</li>
                <li>Proper UoM assignments and default quantities</li>
                <li>Published status ready for BoQ creation</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Next Steps */}
      {templateResult?.success && (
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">🎉 Setup Complete!</CardTitle>
            <CardDescription>
              Your BoQ system is now ready for production use
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm">You can now:</p>
              <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                <li>Browse templates in the Template Library</li>
                <li>Create new projects and BoQs</li>
                <li>Manage catalogs (add more UoMs, materials, equipment)</li>
                <li>Configure additional project types</li>
                <li>Use the Template Builder to create custom templates</li>
              </ul>
            </div>
            <div className="flex space-x-2 mt-4">
              <Button asChild>
                <a href="/templates">Go to Templates</a>
              </Button>
              <Button asChild variant="outline">
                <a href="/projects">Go to Projects</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
