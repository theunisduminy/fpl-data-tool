import {
  PlayersTable,
  type Player,
  type BasePlayer,
} from '@/components/players-table';
import defData from '@/data/def.json';
import fwdData from '@/data/fwd.json';
import gkData from '@/data/gk.json';
import midData from '@/data/mid.json';

export default function DashboardPage() {
  const allPlayers = [
    ...(gkData as BasePlayer[]).map((p) => ({ ...p, position: 'GK' as const })),
    ...(defData as BasePlayer[]).map((p) => ({
      ...p,
      position: 'DEF' as const,
    })),
    ...(midData as BasePlayer[]).map((p) => ({
      ...p,
      position: 'MID' as const,
    })),
    ...(fwdData as BasePlayer[]).map((p) => ({
      ...p,
      position: 'FWD' as const,
    })),
  ] as Player[];

  return (
    <>
      <h1 className='text-2xl font-semibold'>All Players</h1>
      <PlayersTable players={allPlayers} />
    </>
  );
}
