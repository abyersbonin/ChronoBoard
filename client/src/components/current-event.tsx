import { MapPin, Clock, Hand } from "lucide-react";
import { type CalendarEvent } from "@shared/schema";
import { EventDetailsDialog } from "./event-details-dialog";
import { useState, useEffect } from "react";

interface CurrentEventProps {
  event: CalendarEvent | null;
}

export function CurrentEvent({ event }: CurrentEventProps) {
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  }));

  // Update current time every 10 seconds - TV optimized
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      }));
    }, 10000); // 10 seconds instead of 1 second for better TV performance

    return () => clearInterval(timer);
  }, []);

  const getCurrentTime = () => {
    return currentTime;
  };

  if (!event) {
    return (
      <div className="bg-gray-100 bg-opacity-60 rounded-xl p-6 border border-gray-300 mb-8 shadow-lg" style={{ fontFamily: 'Montserrat, sans-serif' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800" style={{ fontFamily: 'Montserrat, sans-serif' }}>À présent</h2>
          <div className="text-3xl font-bold text-blue-600" style={{ fontFamily: 'Montserrat, sans-serif' }}>{currentTime}</div>
        </div>
        
        <div className="border-l-4 border-gray-300 pl-4">
          <h3 className="text-2xl font-bold text-gray-600 mb-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Aucun événement en cours
          </h3>
          <p className="text-gray-500 mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
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
    <>
      <div 
        className="bg-gray-100 bg-opacity-60 rounded-xl p-6 border border-gray-300 mb-8 shadow-lg cursor-pointer hover:bg-gray-100 hover:bg-opacity-70"
        onClick={() => setShowEventDetails(true)}
        style={{ fontFamily: 'Montserrat, sans-serif' }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800" style={{ fontFamily: 'Montserrat, sans-serif' }}>À présent</h2>
          <div className="text-3xl font-bold text-blue-600" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            {currentTime}
          </div>
        </div>
        
        <div className="border-l-4 border-blue-500 pl-4 flex-1">
          <h3 className="text-2xl font-bold text-gray-800 mb-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            {event.title}
          </h3>
          <div className="flex items-center space-x-4 text-gray-500">
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
        
        {/* Clicking finger with shockwave animation */}
        <div className="flex items-center justify-center ml-4 relative">
          <div className="relative">
            {/* Clicking finger */}
            <Hand className="h-8 w-8 text-blue-600 relative z-10 transform -rotate-12" style={{ animation: 'clickFinger 1.5s infinite' }} />
            {/* Small shockwave ripples at fingertip */}
            <div className="absolute top-1 right-2 w-3 h-3 rounded-full border border-blue-400 opacity-75" style={{ animation: 'ripple 1.5s infinite' }}></div>
            <div className="absolute top-1 right-2 w-3 h-3 rounded-full border border-blue-300 opacity-50" style={{ animation: 'ripple 1.5s infinite 0.3s' }}></div>
          </div>
        </div>
      </div>

      <EventDetailsDialog 
        event={event}
        open={showEventDetails}
        onOpenChange={setShowEventDetails}
      />
    </>
  );
}
