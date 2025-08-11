'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { X, Plus } from 'lucide-react';

interface DraftSetupProps {
  onSetupComplete: (teamNames: string[]) => void;
  isLoading?: boolean;
}

export function DraftSetup({ onSetupComplete, isLoading = false }: DraftSetupProps) {
  const [teamNames, setTeamNames] = useState<string[]>([
    'Team 1', 'Team 2', 'Team 3', 'Team 4',
    'Team 5', 'Team 6', 'Team 7', 'Team 8'
  ]);

  const updateTeamName = (index: number, name: string) => {
    const updated = [...teamNames];
    updated[index] = name;
    setTeamNames(updated);
  };

  const addTeam = () => {
    if (teamNames.length < 12) {
      setTeamNames([...teamNames, `Team ${teamNames.length + 1}`]);
    }
  };

  const removeTeam = (index: number) => {
    if (teamNames.length > 2) {
      setTeamNames(teamNames.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = () => {
    const validNames = teamNames.filter(name => name.trim() !== '');
    if (validNames.length >= 2) {
      onSetupComplete(validNames);
    }
  };

  const isValidSetup = teamNames.filter(name => name.trim() !== '').length >= 2;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Draft Setup</h1>
        <p className="text-muted-foreground">
          Configure your draft teams. You need at least 2 teams to start.
        </p>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Draft Teams</h3>
            <Button
              onClick={addTeam}
              disabled={teamNames.length >= 12}
              size="sm"
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Team
            </Button>
          </div>
          
          <div className="grid gap-3">
            {teamNames.map((name, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={name}
                  onChange={(e) => updateTeamName(index, e.target.value)}
                  placeholder={`Team ${index + 1}`}
                  className="flex-1"
                />
                <Button
                  onClick={() => removeTeam(index)}
                  disabled={teamNames.length <= 2}
                  size="sm"
                  variant="outline"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="text-sm text-muted-foreground">
            <p>• Minimum: 2 teams, Maximum: 12 teams</p>
            <p>• Current teams: {teamNames.filter(n => n.trim()).length}</p>
          </div>
        </div>
      </Card>

      <div className="flex justify-center">
        <Button
          onClick={handleSubmit}
          disabled={!isValidSetup || isLoading}
          size="lg"
          className="px-8"
        >
          {isLoading ? 'Setting up...' : 'Start Draft'}
        </Button>
      </div>
    </div>
  );
}