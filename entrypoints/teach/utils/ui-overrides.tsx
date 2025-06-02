import {
  DefaultToolbar,
  DefaultToolbarContent,
  TLComponents,
  TLUiOverrides,
  TldrawUiMenuItem,
  useIsToolSelected,
  useTools,
} from '@tldraw/tldraw';

export const uiOverrides: TLUiOverrides = {
  tools(editor, tools) {
    tools['ai-prompt'] = {
      id: 'ai-prompt',
      icon: 'text',
      label: 'AI Instruction',
      kbd: 'i',
      onSelect: () => {
        editor.setCurrentTool('ai-prompt');
      },
    };
    return tools;
  },
};

export const components: TLComponents = {
  Toolbar: (props) => {
    const tools = useTools();
    const isAIPromptSelected = useIsToolSelected(tools['ai-prompt']);
    return (
      <DefaultToolbar {...props}>
        <TldrawUiMenuItem {...tools['ai-prompt']} isSelected={isAIPromptSelected} />
        <DefaultToolbarContent />
      </DefaultToolbar>
    );
  },
}; 