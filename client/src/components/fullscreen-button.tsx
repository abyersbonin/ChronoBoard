import { useState, useEffect, useRef } from "react";
import { Maximize, Minimize } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FullscreenButton() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const inactivityTimer = useRef<NodeJS.Timeout | null>(null);
  const lastInteractionTime = useRef<number>(Date.now());

  // Function to enter fullscreen
  const enterFullscreen = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      } else if ((document.documentElement as any).webkitRequestFullscreen) {
        await (document.documentElement as any).webkitRequestFullscreen();
      } else if ((document.documentElement as any).mozRequestFullScreen) {
        await (document.documentElement as any).mozRequestFullScreen();
      } else if ((document.documentElement as any).msRequestFullscreen) {
        await (document.documentElement as any).msRequestFullscreen();
      }
    } catch (error) {
      console.error('Fullscreen entry failed:', error);
    }
  };

  // Function to start inactivity timer
  const startInactivityTimer = () => {
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
    }
    
    console.log('Starting 30-second inactivity timer...');
    lastInteractionTime.current = Date.now();
    
    inactivityTimer.current = setTimeout(() => {
      const timeSinceLastInteraction = Date.now() - lastInteractionTime.current;
      console.log(`Timer fired. Time since last interaction: ${timeSinceLastInteraction}ms`);
      
      // Only re-enter fullscreen if user is still inactive (with small buffer)
      if (timeSinceLastInteraction >= 29000) {
        console.log('Re-entering fullscreen due to inactivity...');
        enterFullscreen();
      } else {
        console.log('User was active recently, not re-entering fullscreen');
      }
    }, 30000); // 30 seconds
  };

  // Function to reset inactivity timer
  const resetInactivityTimer = () => {
    lastInteractionTime.current = Date.now();
    if (inactivityTimer.current) {
      console.log('User interaction detected, clearing timer');
      clearTimeout(inactivityTimer.current);
      inactivityTimer.current = null;
    }
  };

  // Track user interactions to reset timer
  useEffect(() => {
    let mouseMoveThrottle: NodeJS.Timeout | null = null;
    
    const handleUserInteraction = (event: Event) => {
      console.log('User interaction detected:', event.type);
      resetInactivityTimer();
    };

    const handleMouseMove = (event: MouseEvent) => {
      // Throttle mouse move events to avoid excessive resets
      if (mouseMoveThrottle) return;
      
      console.log('Mouse move detected');
      resetInactivityTimer();
      
      mouseMoveThrottle = setTimeout(() => {
        mouseMoveThrottle = null;
      }, 1000); // Throttle to max once per second
    };

    // Add event listeners for deliberate user interactions
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mousedown', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);
    document.addEventListener('scroll', handleUserInteraction);
    document.addEventListener('touchstart', handleUserInteraction);
    document.addEventListener('click', handleUserInteraction);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mousedown', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      document.removeEventListener('scroll', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('click', handleUserInteraction);
      
      if (mouseMoveThrottle) {
        clearTimeout(mouseMoveThrottle);
      }
    };
  }, []);

  // Check fullscreen status on mount and when it changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const newIsFullscreen = !!document.fullscreenElement;
      console.log('Fullscreen status changed:', newIsFullscreen);
      setIsFullscreen(newIsFullscreen);

      // If fullscreen was exited, start the inactivity timer
      if (!newIsFullscreen) {
        console.log('Fullscreen exited, starting 30-second timer...');
        startInactivityTimer();
      } else {
        // If entering fullscreen, clear any existing timer
        console.log('Fullscreen entered, clearing timer');
        resetInactivityTimer();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    // Check initial state
    setIsFullscreen(!!document.fullscreenElement);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
      
      // Clean up timer
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
      }
    };
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!isFullscreen) {
        // Enter fullscreen
        await enterFullscreen();
      } else {
        // Exit fullscreen - reset timer since this is a manual action
        resetInactivityTimer();
        
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        } else if ((document as any).mozCancelFullScreen) {
          await (document as any).mozCancelFullScreen();
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen();
        }
      }
    } catch (error) {
      console.error('Fullscreen toggle failed:', error);
    }
  };

  return (
    <Button
      onClick={toggleFullscreen}
      variant="outline"
      size="sm"
      className="bg-white bg-opacity-20 hover:bg-white hover:bg-opacity-30 border-white text-white p-2"
      style={{ fontFamily: 'Montserrat, sans-serif' }}
      title={isFullscreen ? "Quitter le plein écran" : "Plein écran"}
    >
      {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
    </Button>
  );
}