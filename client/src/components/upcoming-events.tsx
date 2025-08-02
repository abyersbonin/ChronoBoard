import { MapPin } from "lucide-react";
import { type CalendarEvent } from "@shared/schema";
import { EventDetailsDialog } from "./event-details-dialog";
import { useState } from "react";

interface UpcomingEventsProps {
  events: CalendarEvent[];
}

export function UpcomingEvents({ events }: UpcomingEventsProps) {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEventDetails, setShowEventDetails] = useState(false);

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventDetails(true);
  };
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
      return "AUJOURD'HUI";
    } else if (eventDate.toDateString() === tomorrow.toDateString()) {
      return "DEMAIN";
    } else {
      // Format as "DIMANCHE, AOÛT 3"
      const weekday = eventDate.toLocaleDateString('fr-FR', { weekday: 'long' }).toUpperCase();
      const month = eventDate.toLocaleDateString('fr-FR', { month: 'long' }).toUpperCase();
      const day = eventDate.getDate();
      return `${weekday}, ${month} ${day}`;
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
      <div className="bg-gray-100 bg-opacity-60 rounded-xl p-6 border border-gray-300 shadow-lg">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Événements à venir</h2>
        <div className="text-center py-8">
          <p className="text-gray-600 mb-2">Aucun événement à venir</p>
          <p className="text-gray-500 text-sm">Les calendriers iCal se synchronisent automatiquement</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gray-100 bg-opacity-60 rounded-xl p-6 border border-gray-300 shadow-lg">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Événements à venir</h2>
        
        <div className="space-y-6">
          {Object.entries(groupedEvents).map(([dateKey, dayEvents]) => {
            const date = new Date(dateKey);
            const isToday = date.toDateString() === new Date().toDateString();
            const isTomorrow = date.toDateString() === new Date(Date.now() + 24*60*60*1000).toDateString();
            
            return (
              <div key={dateKey}>
                <h3 className={`${(isToday || isTomorrow) ? 'text-base' : 'text-lg'} font-semibold mb-4 text-gray-800`} style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {formatDate(date)}
                </h3>
                <div className="space-y-4">
                  {dayEvents.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-start space-x-4 p-4 bg-gray-200/40 rounded-lg hover:bg-gray-200/60 transition-colors duration-200 border border-gray-300/40 cursor-pointer"
                      onClick={() => handleEventClick(event)}
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
                        {event.location && (
                          <div className="flex items-center text-gray-500 text-sm">
                            <MapPin className="mr-1 h-3 w-3" />
                            <span>{event.location}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Shockwave animation centered on right */}
                      <div className="flex items-center justify-center ml-4 w-10 h-10 relative">
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" style={{ transform: 'translate(-50%, -40%)' }}>
                          <div className="w-3 h-3 rounded-full border-2 border-blue-400 opacity-75" style={{ animation: 'ripple 1.8s infinite' }}></div>
                          <div className="absolute top-0 left-0 w-3 h-3 rounded-full border-2 border-blue-300 opacity-50" style={{ animation: 'ripple 1.8s infinite 0.4s' }}></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <EventDetailsDialog 
        event={selectedEvent}
        open={showEventDetails}
        onOpenChange={setShowEventDetails}
      />
    </>
  );
}
