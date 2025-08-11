import type { Player } from '@/components/players-table';
export type DraftPlayer = Player & {
  id: string;
  isDrafted: boolean;
  draftedBy?: string;
};

export type DraftTeam = {
  id: string;
  name: string;
  owner: string;
  players: string[]; // player IDs
  createdAt: Date;
};

export type DraftSettings = {
  teams: DraftTeam[];
  currentPick: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type PositionRanking = {
  position: 'GK' | 'DEF' | 'MID' | 'FWD';
  weights: Record<string, number>;
  updatedAt: Date;
};

class DraftDatabase {
  private dbName = 'DraftToolDB';
  private version = 2;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Players store
        if (!db.objectStoreNames.contains('players')) {
          const playersStore = db.createObjectStore('players', {
            keyPath: 'id',
          });
          playersStore.createIndex('position', 'position', { unique: false });
          playersStore.createIndex('isDrafted', 'isDrafted', { unique: false });
          playersStore.createIndex('draftedBy', 'draftedBy', { unique: false });
        }

        // Teams store
        if (!db.objectStoreNames.contains('teams')) {
          db.createObjectStore('teams', { keyPath: 'id' });
        }

        // Settings store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'id' });
        }

        // Position rankings store
        if (!db.objectStoreNames.contains('position_rankings')) {
          db.createObjectStore('position_rankings', { keyPath: 'position' });
        }
      };
    });
  }

  private getStore(storeName: string, mode: IDBTransactionMode = 'readonly') {
    if (!this.db) throw new Error('Database not initialized');
    return this.db.transaction([storeName], mode).objectStore(storeName);
  }

  // Player operations
  async savePlayers(players: DraftPlayer[]): Promise<void> {
    const store = this.getStore('players', 'readwrite');
    const promises = players.map(
      (player) =>
        new Promise<void>((resolve, reject) => {
          const request = store.put(player);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        }),
    );
    await Promise.all(promises);
  }

  async getAllPlayers(): Promise<DraftPlayer[]> {
    return new Promise((resolve, reject) => {
      const store = this.getStore('players');
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async getAvailablePlayers(): Promise<DraftPlayer[]> {
    return new Promise((resolve, reject) => {
      const store = this.getStore('players');
      const index = store.index('isDrafted');
      const request = index.getAll(IDBKeyRange.only(false));
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async draftPlayer(playerId: string, teamId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.getStore('players', 'readwrite');
      const getRequest = store.get(playerId);

      getRequest.onsuccess = () => {
        const player = getRequest.result;
        if (!player) {
          reject(new Error('Player not found'));
          return;
        }

        const updatedPlayer: DraftPlayer = {
          ...player,
          isDrafted: true,
          draftedBy: teamId,
        };

        const putRequest = store.put(updatedPlayer);
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async undraftPlayer(playerId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.getStore('players', 'readwrite');
      const getRequest = store.get(playerId);

      getRequest.onsuccess = () => {
        const player = getRequest.result;
        if (!player) {
          reject(new Error('Player not found'));
          return;
        }

        const updatedPlayer: DraftPlayer = {
          ...player,
          isDrafted: false,
          draftedBy: undefined,
        };

        const putRequest = store.put(updatedPlayer);
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  // Team operations
  async saveTeams(teams: DraftTeam[]): Promise<void> {
    const store = this.getStore('teams', 'readwrite');
    const promises = teams.map(
      (team) =>
        new Promise<void>((resolve, reject) => {
          const request = store.put(team);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        }),
    );
    await Promise.all(promises);
  }

  async getAllTeams(): Promise<DraftTeam[]> {
    return new Promise((resolve, reject) => {
      const store = this.getStore('teams');
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async addPlayerToTeam(teamId: string, playerId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.getStore('teams', 'readwrite');
      const getRequest = store.get(teamId);

      getRequest.onsuccess = () => {
        const team = getRequest.result;
        if (!team) {
          reject(new Error('Team not found'));
          return;
        }

        if (!team.players.includes(playerId)) {
          team.players.push(playerId);
        }

        const putRequest = store.put(team);
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async removePlayerFromTeam(teamId: string, playerId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.getStore('teams', 'readwrite');
      const getRequest = store.get(teamId);

      getRequest.onsuccess = () => {
        const team = getRequest.result;
        if (!team) {
          reject(new Error('Team not found'));
          return;
        }

        team.players = team.players.filter((id: string) => id !== playerId);

        const putRequest = store.put(team);
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  // Settings operations
  async saveDraftSettings(settings: DraftSettings): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.getStore('settings', 'readwrite');
      const settingsWithId = { ...settings, id: 'draft-settings' };
      const request = store.put(settingsWithId);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getDraftSettings(): Promise<DraftSettings | null> {
    return new Promise((resolve, reject) => {
      const store = this.getStore('settings');
      const request = store.get('draft-settings');
      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          // Remove the id field we added
          const { id, ...settings } = result;
          resolve(settings as DraftSettings);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Position ranking operations
  async savePositionRanking(ranking: PositionRanking): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.getStore('position_rankings', 'readwrite');
      const request = store.put(ranking);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getPositionRanking(
    position: 'GK' | 'DEF' | 'MID' | 'FWD',
  ): Promise<PositionRanking | null> {
    return new Promise((resolve, reject) => {
      const store = this.getStore('position_rankings');
      const request = store.get(position);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async clearAllData(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction(
      ['players', 'teams', 'settings', 'position_rankings'],
      'readwrite',
    );
    const promises = [
      new Promise<void>((resolve, reject) => {
        const request = transaction.objectStore('players').clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      }),
      new Promise<void>((resolve, reject) => {
        const request = transaction.objectStore('teams').clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      }),
      new Promise<void>((resolve, reject) => {
        const request = transaction.objectStore('settings').clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      }),
      new Promise<void>((resolve, reject) => {
        const request = transaction.objectStore('position_rankings').clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      }),
    ];

    await Promise.all(promises);
  }
}

export const draftDB = new DraftDatabase();
