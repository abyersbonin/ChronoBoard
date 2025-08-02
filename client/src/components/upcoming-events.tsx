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
                      
                      {/* Hand tapping icon with animation */}
                      <div className="flex items-center justify-center ml-4 relative">
                        <div className="relative" style={{ animation: 'tapHand 1.2s infinite' }}>
                          {/* Custom tapping hand SVG */}
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-blue-600">
                            {/* Hand outline */}
                            <path d="M8 20c-.5 0-1-.2-1.4-.6-.8-.8-.8-2 0-2.8L11 12.2c.4-.4.4-1 0-1.4-.4-.4-1-.4-1.4 0L6.2 14.2c-.8.8-2 .8-2.8 0s-.8-2 0-2.8L7.8 7c.8-.8 2-.8 2.8 0 .4.4 1 .4 1.4 0s.4-1 0-1.4c-.8-.8-.8-2 0-2.8s2-.8 2.8 0L18.2 6.2c.8.8.8 2 0 2.8L14.8 12.4c-.4.4-.4 1 0 1.4.4.4 1 .4 1.4 0l3.4-3.4c.8-.8 2-.8 2.8 0s.8 2 0 2.8L18 17.6c-.4.4-.6.9-.6 1.4v1c0 1.1-.9 2-2 2H8z" stroke="currentColor" strokeWidth="2" fill="none"/>
                            {/* Index finger pointing down */}
                            <path d="M12 2v8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                            {/* Radiating tap lines */}
                            <g className="tap-rays" style={{ animation: 'tapRays 1.2s infinite' }}>
                              <path d="M10 8l-2-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
                              <path d="M14 8l2-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
                              <path d="M8 10l-2 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
                              <path d="M16 10l2 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
                              <path d="M12 6l0-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
                            </g>
                          </svg>
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
