import { PlayersTable } from '@/components/players-table';
import defData from '@/data/def.json';

export default function DefendersPage() {
  const players = defData.map((p: any) => ({ ...p, position: 'DEF' as const }));

  return (
    <>
      <h1 className='text-2xl font-semibold'>Defenders</h1>
      <PlayersTable players={players} showPositionFilter={false} />
    </>
  );
}
