"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Package,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Download,
  Upload,
  Check,
  X
} from "lucide-react";
import { db } from "@/lib/data";
import type { UnitOfMeasure } from "@/lib/types";

export default function UnitsPage() {
  const [units, setUnits] = useState<UnitOfMeasure[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<UnitOfMeasure | null>(null);
  const [newUnit, setNewUnit] = useState({
    code: "",
    name: "",
    category: "",
    isActive: true
  });

  useEffect(() => {
    // Load units
    const loadedUnits = db.getUnitsOfMeasure('tenant-1');
    setUnits(loadedUnits);
  }, []);

  const categories = Array.from(new Set(units.map(u => u.category).filter(Boolean)));

  const filteredUnits = units.filter(unit => {
    const matchesSearch = unit.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         unit.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || unit.category === categoryFilter;
    const matchesStatus = statusFilter === "all" ||
                         (statusFilter === "active" ? unit.isActive : !unit.isActive);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleCreateUnit = () => {
    if (newUnit.code && newUnit.name) {
      const unit = db.createUnitOfMeasure({
        tenantId: 'tenant-1',
        code: newUnit.code.toUpperCase(),
        name: newUnit.name,
        category: newUnit.category || undefined,
        isActive: newUnit.isActive
      });

      setUnits([...units, unit]);
      setShowCreateDialog(false);
      setNewUnit({
        code: "",
        name: "",
        category: "",
        isActive: true
      });
    }
  };

  const handleEditUnit = (unit: UnitOfMeasure) => {
    setSelectedUnit(unit);
    setNewUnit({
      code: unit.code,
      name: unit.name,
      category: unit.category || "",
      isActive: unit.isActive
    });
    setShowEditDialog(true);
  };

  const handleUpdateUnit = () => {
    if (selectedUnit && newUnit.code && newUnit.name) {
      const updatedUnits = units.map(unit =>
        unit.id === selectedUnit.id
          ? { ...unit, code: newUnit.code.toUpperCase(), name: newUnit.name, category: newUnit.category, isActive: newUnit.isActive }
          : unit
      );

      setUnits(updatedUnits);
      setShowEditDialog(false);
      setSelectedUnit(null);
      setNewUnit({
        code: "",
        name: "",
        category: "",
        isActive: true
      });
    }
  };

  const handleDeleteUnit = (unit: UnitOfMeasure) => {
    setUnits(units.filter(u => u.id !== unit.id));
  };

  const handleToggleStatus = (unit: UnitOfMeasure) => {
    const updatedUnits = units.map(u =>
      u.id === unit.id ? { ...u, isActive: !u.isActive } : u
    );
    setUnits(updatedUnits);
  };

  const exportUnits = () => {
    const csvContent = [
      ['Code', 'Name', 'Category', 'Status'],
      ...filteredUnits.map(unit => [
        unit.code,
        unit.name,
        unit.category || '',
        unit.isActive ? 'Active' : 'Inactive'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'units-of-measure.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Units of Measure</h1>
          <p className="text-muted-foreground">
            Manage measurement units used across your projects
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={exportUnits}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Import CSV
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Unit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Unit of Measure</DialogTitle>
                <DialogDescription>
                  Create a new unit of measure for use in your templates and BoQs.
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="unit-code">Code *</Label>
                  <Input
                    id="unit-code"
                    value={newUnit.code}
                    onChange={(e) => setNewUnit({...newUnit, code: e.target.value})}
                    placeholder="m²"
                    className="uppercase"
                  />
                </div>
                <div>
                  <Label htmlFor="unit-name">Name *</Label>
                  <Input
                    id="unit-name"
                    value={newUnit.name}
                    onChange={(e) => setNewUnit({...newUnit, name: e.target.value})}
                    placeholder="Square Meter"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="unit-category">Category</Label>
                  <Select
                    value={newUnit.category}
                    onValueChange={(value) => setNewUnit({...newUnit, category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No Category</SelectItem>
                      <SelectItem value="Length">Length</SelectItem>
                      <SelectItem value="Area">Area</SelectItem>
                      <SelectItem value="Volume">Volume</SelectItem>
                      <SelectItem value="Weight">Weight</SelectItem>
                      <SelectItem value="Time">Time</SelectItem>
                      <SelectItem value="Count">Count</SelectItem>
                      <SelectItem value="General">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="unit-active"
                      checked={newUnit.isActive}
                      onCheckedChange={(checked) => setNewUnit({...newUnit, isActive: checked as boolean})}
                    />
                    <Label htmlFor="unit-active">Active</Label>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateUnit}>Create Unit</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search units..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredUnits.length} of {units.length} units
        </p>
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <span>Active: {units.filter(u => u.isActive).length}</span>
          <span>Inactive: {units.filter(u => !u.isActive).length}</span>
        </div>
      </div>

      {/* Units Table */}
      <Card>
        <CardContent className="p-0">
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUnits.map((unit) => (
                  <TableRow key={unit.id}>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        {unit.code}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{unit.name}</TableCell>
                    <TableCell>
                      {unit.category ? (
                        <Badge variant="secondary">{unit.category}</Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {unit.isActive ? (
                          <div className="flex items-center space-x-1 text-green-600">
                            <Check className="h-4 w-4" />
                            <span>Active</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1 text-red-600">
                            <X className="h-4 w-4" />
                            <span>Inactive</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(unit.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">0 items</Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleEditUnit(unit)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Unit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleStatus(unit)}>
                            {unit.isActive ? (
                              <>
                                <X className="mr-2 h-4 w-4" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <Check className="mr-2 h-4 w-4" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Unit
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Unit</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{unit.code} - {unit.name}"?
                                  This action cannot be undone and may affect existing templates and BoQs.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteUnit(unit)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete Unit
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredUnits.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {searchQuery || categoryFilter !== "all" || statusFilter !== "all" ? (
                        "No units found matching your filters."
                      ) : (
                        <div className="space-y-2">
                          <Package className="mx-auto h-8 w-8" />
                          <p>No units of measure yet. Create your first unit to get started.</p>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Unit of Measure</DialogTitle>
            <DialogDescription>
              Update the unit of measure details.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-unit-code">Code *</Label>
              <Input
                id="edit-unit-code"
                value={newUnit.code}
                onChange={(e) => setNewUnit({...newUnit, code: e.target.value})}
                placeholder="m²"
                className="uppercase"
              />
            </div>
            <div>
              <Label htmlFor="edit-unit-name">Name *</Label>
              <Input
                id="edit-unit-name"
                value={newUnit.name}
                onChange={(e) => setNewUnit({...newUnit, name: e.target.value})}
                placeholder="Square Meter"
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="edit-unit-category">Category</Label>
              <Select
                value={newUnit.category}
                onValueChange={(value) => setNewUnit({...newUnit, category: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No Category</SelectItem>
                  <SelectItem value="Length">Length</SelectItem>
                  <SelectItem value="Area">Area</SelectItem>
                  <SelectItem value="Volume">Volume</SelectItem>
                  <SelectItem value="Weight">Weight</SelectItem>
                  <SelectItem value="Time">Time</SelectItem>
                  <SelectItem value="Count">Count</SelectItem>
                  <SelectItem value="General">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-unit-active"
                  checked={newUnit.isActive}
                  onCheckedChange={(checked) => setNewUnit({...newUnit, isActive: checked as boolean})}
                />
                <Label htmlFor="edit-unit-active">Active</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateUnit}>Update Unit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
