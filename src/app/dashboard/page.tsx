import { PlayersTable } from '@/components/players-table';
import defData from '@/data/def.json';
import fwdData from '@/data/fwd.json';
import gkData from '@/data/gk.json';
import midData from '@/data/mid.json';

function mapElementTypeToPosition(
  elementType: number,
): 'GK' | 'DEF' | 'MID' | 'FWD' {
  switch (elementType) {
    case 1:
      return 'GK';
    case 2:
      return 'DEF';
    case 3:
      return 'MID';
    case 4:
      return 'FWD';
    default:
      return 'MID';
  }
}

export default function DashboardPage() {
  const allPlayers = [
    ...gkData.map((p: any) => ({ ...p, position: 'GK' as const })),
    ...defData.map((p: any) => ({ ...p, position: 'DEF' as const })),
    ...midData.map((p: any) => ({ ...p, position: 'MID' as const })),
    ...fwdData.map((p: any) => ({ ...p, position: 'FWD' as const })),
  ];

  return (
    <>
      <h1 className='text-2xl font-semibold'>All Players</h1>
      <PlayersTable players={allPlayers} />
    </>
  );
}
