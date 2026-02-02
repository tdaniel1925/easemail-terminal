import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Briefcase, User, Users } from 'lucide-react';
import { useState } from 'react';

export function WelcomeStep({ onNext }: any) {
  const [selected, setSelected] = useState<string>('');

  const options = [
    {
      id: 'work',
      icon: Briefcase,
      label: 'Work',
      description: 'Professional communication',
    },
    {
      id: 'personal',
      icon: User,
      label: 'Personal',
      description: 'Stay connected with friends & family',
    },
    {
      id: 'both',
      icon: Users,
      label: 'Both',
      description: 'Unified inbox for everything',
    },
  ];

  return (
    <Card className="border-0 shadow-2xl">
      <CardContent className="p-8 space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Welcome to EaseMail</h1>
          <p className="text-muted-foreground">
            What will you use EaseMail for?
          </p>
        </div>

        <div className="space-y-3">
          {options.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.id}
                onClick={() => setSelected(option.id)}
                className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                  selected === option.id
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-950'
                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    selected === option.id ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800'
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-semibold">{option.label}</div>
                    <div className="text-sm text-muted-foreground">
                      {option.description}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <Button
          className="w-full"
          size="lg"
          onClick={() => onNext({ use_case: selected })}
          disabled={!selected}
        >
          Continue
        </Button>
      </CardContent>
    </Card>
  );
}
