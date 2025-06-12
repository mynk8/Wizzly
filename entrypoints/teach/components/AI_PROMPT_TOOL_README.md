# Documentation for AI Prompt Tool for Wizzly Canvas

## Overview
The AI Prompt Tool is a new interactive widget that can be added to the Wizzly Canvas (tldraw) allowing users to write prompts and get AI responses directly within shapes on the canvas.

## Features
- **Interactive Prompt Input**: Write any prompt or question in the text area
- **Real-time AI Responses**: Get responses from Gemini AI displayed directly in the shape
- **Copy Response**: Easily copy AI responses to clipboard
- **Reset Functionality**: Clear prompts and responses to start fresh
- **Loading States**: Visual indicators while AI is processing
- **Error Handling**: Clear error messages for API issues
- **Resizable**: Shapes can be resized to fit your content
- **API Key Integration**: Works with your existing Gemini API key settings

## How to Use

### 1. Add an AI Prompt Tool
- Look for the "AI Assistant" button in the top-right corner of the canvas
- Click it to add a new AI prompt widget to the center of your canvas
- The widget will be automatically selected after creation

### 2. Write Your Prompt
- In the "Your Prompt" text area, type any question or request
- Examples:
  - "Explain photosynthesis in simple terms"
  - "Create a lesson plan for teaching fractions to 4th graders"
  - "What are the main causes of World War 2?"
  - "Generate discussion questions about climate change"

### 3. Get AI Response
- Click the "Send" button (arrow icon) to submit your prompt
- Wait for the AI to process (you'll see a loading indicator)
- The response will appear in the "AI Response" area below

### 4. Interact with Responses
- **Copy**: Use the copy button in the header to copy responses to clipboard
- **Reset**: Use the reset button to clear both prompt and response
- **Resize**: Drag the corners of the widget to make it larger or smaller

## Context Awareness
The AI assistant is context-aware and will adapt its responses based on:
- **Canvas Mode**: Provides assistance with visual content and diagrams
- **Lesson Planning**: Focuses on educational content and teaching strategies
- **Current Content**: May consider other content on your canvas for context

## Requirements
- Gemini API Key must be set in Settings
- If no API key is configured, you'll see a warning message in the widget

## Technical Details
- Built using tldraw's shape utility system
- Integrates with existing Wizzly AI service infrastructure
- Supports real-time state updates and persistence
- Uses the same AI context awareness as other Wizzly features

## Troubleshooting
- **"API key required" error**: Set your Gemini API key in the Settings panel
- **Network errors**: Check your internet connection and API key validity
- **No response**: Try refreshing the page and ensuring your prompt is clear

This tool enhances the Wizzly Canvas experience by bringing AI assistance directly into your visual workspace, making it easy to get help, generate content, and enhance your teaching materials without leaving the canvas. 
