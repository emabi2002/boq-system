"use client";

import { useState, useEffect, useMemo } from "react";
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
  DropdownMenuCheckboxItem,
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
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Calculator,
  Save,
  Download,
  Upload,
  Filter,
  Search,
  MoreVertical,
  Plus,
  Trash2,
  Copy,
  Edit,
  Lock,
  Unlock,
  ArrowUpDown,
  FileSpreadsheet,
  FilePdf,
  Eye,
  Settings,
  DollarSign,
  Percent
} from "lucide-react";
import { db } from "@/lib/data";
import type { BoqLine, BoqSection, UnitOfMeasure, BulkOperation } from "@/lib/types";

interface BoqEditData {
  id: string;
  name: string;
  projectName: string;
  templateName: string;
  version: string;
  revision: number;
  status: string;
  currency: string;
  taxPercent: number;
  contingencyPercent: number;
  overheadPercent: number;
  profitPercent: number;
}

interface BoqLineWithSection extends BoqLine {
  sectionCode: string;
  sectionTitle: string;
}

export default function BoqEditPage({ params }: { params: { id: string } }) {
  // State management
  const [boqData, setBoqData] = useState<BoqEditData>({
    id: params.id,
    name: "Highway Project - Section A",
    projectName: "Port Moresby Ring Road",
    templateName: "Road Construction - Standard",
    version: "1.0",
    revision: 1,
    status: "draft",
    currency: "PGK",
    taxPercent: 10,
    contingencyPercent: 5,
    overheadPercent: 15,
    profitPercent: 10
  });

  const [sections, setSections] = useState<BoqSection[]>([]);
  const [lines, setLines] = useState<BoqLineWithSection[]>([]);
  const [unitsOfMeasure, setUnitsOfMeasure] = useState<UnitOfMeasure[]>([]);

  // UI state
  const [selectedLines, setSelectedLines] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [sectionFilter, setSectionFilter] = useState<string>("all");
  const [showLockedLines, setShowLockedLines] = useState(true);
  const [editingCell, setEditingCell] = useState<{lineId: string, field: string} | null>(null);
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [showTotalsPanel, setShowTotalsPanel] = useState(true);

  // Mock data loading
  useEffect(() => {
    // Load BoQ data
    const loadedUoms = db.getUnitsOfMeasure('tenant-1');
    setUnitsOfMeasure(loadedUoms);

    // Generate mock BoQ lines based on the road template
    const mockSections: BoqSection[] = [
      { id: 'sec-1', boqId: params.id, code: '1.0', title: 'General Clauses', orderNo: 1, lines: [] },
      { id: 'sec-2', boqId: params.id, code: '2.0', title: 'Establishment', orderNo: 2, lines: [] },
      { id: 'sec-3', boqId: params.id, code: '3.0', title: 'Clearing and Grubbing', orderNo: 3, lines: [] },
      { id: 'sec-4', boqId: params.id, code: '4.0', title: 'Earthworks', orderNo: 4, lines: [] },
      { id: 'sec-5', boqId: params.id, code: '5.0', title: 'Drainage and Culverts', orderNo: 5, lines: [] },
      { id: 'sec-6', boqId: params.id, code: '6.0', title: 'Pavement', orderNo: 6, lines: [] },
    ];

    const mockLines: BoqLineWithSection[] = [
      // General Clauses
      { id: 'line-1', boqId: params.id, sectionId: 'sec-1', code: '1.1', description: 'Mobilization and Demobilization', uomId: 'uom-1', qty: 1, rate: 25000, amount: 25000, isLocked: false, isProvisional: false, orderNo: 1, customValues: [], sectionCode: '1.0', sectionTitle: 'General Clauses' },
      { id: 'line-2', boqId: params.id, sectionId: 'sec-1', code: '1.2', description: 'Traffic Management', uomId: 'uom-1', qty: 1, rate: 15000, amount: 15000, isLocked: false, isProvisional: false, orderNo: 2, customValues: [], sectionCode: '1.0', sectionTitle: 'General Clauses' },
      { id: 'line-3', boqId: params.id, sectionId: 'sec-1', code: '1.3', description: 'Site Security and Safety', uomId: 'uom-1', qty: 1, rate: 8000, amount: 8000, isLocked: false, isProvisional: false, orderNo: 3, customValues: [], sectionCode: '1.0', sectionTitle: 'General Clauses' },

      // Establishment
      { id: 'line-4', boqId: params.id, sectionId: 'sec-2', code: '2.1', description: 'Site Office and Facilities', uomId: 'uom-1', qty: 1, rate: 12000, amount: 12000, isLocked: false, isProvisional: false, orderNo: 1, customValues: [], sectionCode: '2.0', sectionTitle: 'Establishment' },
      { id: 'line-5', boqId: params.id, sectionId: 'sec-2', code: '2.2', description: 'Temporary Access Roads', uomId: 'uom-2', qty: 500, rate: 25, amount: 12500, isLocked: false, isProvisional: false, orderNo: 2, customValues: [], sectionCode: '2.0', sectionTitle: 'Establishment' },

      // Earthworks
      { id: 'line-6', boqId: params.id, sectionId: 'sec-4', code: '4.1', description: 'Excavation in Common Material', uomId: 'uom-4', qty: 15000, rate: 12, amount: 180000, isLocked: false, isProvisional: false, orderNo: 1, customValues: [], sectionCode: '4.0', sectionTitle: 'Earthworks' },
      { id: 'line-7', boqId: params.id, sectionId: 'sec-4', code: '4.2', description: 'Excavation in Rock', uomId: 'uom-4', qty: 2500, rate: 45, amount: 112500, isLocked: true, isProvisional: false, orderNo: 2, customValues: [], sectionCode: '4.0', sectionTitle: 'Earthworks' },
      { id: 'line-8', boqId: params.id, sectionId: 'sec-4', code: '4.3', description: 'Embankment Construction', uomId: 'uom-4', qty: 18000, rate: 15, amount: 270000, isLocked: false, isProvisional: true, orderNo: 3, customValues: [], sectionCode: '4.0', sectionTitle: 'Earthworks' },

      // Pavement
      { id: 'line-9', boqId: params.id, sectionId: 'sec-6', code: '6.1', description: 'Subgrade Preparation', uomId: 'uom-3', qty: 28000, rate: 3.5, amount: 98000, isLocked: false, isProvisional: false, orderNo: 1, customValues: [], sectionCode: '6.0', sectionTitle: 'Pavement' },
      { id: 'line-10', boqId: params.id, sectionId: 'sec-6', code: '6.2', description: 'Sub-base Course 150mm', uomId: 'uom-4', qty: 4200, rate: 45, amount: 189000, isLocked: false, isProvisional: false, orderNo: 2, customValues: [], sectionCode: '6.0', sectionTitle: 'Pavement' },
    ];

    setSections(mockSections);
    setLines(mockLines);
  }, [params.id]);

  // Filtered lines
  const filteredLines = useMemo(() => {
    return lines.filter(line => {
      const matchesSearch = line.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           line.code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSection = sectionFilter === "all" || line.sectionId === sectionFilter;
      const matchesVisibility = showLockedLines || !line.isLocked;

      return matchesSearch && matchesSection && matchesVisibility;
    });
  }, [lines, searchQuery, sectionFilter, showLockedLines]);

  // Calculations
  const totals = useMemo(() => {
    const subtotal = filteredLines.reduce((sum, line) => sum + line.amount, 0);
    const contingency = subtotal * (boqData.contingencyPercent / 100);
    const overhead = subtotal * (boqData.overheadPercent / 100);
    const profit = subtotal * (boqData.profitPercent / 100);
    const beforeTax = subtotal + contingency + overhead + profit;
    const tax = beforeTax * (boqData.taxPercent / 100);
    const total = beforeTax + tax;

    return {
      subtotal,
      contingency,
      overhead,
      profit,
      beforeTax,
      tax,
      total
    };
  }, [filteredLines, boqData]);

  const sectionTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    lines.forEach(line => {
      if (!totals[line.sectionId]) {
        totals[line.sectionId] = 0;
      }
      totals[line.sectionId] += line.amount;
    });
    return totals;
  }, [lines]);

  // Event handlers
  const handleCellEdit = (lineId: string, field: string, value: any) => {
    setLines(lines.map(line => {
      if (line.id === lineId) {
        const updatedLine = { ...line, [field]: value };
        if (field === 'qty' || field === 'rate') {
          updatedLine.amount = updatedLine.qty * updatedLine.rate;
        }
        return updatedLine;
      }
      return line;
    }));
    setEditingCell(null);
  };

  const handleSelectLine = (lineId: string, selected: boolean) => {
    const newSelected = new Set(selectedLines);
    if (selected) {
      newSelected.add(lineId);
    } else {
      newSelected.delete(lineId);
    }
    setSelectedLines(newSelected);
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedLines(new Set(filteredLines.map(line => line.id)));
    } else {
      setSelectedLines(new Set());
    }
  };

  const handleBulkOperation = (operation: BulkOperation) => {
    const selectedLineIds = Array.from(selectedLines);

    setLines(lines.map(line => {
      if (selectedLineIds.includes(line.id)) {
        let updatedLine = { ...line };

        switch (operation.type) {
          case 'fillDown':
            if (operation.field && operation.value !== undefined) {
              updatedLine[operation.field as keyof BoqLine] = operation.value;
            }
            break;
          case 'increasePercent':
            if (operation.field === 'rate' && operation.percent) {
              updatedLine.rate = updatedLine.rate * (1 + operation.percent / 100);
            }
            break;
          case 'round':
            if (operation.field === 'rate' && operation.decimals !== undefined) {
              updatedLine.rate = Math.round(updatedLine.rate * Math.pow(10, operation.decimals)) / Math.pow(10, operation.decimals);
            }
            break;
        }

        // Recalculate amount
        updatedLine.amount = updatedLine.qty * updatedLine.rate;
        return updatedLine;
      }
      return line;
    }));

    setSelectedLines(new Set());
    setShowBulkDialog(false);
  };

  const getUomCode = (uomId: string) => {
    return unitsOfMeasure.find(u => u.id === uomId)?.code || '';
  };

  const formatCurrency = (amount: number) => {
    return `${boqData.currency} ${amount.toLocaleString()}`;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{boqData.name}</h1>
          <div className="flex items-center space-x-4 text-muted-foreground mt-1">
            <span>{boqData.projectName}</span>
            <Separator orientation="vertical" className="h-4" />
            <span>Version {boqData.version} • Revision {boqData.revision}</span>
            <Separator orientation="vertical" className="h-4" />
            <Badge variant="outline" className="capitalize">{boqData.status}</Badge>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Export to Excel
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FilePdf className="mr-2 h-4 w-4" />
                Export to PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button size="sm">
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="xl:col-span-3 space-y-6">
          {/* Toolbar */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search lines..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Filters */}
                <div className="flex items-center space-x-2">
                  <Select value={sectionFilter} onValueChange={setSectionFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="All Sections" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sections</SelectItem>
                      {sections.map((section) => (
                        <SelectItem key={section.id} value={section.id}>
                          {section.code} - {section.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Filter className="mr-2 h-4 w-4" />
                        View
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuCheckboxItem
                        checked={showLockedLines}
                        onCheckedChange={setShowLockedLines}
                      >
                        Show Locked Lines
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={showTotalsPanel}
                        onCheckedChange={setShowTotalsPanel}
                      >
                        Show Totals Panel
                      </DropdownMenuCheckboxItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Bulk Actions */}
                {selectedLines.size > 0 && (
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">
                      {selectedLines.size} selected
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowBulkDialog(true)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Bulk Edit
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* BoQ Table */}
          <Card>
            <CardContent className="p-0">
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedLines.size === filteredLines.length && filteredLines.length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Section</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>UoM</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Rate ({boqData.currency})</TableHead>
                      <TableHead className="text-right">Amount ({boqData.currency})</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLines.map((line, index) => (
                      <TableRow key={line.id} className={index % 2 === 0 ? 'bg-muted/20' : ''}>
                        <TableCell>
                          <Checkbox
                            checked={selectedLines.has(line.id)}
                            onCheckedChange={(checked) => handleSelectLine(line.id, checked as boolean)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="text-xs text-muted-foreground">
                            {line.sectionCode}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{line.code}</TableCell>
                        <TableCell className="max-w-md">
                          <div>
                            <p className="font-medium">{line.description}</p>
                            {line.remarks && (
                              <p className="text-xs text-muted-foreground">{line.remarks}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{getUomCode(line.uomId)}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {editingCell?.lineId === line.id && editingCell?.field === 'qty' ? (
                            <Input
                              type="number"
                              defaultValue={line.qty}
                              onBlur={(e) => handleCellEdit(line.id, 'qty', Number(e.target.value))}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleCellEdit(line.id, 'qty', Number(e.currentTarget.value));
                                }
                              }}
                              className="w-24 h-8"
                              autoFocus
                            />
                          ) : (
                            <div
                              className="cursor-pointer hover:bg-accent rounded p-1"
                              onClick={() => !line.isLocked && setEditingCell({lineId: line.id, field: 'qty'})}
                            >
                              {line.qty.toLocaleString()}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {editingCell?.lineId === line.id && editingCell?.field === 'rate' ? (
                            <Input
                              type="number"
                              step="0.01"
                              defaultValue={line.rate}
                              onBlur={(e) => handleCellEdit(line.id, 'rate', Number(e.target.value))}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleCellEdit(line.id, 'rate', Number(e.currentTarget.value));
                                }
                              }}
                              className="w-32 h-8"
                              autoFocus
                            />
                          ) : (
                            <div
                              className="cursor-pointer hover:bg-accent rounded p-1"
                              onClick={() => !line.isLocked && setEditingCell({lineId: line.id, field: 'rate'})}
                            >
                              {line.rate.toLocaleString()}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {line.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            {line.isLocked && (
                              <Badge variant="outline" className="text-xs">
                                <Lock className="mr-1 h-3 w-3" />
                                Locked
                              </Badge>
                            )}
                            {line.isProvisional && (
                              <Badge variant="secondary" className="text-xs">
                                Provisional
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Copy className="mr-2 h-4 w-4" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                {line.isLocked ? (
                                  <>
                                    <Unlock className="mr-2 h-4 w-4" />
                                    Unlock
                                  </>
                                ) : (
                                  <>
                                    <Lock className="mr-2 h-4 w-4" />
                                    Lock
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Totals Panel */}
        {showTotalsPanel && (
          <div className="space-y-6">
            {/* Summary Totals */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calculator className="mr-2 h-5 w-5" />
                  Totals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Subtotal:</span>
                    <span className="font-medium">{formatCurrency(totals.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Contingency ({boqData.contingencyPercent}%):</span>
                    <span>{formatCurrency(totals.contingency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Overhead ({boqData.overheadPercent}%):</span>
                    <span>{formatCurrency(totals.overhead)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Profit ({boqData.profitPercent}%):</span>
                    <span>{formatCurrency(totals.profit)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-sm">Before Tax:</span>
                    <span className="font-medium">{formatCurrency(totals.beforeTax)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Tax ({boqData.taxPercent}%):</span>
                    <span>{formatCurrency(totals.tax)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>{formatCurrency(totals.total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section Totals */}
            <Card>
              <CardHeader>
                <CardTitle>Section Totals</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {sections.map((section) => (
                      <div key={section.id} className="flex justify-between text-sm">
                        <span className="truncate">{section.code}</span>
                        <span className="font-medium">
                          {formatCurrency(sectionTotals[section.id] || 0)}
                        </span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Total Lines:</span>
                  <span className="font-medium">{lines.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Filtered Lines:</span>
                  <span className="font-medium">{filteredLines.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Locked Lines:</span>
                  <span className="font-medium">{lines.filter(l => l.isLocked).length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Provisional Lines:</span>
                  <span className="font-medium">{lines.filter(l => l.isProvisional).length}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Bulk Operations Dialog */}
      <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Operations</DialogTitle>
            <DialogDescription>
              Apply changes to {selectedLines.size} selected lines
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleBulkOperation({type: 'increasePercent', field: 'rate', percent: 10})}
            >
              <Percent className="mr-2 h-4 w-4" />
              Increase Rates by 10%
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleBulkOperation({type: 'round', field: 'rate', decimals: 0})}
            >
              <ArrowUpDown className="mr-2 h-4 w-4" />
              Round Rates to Whole Numbers
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
