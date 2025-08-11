'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, RotateCcw } from 'lucide-react';
import { useDraft } from '@/hooks/use-draft';

const POSITION_LIMITS = {
  GK: 2,
  DEF: 5,
  MID: 5,
  FWD: 3,
};

export function DraftPanel() {
  const { teams, undraftPlayer, getTeamRoster, getDraftSummary, resetDraft } =
    useDraft();

  const summary = getDraftSummary();

  const handleUndraftPlayer = async (playerId: string) => {
    try {
      await undraftPlayer(playerId);
    } catch (error) {
      console.error('Failed to undraft player:', error);
    }
  };

  const handleReset = async () => {
    if (
      window.confirm(
        'Are you sure you want to reset the entire draft? This cannot be undone.',
      )
    ) {
      await resetDraft();
    }
  };

  return (
    <div className='space-y-4'>
      {/* Draft Summary */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center justify-between'>
            <span className='flex items-center gap-2'>
              <Users className='h-5 w-5' />
              Team Rosters
            </span>
            <Button onClick={handleReset} variant='destructive' size='sm'>
              <RotateCcw className='mr-2 h-4 w-4' />
              Reset Draft
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-muted-foreground mb-4 text-sm'>
            <span className='text-foreground font-medium'>
              {summary.draftedPlayers}
            </span>{' '}
            of {summary.totalPlayers} players drafted
          </div>

          {/* Team position requirements */}
          <div className='bg-muted/50 mb-4 rounded-lg p-3'>
            <div className='mb-2 text-sm font-medium'>Squad Requirements:</div>
            <div className='flex flex-row gap-2 text-xs'>
              <div>GK: 2</div>
              <div>DEF: 5</div>
              <div>MID: 5</div>
              <div>FWD: 3</div>
            </div>
          </div>

          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            {teams.map((team) => {
              const roster = getTeamRoster(team.id);
              const positionCounts = {
                GK: roster.filter((p) => p.position === 'GK').length,
                DEF: roster.filter((p) => p.position === 'DEF').length,
                MID: roster.filter((p) => p.position === 'MID').length,
                FWD: roster.filter((p) => p.position === 'FWD').length,
              };

              const totalPlayers = roster.length;
              const isComplete = totalPlayers === 15;

              return (
                <div key={team.id} className='rounded-lg border p-4'>
                  <div className='mb-3 flex items-center justify-between'>
                    <h4 className='font-medium'>{team.name}</h4>
                    <Badge variant={isComplete ? 'default' : 'outline'}>
                      {totalPlayers}/15
                    </Badge>
                  </div>

                  <div className='mb-3 grid grid-cols-4 gap-2 text-sm'>
                    {Object.entries(positionCounts).map(([pos, count]) => {
                      const limit =
                        POSITION_LIMITS[pos as keyof typeof POSITION_LIMITS];
                      const isOverLimit = count > limit;
                      const isComplete = count === limit;

                      return (
                        <div
                          key={pos}
                          className={`flex justify-between rounded p-1 text-xs ${
                            isOverLimit
                              ? 'bg-red-50 text-red-700'
                              : isComplete
                                ? 'bg-green-50 text-green-700'
                                : 'bg-gray-50'
                          } `}
                        >
                          <span>{pos}:</span>
                          <span className='font-medium'>
                            {count}/{limit}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {roster.length > 0 && (
                    <div className='max-h-full space-y-5 overflow-y-auto'>
                      {(['GK', 'DEF', 'MID', 'FWD'] as const).map(
                        (position) => {
                          const playersInPosition = roster.filter(
                            (p) => p.position === position,
                          );
                          const limit = POSITION_LIMITS[position];

                          if (playersInPosition.length === 0) return null;

                          return (
                            <div key={position} className='space-y-1'>
                              <div className='flex items-center gap-2'>
                                <Badge
                                  variant={
                                    playersInPosition.length === limit
                                      ? 'default'
                                      : playersInPosition.length > limit
                                        ? 'destructive'
                                        : 'outline'
                                  }
                                  className='text-xs font-medium'
                                >
                                  {position} ({playersInPosition.length}/{limit}
                                  )
                                </Badge>
                              </div>
                              <div className='space-y-1 pl-2'>
                                {playersInPosition.map((player) => (
                                  <div
                                    key={player.id}
                                    className='bg-muted/20 flex items-center justify-between rounded p-1 text-sm text-black/70'
                                  >
                                    <div className='flex flex-1 items-center gap-2'>
                                      <span className='truncate font-medium'>
                                        {player.first_name} {player.second_name}
                                      </span>
                                      <span className='text-muted-foreground truncate text-xs'>
                                        {player.team}
                                      </span>
                                    </div>
                                    <Button
                                      size='sm'
                                      variant='outline'
                                      onClick={() =>
                                        handleUndraftPlayer(player.id)
                                      }
                                      className='bottom-0.5 ml-1 h-5 w-5 p-0 text-xs'
                                    >
                                      ×
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        },
                      )}
                    </div>
                  )}

                  {roster.length === 0 && (
                    <div className='text-muted-foreground py-4 text-center text-xs'>
                      No players drafted yet
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
