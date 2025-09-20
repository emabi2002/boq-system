"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Plus,
  Save,
  Eye,
  FileText,
  GripVertical,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Download,
  Upload,
  Settings,
  Building,
  Package,
  Wrench,
  HardHat,
  Search
} from "lucide-react";
import { db } from "@/lib/data";
import type {
  Template,
  TemplateGroup,
  TemplateItem,
  ProjectType,
  UnitOfMeasure,
  Material,
  Equipment,
  LaborRole
} from "@/lib/types";

export default function TemplateBuilderPage() {
  // Template state
  const [template, setTemplate] = useState<Partial<Template>>({
    name: "",
    projectTypeId: "",
    version: "1.0",
    status: "draft",
    notes: "",
    groupCodeStyle: "1.0",
    itemCodeStyle: "1.1"
  });

  // Data state
  const [groups, setGroups] = useState<TemplateGroup[]>([]);
  const [items, setItems] = useState<TemplateItem[]>([]);
  const [projectTypes, setProjectTypes] = useState<ProjectType[]>([]);
  const [unitsOfMeasure, setUnitsOfMeasure] = useState<UnitOfMeasure[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [laborRoles, setLaborRoles] = useState<LaborRole[]>([]);

  // UI state
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [showGroupDialog, setShowGroupDialog] = useState(false);
  const [showItemDialog, setShowItemDialog] = useState(false);
  const [showLibraryDialog, setShowLibraryDialog] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Partial<TemplateGroup>>({});
  const [editingItem, setEditingItem] = useState<Partial<TemplateItem>>({});
  const [libraryTab, setLibraryTab] = useState<'materials' | 'equipment' | 'labor'>('materials');

  useEffect(() => {
    // Load reference data
    const loadedProjectTypes = db.getProjectTypes('tenant-1');
    const loadedUoms = db.getUnitsOfMeasure('tenant-1');
    const loadedMaterials = db.getMaterials('tenant-1');
    const loadedEquipment = db.getEquipment('tenant-1');
    const loadedLaborRoles = db.getLaborRoles('tenant-1');

    setProjectTypes(loadedProjectTypes);
    setUnitsOfMeasure(loadedUoms);
    setMaterials(loadedMaterials);
    setEquipment(loadedEquipment);
    setLaborRoles(loadedLaborRoles);
  }, []);

  const selectedGroup = groups.find(g => g.id === selectedGroupId);
  const groupItems = items.filter(i => i.groupId === selectedGroupId);

  const handleAddGroup = () => {
    setEditingGroup({
      code: `${groups.length + 1}.0`,
      title: "",
      orderNo: groups.length + 1
    });
    setShowGroupDialog(true);
  };

  const handleSaveGroup = () => {
    if (editingGroup.code && editingGroup.title) {
      const newGroup: TemplateGroup = {
        id: `group-${Date.now()}`,
        templateId: 'temp',
        code: editingGroup.code,
        title: editingGroup.title,
        orderNo: editingGroup.orderNo || groups.length + 1,
        items: []
      };
      setGroups([...groups, newGroup]);
      setSelectedGroupId(newGroup.id);
      setShowGroupDialog(false);
      setEditingGroup({});
    }
  };

  const handleAddItem = () => {
    if (!selectedGroupId) return;

    const groupItemCount = groupItems.length;
    const groupCode = selectedGroup?.code.split('.')[0] || '1';

    setEditingItem({
      groupId: selectedGroupId,
      code: `${groupCode}.${groupItemCount + 1}`,
      description: "",
      uomId: "",
      defaultQty: 1,
      defaultRate: 0,
      orderNo: groupItemCount + 1
    });
    setShowItemDialog(true);
  };

  const handleSaveItem = () => {
    if (editingItem.description && editingItem.uomId && selectedGroupId) {
      const newItem: TemplateItem = {
        id: `item-${Date.now()}`,
        templateId: 'temp',
        groupId: selectedGroupId,
        code: editingItem.code || '',
        description: editingItem.description,
        uomId: editingItem.uomId,
        defaultQty: editingItem.defaultQty || 0,
        defaultRate: editingItem.defaultRate || 0,
        specRef: editingItem.specRef,
        remarks: editingItem.remarks,
        orderNo: editingItem.orderNo || 1,
        customValues: []
      };
      setItems([...items, newItem]);
      setShowItemDialog(false);
      setEditingItem({});
    }
  };

  const handleDeleteGroup = (groupId: string) => {
    setGroups(groups.filter(g => g.id !== groupId));
    setItems(items.filter(i => i.groupId !== groupId));
    if (selectedGroupId === groupId) {
      setSelectedGroupId(null);
    }
  };

  const handleDeleteItem = (itemId: string) => {
    setItems(items.filter(i => i.id !== itemId));
  };

  const handleAddFromLibrary = (libraryItem: Material | Equipment | LaborRole) => {
    if (!selectedGroupId) return;

    const groupItemCount = groupItems.length;
    const groupCode = selectedGroup?.code.split('.')[0] || '1';

    const newItem: TemplateItem = {
      id: `item-${Date.now()}`,
      templateId: 'temp',
      groupId: selectedGroupId,
      code: `${groupCode}.${groupItemCount + 1}`,
      description: libraryItem.name,
      uomId: libraryItem.defaultUomId,
      defaultQty: 1,
      defaultRate: libraryItem.typicalRate || 0,
      specRef: 'specRef' in libraryItem ? libraryItem.specRef : undefined,
      orderNo: groupItemCount + 1,
      customValues: []
    };

    setItems([...items, newItem]);
    setShowLibraryDialog(false);
  };

  const getUomName = (uomId: string) => {
    return unitsOfMeasure.find(u => u.id === uomId)?.code || '';
  };

  const handleSaveTemplate = () => {
    console.log('Saving template:', template, groups, items);
    // TODO: Implement template saving
  };

  const handlePreviewExport = () => {
    console.log('Preview export');
    // TODO: Implement export preview
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Template Builder</h1>
          <p className="text-muted-foreground">
            Create and configure BoQ templates with drag-and-drop functionality
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handlePreviewExport}>
            <Eye className="mr-2 h-4 w-4" />
            Preview Export
          </Button>
          <Button onClick={handleSaveTemplate}>
            <Save className="mr-2 h-4 w-4" />
            Save Template
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Template Settings */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Template Settings</CardTitle>
              <CardDescription>
                Configure basic template properties
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="template-name">Template Name</Label>
                <Input
                  id="template-name"
                  value={template.name}
                  onChange={(e) => setTemplate({...template, name: e.target.value})}
                  placeholder="e.g., Road Construction - Standard"
                />
              </div>

              <div>
                <Label htmlFor="project-type">Project Type</Label>
                <Select
                  value={template.projectTypeId}
                  onValueChange={(value) => setTemplate({...template, projectTypeId: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select project type" />
                  </SelectTrigger>
                  <SelectContent>
                    {projectTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: type.color }}
                          />
                          <span>{type.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="version">Version</Label>
                <Input
                  id="version"
                  value={template.version}
                  onChange={(e) => setTemplate({...template, version: e.target.value})}
                  placeholder="1.0"
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={template.notes}
                  onChange={(e) => setTemplate({...template, notes: e.target.value})}
                  placeholder="Template description..."
                  rows={3}
                />
              </div>

              <Separator />

              <div>
                <Label>Numbering Style</Label>
                <div className="space-y-2 mt-2">
                  <div>
                    <Label htmlFor="group-style" className="text-sm">Group Code</Label>
                    <Select
                      value={template.groupCodeStyle}
                      onValueChange={(value) => setTemplate({...template, groupCodeStyle: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1.0">1.0, 2.0, 3.0</SelectItem>
                        <SelectItem value="A">A, B, C</SelectItem>
                        <SelectItem value="A.0">A.0, B.0, C.0</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="item-style" className="text-sm">Item Code</Label>
                    <Select
                      value={template.itemCodeStyle}
                      onValueChange={(value) => setTemplate({...template, itemCodeStyle: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1.1">1.1, 1.2, 1.3</SelectItem>
                        <SelectItem value="1-1">1-1, 1-2, 1-3</SelectItem>
                        <SelectItem value="A.1">A.1, A.2, A.3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Groups Panel */}
          <Card className="mt-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Groups</CardTitle>
                <Button size="sm" onClick={handleAddGroup}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {groups.map((group) => (
                    <div
                      key={group.id}
                      className={`p-2 rounded border cursor-pointer hover:bg-accent ${
                        selectedGroupId === group.id ? 'bg-accent border-primary' : ''
                      }`}
                      onClick={() => setSelectedGroupId(group.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{group.code}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {group.title}
                          </p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <MoreVertical className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="mr-2 h-4 w-4" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteGroup(group.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Items Table */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    {selectedGroup ? `${selectedGroup.code} - ${selectedGroup.title}` : 'Template Items'}
                  </CardTitle>
                  <CardDescription>
                    {selectedGroup ? 'Manage items in this group' : 'Select a group to manage its items'}
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowLibraryDialog(true)}
                    disabled={!selectedGroupId}
                  >
                    <Package className="mr-2 h-4 w-4" />
                    Add from Library
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleAddItem}
                    disabled={!selectedGroupId}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Item
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {selectedGroup ? (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12"></TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>UoM</TableHead>
                        <TableHead>Default Qty</TableHead>
                        <TableHead>Default Rate (K)</TableHead>
                        <TableHead>Spec Ref</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {groupItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                          </TableCell>
                          <TableCell className="font-mono">{item.code}</TableCell>
                          <TableCell className="max-w-md">
                            <div>
                              <p className="font-medium">{item.description}</p>
                              {item.remarks && (
                                <p className="text-xs text-muted-foreground">{item.remarks}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{getUomName(item.uomId)}</Badge>
                          </TableCell>
                          <TableCell>{item.defaultQty?.toLocaleString()}</TableCell>
                          <TableCell>K {item.defaultRate?.toLocaleString()}</TableCell>
                          <TableCell>{item.specRef}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                  <MoreVertical className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Copy className="mr-2 h-4 w-4" />
                                  Duplicate
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteItem(item.id)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                      {groupItems.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                            No items in this group. Click "Add Item" to get started.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="mx-auto h-12 w-12 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Select a Group</h3>
                  <p>Choose a group from the sidebar to view and edit its items.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Group Dialog */}
      <Dialog open={showGroupDialog} onOpenChange={setShowGroupDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Group</DialogTitle>
            <DialogDescription>
              Create a new group for organizing template items.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="group-code">Group Code</Label>
              <Input
                id="group-code"
                value={editingGroup.code}
                onChange={(e) => setEditingGroup({...editingGroup, code: e.target.value})}
                placeholder="e.g., 1.0"
              />
            </div>
            <div>
              <Label htmlFor="group-title">Group Title</Label>
              <Input
                id="group-title"
                value={editingGroup.title}
                onChange={(e) => setEditingGroup({...editingGroup, title: e.target.value})}
                placeholder="e.g., General Clauses"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGroupDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveGroup}>Add Group</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Item Dialog */}
      <Dialog open={showItemDialog} onOpenChange={setShowItemDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Item</DialogTitle>
            <DialogDescription>
              Add a new item to the selected group.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="item-code">Item Code</Label>
              <Input
                id="item-code"
                value={editingItem.code}
                onChange={(e) => setEditingItem({...editingItem, code: e.target.value})}
                placeholder="e.g., 1.1"
              />
            </div>
            <div>
              <Label htmlFor="item-uom">Unit of Measure</Label>
              <Select
                value={editingItem.uomId}
                onValueChange={(value) => setEditingItem({...editingItem, uomId: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select UoM" />
                </SelectTrigger>
                <SelectContent>
                  {unitsOfMeasure.map((uom) => (
                    <SelectItem key={uom.id} value={uom.id}>
                      {uom.code} - {uom.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label htmlFor="item-description">Description</Label>
              <Input
                id="item-description"
                value={editingItem.description}
                onChange={(e) => setEditingItem({...editingItem, description: e.target.value})}
                placeholder="e.g., Excavation in Common Material"
              />
            </div>
            <div>
              <Label htmlFor="item-qty">Default Quantity</Label>
              <Input
                id="item-qty"
                type="number"
                value={editingItem.defaultQty}
                onChange={(e) => setEditingItem({...editingItem, defaultQty: Number(e.target.value)})}
                placeholder="1"
              />
            </div>
            <div>
              <Label htmlFor="item-rate">Default Rate (K)</Label>
              <Input
                id="item-rate"
                type="number"
                value={editingItem.defaultRate}
                onChange={(e) => setEditingItem({...editingItem, defaultRate: Number(e.target.value)})}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="item-spec">Spec Reference</Label>
              <Input
                id="item-spec"
                value={editingItem.specRef}
                onChange={(e) => setEditingItem({...editingItem, specRef: e.target.value})}
                placeholder="Optional specification reference"
              />
            </div>
            <div>
              <Label htmlFor="item-remarks">Remarks</Label>
              <Input
                id="item-remarks"
                value={editingItem.remarks}
                onChange={(e) => setEditingItem({...editingItem, remarks: e.target.value})}
                placeholder="Optional remarks"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowItemDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveItem}>Add Item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Library Dialog */}
      <Dialog open={showLibraryDialog} onOpenChange={setShowLibraryDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Add from Library</DialogTitle>
            <DialogDescription>
              Select items from your catalogs to add to the template.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Tabs */}
            <div className="flex space-x-2">
              <Button
                variant={libraryTab === 'materials' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setLibraryTab('materials')}
              >
                <Package className="mr-2 h-4 w-4" />
                Materials
              </Button>
              <Button
                variant={libraryTab === 'equipment' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setLibraryTab('equipment')}
              >
                <Wrench className="mr-2 h-4 w-4" />
                Equipment
              </Button>
              <Button
                variant={libraryTab === 'labor' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setLibraryTab('labor')}
              >
                <HardHat className="mr-2 h-4 w-4" />
                Labor
              </Button>
            </div>

            {/* Content */}
            <ScrollArea className="h-96 border rounded-lg">
              <div className="p-4">
                {libraryTab === 'materials' && (
                  <div className="space-y-2">
                    {materials.map((material) => (
                      <div
                        key={material.id}
                        className="flex items-center justify-between p-3 border rounded hover:bg-accent cursor-pointer"
                        onClick={() => handleAddFromLibrary(material)}
                      >
                        <div>
                          <p className="font-medium">{material.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {material.code} • {getUomName(material.defaultUomId)} • K {material.typicalRate}
                          </p>
                        </div>
                        <Plus className="h-4 w-4" />
                      </div>
                    ))}
                  </div>
                )}

                {libraryTab === 'equipment' && (
                  <div className="space-y-2">
                    {equipment.map((eq) => (
                      <div
                        key={eq.id}
                        className="flex items-center justify-between p-3 border rounded hover:bg-accent cursor-pointer"
                        onClick={() => handleAddFromLibrary(eq)}
                      >
                        <div>
                          <p className="font-medium">{eq.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {eq.code} • {getUomName(eq.defaultUomId)} • K {eq.typicalRate}
                          </p>
                        </div>
                        <Plus className="h-4 w-4" />
                      </div>
                    ))}
                  </div>
                )}

                {libraryTab === 'labor' && (
                  <div className="space-y-2">
                    {laborRoles.map((labor) => (
                      <div
                        key={labor.id}
                        className="flex items-center justify-between p-3 border rounded hover:bg-accent cursor-pointer"
                        onClick={() => handleAddFromLibrary(labor)}
                      >
                        <div>
                          <p className="font-medium">{labor.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {labor.code} • {getUomName(labor.defaultUomId)} • K {labor.typicalRate}
                          </p>
                        </div>
                        <Plus className="h-4 w-4" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLibraryDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
