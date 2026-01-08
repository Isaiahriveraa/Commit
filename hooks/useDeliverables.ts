/**
 * useDeliverables Hook
 *
 * Custom hook for managing deliverables with Supabase.
 * Handles fetching, creating, updating, and deleting deliverables.
 *
 * Features:
 * - Real-time data from Supabase
 * - Input validation with Zod
 * - Loading and error states
 * - Dependency management
 * - Progress tracking
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import {
  deliverableCreateSchema,
  deliverableUpdateSchema,
  deliverableDependencySchema,
  validate,
  formatValidationError,
} from '@/lib/validation';
import type {
  Deliverable,
  TeamMember,
  DeliverableDependency,
} from '@/types/database';

// Extended deliverable type with owner info and dependencies
export interface DeliverableWithDetails extends Deliverable {
  ownerName: string;
  dependencyIds: string[];
}

// Status type for type safety
export type DeliverableStatus = 'upcoming' | 'in-progress' | 'at-risk' | 'completed';

interface UseDeliverablesResult {
  // Data
  deliverables: DeliverableWithDetails[];
  teamMembers: TeamMember[];
  currentUserId: string | null;

  // Loading states
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;

  // Error state
  error: string | null;

  // Actions
  createDeliverable: (data: {
    title: string;
    description: string;
    owner_id: string | null;
    deadline: string | null;
    dependencyIds?: string[];
  }) => Promise<{ success: boolean; error?: string; id?: string }>;

  updateDeliverable: (
    id: string,
    data: {
      title?: string;
      description?: string | null;
      owner_id?: string | null;
      deadline?: string | null;
      progress?: number;
      status?: DeliverableStatus;
    }
  ) => Promise<{ success: boolean; error?: string }>;

  updateProgress: (
    id: string,
    progress: number
  ) => Promise<{ success: boolean; error?: string }>;

  deleteDeliverable: (id: string) => Promise<{ success: boolean; error?: string }>;

  addDependency: (
    deliverableId: string,
    dependsOnId: string
  ) => Promise<{ success: boolean; error?: string }>;

  removeDependency: (
    deliverableId: string,
    dependsOnId: string
  ) => Promise<{ success: boolean; error?: string }>;

  refresh: () => Promise<void>;
}

export function useDeliverables(): UseDeliverablesResult {
  const [deliverables, setDeliverables] = useState<DeliverableWithDetails[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all team members
   */
  const fetchTeamMembers = useCallback(async (): Promise<TeamMember[]> => {
    const { data, error: fetchError } = await supabase
      .from('team_members')
      .select('*')
      .order('name');

    if (fetchError) {
      throw new Error(`Failed to fetch team members: ${fetchError.message}`);
    }

    return (data as TeamMember[]) || [];
  }, []);

  /**
   * Fetch all deliverables with owner info and dependencies
   */
  const fetchDeliverables = useCallback(
    async (members: TeamMember[]): Promise<DeliverableWithDetails[]> => {
      // Fetch deliverables (sorting handled client-side for consistent null handling)
      const { data: deliverablesData, error: deliverablesError } = await supabase
        .from('deliverables')
        .select('*');

      if (deliverablesError) {
        throw new Error(`Failed to fetch deliverables: ${deliverablesError.message}`);
      }

      const deliverablesList = (deliverablesData as Deliverable[]) || [];

      if (deliverablesList.length === 0) {
        return [];
      }

      // Fetch all dependencies
      const { data: dependenciesData, error: depsError } = await supabase
        .from('deliverable_dependencies')
        .select('*');

      if (depsError) {
        throw new Error(`Failed to fetch dependencies: ${depsError.message}`);
      }

      const dependencies = (dependenciesData as DeliverableDependency[]) || [];

      // Group dependencies by deliverable_id
      const depsMap: Record<string, string[]> = {};
      dependencies.forEach((dep) => {
        if (!depsMap[dep.deliverable_id]) {
          depsMap[dep.deliverable_id] = [];
        }
        depsMap[dep.deliverable_id].push(dep.depends_on_id);
      });

      // Build member lookup
      const memberLookup: Record<string, TeamMember> = {};
      members.forEach((m) => {
        memberLookup[m.id] = m;
      });

      // Combine data
      return deliverablesList.map((deliverable) => ({
        ...deliverable,
        ownerName: deliverable.owner_id
          ? memberLookup[deliverable.owner_id]?.name || 'Unknown'
          : 'Unassigned',
        dependencyIds: depsMap[deliverable.id] || [],
      }));
    },
    []
  );

  /**
   * Initial data load
   */
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const members = await fetchTeamMembers();
      setTeamMembers(members);

      // TODO: Replace this placeholder with real authentication-derived user context.
      // Currently sets the current user to the first team member (no auth yet),
      // which can lead to incorrect audit trails and ownership tracking.
      // BLOCKER: Must implement proper authentication before production use.
      if (members.length > 0) {
        setCurrentUserId(members[0].id);
      }

      const deliverablesData = await fetchDeliverables(members);
      setDeliverables(deliverablesData);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load data';
      setError(message);
      console.error('useDeliverables loadData error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [fetchTeamMembers, fetchDeliverables]);

  /**
   * Refresh data
   */
  const refresh = useCallback(async () => {
    await loadData();
  }, [loadData]);

  /**
   * Create a new deliverable
   */
  const createDeliverable = useCallback(
    async (data: {
      title: string;
      description: string;
      owner_id: string | null;
      deadline: string | null;
      dependencyIds?: string[];
    }): Promise<{ success: boolean; error?: string; id?: string }> => {
      setIsCreating(true);

      try {
        // Validate input
        const validation = validate(deliverableCreateSchema, {
          title: data.title,
          description: data.description || null,
          owner_id: data.owner_id,
          deadline: data.deadline,
          status: 'upcoming',
          progress: 0,
        });

        if (!validation.success) {
          return { success: false, error: formatValidationError(validation.error) };
        }

        // Insert deliverable
        const { data: newDeliverable, error: insertError } = await supabase
          .from('deliverables')
          .insert({
            title: validation.data.title,
            description: validation.data.description,
            owner_id: validation.data.owner_id,
            deadline: validation.data.deadline,
            status: validation.data.status,
            progress: validation.data.progress,
          })
          .select()
          .single();

        if (insertError) {
          return { success: false, error: insertError.message };
        }

        const deliverable = newDeliverable as Deliverable;

        // Insert dependencies if provided
        const dependencyIds = data.dependencyIds || [];
        if (dependencyIds.length > 0) {
          const depsToInsert = dependencyIds.map((depId) => ({
            deliverable_id: deliverable.id,
            depends_on_id: depId,
          }));

          const { error: depsError } = await supabase
            .from('deliverable_dependencies')
            .insert(depsToInsert);

          if (depsError) {
            console.error('Failed to insert dependencies:', depsError);

            // Roll back the deliverable creation to avoid inconsistent state
            const { error: rollbackError } = await supabase
              .from('deliverables')
              .delete()
              .eq('id', deliverable.id);

            if (rollbackError) {
              console.error('Failed to roll back deliverable after dependency failure:', rollbackError);
            }

            return {
              success: false,
              error: 'Deliverable could not be saved because adding its dependencies failed. Please try again.',
            };
          }
        }

        // Add to local state
        const enrichedDeliverable: DeliverableWithDetails = {
          ...deliverable,
          ownerName: deliverable.owner_id
            ? teamMembers.find((m) => m.id === deliverable.owner_id)?.name || 'Unknown'
            : 'Unassigned',
          dependencyIds,
        };

        setDeliverables((prev) => [enrichedDeliverable, ...prev]);

        return { success: true, id: deliverable.id };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create deliverable';
        return { success: false, error: message };
      } finally {
        setIsCreating(false);
      }
    },
    [teamMembers]
  );

  /**
   * Update a deliverable
   */
  const updateDeliverable = useCallback(
    async (
      id: string,
      data: {
        title?: string;
        description?: string | null;
        owner_id?: string | null;
        deadline?: string | null;
        progress?: number;
        status?: DeliverableStatus;
      }
    ): Promise<{ success: boolean; error?: string }> => {
      setIsUpdating(true);

      try {
        // Validate input
        const validation = validate(deliverableUpdateSchema, data);

        if (!validation.success) {
          return { success: false, error: formatValidationError(validation.error) };
        }

        // Update in database
        const { error: updateError } = await supabase
          .from('deliverables')
          .update(validation.data)
          .eq('id', id);

        if (updateError) {
          return { success: false, error: updateError.message };
        }

        // Update local state
        setDeliverables((prev) =>
          prev.map((d) => {
            if (d.id !== id) return d;

            const updated = { ...d, ...validation.data };

            // Update owner name if owner_id changed
            if (data.owner_id !== undefined) {
              updated.ownerName = data.owner_id
                ? teamMembers.find((m) => m.id === data.owner_id)?.name || 'Unknown'
                : 'Unassigned';
            }

            return updated;
          })
        );

        return { success: true };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update deliverable';
        return { success: false, error: message };
      } finally {
        setIsUpdating(false);
      }
    },
    [teamMembers]
  );

  /**
   * Update just the progress of a deliverable
   */
  const updateProgress = useCallback(
    async (id: string, progress: number): Promise<{ success: boolean; error?: string }> => {
      // Auto-update status based on progress
      let status: DeliverableStatus | undefined;
      if (progress === 100) {
        status = 'completed';
      } else if (progress > 0) {
        // Check if deadline is approaching for at-risk status
        const deliverable = deliverables.find((d) => d.id === id);
        if (deliverable?.deadline) {
          const daysUntil = Math.ceil(
            (new Date(deliverable.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
          );
          if (daysUntil < 0 || (daysUntil <= 3 && progress < 75)) {
            status = 'at-risk';
          } else {
            status = 'in-progress';
          }
        } else {
          status = 'in-progress';
        }
      }

      return updateDeliverable(id, { progress, status });
    },
    [deliverables, updateDeliverable]
  );

  /**
   * Delete a deliverable
   */
  const deleteDeliverable = useCallback(
    async (id: string): Promise<{ success: boolean; error?: string }> => {
      setIsDeleting(true);

      try {
        const { error: deleteError } = await supabase
          .from('deliverables')
          .delete()
          .eq('id', id);

        if (deleteError) {
          return { success: false, error: deleteError.message };
        }

        // Remove from local state
        setDeliverables((prev) => prev.filter((d) => d.id !== id));

        return { success: true };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete deliverable';
        return { success: false, error: message };
      } finally {
        setIsDeleting(false);
      }
    },
    []
  );

  /**
   * Add a dependency to a deliverable
   */
  const addDependency = useCallback(
    async (
      deliverableId: string,
      dependsOnId: string
    ): Promise<{ success: boolean; error?: string }> => {
      // Validate schema
      const validation = validate(deliverableDependencySchema, {
        deliverable_id: deliverableId,
        depends_on_id: dependsOnId,
      });

      if (!validation.success) {
        return { success: false, error: formatValidationError(validation.error) };
      }

      // Validate self-referential
      if (deliverableId === dependsOnId) {
        return { success: false, error: 'A deliverable cannot depend on itself' };
      }

      // Validate both deliverables exist
      const deliverableExists = deliverables.some(d => d.id === deliverableId);
      const dependsOnExists = deliverables.some(d => d.id === dependsOnId);

      if (!deliverableExists) {
        return { success: false, error: 'Deliverable not found' };
      }

      if (!dependsOnExists) {
        return { success: false, error: 'Dependency deliverable not found' };
      }

      try {
        const { error: insertError } = await supabase
          .from('deliverable_dependencies')
          .insert({
            deliverable_id: deliverableId,
            depends_on_id: dependsOnId,
          });

        if (insertError) {
          // Check for unique constraint violation
          if (insertError.code === '23505') {
            return { success: false, error: 'This dependency already exists' };
          }
          // Check for circular dependency error from trigger
          if (insertError.code === 'P0001') {
            return { success: false, error: 'This would create a circular dependency' };
          }
          return { success: false, error: insertError.message };
        }

        // Update local state
        setDeliverables((prev) =>
          prev.map((d) =>
            d.id === deliverableId
              ? { ...d, dependencyIds: [...d.dependencyIds, dependsOnId] }
              : d
          )
        );

        return { success: true };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to add dependency';
        return { success: false, error: message };
      }
    },
    [deliverables]
  );

  /**
   * Remove a dependency from a deliverable
   */
  const removeDependency = useCallback(
    async (
      deliverableId: string,
      dependsOnId: string
    ): Promise<{ success: boolean; error?: string }> => {
      try {
        const { error: deleteError } = await supabase
          .from('deliverable_dependencies')
          .delete()
          .eq('deliverable_id', deliverableId)
          .eq('depends_on_id', dependsOnId);

        if (deleteError) {
          return { success: false, error: deleteError.message };
        }

        // Update local state
        setDeliverables((prev) =>
          prev.map((d) =>
            d.id === deliverableId
              ? { ...d, dependencyIds: d.dependencyIds.filter((id) => id !== dependsOnId) }
              : d
          )
        );

        return { success: true };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to remove dependency';
        return { success: false, error: message };
      }
    },
    []
  );

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    deliverables,
    teamMembers,
    currentUserId,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    error,
    createDeliverable,
    updateDeliverable,
    updateProgress,
    deleteDeliverable,
    addDependency,
    removeDependency,
    refresh,
  };
}
