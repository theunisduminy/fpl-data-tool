'use client';

import { useState, useEffect } from 'react';
import { DraftSetup } from '@/components/draft-setup';
import { DraftPanel } from '@/components/draft-panel';
import { PlayersTable, type Player } from '@/components/players-table';
import { useDraft } from '@/hooks/use-draft';
import { type DraftPlayer } from '@/lib/draft-db';
import defData from '@/data/def.json';
import fwdData from '@/data/fwd.json';
import gkData from '@/data/gk.json';
import midData from '@/data/mid.json';

type BasePlayer = Omit<Player, 'position'>;

export default function DraftPage() {
  const {
    isInitialized,
    isLoading,
    teams,
    players,
    initializePlayers,
    createTeams,
    draftPlayer,
    undraftPlayer,
  } = useDraft();

  const [selectedPlayer, setSelectedPlayer] = useState<DraftPlayer | null>(
    null,
  );
  const [isSetupMode, setIsSetupMode] = useState(true);

  // Check if draft is already set up
  useEffect(() => {
    if (isInitialized && teams.length > 0) {
      setIsSetupMode(false);
    }
  }, [isInitialized, teams.length]);

  // Initialize players from JSON data
  useEffect(() => {
    if (isInitialized && players.length === 0) {
      const allPlayers = [
        ...(gkData as BasePlayer[]).map((p) => ({
          ...p,
          position: 'GK' as const,
        })),
        ...(defData as BasePlayer[]).map((p) => ({
          ...p,
          position: 'DEF' as const,
        })),
        ...(midData as BasePlayer[]).map((p) => ({
          ...p,
          position: 'MID' as const,
        })),
        ...(fwdData as BasePlayer[]).map((p) => ({
          ...p,
          position: 'FWD' as const,
        })),
      ] as Player[];

      initializePlayers(allPlayers);
    }
  }, [isInitialized, players.length, initializePlayers]);

  const handleSetupComplete = async (teamNames: string[]) => {
    await createTeams(teamNames);
    setIsSetupMode(false);
  };

  const handlePlayerRowClick = (player: Player) => {
    // Find the corresponding draft player
    const draftPlayer = players.find(
      (p) => p.web_name === player.web_name && p.team === player.team,
    );
    if (draftPlayer) {
      setSelectedPlayer(draftPlayer);
    }
  };

  const handleTeamAssign = async (playerId: string, teamId: string | null) => {
    try {
      if (teamId) {
        // Check if player is already assigned to another team
        const player = players.find((p) => p.id === playerId);
        if (player && player.draftedBy && player.draftedBy !== teamId) {
          // Remove from old team and add to new team
          await undraftPlayer(playerId);
        }
        await draftPlayer(playerId, teamId);
      } else {
        // Remove from team
        await undraftPlayer(playerId);
      }
    } catch (error) {
      console.error('Failed to assign player to team:', error);
    }
  };

  if (isLoading) {
    return (
      <div className='flex min-h-[400px] items-center justify-center'>
        <div className='text-center'>
          <div className='text-lg font-medium'>Loading draft...</div>
          <div className='text-muted-foreground'>
            Setting up your draft environment
          </div>
        </div>
      </div>
    );
  }

  if (isSetupMode) {
    return (
      <DraftSetup onSetupComplete={handleSetupComplete} isLoading={false} />
    );
  }

  // Use original player data with draft status overlay
  const allPlayers = [
    ...(gkData as BasePlayer[]).map((p) => ({ ...p, position: 'GK' as const })),
    ...(defData as BasePlayer[]).map((p) => ({
      ...p,
      position: 'DEF' as const,
    })),
    ...(midData as BasePlayer[]).map((p) => ({
      ...p,
      position: 'MID' as const,
    })),
    ...(fwdData as BasePlayer[]).map((p) => ({
      ...p,
      position: 'FWD' as const,
    })),
  ] as Player[];

  // Merge original data with draft status
  const tablePlayer = allPlayers.map((originalPlayer) => {
    const draftPlayer = players.find(
      (dp) =>
        dp.web_name === originalPlayer.web_name &&
        dp.team === originalPlayer.team,
    );

    return {
      ...originalPlayer, // Keep all original fields for ranking
      isDrafted: draftPlayer?.isDrafted || false,
      draftedBy: draftPlayer?.draftedBy,
    } as Player & { isDrafted: boolean; draftedBy?: string };
  });

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-semibold'>Draft Room</h1>
        <p className='text-muted-foreground'>
          Assign players to teams using the dropdown in the players table
        </p>
      </div>

      {/* Team Rosters - Top Section */}
      <DraftPanel />

      {/* Players Table - Bottom Section */}
      <div>
        <PlayersTable
          players={tablePlayer}
          showPositionFilter={true}
          onRowClick={handlePlayerRowClick}
          selectedPlayer={selectedPlayer}
          showTeamAssignment={true}
          teams={teams}
          onTeamAssign={handleTeamAssign}
        />
      </div>
    </div>
  );
}
