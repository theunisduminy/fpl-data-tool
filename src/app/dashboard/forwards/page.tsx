import { PlayersTable } from '@/components/players-table';
import fwdData from '@/data/fwd.json';

export default function ForwardsPage() {
  const players = fwdData.map((p: any) => ({ ...p, position: 'FWD' as const }));

  return (
    <>
      <h1 className='text-2xl font-semibold'>Forwards</h1>
      <PlayersTable players={players} showPositionFilter={false} />
    </>
  );
}
