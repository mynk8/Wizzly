import { createShapePropsMigrationIds, createShapePropsMigrationSequence } from '@tldraw/tldraw';

const versions = createShapePropsMigrationIds(
  'ai-prompt',
  {
    RemoveResponseProperty: 1,
  }
);

export const aiPromptShapeMigrations = createShapePropsMigrationSequence({
  sequence: [
    {
      id: versions.RemoveResponseProperty,
      up(props) {
        if ('response' in props) {
          delete (props as any).response;
        }
      },
      down(props) {
        (props as any).response = '';
      },
    },
  ],
}); 