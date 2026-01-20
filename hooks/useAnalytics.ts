/**
 * useAnalytics Hook
 *
 * Custom hook for fetching and computing analytics metrics.
 * Aggregates data from agreements, deliverables, and updates tables.
 *
 * Features:
 * - Real-time metrics from Supabase
 * - Computed aggregations (adoption %, health distribution, activity)
 * - Loading and error states
 * - Contribution graph data (GitHub-style)
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type {
  Agreement,
  AgreementSignature,
  Deliverable,
  Update,
  TeamMember,
} from '@/types/database';

// =============================================================================
// Types
// =============================================================================

/**
 * Daily activity data for the contribution graph
 * Each entry represents one day's worth of updates
 */
export interface DailyActivity {
  date: string; // ISO date string (YYYY-MM-DD)
  count: number; // Number of updates on this day
}

/**
 * Deliverable status distribution for ring charts
 */
export interface StatusDistribution {
  status: string;
  count: number;
  color: string;
}

/**
 * Team member workload data
 */
export interface MemberWorkload {
  memberId: string;
  memberName: string;
  role: string;
  deliverableCount: number;
  atRiskCount: number;
  completedCount: number;
}

/**
 * All computed analytics metrics
 */
export interface AnalyticsMetrics {
  // Agreement metrics
  agreementAdoptionPercent: number; // % of agreements fully signed
  totalAgreements: number;
  fullySignedAgreements: number;

  // Deliverable metrics
  totalDeliverables: number;
  atRiskCount: number;
  completedCount: number;
  inProgressCount: number;
  upcomingCount: number;
  deliverableStatusDistribution: StatusDistribution[];

  // Update/Activity metrics
  totalUpdates: number;
  updatesThisWeek: number;
  openHelpRequests: number;
  dailyActivity: DailyActivity[]; // Last 12 weeks for contribution graph

  // Team metrics
  memberWorkloads: MemberWorkload[];
}

/**
 * Raw data fetched from Supabase (before computation)
 */
interface RawAnalyticsData {
  agreements: Agreement[];
  signatures: AgreementSignature[];
  deliverables: Deliverable[];
  updates: Update[];
  teamMembers: TeamMember[];
}

interface UseAnalyticsResult {
  // Computed metrics
  metrics: AnalyticsMetrics | null;

  // Loading state
  isLoading: boolean;

  // Error state
  error: string | null;

  // Actions
  refresh: () => Promise<void>;
}

// =============================================================================
// Constants
// =============================================================================

// Status colors matching your design system
const STATUS_COLORS: Record<string, string> = {
  'completed': 'var(--color-success)',
  'in-progress': 'var(--color-primary)',
  'at-risk': 'var(--color-error)',
  'upcoming': 'var(--color-muted)',
};

// =============================================================================
// Hook
// =============================================================================

export function useAnalytics(): UseAnalyticsResult {
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all raw data from Supabase
   * Following the established pattern from useAgreements/useDeliverables
   */
  const fetchRawData = useCallback(async (): Promise<RawAnalyticsData> => {
    // Fetch all data in parallel for performance
    const [
      agreementsRes,
      signaturesRes,
      deliverablesRes,
      updatesRes,
      membersRes,
    ] = await Promise.all([
      supabase.from('agreements').select('*'),
      supabase.from('agreement_signatures').select('*'),
      supabase.from('deliverables').select('*'),
      supabase.from('updates').select('*'),
      supabase.from('team_members').select('*'),
    ]);

    // Check for errors
    if (agreementsRes.error) throw new Error(`Agreements: ${agreementsRes.error.message}`);
    if (signaturesRes.error) throw new Error(`Signatures: ${signaturesRes.error.message}`);
    if (deliverablesRes.error) throw new Error(`Deliverables: ${deliverablesRes.error.message}`);
    if (updatesRes.error) throw new Error(`Updates: ${updatesRes.error.message}`);
    if (membersRes.error) throw new Error(`Team members: ${membersRes.error.message}`);

    return {
      agreements: (agreementsRes.data as Agreement[]) || [],
      signatures: (signaturesRes.data as AgreementSignature[]) || [],
      deliverables: (deliverablesRes.data as Deliverable[]) || [],
      updates: (updatesRes.data as Update[]) || [],
      teamMembers: (membersRes.data as TeamMember[]) || [],
    };
  }, []);

  /**
   *
   * This is where the real analytics logic lives.
   * You have access to all raw data - now compute meaningful metrics.
   *
   * @param data - Raw data from all tables
   * @returns Computed analytics metrics
   */
  const computeMetrics = useCallback((data: RawAnalyticsData): AnalyticsMetrics => {
    const { agreements, signatures, deliverables, updates, teamMembers } = data;

    // =========================================================================
    // STEP 1: Agreement Adoption
    // =========================================================================
    const totalAgreements = agreements.filter(a => a.status === 'active').length;
    // Count signatures per agreement
    const sigsByAgreement = signatures.reduce((acc, sig) => {
      acc[sig.agreement_id] = (acc[sig.agreement_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Fully signed = signature count >= total team members
    const totalMembers = teamMembers.length;
    const fullySignedAgreements = agreements.filter(a =>
      a.status === 'active' && (sigsByAgreement[a.id] || 0) >= totalMembers
    ).length;

    const agreementAdoptionPercent = totalAgreements > 0
      ? Math.round((fullySignedAgreements / totalAgreements) * 100)
      : 0;

    // =========================================================================
    // STEP 2: Deliverable Health
    // =========================================================================
    const totalDeliverables = deliverables.length;
    const completedCount = deliverables.filter(d => d.status === 'completed').length;
    const inProgressCount = deliverables.filter(d => d.status === 'in-progress').length;
    const atRiskCount = deliverables.filter(d => d.status === 'at-risk').length;
    const upcomingCount = deliverables.filter(d => d.status === 'upcoming').length;

    const deliverableStatusDistribution: StatusDistribution[] = [
      { status: 'Completed', count: completedCount, color: STATUS_COLORS['completed'] },
      { status: 'In Progress', count: inProgressCount, color: STATUS_COLORS['in-progress'] },
      { status: 'At Risk', count: atRiskCount, color: STATUS_COLORS['at-risk'] },
      { status: 'Upcoming', count: upcomingCount, color: STATUS_COLORS['upcoming'] },
    ];

    // =========================================================================
    // STEP 3: Update Activity & Help Requests
    // =========================================================================
    const totalUpdates = updates.length;

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const updatesThisWeek = updates.filter(u => new Date(u.created_at!) > oneWeekAgo).length;
    const openHelpRequests = updates.filter(u => u.is_help_request).length;

    // =========================================================================
    // STEP 4: Daily Activity (Full Activity Feed)
    // Tracks ALL activity: updates, agreement signatures, deliverable changes
    // =========================================================================
    const activityMap = new Map<string, number>();

    // Helper to increment activity count for a date
    const addActivity = (dateStr: string | null | undefined) => {
      if (!dateStr) return;
      const date = new Date(dateStr).toISOString().split('T')[0];
      activityMap.set(date, (activityMap.get(date) || 0) + 1);
    };

    // Count status updates
    updates.forEach(u => addActivity(u.created_at));

    // Count agreement signatures
    signatures.forEach(s => addActivity(s.signed_at));

    // Count deliverable creation and updates
    deliverables.forEach(d => {
      addActivity(d.created_at);
      // Only count updated_at if it's different from created_at (actual update)
      if (d.updated_at && d.created_at && d.updated_at !== d.created_at) {
        addActivity(d.updated_at);
      }
    });

    // Generate last 84 days (12 weeks)
    const dailyActivity: DailyActivity[] = [];
    const today = new Date();
    for (let i = 83; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      dailyActivity.push({
        date: dateStr,
        count: activityMap.get(dateStr) || 0
      });
    }

    // =========================================================================
    // STEP 5: Member Workloads
    // =========================================================================
    const memberWorkloads: MemberWorkload[] = teamMembers.map(member => {
      const memberDeliverables = deliverables.filter(d => d.owner_id === member.id);
      return {
        memberId: member.id,
        memberName: member.name,
        role: member.role,
        deliverableCount: memberDeliverables.length,
        atRiskCount: memberDeliverables.filter(d => d.status === 'at-risk').length,
        completedCount: memberDeliverables.filter(d => d.status === 'completed').length,
      };
    });

    // Sort by deliverable count descending
    memberWorkloads.sort((a, b) => b.deliverableCount - a.deliverableCount);

    return {
      agreementAdoptionPercent,
      totalAgreements,
      fullySignedAgreements,
      totalDeliverables,
      atRiskCount,
      completedCount,
      inProgressCount,
      upcomingCount,
      deliverableStatusDistribution,
      totalUpdates,
      updatesThisWeek,
      openHelpRequests,
      dailyActivity,
      memberWorkloads,
    };
  }, []);

  /**
   * Load and compute all analytics data
   */
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const rawData = await fetchRawData();
      const computedMetrics = computeMetrics(rawData);
      setMetrics(computedMetrics);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load analytics';
      setError(message);
      console.error('useAnalytics loadData error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [fetchRawData, computeMetrics]);

  /**
   * Refresh data
   */
  const refresh = useCallback(async () => {
    await loadData();
  }, [loadData]);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    metrics,
    isLoading,
    error,
    refresh,
  };
}
