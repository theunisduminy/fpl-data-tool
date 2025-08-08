import {
  PlayersTable,
  type Player,
  type BasePlayer,
} from '@/components/players-table';
import defData from '@/data/def.json';

export default function DefendersPage() {
  const players = (defData as BasePlayer[]).map((p) => ({
    ...p,
    position: 'DEF' as const,
  })) as Player[];

  return (
    <>
      <h1 className='text-2xl font-semibold'>Defenders</h1>
      <PlayersTable players={players} showPositionFilter={false} />
    </>
  );
}
