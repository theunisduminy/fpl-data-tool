import {
  PlayersTable,
  type Player,
  type BasePlayer,
} from '@/components/players-table';
import fwdData from '@/data/fwd.json';

export default function ForwardsPage() {
  const players = (fwdData as BasePlayer[]).map((p) => ({
    ...p,
    position: 'FWD' as const,
  })) as Player[];

  return (
    <>
      <h1 className='text-2xl font-semibold'>Forwards</h1>
      <PlayersTable players={players} showPositionFilter={false} />
    </>
  );
}
