import {
  PlayersTable,
  type Player,
  type BasePlayer,
} from '@/components/players-table';
import gkData from '@/data/gk.json';

export default function GoalkeepersPage() {
  const players = (gkData as BasePlayer[]).map((p) => ({
    ...p,
    position: 'GK' as const,
  })) as Player[];

  return (
    <>
      <h1 className='text-2xl font-semibold'>Goalkeepers</h1>
      <PlayersTable players={players} showPositionFilter={false} />
    </>
  );
}
