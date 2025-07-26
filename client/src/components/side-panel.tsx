import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { RefreshCw, Settings, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SidePanelProps {
  onSyncCalendar: () => void;
  isCalendarConnected: boolean;
  lastSync?: string;
  autoRefresh: boolean;
  use24Hour: boolean;
  onToggleAutoRefresh: (enabled: boolean) => void;
  onToggle24Hour: (enabled: boolean) => void;
}

export function SidePanel({
  onSyncCalendar,
  isCalendarConnected,
  lastSync,
  autoRefresh,
  use24Hour,
  onToggleAutoRefresh,
  onToggle24Hour,
}: SidePanelProps) {
  const { toast } = useToast();

  const formatLastSync = (syncTime?: string) => {
    if (!syncTime) return 'Jamais';
    
    const now = new Date();
    const sync = new Date(syncTime);
    const diffMs = now.getTime() - sync.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `il y a ${diffMins} minute${diffMins > 1 ? 's' : ''}`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
    
    return sync.toLocaleDateString('fr-FR');
  };

  const handleSyncCalendar = async () => {
    try {
      await onSyncCalendar();
      toast({
        title: "Synchronisation réussie",
        description: "Votre calendrier Google a été synchronisé.",
      });
    } catch (error) {
      toast({
        title: "Erreur de synchronisation",
        description: "Impossible de synchroniser avec Google Calendar.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="lg:col-span-1">

      {/* iCal Calendar Integration Status */}
      <div className="bg-dashboard-card rounded-xl p-6 border border-gray-700 mb-6">
        <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center">
          <Calendar className="mr-2 h-5 w-5" />
          Calendriers iCal
        </h3>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-3 ${
              isCalendarConnected ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <span className="text-sm text-gray-300">
              {isCalendarConnected ? 'Connecté' : 'Déconnecté'}
            </span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleSyncCalendar}
            className="text-blue-400 hover:text-blue-300 hover:bg-dashboard-light"
          >
            <RefreshCw className="mr-1 h-3 w-3" />
            Sync
          </Button>
        </div>
        <div className="text-xs text-gray-500">
          Dernière mise à jour: {formatLastSync(lastSync)}
        </div>
      </div>

      {/* Settings Panel */}
      <div className="bg-dashboard-card rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center">
          <Settings className="mr-2 h-5 w-5" />
          Paramètres
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">Actualisation auto</span>
            <Switch
              checked={autoRefresh}
              onCheckedChange={onToggleAutoRefresh}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">Mode 24h</span>
            <Switch
              checked={use24Hour}
              onCheckedChange={onToggle24Hour}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
