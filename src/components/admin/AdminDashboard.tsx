/**
 * Main admin dashboard client component.
 * Fetches data from /api/admin/* endpoints and renders
 * three tabs: Growth, Retention, Platform.
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import SignupsChart from "./SignupsChart";
import RetentionMetrics from "./RetentionMetrics";
import RetentionTable from "./RetentionTable";
import PlatformAdoption from "./PlatformAdoption";
import TaskStats from "./TaskStats";
import StatCard from "./StatCard";

/** Shape of GET /api/admin/signups response */
interface SignupsData {
  daily: Array<{ date: string; count: number }>;
  total: number;
}

/** Shape of GET /api/admin/retention response */
interface RetentionData {
  dau: number;
  wau: number;
  mau: number;
  stickiness: number;
  topUsers: Array<{
    email: string;
    totalLogins: number;
    activeDays: number;
    lastLogin: string;
  }>;
}

/** Shape of GET /api/admin/overview response */
interface OverviewData {
  platforms: {
    canvas: number;
    gradescope: number;
    googleCalendar: number;
    pensieve: number;
  };
  taskStats: {
    total: number;
    completed: number;
    completionRate: number;
    bySource: Array<{ source: string; count: number; completed: number }>;
  };
}

/**
 * Loading skeleton placeholder for chart areas.
 *
 * @returns Animated skeleton div
 */
function ChartSkeleton() {
  return (
    <div className="glass rounded-2xl border border-border p-5">
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-muted rounded w-32" />
        <div className="h-3 bg-muted rounded w-48" />
        <div className="h-[280px] bg-muted/50 rounded-xl" />
      </div>
    </div>
  );
}

/**
 * Loading skeleton placeholder for stat card grids.
 *
 * @param count - Number of skeleton cards to render
 * @returns Grid of animated skeleton cards
 */
function StatsSkeleton({ count }: { count: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass rounded-2xl border border-border p-5">
          <div className="animate-pulse space-y-2">
            <div className="h-3 bg-muted rounded w-16" />
            <div className="h-7 bg-muted rounded w-12" />
            <div className="h-3 bg-muted rounded w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Renders the admin analytics dashboard with three tabs.
 * Data is fetched client-side from authenticated API routes.
 *
 * @returns Full admin dashboard UI with tabs, charts, and tables
 */
export default function AdminDashboard() {
  const [signups, setSignups] = useState<SignupsData | null>(null);
  const [retention, setRetention] = useState<RetentionData | null>(null);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [signupsRes, retentionRes, overviewRes] = await Promise.all([
        fetch("/api/admin/signups"),
        fetch("/api/admin/retention"),
        fetch("/api/admin/overview"),
      ]);

      if (!signupsRes.ok || !retentionRes.ok || !overviewRes.ok) {
        setError("Failed to load dashboard data");
        return;
      }

      const [signupsJson, retentionJson, overviewJson] = await Promise.all([
        signupsRes.json(),
        retentionRes.json(),
        overviewRes.json(),
      ]);

      setSignups(signupsJson);
      setRetention(retentionJson);
      setOverview(overviewJson);
    } catch {
      setError("Failed to load dashboard data");
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2">
          <p className="text-sm text-red-500">{error}</p>
          <button
            onClick={() => {
              setError(null);
              fetchData();
            }}
            className="text-sm text-blue-500 hover:text-blue-600 transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          User growth, retention, and platform metrics
        </p>
      </div>

      {/* Quick stats row */}
      {signups && retention ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Users" value={signups.total} />
          <StatCard label="DAU" value={retention.dau} subtext="Last 24h" />
          <StatCard label="WAU" value={retention.wau} subtext="Last 7d" />
          <StatCard
            label="Stickiness"
            value={`${retention.stickiness}%`}
            subtext="DAU/MAU"
          />
        </div>
      ) : (
        <StatsSkeleton count={4} />
      )}

      {/* Tabs */}
      <Tabs defaultValue="growth">
        <TabsList>
          <TabsTrigger value="growth">Growth</TabsTrigger>
          <TabsTrigger value="retention">Retention</TabsTrigger>
          <TabsTrigger value="platform">Platform</TabsTrigger>
        </TabsList>

        {/* Growth Tab */}
        <TabsContent value="growth">
          <div className="space-y-4">
            {signups ? (
              <SignupsChart daily={signups.daily} total={signups.total} />
            ) : (
              <ChartSkeleton />
            )}
          </div>
        </TabsContent>

        {/* Retention Tab */}
        <TabsContent value="retention">
          <div className="space-y-4">
            {retention ? (
              <>
                <RetentionMetrics
                  dau={retention.dau}
                  wau={retention.wau}
                  mau={retention.mau}
                  stickiness={retention.stickiness}
                />
                <RetentionTable users={retention.topUsers} />
              </>
            ) : (
              <>
                <StatsSkeleton count={4} />
                <ChartSkeleton />
              </>
            )}
          </div>
        </TabsContent>

        {/* Platform Tab */}
        <TabsContent value="platform">
          <div className="space-y-4">
            {overview ? (
              <>
                <PlatformAdoption {...overview.platforms} />
                <TaskStats {...overview.taskStats} />
              </>
            ) : (
              <>
                <ChartSkeleton />
                <StatsSkeleton count={3} />
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
