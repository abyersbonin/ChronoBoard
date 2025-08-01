import { MapPin } from "lucide-react";
import { type CalendarEvent } from "@shared/schema";

interface UpcomingEventsProps {
  events: CalendarEvent[];
}

export function UpcomingEvents({ events }: UpcomingEventsProps) {
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const eventDate = new Date(date);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (eventDate.toDateString() === today.toDateString()) {
      return "Aujourd'hui";
    } else if (eventDate.toDateString() === tomorrow.toDateString()) {
      return "Demain";
    } else {
      return eventDate.toLocaleDateString('fr-FR', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      });
    }
  };

  const groupEventsByDate = (events: CalendarEvent[]) => {
    const grouped: { [key: string]: CalendarEvent[] } = {};
    
    events.forEach(event => {
      const dateKey = new Date(event.startTime).toDateString();
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });
    
    return grouped;
  };

  const groupedEvents = groupEventsByDate(events);

  if (events.length === 0) {
    return (
      <div className="bg-gray-100/60 backdrop-blur-sm rounded-xl p-6 border border-gray-300/50 shadow-lg">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Événements à venir</h2>
        <div className="text-center py-8">
          <p className="text-gray-600 mb-2">Aucun événement à venir</p>
          <p className="text-gray-500 text-sm">Les calendriers iCal se synchronisent automatiquement</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100/60 backdrop-blur-sm rounded-xl p-6 border border-gray-300/50 shadow-lg">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Événements à venir</h2>
      
      <div className="space-y-6">
        {Object.entries(groupedEvents).map(([dateKey, dayEvents]) => {
          const date = new Date(dateKey);
          const isToday = date.toDateString() === new Date().toDateString();
          const isTomorrow = date.toDateString() === new Date(Date.now() + 24*60*60*1000).toDateString();
          
          return (
            <div key={dateKey}>
              <h3 className={`text-lg font-semibold mb-4 ${
                isToday ? 'text-blue-600' : isTomorrow ? 'text-green-600' : 'text-yellow-600'
              }`}>
                {formatDate(date)}
              </h3>
              <div className="space-y-4">
                {dayEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start space-x-4 p-4 bg-gray-200/40 rounded-lg hover:bg-gray-200/60 transition-colors duration-200 border border-gray-300/40"
                  >
                    <div className="text-center min-w-0 flex-shrink-0">
                      <div className="text-xl font-bold text-gray-800">
                        {formatTime(event.startTime)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-lg font-semibold text-gray-800 mb-2">
                        {event.title}
                      </h4>
                      {event.description && (
                        <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                          {event.description}
                        </p>
                      )}
                      {event.location && (
                        <div className="flex items-center text-gray-500 text-sm">
                          <MapPin className="mr-1 h-3 w-3" />
                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
