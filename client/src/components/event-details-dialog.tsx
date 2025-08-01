import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MapPin, Clock, Calendar } from "lucide-react";
import { type CalendarEvent } from "@shared/schema";

interface EventDetailsDialogProps {
  event: CalendarEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EventDetailsDialog({ event, open, onOpenChange }: EventDetailsDialogProps) {
  if (!event) return null;

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto bg-white/95 backdrop-blur-sm border border-gray-300">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-800 mb-4">
            {event.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Date and Time */}
          <div className="flex items-center space-x-3 text-gray-700">
            <Calendar className="h-5 w-5 text-blue-600" />
            <div>
              <div className="font-medium">{formatDate(event.startTime)}</div>
              <div className="text-sm text-gray-600">
                {formatTime(event.startTime)} - {formatTime(event.endTime)}
              </div>
            </div>
          </div>

          {/* Location */}
          {event.location && (
            <div className="flex items-center space-x-3 text-gray-700">
              <MapPin className="h-5 w-5 text-green-600" />
              <span>{event.location}</span>
            </div>
          )}

          {/* Description */}
          {event.description && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="font-medium text-gray-800 mb-2">Description</h4>
              <p className="text-gray-600 leading-relaxed">
                {event.description}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}