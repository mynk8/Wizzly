import { Editor, TLShapeId, createShapeId } from '@tldraw/tldraw';

export const captureCanvasScreenshot = async (editor: Editor): Promise<string | null> => {
  try {
    const shapeIds = editor.getCurrentPageShapeIds();
    if (shapeIds.size === 0) return null;
    
    const { blob } = await editor.toImage([...shapeIds], { 
      format: 'png', 
      background: true,
      padding: 16
    });
    
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.warn('Failed to capture canvas screenshot:', error);
    return null;
  }
};

export const handleYouTubePaste = (
  editor: Editor, 
  data: ClipboardEvent, 
  isYouTubeUrl: (text: string) => boolean,
  extractYouTubeId: (url: string) => string | null,
  createShapeId: () => TLShapeId
) => {
  const text = data.clipboardData?.getData('text/plain');
  if (!text || !isYouTubeUrl(text)) return;

  const videoId = extractYouTubeId(text);
  if (!videoId) return;

  data.preventDefault();
  data.stopPropagation();
  data.stopImmediatePropagation();

  const viewportCenter = editor.getViewportScreenCenter();
  const pageCenter = editor.screenToPage(viewportCenter);

  const shapeId = createShapeId();
  editor.createShape({
    id: shapeId,
    type: 'youtube',
    x: pageCenter.x - 280, // Center the video (560/2 = 280)
    y: pageCenter.y - 157.5, // Center the video (315/2 = 157.5)
    props: {
      videoId,
      url: text,
      w: 560,
      h: 315,
    },
  });

  editor.select(shapeId);
  
  setTimeout(() => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText('').catch(() => {
      });
    }
  }, 100);
};

export const importLessonToCanvas = (editor: Editor, lessonPlan: any) => {
  if (!editor || !lessonPlan) return;

  try {
    console.log('Starting import of lesson to canvas');
    
    const allShapeIds = editor.getCurrentPageShapeIds();
    if (allShapeIds.size > 0) {
      const proceed = window.confirm('This will clear the current canvas. Proceed?');
      if (!proceed) return;
      
      editor.deleteShapes([...allShapeIds]);
    }

    const viewportCenter = editor.getViewportScreenCenter();
    const pageCenter = editor.screenToPage(viewportCenter);
    
    let content = '';
    
    content += lessonPlan.title || 'Untitled Lesson';
    content += '\n\n';
    
    content += `Subject: ${lessonPlan.subject || 'Not set'}\n`;
    content += `Grade: ${lessonPlan.gradeLevel || 'Not set'}\n`;
    content += `Duration: ${lessonPlan.duration || 0} min\n`;
    content += `Date: ${lessonPlan.date ? new Date(lessonPlan.date).toLocaleDateString() : 'Not set'}`;
    content += '\n\n';
    
    if (lessonPlan.objectives && lessonPlan.objectives.length > 0) {
      content += 'LEARNING OBJECTIVES:\n';
      lessonPlan.objectives.forEach((objective: any, index: number) => {
        content += `${index + 1}. ${objective.text || 'No objective text'}\n`;
      });
      content += '\n';
    }
    
    if (lessonPlan.activities && lessonPlan.activities.length > 0) {
      content += 'LESSON ACTIVITIES:\n';
      lessonPlan.activities.forEach((activity: any, index: number) => {
        content += `${index + 1}. ${activity.title || 'Untitled Activity'} (${activity.duration} min, ${activity.type})\n`;
        if (activity.description) {
          content += `   ${activity.description}\n`;
        }
      });
      content += '\n';
    }
    
    if (lessonPlan.notes) {
      content += 'NOTES:\n';
      content += lessonPlan.notes;
    }
    
    console.log('Creating text shape');
    
    const id = createShapeId();
    editor.createShape({
      id,
      type: 'text',
      x: pageCenter.x - 400,
      y: pageCenter.y - 300,
      props: {
        text: content,
        w: 800,
      },
    });
    
    console.log('Text shape created successfully');
    
    editor.zoomToFit();
    
    return true;
  } catch (error) {
    console.error('Error importing lesson to canvas:', error);
    alert('There was an error importing the lesson to canvas. See console for details.');
    return false;
  }
}; 