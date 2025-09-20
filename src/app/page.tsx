"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Building,
  FileText,
  Calculator,
  Download,
  Plus,
  TrendingUp,
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
  Eye,
  Edit,
  BarChart3
} from "lucide-react";
import { db } from "@/lib/data";
import type { DashboardCard } from "@/lib/types";
import Link from "next/link";

interface RecentActivity {
  id: string;
  type: 'template' | 'boq' | 'project' | 'export';
  title: string;
  subtitle: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'approved' | 'draft';
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalTemplates: 0,
    activeBoqs: 0,
    recentExports: 0
  });

  const [recentActivity] = useState<RecentActivity[]>([
    {
      id: '1',
      type: 'template',
      title: 'Road Construction - Standard v1.0',
      subtitle: 'Template published',
      timestamp: '2 hours ago',
      status: 'completed'
    },
    {
      id: '2',
      type: 'boq',
      title: 'Highway Project - Section A',
      subtitle: 'BoQ created from template',
      timestamp: '4 hours ago',
      status: 'draft'
    },
    {
      id: '3',
      type: 'project',
      title: 'Port Moresby Ring Road',
      subtitle: 'New project created',
      timestamp: '1 day ago',
      status: 'completed'
    },
    {
      id: '4',
      type: 'export',
      title: 'Project Summary.xlsx',
      subtitle: 'Excel export completed',
      timestamp: '1 day ago',
      status: 'completed'
    },
    {
      id: '5',
      type: 'boq',
      title: 'Bridge Construction - East Wing',
      subtitle: 'Pending approval',
      timestamp: '2 days ago',
      status: 'pending'
    }
  ]);

  useEffect(() => {
    // Load dashboard statistics
    const dashboardStats = db.getDashboardStats('tenant-1');
    setStats(dashboardStats);
  }, []);

  const dashboardCards: DashboardCard[] = [
    {
      title: "Active Projects",
      value: stats.totalProjects,
      subtitle: "+2 this month",
      trend: { value: 12, isPositive: true },
      action: { label: "View All", href: "/projects" }
    },
    {
      title: "Templates",
      value: stats.totalTemplates,
      subtitle: "Published templates",
      action: { label: "Browse", href: "/templates" }
    },
    {
      title: "Active BoQs",
      value: stats.activeBoqs,
      subtitle: "In progress",
      trend: { value: 8, isPositive: true },
      action: { label: "View BoQs", href: "/boqs" }
    },
    {
      title: "Recent Exports",
      value: "12",
      subtitle: "This week",
      action: { label: "Export Center", href: "/boqs/exports" }
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'template': return FileText;
      case 'boq': return Calculator;
      case 'project': return Building;
      case 'export': return Download;
      default: return FileText;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'approved': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      case 'draft': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'approved': return CheckCircle;
      case 'pending': return Clock;
      case 'draft': return Edit;
      default: return AlertCircle;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your BoQ management system.
        </p>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Plus className="mr-2 h-5 w-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Get started with common tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button asChild className="h-20 flex-col">
              <Link href="/templates/new">
                <FileText className="h-6 w-6 mb-2" />
                Create Template
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col">
              <Link href="/projects/new">
                <Building className="h-6 w-6 mb-2" />
                New Project
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col">
              <Link href="/boqs/create">
                <Calculator className="h-6 w-6 mb-2" />
                Create BoQ
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardCards.map((card, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {card.subtitle}
                </p>
                {card.trend && (
                  <div className={`flex items-center text-xs ${
                    card.trend.isPositive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <TrendingUp className="mr-1 h-3 w-3" />
                    {card.trend.value}%
                  </div>
                )}
              </div>
              {card.action && (
                <Button asChild variant="ghost" size="sm" className="mt-2 w-full">
                  <Link href={card.action.href}>
                    <Eye className="mr-2 h-4 w-4" />
                    {card.action.label}
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest updates across your projects and templates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => {
                const Icon = getActivityIcon(activity.type);
                const StatusIcon = getStatusIcon(activity.status);

                return (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-foreground truncate">
                          {activity.title}
                        </p>
                        <Badge variant="outline" className="flex items-center space-x-1">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(activity.status)}`} />
                          <span className="capitalize">{activity.status}</span>
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {activity.subtitle}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.timestamp}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Templates Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Template Library</CardTitle>
            <CardDescription>
              Your most used templates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Road Construction - Standard</p>
                  <p className="text-sm text-muted-foreground">v1.0 • Published</p>
                </div>
                <Badge>Active</Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Bridge Construction</p>
                  <p className="text-sm text-muted-foreground">v2.1 • Draft</p>
                </div>
                <Badge variant="outline">Draft</Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">ICT Infrastructure</p>
                  <p className="text-sm text-muted-foreground">v1.5 • Published</p>
                </div>
                <Badge>Active</Badge>
              </div>
              <Button asChild variant="outline" className="w-full mt-4">
                <Link href="/templates">
                  <FileText className="mr-2 h-4 w-4" />
                  View All Templates
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
