
import { Edit3, Target } from 'lucide-react';
import { useMission } from '@/hooks/useMission';
import { MissionEditor } from './MissionEditor';
import { Button } from '@/components/ui/button';

export const MissionBar = () => {
  const {
    mission,
    isLoading,
    isSaving,
    isEditing,
    editValue,
    setEditValue,
    startEditing,
    cancelEditing,
    saveMission
  } = useMission();

  if (isLoading) {
    return (
      <div className="w-full bg-gray-900/80 border-b border-yellow-500/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Target className="w-4 h-4 text-yellow-500 animate-pulse" />
            <span className="text-yellow-500 font-mono text-sm font-bold tracking-wider">
              THE MISSION:
            </span>
            <div className="h-5 bg-gray-700 rounded animate-pulse flex-1 max-w-md" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-900/80 border-b border-yellow-500/20 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-start gap-3">
          <Target className="w-4 h-4 text-yellow-500 mt-1 flex-shrink-0" />
          <span className="text-yellow-500 font-mono text-sm font-bold tracking-wider flex-shrink-0 mt-0.5">
            THE MISSION:
          </span>
          
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <MissionEditor
                value={editValue}
                onChange={setEditValue}
                onSave={saveMission}
                onCancel={cancelEditing}
                isSaving={isSaving}
              />
            ) : (
              <div className="group flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  {mission ? (
                    <p className="text-gray-100 font-mono text-sm leading-relaxed whitespace-pre-wrap break-words">
                      {mission}
                    </p>
                  ) : (
                    <p className="text-gray-500 font-mono text-sm italic">
                      Click to define your mission...
                    </p>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={startEditing}
                  className="opacity-0 group-hover:opacity-100 transition-all duration-200 text-gray-400 hover:text-yellow-500 hover:bg-yellow-500/10 p-1 h-auto"
                >
                  <Edit3 className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
