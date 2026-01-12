/**
 * useAgreements Hook
 *
 * Custom hook for managing agreements with Supabase.
 * Handles fetching, creating, and signing agreements.
 *
 * Features:
 * - Real-time data from Supabase
 * - Input validation with Zod
 * - Loading and error states
 * - Optimistic UI updates
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import {
  agreementCreateSchema,
  agreementSignatureSchema,
  validate,
  formatValidationError,
} from '@/lib/validation';
import type {
  Agreement,
  AgreementSignature,
  TeamMember,
} from '@/types/database';

// Extended agreement type with computed signature counts
export interface AgreementWithSignatures extends Agreement {
  signedBy: number;
  totalMembers: number;
  creatorName: string;
}

// Signature display type
export interface SignatureDisplay {
  id: string;
  name: string;
  signed: boolean;
  timestamp: string | null;
  memberId: string;
}

interface UseAgreementsResult {
  // Data
  agreements: AgreementWithSignatures[];
  teamMembers: TeamMember[];
  currentUserId: string | null;

  // Loading states
  isLoading: boolean;
  isCreating: boolean;
  isSigning: boolean;

  // Error state
  error: string | null;

  // Actions
  createAgreement: (data: {
    title: string;
    description: string;
  }) => Promise<{ success: boolean; error?: string; id?: string }>;
  signAgreement: (
    agreementId: string
  ) => Promise<{ success: boolean; error?: string }>;
  permanentlyDeleteAgreement: (
    agreementId: string
  ) => Promise<{ success: boolean; error?: string }>;
  deleteAgreement: (
    agreementId: string
  ) => Promise<{
    success: boolean;
    error?: string;
    deleted?: AgreementWithSignatures;
  }>;
  fetchSignatures: (agreementId: string) => Promise<SignatureDisplay[]>;
  hasUserSigned: (agreementId: string) => Promise<boolean>;
  refresh: () => Promise<void>;
}

export function useAgreements(): UseAgreementsResult {
  const [agreements, setAgreements] = useState<AgreementWithSignatures[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteAgreement = async (agreementId: string) => {
    const agreementToDel = agreements.find((a) => a.id === agreementId);

    //Edge case: Agreement not found
    if (!agreementToDel) {
      return {success: false, error: "Agreement not found!"};
    }

    //Remove the Agreement from the UI
    setAgreements(prev => prev.filter(a => a.id !== agreementId));

    return {success: true, deleted: agreementToDel};
  };

  /**
   * Permanently delete an agreement from the database
   * Called after undo timer expires
   */
  const permanentlyDeleteAgreement = async (agreementId: string) => {
    //Delete from DB using Supabase
    const { error: deleteError } = await supabase
      .from('agreements')
      .delete()
      .eq('id', agreementId);

    if (deleteError) {
      return { success: false, error: deleteError.message };
    }

    return {success: true};
  }

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
   * Fetch all agreements with signature counts
   */
  const fetchAgreements = useCallback(async (members: TeamMember[]): Promise<AgreementWithSignatures[]> => {
    // Fetch agreements
    const { data: agreementsData, error: agreementsError } = await supabase
      .from('agreements')
      .select('*')
      .order('created_at', { ascending: false });

    if (agreementsError) {
      throw new Error(`Failed to fetch agreements: ${agreementsError.message}`);
    }

    const agreements = (agreementsData as Agreement[]) || [];

    if (agreements.length === 0) {
      return [];
    }

    // Fetch signature counts for all agreements
    const { data: signatureCounts, error: sigError } = await supabase
      .from('agreement_signatures')
      .select('agreement_id');

    if (sigError) {
      throw new Error(`Failed to fetch signatures: ${sigError.message}`);
    }

    // Count signatures per agreement
    const sigCountMap: Record<string, number> = {};
    const signatures = (signatureCounts as Array<{ agreement_id: string }>) || [];
    signatures.forEach((sig) => {
      sigCountMap[sig.agreement_id] = (sigCountMap[sig.agreement_id] || 0) + 1;
    });

    // Build member lookup
    const memberLookup: Record<string, TeamMember> = {};
    members.forEach((m) => {
      memberLookup[m.id] = m;
    });

    // Combine data
    return agreements.map((agreement) => ({
      ...agreement,
      signedBy: sigCountMap[agreement.id] || 0,
      totalMembers: members.length,
      creatorName: agreement.created_by
        ? memberLookup[agreement.created_by]?.name || 'Unknown'
        : 'Unknown',
    }));
  }, []);

  /**
   * Initial data load
   */
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const members = await fetchTeamMembers();
      setTeamMembers(members);

      // Set current user to first team member (no auth yet)
      if (members.length > 0) {
        setCurrentUserId(members[0].id);
      }

      const agreementsData = await fetchAgreements(members);
      setAgreements(agreementsData);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load data';
      setError(message);
      console.error('useAgreements loadData error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [fetchTeamMembers, fetchAgreements]);

  /**
   * Refresh data
   */
  const refresh = useCallback(async () => {
    await loadData();
  }, [loadData]);

  /**
   * Create a new agreement
   */
  const createAgreement = useCallback(
    async (data: { title: string; description: string }): Promise<{ success: boolean; error?: string; id?: string }> => {
      setIsCreating(true);

      try {
        // Validate input
        const validation = validate(agreementCreateSchema, {
          title: data.title,
          description: data.description || null,
          status: 'pending',
          created_by: currentUserId,
        });

        if (!validation.success) {
          return { success: false, error: formatValidationError(validation.error) };
        }

        // Insert into database
        const insertData = {
          title: validation.data.title,
          description: validation.data.description,
          status: validation.data.status,
          created_by: validation.data.created_by,
        };

        const { data: newAgreement, error: insertError } = await supabase
          .from('agreements')
          .insert(insertData)
          .select()
          .single();

        if (insertError) {
          return { success: false, error: insertError.message };
        }

        const agreement = newAgreement as Agreement;

        // Add to local state (optimistic update)
        const enrichedAgreement: AgreementWithSignatures = {
          ...agreement,
          signedBy: 0,
          totalMembers: teamMembers.length,
          creatorName: teamMembers.find((m) => m.id === currentUserId)?.name || 'You',
        };

        setAgreements((prev) => [enrichedAgreement, ...prev]);

        return { success: true, id: agreement.id };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create agreement';
        return { success: false, error: message };
      } finally {
        setIsCreating(false);
      }
    },
    [currentUserId, teamMembers]
  );

  /**
   * Sign an agreement
   */
  const signAgreement = useCallback(
    async (agreementId: string): Promise<{ success: boolean; error?: string }> => {
      if (!currentUserId) {
        return { success: false, error: 'No user logged in' };
      }

      setIsSigning(true);

      try {
        // Validate input
        const validation = validate(agreementSignatureSchema, {
          agreement_id: agreementId,
          member_id: currentUserId,
        });

        if (!validation.success) {
          return { success: false, error: formatValidationError(validation.error) };
        }

        // Check if already signed (use maybeSingle to avoid error when no rows)
        const { data: existing, error: checkError } = await supabase
          .from('agreement_signatures')
          .select('id')
          .eq('agreement_id', agreementId)
          .eq('member_id', currentUserId)
          .maybeSingle();

        if (checkError) {
          return { success: false, error: 'Failed to check signature status' };
        }

        if (existing) {
          return { success: false, error: 'You have already signed this agreement' };
        }

        // Insert signature
        const { error: insertError } = await supabase
          .from('agreement_signatures')
          .insert({
            agreement_id: agreementId,
            member_id: currentUserId,
          });

        if (insertError) {
          return { success: false, error: insertError.message };
        }

        // Calculate new signature count and check if agreement is now fully signed
        const currentAgreement = agreements.find((a) => a.id === agreementId);
        const newSignedCount = (currentAgreement?.signedBy ?? 0) + 1;
        const totalMembers = currentAgreement?.totalMembers ?? 0;
        const shouldActivate = newSignedCount >= totalMembers && totalMembers > 0;

        // Persist status to database if fully signed
        if (shouldActivate) {
          const { error: statusError } = await supabase
            .from('agreements')
            .update({ status: 'active' })
            .eq('id', agreementId);

          if (statusError) {
            console.error('Failed to update agreement status:', statusError);
          }
        }

        // Update local state
        setAgreements((prev) =>
          prev.map((a) =>
            a.id === agreementId
              ? {
                  ...a,
                  signedBy: newSignedCount,
                  status: shouldActivate ? 'active' : a.status,
                }
              : a
          )
        );

        return { success: true };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to sign agreement';
        return { success: false, error: message };
      } finally {
        setIsSigning(false);
      }
    },
    [currentUserId, agreements]
  );

  /**
   * Fetch signatures for a specific agreement
   */
  const fetchSignatures = useCallback(
    async (agreementId: string): Promise<SignatureDisplay[]> => {
      // Fetch existing signatures
      const { data: signatures, error: sigError } = await supabase
        .from('agreement_signatures')
        .select('*')
        .eq('agreement_id', agreementId);

      if (sigError) {
        console.error('Failed to fetch signatures:', sigError);
        return [];
      }

      const sigs = (signatures as AgreementSignature[]) || [];

      // Build signature lookup
      const signedMemberIds = new Set(sigs.map((s) => s.member_id));
      const signatureLookup: Record<string, AgreementSignature> = {};
      sigs.forEach((s) => {
        signatureLookup[s.member_id] = s;
      });

      // Map team members to signature display
      return teamMembers.map((member) => {
        const signature = signatureLookup[member.id];
        return {
          id: signature?.id || member.id,
          name: member.name,
          signed: signedMemberIds.has(member.id),
          timestamp: signature?.signed_at
            ? formatTimeAgo(new Date(signature.signed_at))
            : null,
          memberId: member.id,
        };
      });
    },
    [teamMembers]
  );

  /**
   * Check if current user has signed an agreement
   */
  const hasUserSigned = useCallback(
    async (agreementId: string): Promise<boolean> => {
      if (!currentUserId) return false;

      const { data, error } = await supabase
        .from('agreement_signatures')
        .select('id')
        .eq('agreement_id', agreementId)
        .eq('member_id', currentUserId)
        .maybeSingle();

      if (error) {
        console.error('Failed to check signature status:', error);
        return false;
      }

      return !!data;
    },
    [currentUserId]
  );

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    agreements,
    teamMembers,
    currentUserId,
    isLoading,
    isCreating,
    isSigning,
    error,
    createAgreement,
    signAgreement,
    deleteAgreement,
    permanentlyDeleteAgreement,
    fetchSignatures,
    hasUserSigned,
    refresh,
  };
}

/**
 * Format a date into a human-readable "time ago" string
 */
function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';

  const minutes = Math.floor(seconds / 60);
  if (seconds < 3600) return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;

  const hours = Math.floor(seconds / 3600);
  if (seconds < 86400) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;

  const days = Math.floor(seconds / 86400);
  if (seconds < 604800) return `${days} ${days === 1 ? 'day' : 'days'} ago`;

  return date.toLocaleDateString();
}
