"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Calculator,
  ArrowLeft,
  ArrowRight,
  Building,
  FileText,
  Settings,
  CheckCircle,
  Percent,
  DollarSign
} from "lucide-react";
import { db } from "@/lib/data";
import type { Project, Template, RateSet, ProjectType } from "@/lib/types";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface BoqWizardData {
  projectId: string;
  templateId: string;
  name: string;
  version: string;
  currency: string;
  rateSetId?: string;
  taxPercent: number;
  contingencyPercent: number;
  overheadPercent: number;
  profitPercent: number;
  notes?: string;
}

export default function CreateBoqPage() {
  const searchParams = useSearchParams();
  const preselectedProject = searchParams.get('project');
  const preselectedTemplate = searchParams.get('template');

  const [currentStep, setCurrentStep] = useState(1);
  const [projects, setProjects] = useState<Project[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [rateSets, setRateSets] = useState<RateSet[]>([]);
  const [projectTypes, setProjectTypes] = useState<ProjectType[]>([]);

  const [wizardData, setWizardData] = useState<BoqWizardData>({
    projectId: preselectedProject || "",
    templateId: preselectedTemplate || "",
    name: "",
    version: "1.0",
    currency: "PGK",
    taxPercent: 10,
    contingencyPercent: 5,
    overheadPercent: 15,
    profitPercent: 10,
  });

  useEffect(() => {
    // Load data
    const loadedProjects = db.getProjects('tenant-1');
    const loadedTemplates = db.getTemplates('tenant-1');
    const loadedRateSets = db.getRateSets('tenant-1');
    const loadedProjectTypes = db.getProjectTypes('tenant-1');

    setProjects(loadedProjects);
    setTemplates(loadedTemplates);
    setRateSets(loadedRateSets);
    setProjectTypes(loadedProjectTypes);

    // Auto-generate BoQ name if project and template are selected
    if (wizardData.projectId && wizardData.templateId) {
      const project = loadedProjects.find(p => p.id === wizardData.projectId);
      const template = loadedTemplates.find(t => t.id === wizardData.templateId);
      if (project && template && !wizardData.name) {
        setWizardData(prev => ({
          ...prev,
          name: `${project.name} - ${template.name}`,
          currency: project.currency
        }));
      }
    }
  }, [wizardData.projectId, wizardData.templateId]);

  const selectedProject = projects.find(p => p.id === wizardData.projectId);
  const selectedTemplate = templates.find(t => t.id === wizardData.templateId);
  const selectedRateSet = rateSets.find(rs => rs.id === wizardData.rateSetId);

  const filteredTemplates = templates.filter(template => {
    if (!selectedProject) return true;
    // In a real implementation, you might filter templates by project type compatibility
    return template.status === 'published';
  });

  const canProceedFromStep1 = wizardData.projectId && wizardData.templateId;
  const canProceedFromStep2 = wizardData.name && wizardData.version;
  const canComplete = canProceedFromStep1 && canProceedFromStep2;

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCreateBoq = () => {
    console.log('Creating BoQ with data:', wizardData);

    // Here you would typically:
    // 1. Create the BoQ record
    // 2. Copy template structure to BoQ sections and lines
    // 3. Apply rate set if selected
    // 4. Redirect to the BoQ editor

    // For now, redirect to a placeholder
    window.location.href = '/boqs/1/edit';
  };

  const getProjectTypeName = (projectTypeId: string) => {
    return projectTypes.find(pt => pt.id === projectTypeId)?.name || 'Unknown';
  };

  const getProjectTypeColor = (projectTypeId: string) => {
    return projectTypes.find(pt => pt.id === projectTypeId)?.color || '#6B7280';
  };

  const steps = [
    {
      number: 1,
      title: "Select Project & Template",
      description: "Choose the project and template for your BoQ"
    },
    {
      number: 2,
      title: "Configure Settings",
      description: "Set up BoQ details and financial parameters"
    },
    {
      number: 3,
      title: "Review & Create",
      description: "Review your settings and create the BoQ"
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/boqs">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to BoQs
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create BoQ</h1>
          <p className="text-muted-foreground">
            Create a new Bill of Quantities from a template
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className="flex items-center space-x-4">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    currentStep >= step.number
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {currentStep > step.number ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <span>{step.number}</span>
                    )}
                  </div>
                  <div className="hidden md:block">
                    <p className="font-medium">{step.title}</p>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`hidden md:block w-24 h-0.5 mx-4 ${
                    currentStep > step.number ? 'bg-primary' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Step 1: Project & Template Selection */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="mr-2 h-5 w-5" />
                  Select Project & Template
                </CardTitle>
                <CardDescription>
                  Choose the project and template to base your BoQ on
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Project Selection */}
                <div>
                  <Label htmlFor="project">Project</Label>
                  <Select
                    value={wizardData.projectId}
                    onValueChange={(value) => setWizardData({...wizardData, projectId: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{project.name}</span>
                            <span className="text-sm text-muted-foreground">{project.code}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedProject && (
                    <div className="mt-2 p-3 bg-muted rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{selectedProject.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {selectedProject.client} • {selectedProject.location}
                          </p>
                        </div>
                        <Badge variant="outline">{selectedProject.currency}</Badge>
                      </div>
                    </div>
                  )}
                </div>

                {/* Template Selection */}
                <div>
                  <Label htmlFor="template">Template</Label>
                  <Select
                    value={wizardData.templateId}
                    onValueChange={(value) => setWizardData({...wizardData, templateId: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredTemplates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          <div className="flex items-center space-x-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: getProjectTypeColor(template.projectTypeId) }}
                            />
                            <div className="flex flex-col">
                              <span className="font-medium">{template.name}</span>
                              <span className="text-sm text-muted-foreground">
                                v{template.version} • {getProjectTypeName(template.projectTypeId)}
                              </span>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedTemplate && (
                    <div className="mt-2 p-3 bg-muted rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{selectedTemplate.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Version {selectedTemplate.version} • {getProjectTypeName(selectedTemplate.projectTypeId)}
                          </p>
                          {selectedTemplate.notes && (
                            <p className="text-sm text-muted-foreground mt-1">{selectedTemplate.notes}</p>
                          )}
                        </div>
                        <Badge>{selectedTemplate.status}</Badge>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Configuration */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="mr-2 h-5 w-5" />
                  Configure BoQ Settings
                </CardTitle>
                <CardDescription>
                  Set up BoQ details and financial parameters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="boq-name">BoQ Name</Label>
                    <Input
                      id="boq-name"
                      value={wizardData.name}
                      onChange={(e) => setWizardData({...wizardData, name: e.target.value})}
                      placeholder="Enter BoQ name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="version">Version</Label>
                    <Input
                      id="version"
                      value={wizardData.version}
                      onChange={(e) => setWizardData({...wizardData, version: e.target.value})}
                      placeholder="1.0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="currency">Currency</Label>
                    <Select
                      value={wizardData.currency}
                      onValueChange={(value) => setWizardData({...wizardData, currency: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PGK">PGK - Papua New Guinea Kina</SelectItem>
                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                        <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="rate-set">Rate Set (Optional)</Label>
                    <Select
                      value={wizardData.rateSetId || ""}
                      onValueChange={(value) => setWizardData({...wizardData, rateSetId: value || undefined})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="No rate set" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No rate set</SelectItem>
                        {rateSets.map((rateSet) => (
                          <SelectItem key={rateSet.id} value={rateSet.id}>
                            {rateSet.name} ({new Date(rateSet.effectiveDate).toLocaleDateString()})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                {/* Financial Parameters */}
                <div>
                  <h3 className="font-medium mb-4 flex items-center">
                    <Percent className="mr-2 h-4 w-4" />
                    Financial Parameters
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="tax">Tax (%)</Label>
                      <Input
                        id="tax"
                        type="number"
                        step="0.1"
                        value={wizardData.taxPercent}
                        onChange={(e) => setWizardData({...wizardData, taxPercent: Number(e.target.value)})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="contingency">Contingency (%)</Label>
                      <Input
                        id="contingency"
                        type="number"
                        step="0.1"
                        value={wizardData.contingencyPercent}
                        onChange={(e) => setWizardData({...wizardData, contingencyPercent: Number(e.target.value)})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="overhead">Overhead (%)</Label>
                      <Input
                        id="overhead"
                        type="number"
                        step="0.1"
                        value={wizardData.overheadPercent}
                        onChange={(e) => setWizardData({...wizardData, overheadPercent: Number(e.target.value)})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="profit">Profit (%)</Label>
                      <Input
                        id="profit"
                        type="number"
                        step="0.1"
                        value={wizardData.profitPercent}
                        onChange={(e) => setWizardData({...wizardData, profitPercent: Number(e.target.value)})}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={wizardData.notes || ""}
                    onChange={(e) => setWizardData({...wizardData, notes: e.target.value})}
                    placeholder="Additional notes or comments..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Review */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Review & Create
                </CardTitle>
                <CardDescription>
                  Review your settings and create the BoQ
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Project Summary */}
                  <div className="space-y-4">
                    <h3 className="font-medium">Project Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Project:</span>
                        <span className="font-medium">{selectedProject?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Code:</span>
                        <span>{selectedProject?.code}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Client:</span>
                        <span>{selectedProject?.client}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Template:</span>
                        <span className="font-medium">{selectedTemplate?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Template Version:</span>
                        <span>{selectedTemplate?.version}</span>
                      </div>
                    </div>
                  </div>

                  {/* BoQ Summary */}
                  <div className="space-y-4">
                    <h3 className="font-medium">BoQ Configuration</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">BoQ Name:</span>
                        <span className="font-medium">{wizardData.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Version:</span>
                        <span>{wizardData.version}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Currency:</span>
                        <span>{wizardData.currency}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Rate Set:</span>
                        <span>{selectedRateSet?.name || 'None'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Financial Parameters Summary */}
                <div>
                  <h3 className="font-medium mb-4">Financial Parameters</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <p className="text-2xl font-bold">{wizardData.taxPercent}%</p>
                      <p className="text-sm text-muted-foreground">Tax</p>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <p className="text-2xl font-bold">{wizardData.contingencyPercent}%</p>
                      <p className="text-sm text-muted-foreground">Contingency</p>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <p className="text-2xl font-bold">{wizardData.overheadPercent}%</p>
                      <p className="text-sm text-muted-foreground">Overhead</p>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <p className="text-2xl font-bold">{wizardData.profitPercent}%</p>
                      <p className="text-sm text-muted-foreground">Profit</p>
                    </div>
                  </div>
                </div>

                {wizardData.notes && (
                  <div>
                    <h3 className="font-medium mb-2">Notes</h3>
                    <p className="text-sm text-muted-foreground p-3 bg-muted rounded-lg">
                      {wizardData.notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Navigation */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>

                {currentStep < 3 ? (
                  <Button
                    onClick={handleNext}
                    disabled={
                      (currentStep === 1 && !canProceedFromStep1) ||
                      (currentStep === 2 && !canProceedFromStep2)
                    }
                  >
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleCreateBoq}
                    disabled={!canComplete}
                  >
                    <Calculator className="mr-2 h-4 w-4" />
                    Create BoQ
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Info */}
          {selectedProject && selectedTemplate && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Project</p>
                  <p className="font-medium">{selectedProject.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Template</p>
                  <p className="font-medium">{selectedTemplate.name}</p>
                </div>
                {wizardData.name && (
                  <div>
                    <p className="text-sm text-muted-foreground">BoQ Name</p>
                    <p className="font-medium">{wizardData.name}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Currency</p>
                  <p className="font-medium">{wizardData.currency}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
