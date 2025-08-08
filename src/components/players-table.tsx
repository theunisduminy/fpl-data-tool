'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import {
  User,
  ChevronUp,
  ChevronDown,
  Settings2,
  Search,
  TrendingUp,
} from 'lucide-react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

type Player = {
  first_name: string;
  second_name: string;
  web_name: string;
  team: string;
  now_cost: number;
  total_points: number;
  points_per_game: string;
  image: string;
  position: 'GK' | 'DEF' | 'MID' | 'FWD';
  [key: string]: unknown;
};

type Props = {
  players: Player[];
  showPositionFilter?: boolean;
};

const POSITION_OPTIONS: Array<{
  label: string;
  value: Player['position'] | 'ALL';
}> = [
  { label: 'All', value: 'ALL' },
  { label: 'GK', value: 'GK' },
  { label: 'DEF', value: 'DEF' },
  { label: 'MID', value: 'MID' },
  { label: 'FWD', value: 'FWD' },
];

const DEFAULT_VISIBLE_COLUMNS = [
  'image',
  'web_name',
  'position',
  'team',
  'goals_scored',
  'assists',
  'total_points',
  'points_per_game',
] as const;

function PlayerImage({ src, alt }: { src: string; alt: string }) {
  const [imageError, setImageError] = useState(false);

  if (imageError || !src) {
    return (
      <div className='bg-muted flex h-10 w-10 items-center justify-center rounded-md'>
        <User className='text-muted-foreground h-6 w-6' />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={40}
      height={40}
      className='rounded-md'
      onError={() => setImageError(true)}
    />
  );
}

function formatColumnHeader(columnName: string): string {
  return columnName
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

type SortConfig = {
  key: string;
  direction: 'asc' | 'desc';
} | null;

export const PlayersTable = ({ players, showPositionFilter = true }: Props) => {
  const [position, setPosition] = useState<Player['position'] | 'ALL'>('ALL');
  const [team, setTeam] = useState<string | 'ALL'>('ALL');
  const PAGE_SIZE = 50;
  const [page, setPage] = useState<number>(1);
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const [columnVisibility, setColumnVisibility] = useState<
    Record<string, boolean>
  >({});
  const [columnSearch, setColumnSearch] = useState<string>('');
  const [weights, setWeights] = useState<Record<string, number>>({});
  const [isRankingSheetOpen, setIsRankingSheetOpen] = useState(false);

  const teams = useMemo(() => {
    const set = new Set<string>();
    for (const p of players) {
      if (typeof p.team === 'string') set.add(p.team);
    }
    return Array.from(set).sort();
  }, [players]);

  useEffect(() => {
    setPage(1);
  }, [position, team, sortConfig]);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === 'asc'
    ) {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const totalWeight = useMemo(() => {
    return Object.values(weights).reduce((sum, weight) => sum + weight, 0);
  }, [weights]);

  const playersWithRanking = useMemo(() => {
    if (totalWeight === 0) return players;

    return players.map((player) => {
      let rankScore = 0;
      Object.entries(weights).forEach(([column, weight]) => {
        if (weight > 0) {
          const value = Number((player as any)[column]) || 0;
          rankScore += (value * weight) / 100;
        }
      });
      return { ...player, rank_score: rankScore };
    });
  }, [players, weights, totalWeight]);

  const filtered = useMemo(() => {
    let result = playersWithRanking.filter((p) => {
      const matchesPosition = position === 'ALL' || p.position === position;
      const matchesTeam = team === 'ALL' || p.team === team;
      return matchesPosition && matchesTeam;
    });

    // Apply sorting
    if (sortConfig) {
      result = [...result].sort((a, b) => {
        const aValue = (a as any)[sortConfig.key];
        const bValue = (b as any)[sortConfig.key];

        // Handle different data types
        let comparison = 0;
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          comparison = aValue - bValue;
        } else if (typeof aValue === 'string' && typeof bValue === 'string') {
          comparison = aValue.localeCompare(bValue);
        } else {
          // Convert to strings for comparison
          const aStr = String(aValue || '');
          const bStr = String(bValue || '');
          comparison = aStr.localeCompare(bStr);
        }

        return sortConfig.direction === 'desc' ? -comparison : comparison;
      });
    }

    return result;
  }, [playersWithRanking, position, team, sortConfig]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = Math.min(filtered.length, startIndex + PAGE_SIZE);
  const pageItems = filtered.slice(startIndex, endIndex);

  const allColumns = useMemo(() => {
    const keySet = new Set<string>();
    for (const p of playersWithRanking) {
      for (const key of Object.keys(p)) keySet.add(key);
    }
    // Show key columns first, then all others
    const keyColumns = [
      'rank_score',
      'image',
      'web_name',
      'position',
      'team',
      'now_cost',
      'total_points',
      'points_per_game',
    ];
    const remainingColumns = Array.from(keySet)
      .filter((k) => !keyColumns.includes(k))
      .sort();
    return [...keyColumns.filter((k) => keySet.has(k)), ...remainingColumns];
  }, [playersWithRanking]);

  const numericColumns = useMemo(() => {
    if (players.length === 0) return [];
    const sample = players[0];
    return allColumns.filter((col) => {
      const value = (sample as any)[col];
      return typeof value === 'number' && col !== 'id' && col !== 'team_code';
    });
  }, [allColumns, players]);

  // Initialize column visibility with default visible columns
  useEffect(() => {
    if (Object.keys(columnVisibility).length === 0 && allColumns.length > 0) {
      const defaultVisible: Record<string, boolean> = {};
      allColumns.forEach((col) => {
        defaultVisible[col] = DEFAULT_VISIBLE_COLUMNS.includes(
          col as (typeof DEFAULT_VISIBLE_COLUMNS)[number],
        );
      });
      setColumnVisibility(defaultVisible);
    }
  }, [allColumns, columnVisibility]);

  const visibleColumns = useMemo(() => {
    return allColumns.filter((col) => columnVisibility[col] !== false);
  }, [allColumns, columnVisibility]);

  const filteredColumns = useMemo(() => {
    if (!columnSearch) return allColumns;
    return allColumns.filter((col) =>
      formatColumnHeader(col)
        .toLowerCase()
        .includes(columnSearch.toLowerCase()),
    );
  }, [allColumns, columnSearch]);

  const handleShowAllColumns = () => {
    const allVisible: Record<string, boolean> = {};
    allColumns.forEach((col) => {
      allVisible[col] = true;
    });
    setColumnVisibility(allVisible);
  };

  const handleShowDefaultColumns = () => {
    const defaults: Record<string, boolean> = {};
    allColumns.forEach((col) => {
      defaults[col] = DEFAULT_VISIBLE_COLUMNS.includes(
        col as (typeof DEFAULT_VISIBLE_COLUMNS)[number],
      );
    });
    setColumnVisibility(defaults);
  };

  const handleWeightChange = (column: string, weight: number) => {
    setWeights((prev) => ({
      ...prev,
      [column]: Math.max(0, Math.min(100, weight)),
    }));
  };

  const handleApplyRanking = () => {
    if (totalWeight === 100) {
      // Add rank_score to visible columns if not already there
      if (!columnVisibility['rank_score']) {
        setColumnVisibility((prev) => ({
          ...prev,
          rank_score: true,
        }));
      }
      setIsRankingSheetOpen(false);
    }
  };

  return (
    <div className='flex w-full flex-col gap-4'>
      <div className='flex flex-wrap items-center gap-3'>
        {showPositionFilter && (
          <div className='flex items-center gap-2'>
            <label className='text-muted-foreground text-sm'>Position</label>
            <select
              value={position}
              onChange={(e) =>
                setPosition((e.target.value as Player['position']) || 'ALL')
              }
              className='bg-background ring-offset-background focus-visible:ring-ring inline-flex h-9 items-center justify-center rounded-md border px-3 text-sm whitespace-nowrap shadow-sm transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50'
            >
              {POSITION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className='flex items-center gap-2'>
          <label className='text-muted-foreground text-sm'>Team</label>
          <select
            value={team}
            onChange={(e) => setTeam(e.target.value)}
            className='bg-background ring-offset-background focus-visible:ring-ring inline-flex h-9 items-center justify-center rounded-md border px-3 text-sm whitespace-nowrap shadow-sm transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50'
          >
            <option value='ALL'>All</option>
            {teams.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className='ml-auto flex items-center gap-2'>
          <Sheet open={isRankingSheetOpen} onOpenChange={setIsRankingSheetOpen}>
            <SheetTrigger asChild>
              <Button variant='outline' size='sm' className='h-8'>
                <TrendingUp className='h-4 w-4' />
                Rank
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Player Ranking</SheetTitle>
                <SheetDescription>
                  Assign weights to different stats to calculate player
                  rankings. Weights must total 100%.
                </SheetDescription>
              </SheetHeader>
              <div className='mt-6 space-y-4 p-5'>
                <div className='space-y-3'>
                  {numericColumns.map((column) => (
                    <div
                      key={column}
                      className='flex items-center justify-between'
                    >
                      <label className='text-sm font-medium'>
                        {formatColumnHeader(column)}
                      </label>
                      <div className='flex items-center gap-2'>
                        <Input
                          type='number'
                          min='0'
                          max='100'
                          value={weights[column] || ''}
                          onChange={(e) =>
                            handleWeightChange(column, Number(e.target.value))
                          }
                          className='h-8 w-20'
                          placeholder='0'
                        />
                        <span className='text-muted-foreground text-sm'>%</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className='border-t pt-4'>
                  <div className='flex items-center justify-between'>
                    <span className='font-medium'>Total Weight:</span>
                    <span
                      className={`font-bold ${totalWeight === 100 ? 'text-green-600' : totalWeight > 100 ? 'text-red-600' : 'text-muted-foreground'}`}
                    >
                      {totalWeight}%
                    </span>
                  </div>
                  {totalWeight !== 100 && (
                    <p className='text-muted-foreground mt-1 text-sm'>
                      {totalWeight > 100
                        ? 'Total exceeds 100%'
                        : 'Total must equal 100%'}
                    </p>
                  )}
                </div>
                <div className='flex gap-2 pt-4'>
                  <Button
                    onClick={handleApplyRanking}
                    disabled={totalWeight !== 100}
                    className='flex-1'
                  >
                    Apply Ranking
                  </Button>
                  <Button
                    variant='outline'
                    onClick={() => setIsRankingSheetOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline' size='sm' className='h-8'>
                <Settings2 className='h-4 w-4' />
                View
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-[250px]'>
              <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
              <DropdownMenuSeparator />

              <div className='p-2'>
                <div className='relative'>
                  <Search className='text-muted-foreground absolute top-2.5 left-2 h-4 w-4' />
                  <Input
                    placeholder='Search columns...'
                    value={columnSearch}
                    onChange={(e) => setColumnSearch(e.target.value)}
                    className='h-8 pl-8'
                  />
                </div>
              </div>

              <DropdownMenuSeparator />

              <div className='p-1'>
                <Button
                  variant='ghost'
                  size='sm'
                  className='h-8 w-full justify-start px-2'
                  onClick={handleShowDefaultColumns}
                >
                  Show Default Columns
                </Button>
              </div>
              <div className='p-1'>
                <Button
                  variant='ghost'
                  size='sm'
                  className='h-8 w-full justify-start px-2'
                  onClick={handleShowAllColumns}
                >
                  Show All Columns
                </Button>
              </div>

              <DropdownMenuSeparator />

              <div className='max-h-[300px] overflow-y-auto'>
                {filteredColumns.map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column}
                      className='capitalize'
                      checked={columnVisibility[column] !== false}
                      onCheckedChange={(value) =>
                        setColumnVisibility((prev) => ({
                          ...prev,
                          [column]: !!value,
                        }))
                      }
                      onSelect={(e) => e.preventDefault()}
                    >
                      {formatColumnHeader(column)}
                    </DropdownMenuCheckboxItem>
                  );
                })}
              </div>

              {filteredColumns.length === 0 && (
                <div className='text-muted-foreground p-2 text-center text-sm'>
                  No columns found
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className='overflow-auto rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              {visibleColumns.map((col) => {
                const isImage = col === 'image';
                const isSorted = sortConfig?.key === col;
                const sortDirection = isSorted ? sortConfig.direction : null;

                return (
                  <TableHead key={col} className='whitespace-nowrap'>
                    {isImage ? (
                      <span className='text-xs font-medium'>Photo</span>
                    ) : (
                      <button
                        type='button'
                        className='hover:text-foreground flex items-center gap-1 text-left font-medium'
                        onClick={() => handleSort(col)}
                      >
                        <span className='text-xs'>
                          {formatColumnHeader(col)}
                        </span>
                        <div className='flex flex-col'>
                          <ChevronUp
                            className={`h-3 w-3 ${
                              isSorted && sortDirection === 'asc'
                                ? 'text-foreground'
                                : 'text-muted-foreground/50'
                            }`}
                          />
                          <ChevronDown
                            className={`-mt-1 h-3 w-3 ${
                              isSorted && sortDirection === 'desc'
                                ? 'text-foreground'
                                : 'text-muted-foreground/50'
                            }`}
                          />
                        </div>
                      </button>
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageItems.map((p, idx) => (
              <TableRow key={`${p.web_name}-${idx}`}>
                {visibleColumns.map((col) => {
                  if (col === 'image') {
                    return (
                      <TableCell key={col} className='p-2'>
                        <PlayerImage src={p.image} alt={p.web_name} />
                      </TableCell>
                    );
                  }
                  if (col === 'rank_score') {
                    const rankScore = (p as any)[col];
                    return (
                      <TableCell
                        key={col}
                        className='min-w-[100px] font-medium whitespace-nowrap'
                      >
                        {rankScore ? Number(rankScore).toFixed(2) : ''}
                      </TableCell>
                    );
                  }
                  return (
                    <TableCell
                      key={col}
                      className='min-w-[100px] whitespace-nowrap'
                    >
                      {String((p as Record<string, unknown>)[col] ?? '')}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className='flex items-center justify-between gap-3'>
        <div className='text-muted-foreground text-xs'>
          Showing {filtered.length === 0 ? 0 : startIndex + 1}-{endIndex} of{' '}
          {filtered.length}
        </div>
        <div className='flex items-center gap-2'>
          <button
            type='button'
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            className='bg-background ring-offset-background focus-visible:ring-ring inline-flex h-9 items-center justify-center rounded-md border px-3 text-sm shadow-sm transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50'
          >
            Prev
          </button>
          <span className='text-muted-foreground text-sm'>
            Page {currentPage} of {totalPages}
          </span>
          <button
            type='button'
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className='bg-background ring-offset-background focus-visible:ring-ring inline-flex h-9 items-center justify-center rounded-md border px-3 text-sm shadow-sm transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50'
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
