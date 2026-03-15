import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
import type { AnyBlock, EmailColumn, EmailSection, EmailTemplate, SectionLayout, BackgroundType, BackgroundGradient } from '../types/template';

const createColumn = (): EmailColumn => ({ id: uuid(), width: '100%', blocks: [] });
const createSection = (n: number, layout: SectionLayout = 'row'): EmailSection => {
  const cols = Array.from({ length: n }, () => {
    const col = createColumn();
    if (n > 1 && layout === 'row') col.width = `${100 / n}%`;
    return col;
  });
  return { id: uuid(), layout, columns: cols };
};
const emptyTemplate = (): EmailTemplate => ({ id: uuid(), name: 'Untitled', width: '600px', backgroundType: 'color', backgroundColor: '#ffffff', sections: [createSection(1)] });

interface State {
  template: EmailTemplate;
  selectedBlockId: string | null;
  selectedSectionId: string | null;
  history: EmailTemplate[];
  historyIndex: number;
  showPreview: boolean;
  dragActiveId: string | null;
}
const getState = () => useEditorStore.getState();
const setState = (s: Partial<State>) => useEditorStore.setState(s);

export const useEditorStore = create<State>(() => ({
  template: emptyTemplate(),
  selectedBlockId: null,
  selectedSectionId: null,
  history: [emptyTemplate()],
  historyIndex: 0,
  showPreview: false,
  dragActiveId: null,
}));

export const actions = {
  pushHistory: () => {
    const { template, history, historyIndex } = getState();
    const next = history.slice(0, historyIndex + 1);
    next.push(JSON.parse(JSON.stringify(template)));
    if (next.length > 50) next.shift();
    setState({ history: next, historyIndex: next.length - 1 });
  },
  undo: () => {
    const { history, historyIndex } = getState();
    if (historyIndex <= 0) return;
    setState({ template: JSON.parse(JSON.stringify(history[historyIndex - 1])), historyIndex: historyIndex - 1, selectedBlockId: null });
  },
  redo: () => {
    const { history, historyIndex } = getState();
    if (historyIndex >= history.length - 1) return;
    setState({ template: JSON.parse(JSON.stringify(history[historyIndex + 1])), historyIndex: historyIndex + 1, selectedBlockId: null });
  },
  setTemplate: (t: EmailTemplate) => setState({ template: JSON.parse(JSON.stringify(t)) }),
  selectBlock: (id: string | null) => setState({ selectedBlockId: id }),
  selectSection: (id: string | null) => setState({ selectedSectionId: id }),
  setShowPreview: (v: boolean) => setState({ showPreview: v }),
  setDragActiveId: (id: string | null) => setState({ dragActiveId: id }),
  setTemplateBackground: (c: string) => setState({ template: { ...getState().template, backgroundType: 'color', backgroundColor: c } }),
  setTemplateBackgroundType: (t: BackgroundType) => setState({ template: { ...getState().template, backgroundType: t } }),
  setTemplateBackgroundGradient: (g: BackgroundGradient) => setState({ template: { ...getState().template, backgroundType: 'gradient', backgroundGradient: { angle: g.angle ?? 90, colors: g.colors?.length ? g.colors : ['#ffffff', '#e5e7eb'] } } }),
  setTemplateBackgroundImage: (url: string, size?: 'cover' | 'contain' | 'auto', position?: string) => setState({ template: { ...getState().template, backgroundType: 'image', backgroundImageUrl: url, backgroundImageSize: size, backgroundImagePosition: position } }),
  setTemplateWidth: (w: string) => setState({ template: { ...getState().template, width: w } }),
  addSection: (n: number, layout: SectionLayout = 'row') => {
    actions.pushHistory();
    const { template } = getState();
    setState({ template: { ...template, sections: [...template.sections, createSection(n, layout)] } });
  },
  removeSection: (id: string) => {
    actions.pushHistory();
    const { template } = getState();
    setState({ template: { ...template, sections: template.sections.filter(s => s.id !== id) }, selectedSectionId: getState().selectedSectionId === id ? null : getState().selectedSectionId });
  },
  addColumnToSection: (sectionId: string) => {
    actions.pushHistory();
    const { template } = getState();
    const s = template.sections.find(x => x.id === sectionId);
    if (!s) return;
    const w = `${Math.floor(100 / (s.columns.length + 1))}%`;
    const newCol: EmailColumn = { id: uuid(), width: w, blocks: [] };
    setState({ template: { ...template, sections: template.sections.map(sec => sec.id === sectionId ? { ...sec, columns: [...sec.columns.map(c => ({ ...c, width: c.width ?? w })), newCol] } : sec) } });
  },
  setSectionLayout: (sectionId: string, layout: SectionLayout) => {
    actions.pushHistory();
    const { template } = getState();
    setState({ template: { ...template, sections: template.sections.map(s => s.id === sectionId ? { ...s, layout } : s) } });
  },
  setSectionPadding: (sectionId: string, padding: string) => setState({ template: { ...getState().template, sections: getState().template.sections.map(s => s.id === sectionId ? { ...s, padding } : s) } }),
  setSectionBackground: (sectionId: string, backgroundColor: string) => setState({ template: { ...getState().template, sections: getState().template.sections.map(s => s.id === sectionId ? { ...s, backgroundType: 'color', backgroundColor } : s) } }),
  setSectionBackgroundType: (sectionId: string, t: BackgroundType) => setState({ template: { ...getState().template, sections: getState().template.sections.map(s => s.id === sectionId ? { ...s, backgroundType: t } : s) } }),
  setSectionBackgroundGradient: (sectionId: string, g: BackgroundGradient) => setState({ template: { ...getState().template, sections: getState().template.sections.map(s => s.id === sectionId ? { ...s, backgroundType: 'gradient', backgroundGradient: { angle: g.angle ?? 90, colors: g.colors?.length ? g.colors : ['#ffffff', '#e5e7eb'] } } : s) } }),
  setSectionBackgroundImage: (sectionId: string, url: string, size?: 'cover' | 'contain' | 'auto', position?: string) => setState({ template: { ...getState().template, sections: getState().template.sections.map(s => s.id === sectionId ? { ...s, backgroundType: 'image', backgroundImageUrl: url, backgroundImageSize: size, backgroundImagePosition: position } : s) } }),
  addBlock: (sectionId: string, columnId: string, index: number, block: AnyBlock) => {
    actions.pushHistory();
    const { template } = getState();
    setState({
      template: { ...template, sections: template.sections.map(s => s.id !== sectionId ? s : { ...s, columns: s.columns.map(col => col.id !== columnId ? col : { ...col, blocks: [...col.blocks.slice(0, index), block, ...col.blocks.slice(index)] }) }) },
      selectedBlockId: block.id
    });
  },
  moveBlock: (blockId: string, _sId: string, columnId: string, index: number) => {
    actions.pushHistory();
    const { template } = getState();
    let block: AnyBlock | undefined; let fromS: string | undefined; let fromC: string | undefined;
    for (const s of template.sections)
      for (const col of s.columns) {
        const i = col.blocks.findIndex(b => b.id === blockId);
        if (i >= 0) { block = col.blocks[i]; fromS = s.id; fromC = col.id; break; }
      }
    if (!block || fromS === undefined || fromC === undefined) return;
    const remove = (sec: EmailSection) => ({ ...sec, columns: sec.columns.map(c => c.id === fromC ? { ...c, blocks: c.blocks.filter(b => b.id !== blockId) } : c) });
    const insert = (sec: EmailSection) => ({
      ...sec,
      columns: sec.columns.map(c => {
        if (c.id !== columnId) return c;
        const without = c.blocks.filter(b => b.id !== blockId);
        const idx = Math.min(index, without.length);
        return { ...c, blocks: [...without.slice(0, idx), block!, ...without.slice(idx)] };
      })
    });
    setState({ template: { ...template, sections: template.sections.map(remove).map(insert) } });
  },
  updateBlock: (blockId: string, updater: (b: AnyBlock) => AnyBlock) => {
    const { template } = getState();
    setState({ template: { ...template, sections: template.sections.map(s => ({ ...s, columns: s.columns.map(c => ({ ...c, blocks: c.blocks.map(b => b.id === blockId ? updater(b) : b) })) })) } });
  },
  deleteBlock: (blockId: string) => {
    actions.pushHistory();
    const { template } = getState();
    setState({ template: { ...template, sections: template.sections.map(s => ({ ...s, columns: s.columns.map(c => ({ ...c, blocks: c.blocks.filter(b => b.id !== blockId) })) })) }, selectedBlockId: getState().selectedBlockId === blockId ? null : getState().selectedBlockId });
  },
  duplicateBlock: (blockId: string) => {
    const { template } = getState();
    for (const s of template.sections)
      for (const col of s.columns) {
        const i = col.blocks.findIndex(b => b.id === blockId);
        if (i >= 0) {
          const clone = { ...col.blocks[i], id: uuid(), config: { ...(col.blocks[i].config as object) } } as AnyBlock;
          actions.addBlock(s.id, col.id, i + 1, clone);
          return;
        }
      }
  },
};
