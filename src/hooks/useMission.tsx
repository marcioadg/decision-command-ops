
import { useState, useEffect } from 'react';
import { missionService } from '@/services/missionService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export const useMission = () => {
  const [mission, setMission] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const { toast } = useToast();
  const { user, profile } = useAuth();

  // Load mission on mount and when profile changes
  useEffect(() => {
    const loadMission = async () => {
      if (!user || !profile) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const userMission = await missionService.getUserMission();
        setMission(userMission);
      } catch (error) {
        console.error('Failed to load mission:', error);
        toast({
          title: "Error",
          description: "Failed to load mission statement",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadMission();
  }, [user?.id, profile?.id, toast]);

  const startEditing = () => {
    setEditValue(mission || '');
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setEditValue('');
    setIsEditing(false);
  };

  const saveMission = async () => {
    if (isSaving) return;

    try {
      setIsSaving(true);
      
      // Optimistic update
      const newMission = editValue.trim() || null;
      setMission(newMission);
      setIsEditing(false);
      
      // Save to database
      await missionService.updateUserMission(newMission);
      
      toast({
        title: "Success",
        description: "Mission statement updated successfully"
      });
    } catch (error) {
      console.error('Failed to save mission:', error);
      
      // Rollback optimistic update
      try {
        const currentMission = await missionService.getUserMission();
        setMission(currentMission);
      } catch (rollbackError) {
        console.error('Failed to rollback mission:', rollbackError);
      }
      
      toast({
        title: "Error",
        description: "Failed to update mission statement",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return {
    mission,
    isLoading,
    isSaving,
    isEditing,
    editValue,
    setEditValue,
    startEditing,
    cancelEditing,
    saveMission
  };
};
