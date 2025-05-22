/**
 * YouTube Video Control Functions
 * These functions interact with the YouTube player on the current page
 */

export interface YouTubeControlResult {
  success: boolean;
  action: string;
  message: string;
}

/**
 * Play the currently loaded YouTube video
 * @returns {YouTubeControlResult} Result of the play action
 */
export function playYouTubeVideo(): YouTubeControlResult {
  try {
    // Try to find the YouTube video element
    const video = document.querySelector('video') as HTMLVideoElement;
    
    if (!video) {
      return {
        success: false,
        action: 'play',
        message: 'No video element found on the page'
      };
    }

    // Check if we're on YouTube
    if (!window.location.hostname.includes('youtube.com')) {
      return {
        success: false,
        action: 'play',
        message: 'This function only works on YouTube'
      };
    }

    // Play the video
    video.play();
    
    return {
      success: true,
      action: 'play',
      message: 'Video playback started successfully'
    };
  } catch (error) {
    return {
      success: false,
      action: 'play',
      message: `Error playing video: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Pause the currently playing YouTube video
 * @returns {YouTubeControlResult} Result of the pause action
 */
export function pauseYouTubeVideo(): YouTubeControlResult {
  try {
    // Try to find the YouTube video element
    const video = document.querySelector('video') as HTMLVideoElement;
    
    if (!video) {
      return {
        success: false,
        action: 'pause',
        message: 'No video element found on the page'
      };
    }

    // Check if we're on YouTube
    if (!window.location.hostname.includes('youtube.com')) {
      return {
        success: false,
        action: 'pause',
        message: 'This function only works on YouTube'
      };
    }

    // Pause the video
    video.pause();
    
    return {
      success: true,
      action: 'pause',
      message: 'Video playback paused successfully'
    };
  } catch (error) {
    return {
      success: false,
      action: 'pause',
      message: `Error pausing video: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Get the current playback status of the YouTube video
 * @returns {YouTubeControlResult & { isPlaying?: boolean, currentTime?: number, duration?: number }} Current video status
 */
export function getYouTubeVideoStatus(): YouTubeControlResult & { 
  isPlaying?: boolean; 
  currentTime?: number; 
  duration?: number;
} {
  try {
    const video = document.querySelector('video') as HTMLVideoElement;
    
    if (!video) {
      return {
        success: false,
        action: 'status',
        message: 'No video element found on the page'
      };
    }

    if (!window.location.hostname.includes('youtube.com')) {
      return {
        success: false,
        action: 'status',
        message: 'This function only works on YouTube'
      };
    }

    const isPlaying = !video.paused && !video.ended && video.readyState > 2;
    
    return {
      success: true,
      action: 'status',
      message: `Video is currently ${isPlaying ? 'playing' : 'paused'}`,
      isPlaying,
      currentTime: video.currentTime,
      duration: video.duration
    };
  } catch (error) {
    return {
      success: false,
      action: 'status',
      message: `Error getting video status: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Parse time string to seconds
 * Supports formats like: "2:30", "1m 30s", "90", "1:30:45"
 * @param {string | number} timeInput - Time input to parse
 * @returns {number} Time in seconds
 */
function parseTimeToSeconds(timeInput: string | number): number {
  if (typeof timeInput === 'number') {
    return timeInput;
  }

  const timeStr = timeInput.toString().trim();
  
  // Handle MM:SS or HH:MM:SS format
  if (timeStr.includes(':')) {
    const parts = timeStr.split(':').map(part => parseInt(part, 10));
    if (parts.length === 2) {
      // MM:SS
      return parts[0] * 60 + parts[1];
    } else if (parts.length === 3) {
      // HH:MM:SS
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
  }
  
  // Handle formats like "1m 30s" or "90s"
  const minutesMatch = timeStr.match(/(\d+)m/);
  const secondsMatch = timeStr.match(/(\d+)s/);
  
  let totalSeconds = 0;
  if (minutesMatch) {
    totalSeconds += parseInt(minutesMatch[1], 10) * 60;
  }
  if (secondsMatch) {
    totalSeconds += parseInt(secondsMatch[1], 10);
  }
  
  if (totalSeconds > 0) {
    return totalSeconds;
  }
  
  // Try to parse as plain number
  const numericValue = parseFloat(timeStr);
  return isNaN(numericValue) ? 0 : numericValue;
}

/**
 * Jump to a specific time in the YouTube video
 * @param {number | string} timeInput - The time to jump to (in seconds or time string)
 * @returns {YouTubeControlResult & { newTime?: number }} Result of the seek action
 */
export function jumpToTimeInVideo(timeInput: number | string): YouTubeControlResult & { newTime?: number } {
  try {
    const video = document.querySelector('video') as HTMLVideoElement;
    
    if (!video) {
      return {
        success: false,
        action: 'jump',
        message: 'No video element found on the page'
      };
    }

    if (!window.location.hostname.includes('youtube.com')) {
      return {
        success: false,
        action: 'jump',
        message: 'This function only works on YouTube'
      };
    }

    // Parse the time input to seconds
    const timeInSeconds = parseTimeToSeconds(timeInput);

    // Validate time input
    if (isNaN(timeInSeconds) || timeInSeconds < 0) {
      return {
        success: false,
        action: 'jump',
        message: 'Invalid time provided. Time must be a positive number in seconds.'
      };
    }

    // Check if time is within video duration
    if (video.duration && timeInSeconds > video.duration) {
      return {
        success: false,
        action: 'jump',
        message: `Time ${timeInSeconds}s exceeds video duration of ${Math.floor(video.duration)}s`
      };
    }

    // Jump to the specified time
    video.currentTime = timeInSeconds;
    
    // Format time for display
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    return {
      success: true,
      action: 'jump',
      message: `Jumped to ${timeString} in the video`,
      newTime: timeInSeconds
    };
  } catch (error) {
    return {
      success: false,
      action: 'jump',
      message: `Error jumping to time: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
} 