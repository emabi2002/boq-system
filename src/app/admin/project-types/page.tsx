"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  Building,
  Plus,
  Search,
  Edit,
  Trash2,
  MoreVertical,
  Palette,
  FileText,
  Calculator
} from "lucide-react";
import { db } from "@/lib/data";
import type { ProjectType } from "@/lib/types";

const PRESET_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#8B5CF6', // Purple
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#F97316', // Orange
  '#EC4899', // Pink
  '#6B7280', // Gray
];

const PRESET_ICONS = [
  '🛣️', '🌉', '🏢', '📡', '🏭', '🏥', '🏫', '🏠', '⚡', '💧'
];

export default function ProjectTypesPage() {
  const [projectTypes, setProjectTypes] = useState<ProjectType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedType, setSelectedType] = useState<ProjectType | null>(null);
  const [newType, setNewType] = useState({
    code: "",
    name: "",
    color: PRESET_COLORS[0],
    icon: PRESET_ICONS[0]
  });

  useEffect(() => {
    // Load project types
    const loadedTypes = db.getProjectTypes('tenant-1');
    setProjectTypes(loadedTypes);
  }, []);

  const filteredTypes = projectTypes.filter(type => {
    const matchesSearch = type.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         type.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleCreateType = () => {
    if (newType.code && newType.name) {
      const type = db.createProjectType({
        tenantId: 'tenant-1',
        code: newType.code.toUpperCase(),
        name: newType.name,
        color: newType.color,
        icon: newType.icon,
        createdBy: 'user-1',
        updatedBy: 'user-1'
      });

      setProjectTypes([...projectTypes, type]);
      setShowCreateDialog(false);
      setNewType({
        code: "",
        name: "",
        color: PRESET_COLORS[0],
        icon: PRESET_ICONS[0]
      });
    }
  };

  const handleEditType = (type: ProjectType) => {
    setSelectedType(type);
    setNewType({
      code: type.code,
      name: type.name,
      color: type.color || PRESET_COLORS[0],
      icon: type.icon || PRESET_ICONS[0]
    });
    setShowEditDialog(true);
  };

  const handleUpdateType = () => {
    if (selectedType && newType.code && newType.name) {
      const updatedTypes = projectTypes.map(type =>
        type.id === selectedType.id
          ? {
              ...type,
              code: newType.code.toUpperCase(),
              name: newType.name,
              color: newType.color,
              icon: newType.icon,
              updatedAt: new Date(),
              updatedBy: 'user-1'
            }
          : type
      );

      setProjectTypes(updatedTypes);
      setShowEditDialog(false);
      setSelectedType(null);
      setNewType({
        code: "",
        name: "",
        color: PRESET_COLORS[0],
        icon: PRESET_ICONS[0]
      });
    }
  };

  const handleDeleteType = (type: ProjectType) => {
    setProjectTypes(projectTypes.filter(t => t.id !== type.id));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Project Types</h1>
          <p className="text-muted-foreground">
            Configure project types for organizing templates and projects
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Project Type
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Project Type</DialogTitle>
              <DialogDescription>
                Add a new project type to categorize your templates and projects.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type-code">Code *</Label>
                  <Input
                    id="type-code"
                    value={newType.code}
                    onChange={(e) => setNewType({...newType, code: e.target.value})}
                    placeholder="ICT"
                    className="uppercase"
                  />
                </div>
                <div>
                  <Label htmlFor="type-name">Name *</Label>
                  <Input
                    id="type-name"
                    value={newType.name}
                    onChange={(e) => setNewType({...newType, name: e.target.value})}
                    placeholder="ICT Infrastructure"
                  />
                </div>
              </div>

              <div>
                <Label>Color</Label>
                <div className="flex items-center space-x-2 mt-2">
                  <div
                    className="w-8 h-8 rounded border"
                    style={{ backgroundColor: newType.color }}
                  />
                  <div className="flex flex-wrap gap-2">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        className={`w-6 h-6 rounded border-2 ${
                          newType.color === color ? 'border-primary' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setNewType({...newType, color})}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <Label>Icon</Label>
                <div className="flex items-center space-x-2 mt-2">
                  <div className="text-2xl">{newType.icon}</div>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_ICONS.map((icon) => (
                      <button
                        key={icon}
                        className={`w-8 h-8 rounded border-2 flex items-center justify-center text-lg ${
                          newType.icon === icon ? 'border-primary' : 'border-gray-300'
                        }`}
                        onClick={() => setNewType({...newType, icon})}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateType}>Create Type</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search project types..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredTypes.length} of {projectTypes.length} project types
        </p>
      </div>

      {/* Project Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTypes.map((type) => (
          <Card key={type.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl"
                    style={{ backgroundColor: type.color }}
                  >
                    {type.icon}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{type.name}</CardTitle>
                    <CardDescription>{type.code}</CardDescription>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleEditType(type)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Type
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Type
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Project Type</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{type.name}"?
                            This action cannot be undone and may affect existing templates and projects.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteType(type)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete Type
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Usage Statistics */}
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="space-y-1">
                  <div className="text-2xl font-bold">0</div>
                  <div className="text-xs text-muted-foreground flex items-center justify-center">
                    <FileText className="mr-1 h-3 w-3" />
                    Templates
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold">0</div>
                  <div className="text-xs text-muted-foreground flex items-center justify-center">
                    <Building className="mr-1 h-3 w-3" />
                    Projects
                  </div>
                </div>
              </div>

              {/* Metadata */}
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Created: {new Date(type.createdAt).toLocaleDateString()}</p>
                <p>Updated: {new Date(type.updatedAt).toLocaleDateString()}</p>
                <p>By: {type.createdBy}</p>
              </div>

              {/* Actions */}
              <div className="flex space-x-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEditType(type)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <FileText className="mr-2 h-4 w-4" />
                  Templates
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredTypes.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Building className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No project types found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery
                ? "Try adjusting your search to see more results."
                : "Get started by creating your first project type."}
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Project Type
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Project Type</DialogTitle>
            <DialogDescription>
              Update the project type details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-type-code">Code *</Label>
                <Input
                  id="edit-type-code"
                  value={newType.code}
                  onChange={(e) => setNewType({...newType, code: e.target.value})}
                  placeholder="ICT"
                  className="uppercase"
                />
              </div>
              <div>
                <Label htmlFor="edit-type-name">Name *</Label>
                <Input
                  id="edit-type-name"
                  value={newType.name}
                  onChange={(e) => setNewType({...newType, name: e.target.value})}
                  placeholder="ICT Infrastructure"
                />
              </div>
            </div>

            <div>
              <Label>Color</Label>
              <div className="flex items-center space-x-2 mt-2">
                <div
                  className="w-8 h-8 rounded border"
                  style={{ backgroundColor: newType.color }}
                />
                <div className="flex flex-wrap gap-2">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      className={`w-6 h-6 rounded border-2 ${
                        newType.color === color ? 'border-primary' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewType({...newType, color})}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div>
              <Label>Icon</Label>
              <div className="flex items-center space-x-2 mt-2">
                <div className="text-2xl">{newType.icon}</div>
                <div className="flex flex-wrap gap-2">
                  {PRESET_ICONS.map((icon) => (
                    <button
                      key={icon}
                      className={`w-8 h-8 rounded border-2 flex items-center justify-center text-lg ${
                        newType.icon === icon ? 'border-primary' : 'border-gray-300'
                      }`}
                      onClick={() => setNewType({...newType, icon})}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateType}>Update Type</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
