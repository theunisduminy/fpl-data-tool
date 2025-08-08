import { PlayersTable } from '@/components/players-table';
import midData from '@/data/mid.json';

export default function MidfieldersPage() {
  const players = midData.map((p: any) => ({ ...p, position: 'MID' as const }));

  return (
    <>
      <h1 className='text-2xl font-semibold'>Midfielders</h1>
      <PlayersTable players={players} showPositionFilter={false} />
    </>
  );
}
