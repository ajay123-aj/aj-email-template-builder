import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { v4 as uuid } from 'uuid';
import App from '../App';
import { actions } from '../store/useEditorStore';
import { getMockTemplate } from '../data/mockTemplates';

function emptyTemplate() {
  const createColumn = () => ({ id: uuid(), width: '100%', blocks: [] });
  const createSection = () => ({
    id: uuid(),
    layout: 'row' as const,
    columns: [createColumn()],
  });
  return {
    id: uuid(),
    name: 'Untitled',
    width: '600px',
    padding: '24px 24px 0 24px',
    backgroundType: 'color' as const,
    backgroundColor: '#ffffff',
    sections: [createSection()],
  };
}

export function EditorPage() {
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get('template') || 'blank';

  useEffect(() => {
    if (templateId === 'blank') {
      actions.setTemplate(emptyTemplate());
    } else {
      const mock = getMockTemplate(templateId);
      if (mock) {
        actions.setTemplate(mock);
      } else {
        actions.setTemplate(emptyTemplate());
      }
    }
  }, [templateId]);

  return (
    <div className="relative h-screen w-full overflow-x-hidden">
      <App />
    </div>
  );
}
