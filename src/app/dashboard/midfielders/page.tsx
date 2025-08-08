import {
  PlayersTable,
  type Player,
  type BasePlayer,
} from '@/components/players-table';
import midData from '@/data/mid.json';

export default function MidfieldersPage() {
  const players = (midData as BasePlayer[]).map((p) => ({
    ...p,
    position: 'MID' as const,
  })) as Player[];

  return (
    <>
      <h1 className='text-2xl font-semibold'>Midfielders</h1>
      <PlayersTable players={players} showPositionFilter={false} />
    </>
  );
}
