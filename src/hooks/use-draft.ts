'use client';

import { useState, useEffect, useCallback } from 'react';
import { draftDB, type DraftPlayer, type DraftTeam, type DraftSettings } from '@/lib/draft-db';
import { type Player } from '@/components/players-table';

export function useDraft() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [players, setPlayers] = useState<DraftPlayer[]>([]);
  const [teams, setTeams] = useState<DraftTeam[]>([]);
  const [draftSettings, setDraftSettings] = useState<DraftSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize database and load data
  useEffect(() => {
    async function initialize() {
      try {
        await draftDB.init();
        await loadAllData();
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize draft database:', error);
      } finally {
        setIsLoading(false);
      }
    }
    initialize();
  }, []);

  const loadAllData = useCallback(async () => {
    try {
      const [playersData, teamsData, settingsData] = await Promise.all([
        draftDB.getAllPlayers(),
        draftDB.getAllTeams(),
        draftDB.getDraftSettings()
      ]);
      
      setPlayers(playersData);
      setTeams(teamsData);
      setDraftSettings(settingsData);
    } catch (error) {
      console.error('Failed to load draft data:', error);
    }
  }, []);

  // Convert regular players to draft players
  const initializePlayers = useCallback(async (playerData: Player[]) => {
    const draftPlayers: DraftPlayer[] = playerData.map(player => ({
      id: `${player.web_name}-${player.team}`, // Create unique ID
      ...player, // Preserve ALL original fields
      isDrafted: false,
      draftedBy: undefined
    }));

    await draftDB.savePlayers(draftPlayers);
    await loadAllData();
  }, [loadAllData]);

  // Create draft teams
  const createTeams = useCallback(async (teamNames: string[]) => {
    const newTeams: DraftTeam[] = teamNames.map((name, index) => ({
      id: `team-${index + 1}`,
      name,
      owner: name,
      players: [],
      createdAt: new Date()
    }));

    const newSettings: DraftSettings = {
      teams: newTeams,
      currentPick: 0, // Not used anymore
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await Promise.all([
      draftDB.saveTeams(newTeams),
      draftDB.saveDraftSettings(newSettings)
    ]);
    
    await loadAllData();
  }, [loadAllData]);

  // Draft a player
  const draftPlayer = useCallback(async (playerId: string, teamId: string) => {
    await Promise.all([
      draftDB.draftPlayer(playerId, teamId),
      draftDB.addPlayerToTeam(teamId, playerId)
    ]);
    
    await loadAllData();
  }, [loadAllData]);

  // Undo a draft pick
  const undraftPlayer = useCallback(async (playerId: string) => {
    const player = players.find(p => p.id === playerId);
    if (!player || !player.draftedBy) return;

    await Promise.all([
      draftDB.undraftPlayer(playerId),
      draftDB.removePlayerFromTeam(player.draftedBy, playerId)
    ]);

    await loadAllData();
  }, [players, loadAllData]);

  // Get available players
  const availablePlayers = players.filter(player => !player.isDrafted);

  // Get drafted players
  const draftedPlayers = players.filter(player => player.isDrafted);

  // Get team roster
  const getTeamRoster = useCallback((teamId: string): DraftPlayer[] => {
    return players.filter(player => player.draftedBy === teamId);
  }, [players]);

  // Get current drafting team - not used anymore
  const getCurrentDraftingTeam = useCallback((): DraftTeam | null => {
    return null; // No current drafting team concept
  }, []);

  // Reset draft
  const resetDraft = useCallback(async () => {
    await draftDB.clearAllData();
    await loadAllData();
  }, [loadAllData]);

  // Get draft summary
  const getDraftSummary = useCallback(() => {
    const summary = {
      totalPlayers: players.length,
      draftedPlayers: draftedPlayers.length,
      availablePlayers: availablePlayers.length,
      totalTeams: teams.length,
      currentPick: draftSettings?.currentPick || 0,
      isActive: draftSettings?.isActive || false
    };

    const teamSummaries = teams.map(team => {
      const roster = getTeamRoster(team.id);
      return {
        team: team.name,
        playersCount: roster.length,
        positions: {
          GK: roster.filter(p => p.position === 'GK').length,
          DEF: roster.filter(p => p.position === 'DEF').length,
          MID: roster.filter(p => p.position === 'MID').length,
          FWD: roster.filter(p => p.position === 'FWD').length
        }
      };
    });

    return { ...summary, teamSummaries };
  }, [players, draftedPlayers, availablePlayers, teams, draftSettings, getTeamRoster]);

  return {
    // State
    isInitialized,
    isLoading,
    players,
    teams,
    draftSettings,
    availablePlayers,
    draftedPlayers,
    
    // Actions
    initializePlayers,
    createTeams,
    draftPlayer,
    undraftPlayer,
    resetDraft,
    
    // Computed
    getTeamRoster,
    getCurrentDraftingTeam,
    getDraftSummary,
    
    // Utils
    loadAllData
  };
}