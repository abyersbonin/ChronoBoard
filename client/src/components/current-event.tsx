import { MapPin, Clock } from "lucide-react";
import { type CalendarEvent } from "@shared/schema";

interface CurrentEventProps {
  event: CalendarEvent | null;
}

export function CurrentEvent({ event }: CurrentEventProps) {
  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!event) {
    return (
      <div className="bg-dashboard-card rounded-xl p-6 border border-gray-700 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-200">À présent</h2>
          <div className="text-3xl font-bold text-blue-400">{getCurrentTime()}</div>
        </div>
        
        <div className="border-l-4 border-gray-600 pl-4">
          <h3 className="text-2xl font-bold text-gray-400 mb-3">
            Aucun événement en cours
          </h3>
          <p className="text-gray-500 mb-4">
            Profitez de ce moment libre dans votre emploi du temps.
          </p>
        </div>
      </div>
    );
  }

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-dashboard-card rounded-xl p-6 border border-gray-700 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-200">À présent</h2>
        <div className="text-3xl font-bold text-blue-400">
          {formatTime(event.startTime)}
        </div>
      </div>
      
      <div className="border-l-4 border-blue-500 pl-4">
        <h3 className="text-2xl font-bold text-white mb-3">
          {event.title}
        </h3>
        {event.description && (
          <p className="text-gray-300 mb-4 leading-relaxed">
            {event.description}
          </p>
        )}
        <div className="flex items-center space-x-4 text-gray-400">
          {event.location && (
            <div className="flex items-center">
              <MapPin className="mr-2 h-4 w-4" />
              <span>{event.location}</span>
            </div>
          )}
          <div className="flex items-center">
            <Clock className="mr-2 h-4 w-4" />
            <span>
              {formatTime(event.startTime)} - {formatTime(event.endTime)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
