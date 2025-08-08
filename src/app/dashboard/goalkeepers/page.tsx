import { PlayersTable } from '@/components/players-table';
import gkData from '@/data/gk.json';

export default function GoalkeepersPage() {
  const players = gkData.map((p: any) => ({ ...p, position: 'GK' as const }));

  return (
    <>
      <h1 className='text-2xl font-semibold'>Goalkeepers</h1>
      <PlayersTable players={players} showPositionFilter={false} />
    </>
  );
}
