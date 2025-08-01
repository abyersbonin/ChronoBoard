/**
 * WebOS TV Application Configuration for Spa Eastman Dashboard
 * This file provides TV-specific functionality and configurations
 */

// Initialize webOS TV services
var webOSTV = {};

// Configuration for the Spa Eastman Dashboard
webOSTV.config = {
    appId: "com.spaeastman.dashboard",
    version: "1.0.0",
    autoRefresh: true,
    refreshInterval: 30000, // 30 seconds
    fullscreen: true
};

// TV Remote Control Handler
webOSTV.handleRemoteControl = function() {
    document.addEventListener('keydown', function(event) {
        switch(event.keyCode) {
            case 27: // BACK/EXIT
                console.log('Back button pressed');
                if (typeof webOSSystem !== 'undefined') {
                    webOSSystem.platformBack();
                }
                break;
            case 13: // OK/ENTER
                console.log('OK button pressed');
                // Handle selection/interaction
                var focusedElement = document.activeElement || document.querySelector('.tv-focus');
                if (focusedElement && focusedElement.click) {
                    focusedElement.click();
                }
                break;
            case 37: // LEFT
                console.log('Left arrow pressed');
                break;
            case 38: // UP
                console.log('Up arrow pressed');
                break;
            case 39: // RIGHT
                console.log('Right arrow pressed');
                break;
            case 40: // DOWN
                console.log('Down arrow pressed');
                break;
            case 415: // PLAY
                console.log('Play button pressed');
                break;
            case 19: // PAUSE
                console.log('Pause button pressed');
                break;
        }
    });
};

// Auto-refresh for TV display
webOSTV.setupAutoRefresh = function() {
    if (webOSTV.config.autoRefresh) {
        setInterval(function() {
            // Trigger a refresh of calendar events and weather
            if (window.location.reload) {
                console.log('Auto-refreshing dashboard content...');
                window.location.reload();
            }
        }, webOSTV.config.refreshInterval);
    }
};

// Initialize TV-specific features
webOSTV.init = function() {
    console.log('Initializing Spa Eastman Dashboard for webOS TV');
    
    // Set up remote control handling
    webOSTV.handleRemoteControl();
    
    // Set up auto-refresh
    webOSTV.setupAutoRefresh();
    
    // Ensure fullscreen mode
    if (webOSTV.config.fullscreen && document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(function(error) {
            console.log('Fullscreen request failed:', error);
        });
    }
    
    // Hide mouse cursor for TV
    document.body.style.cursor = 'none';
    
    console.log('webOS TV initialization complete');
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', webOSTV.init);
} else {
    webOSTV.init();
}

// Export for global access
window.webOSTV = webOSTV;