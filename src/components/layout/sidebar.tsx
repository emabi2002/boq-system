"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  BarChart3,
  FileText,
  FolderOpen,
  Settings,
  Users,
  Database,
  Plus,
  Download,
  Upload,
  Calculator,
  Building,
  Wrench,
  HardHat,
  Package,
  ChevronDown,
  ChevronRight,
  Home,
  Folder,
  FileEdit,
  Library
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface NavItem {
  title: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: NavItem[];
  badge?: string;
}

const navigation: NavItem[] = [
  {
    title: "Dashboard",
    href: "/",
    icon: Home,
  },
  {
    title: "Projects",
    icon: Building,
    children: [
      { title: "All Projects", href: "/projects", icon: FolderOpen },
      { title: "New Project", href: "/projects/new", icon: Plus },
    ],
  },
  {
    title: "Templates",
    icon: FileText,
    children: [
      { title: "Template Library", href: "/templates", icon: Library },
      { title: "Template Builder", href: "/templates/builder", icon: FileEdit },
      { title: "New Template", href: "/templates/new", icon: Plus },
    ],
  },
  {
    title: "BoQ Management",
    icon: Calculator,
    children: [
      { title: "All BoQs", href: "/boqs", icon: Folder },
      { title: "Create BoQ", href: "/boqs/create", icon: Plus },
      { title: "Recent Exports", href: "/boqs/exports", icon: Download },
    ],
  },
  {
    title: "Catalogs",
    icon: Database,
    children: [
      { title: "Units of Measure", href: "/catalogs/units", icon: Package },
      { title: "Materials", href: "/catalogs/materials", icon: Package },
      { title: "Equipment", href: "/catalogs/equipment", icon: Wrench },
      { title: "Labor Roles", href: "/catalogs/labor", icon: HardHat },
      { title: "Rate Sets", href: "/catalogs/rates", icon: BarChart3 },
    ],
  },
  {
    title: "Import/Export",
    icon: Download,
    children: [
      { title: "Import Template", href: "/import/template", icon: Upload },
      { title: "Import BoQ", href: "/import/boq", icon: Upload },
      { title: "Export Templates", href: "/export/templates", icon: Download },
    ],
  },
  {
    title: "Administration",
    icon: Settings,
    children: [
      { title: "Project Types", href: "/admin/project-types", icon: Building },
      { title: "Custom Fields", href: "/admin/custom-fields", icon: Settings },
      { title: "Users & Roles", href: "/admin/users", icon: Users },
      { title: "Tenant Settings", href: "/admin/settings", icon: Settings },
    ],
  },
];

function NavItem({ item, level = 0 }: { item: NavItem; level?: number }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

  if (hasChildren) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start text-left font-normal h-9",
              level > 0 && "pl-8"
            )}
          >
            <item.icon className="mr-2 h-4 w-4" />
            <span className="flex-1">{item.title}</span>
            {item.badge && (
              <span className="ml-auto bg-primary/10 text-primary px-2 py-1 text-xs rounded-full">
                {item.badge}
              </span>
            )}
            {isOpen ? (
              <ChevronDown className="ml-auto h-4 w-4" />
            ) : (
              <ChevronRight className="ml-auto h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-1">
          {item.children?.map((child, index) => (
            <NavItem key={index} item={child} level={level + 1} />
          ))}
        </CollapsibleContent>
      </Collapsible>
    );
  }

  return (
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start text-left font-normal h-9",
        level > 0 && "pl-8",
        pathname === item.href && "bg-accent text-accent-foreground"
      )}
      asChild
    >
      <Link href={item.href || "#"}>
        <item.icon className="mr-2 h-4 w-4" />
        <span className="flex-1">{item.title}</span>
        {item.badge && (
          <span className="ml-auto bg-primary/10 text-primary px-2 py-1 text-xs rounded-full">
            {item.badge}
          </span>
        )}
      </Link>
    </Button>
  );
}

export function Sidebar() {
  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-background border-r">
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center h-16 px-4 border-b">
          <div className="flex items-center space-x-2">
            <Calculator className="h-8 w-8 text-primary" />
            <div>
              <h1 className="font-bold text-lg">BoQ System</h1>
              <p className="text-xs text-muted-foreground">v1.0</p>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1 px-3 py-4">
          <div className="space-y-1">
            {navigation.map((item, index) => (
              <NavItem key={index} item={item} />
            ))}
          </div>
        </ScrollArea>

        <div className="p-4 border-t">
          <div className="bg-muted p-3 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Building className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">PNG Construction Co.</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Active Tenant
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
