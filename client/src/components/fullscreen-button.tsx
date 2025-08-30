import { useState, useEffect, useRef } from "react";
import { Maximize, Minimize } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FullscreenButton() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const autoFullscreenTimer = useRef<NodeJS.Timeout | null>(null);

  // Function to enter fullscreen
  const enterFullscreen = async () => {
    try {
      // For automatic entry, we need to simulate a user gesture
      const elem = document.documentElement;
      
      if (elem.requestFullscreen) {
        await elem.requestFullscreen({ navigationUI: "hide" });
      } else if ((elem as any).webkitRequestFullscreen) {
        await (elem as any).webkitRequestFullscreen();
      } else if ((elem as any).mozRequestFullScreen) {
        await (elem as any).mozRequestFullScreen();
      } else if ((elem as any).msRequestFullscreen) {
        await (elem as any).msRequestFullscreen();
      }
      
      console.log('Fullscreen entry successful');
    } catch (error) {
      console.error('Fullscreen entry failed:', error);
      
      // If automatic fullscreen fails, create a visual prompt
      const notification = document.createElement('div');
      notification.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 20px;
        border-radius: 10px;
        z-index: 10000;
        font-family: Montserrat, sans-serif;
        text-align: center;
        border: 2px solid white;
      `;
      notification.innerHTML = `
        <div>Click anywhere to return to fullscreen</div>
        <div style="font-size: 12px; margin-top: 10px; opacity: 0.7;">Or press F11</div>
      `;
      
      document.body.appendChild(notification);
      
      // Remove notification and enter fullscreen on any click
      const handleClick = async () => {
        document.body.removeChild(notification);
        document.removeEventListener('click', handleClick);
        await enterFullscreen();
      };
      
      document.addEventListener('click', handleClick);
      
      // Auto-remove notification after 10 seconds
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
          document.removeEventListener('click', handleClick);
        }
      }, 10000);
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
        console.log('Fullscreen exited, starting 5-second auto-return timer...');
        
        // Clear any existing timer
        if (autoFullscreenTimer.current) {
          clearTimeout(autoFullscreenTimer.current);
        }
        
        // Start new timer to re-enter fullscreen after 5 seconds (testing)
        autoFullscreenTimer.current = setTimeout(() => {
          console.log('5 seconds passed, automatically re-entering fullscreen...');
          enterFullscreen();
        }, 5000);
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