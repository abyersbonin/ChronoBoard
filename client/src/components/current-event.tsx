import { MapPin, Clock } from "lucide-react";
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
        
        {/* Hand tapping icon with animation */}
        <div className="flex items-center justify-center ml-4 relative">
          <div className="relative" style={{ animation: 'tapHand 1.5s infinite' }}>
            {/* Custom tapping hand SVG */}
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-blue-600">
              {/* Hand outline */}
              <path d="M8 20c-.5 0-1-.2-1.4-.6-.8-.8-.8-2 0-2.8L11 12.2c.4-.4.4-1 0-1.4-.4-.4-1-.4-1.4 0L6.2 14.2c-.8.8-2 .8-2.8 0s-.8-2 0-2.8L7.8 7c.8-.8 2-.8 2.8 0 .4.4 1 .4 1.4 0s.4-1 0-1.4c-.8-.8-.8-2 0-2.8s2-.8 2.8 0L18.2 6.2c.8.8.8 2 0 2.8L14.8 12.4c-.4.4-.4 1 0 1.4.4.4 1 .4 1.4 0l3.4-3.4c.8-.8 2-.8 2.8 0s.8 2 0 2.8L18 17.6c-.4.4-.6.9-.6 1.4v1c0 1.1-.9 2-2 2H8z" stroke="currentColor" strokeWidth="2" fill="none"/>
              {/* Index finger pointing down */}
              <path d="M12 2v8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
              {/* Radiating tap lines */}
              <g className="tap-rays" style={{ animation: 'tapRays 1.5s infinite' }}>
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

      <EventDetailsDialog 
        event={event}
        open={showEventDetails}
        onOpenChange={setShowEventDetails}
      />
    </>
  );
}
