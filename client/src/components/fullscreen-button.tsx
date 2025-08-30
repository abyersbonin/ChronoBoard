import { useState, useEffect, useRef } from "react";
import { Maximize, Minimize } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FullscreenButton() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const autoFullscreenTimer = useRef<NodeJS.Timeout | null>(null);

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

  // Check fullscreen status on mount and when it changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const newIsFullscreen = !!document.fullscreenElement;
      console.log('Fullscreen status changed:', newIsFullscreen);
      setIsFullscreen(newIsFullscreen);

      // If fullscreen was exited, start the 30-second timer
      if (!newIsFullscreen) {
        console.log('Fullscreen exited, starting 30-second auto-return timer...');
        
        // Clear any existing timer
        if (autoFullscreenTimer.current) {
          clearTimeout(autoFullscreenTimer.current);
        }
        
        // Start new timer to re-enter fullscreen after 30 seconds
        autoFullscreenTimer.current = setTimeout(() => {
          console.log('30 seconds passed, automatically re-entering fullscreen...');
          enterFullscreen();
        }, 30000);
      } else {
        // If entering fullscreen, clear the timer
        console.log('Fullscreen entered, clearing auto-return timer');
        if (autoFullscreenTimer.current) {
          clearTimeout(autoFullscreenTimer.current);
          autoFullscreenTimer.current = null;
        }
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
      if (autoFullscreenTimer.current) {
        clearTimeout(autoFullscreenTimer.current);
      }
    };
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!isFullscreen) {
        // Enter fullscreen
        await enterFullscreen();
      } else {
        // Exit fullscreen
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