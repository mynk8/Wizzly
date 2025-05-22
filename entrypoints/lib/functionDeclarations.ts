import { Type } from '@google/genai';

/**
 * Function declaration for playing YouTube videos
 */
export const playYouTubeVideoDeclaration = {
  name: 'play_youtube_video',
  description: 'Plays the currently loaded YouTube video on the page. Use this when the user asks to play, start, or resume the video.',
  parameters: {
    type: Type.OBJECT,
    properties: {},
    required: [],
  },
};

/**
 * Function declaration for pausing YouTube videos
 */
export const pauseYouTubeVideoDeclaration = {
  name: 'pause_youtube_video',
  description: 'Pauses the currently playing YouTube video on the page. Use this when the user asks to pause, stop, or halt the video.',
  parameters: {
    type: Type.OBJECT,
    properties: {},
    required: [],
  },
};

/**
 * Function declaration for getting YouTube video status
 */
export const getYouTubeVideoStatusDeclaration = {
  name: 'get_youtube_video_status',
  description: 'Gets the current playback status of the YouTube video, including whether it is playing, paused, current time, and duration. Use this when the user asks about the video status or current state.',
  parameters: {
    type: Type.OBJECT,
    properties: {},
    required: [],
  },
};

/**
 * Function declaration for jumping to a specific time in the video
 */
export const jumpToTimeDeclaration = {
  name: 'jump_to_time',
  description: 'Jumps to a specific time in the YouTube video. Use this when the user asks to go to a specific time, skip to a timestamp, or jump to a particular moment in the video. Supports various time formats like "2:30", "90", "1m 30s".',
  parameters: {
    type: Type.OBJECT,
    properties: {
      timeInSeconds: {
        type: Type.NUMBER,
        description: 'The time to jump to in seconds. For example, 90 for 1:30, 150 for 2:30, etc. Can also parse time strings like "2:30" or "1m 30s".',
      },
    },
    required: ['timeInSeconds'],
  },
};

/**
 * All YouTube control function declarations
 */
export const youTubeControlDeclarations = [
  playYouTubeVideoDeclaration,
  pauseYouTubeVideoDeclaration,
  getYouTubeVideoStatusDeclaration,
  jumpToTimeDeclaration,
]; 