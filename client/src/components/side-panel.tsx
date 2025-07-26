import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { RefreshCw, Settings, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

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
  const { isLoggedIn } = useAuth();

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

  // Only show if admin is logged in
  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="lg:col-span-1">

      {/* iCal Calendar Integration Status */}
      <div className="backdrop-blur-sm rounded-xl p-6 border mb-6" style={{ 
        backgroundColor: 'rgba(54, 69, 92, 0.3)', 
        borderColor: 'rgba(214, 204, 194, 0.3)' 
      }}>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Calendar className="mr-2 h-5 w-5" />
          Calendriers iCal
        </h3>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-3 ${
              isCalendarConnected ? 'bg-green-400' : 'bg-red-400'
            }`} />
            <span className="text-sm text-white/80">
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
      <div className="backdrop-blur-sm rounded-xl p-6 border" style={{ 
        backgroundColor: 'rgba(54, 69, 92, 0.3)', 
        borderColor: 'rgba(214, 204, 194, 0.3)' 
      }}>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Settings className="mr-2 h-5 w-5" />
          Paramètres
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/80">Actualisation auto</span>
            <Switch
              checked={autoRefresh}
              onCheckedChange={onToggleAutoRefresh}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/80">Mode 24h</span>
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
