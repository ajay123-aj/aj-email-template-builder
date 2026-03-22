import { useEditorStore, actions } from '../store/useEditorStore';
import { ConfirmTooltip } from './ConfirmTooltip';
import { BlockIcon, IconColumns, IconProperties } from './icons';
import type { AnyBlock, BackgroundType, ButtonBackgroundType, DividerBorderType, ColumnSeparatorType } from '../types/template';

function BlockBackgroundFields({ config, update }: { config: Record<string, unknown>; update: (key: string, value: unknown) => void }) {
  const type = (config.backgroundType ?? (config.backgroundColor ? 'color' : 'color')) as BackgroundType;
  return (
    <>
      <div>
        <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Background type</label>
        <select value={type} onChange={e => update('backgroundType', e.target.value as BackgroundType)} className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-slate-200 focus:border-blue-400 dark:focus:border-slate-400">
          <option value="color">Plain color</option>
          <option value="gradient">Linear gradient</option>
          <option value="image">Image</option>
        </select>
      </div>
      {type === 'color' && (
        <div>
          <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Color</label>
          <input type="color" value={String(config.backgroundColor ?? '#f9fafb')} onChange={e => update('backgroundColor', e.target.value)} className="w-full h-8 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500 cursor-pointer" />
        </div>
      )}
      {type === 'gradient' && (
        <>
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Angle (degrees)</label>
            <input type="number" min={0} max={360} value={Number((config.backgroundGradient as { angle?: number })?.angle ?? 90)} onChange={e => update('backgroundGradient', { ...(config.backgroundGradient as object), angle: Number(e.target.value) })} className="w-full px-2 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500" />
          </div>
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Gradient colors</label>
            {((config.backgroundGradient as { colors?: string[] })?.colors ?? ['#f9fafb', '#e5e7eb']).map((color, i) => (
              <div key={i} className="flex items-center gap-2 mb-2">
                <input type="color" value={color.startsWith('#') && color.length >= 4 ? color : '#f9fafb'} onChange={e => { const c = [...((config.backgroundGradient as { colors?: string[] })?.colors ?? ['#f9fafb', '#e5e7eb'])]; c[i] = e.target.value; update('backgroundGradient', { ...(config.backgroundGradient as object), colors: c }); }} className="h-8 w-10 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500 cursor-pointer flex-shrink-0" />
                <input type="text" value={color} onChange={e => { const c = [...((config.backgroundGradient as { colors?: string[] })?.colors ?? ['#f9fafb', '#e5e7eb'])]; c[i] = e.target.value; update('backgroundGradient', { ...(config.backgroundGradient as object), colors: c }); }} className="flex-1 px-2 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500" placeholder="#hex or name" />
                {((config.backgroundGradient as { colors?: string[] })?.colors ?? ['#f9fafb', '#e5e7eb']).length > 2 && (
                  <button type="button" onClick={() => { const cur = ((config.backgroundGradient as { colors?: string[] })?.colors ?? ['#f9fafb', '#e5e7eb']).filter((_, j) => j !== i); update('backgroundGradient', { ...(config.backgroundGradient as object), colors: cur }); }} className="p-1.5 rounded text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 hover:text-slate-800 dark:hover:text-slate-100" aria-label="Remove color">×</button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => { const cur = (config.backgroundGradient as { colors?: string[] })?.colors ?? ['#f9fafb', '#e5e7eb']; const last = cur[cur.length - 1] ?? '#e5e7eb'; update('backgroundGradient', { ...(config.backgroundGradient as object), colors: [...cur, last] }); }} className="mt-1 text-xs text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 rounded px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300">+ Add color</button>
          </div>
        </>
      )}
      {type === 'image' && (
        <>
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Image URL</label>
            <input type="text" value={String(config.backgroundImageUrl ?? '')} onChange={e => update('backgroundImageUrl', e.target.value)} className="w-full px-2 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500" placeholder="https://..." />
          </div>
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Size</label>
            <select value={String(config.backgroundImageSize ?? 'cover')} onChange={e => update('backgroundImageSize', e.target.value)} className="w-full px-2 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500">
              <option value="cover">Cover</option>
              <option value="contain">Contain</option>
              <option value="auto">Auto</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Position</label>
            <input type="text" value={String(config.backgroundImagePosition ?? 'center')} onChange={e => update('backgroundImagePosition', e.target.value)} className="w-full px-2 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500" placeholder="center" />
          </div>
        </>
      )}
    </>
  );
}

function TemplateBackgroundFields() {
  const template = useEditorStore(s => s.template);
  const type = template.backgroundType ?? 'color';
  return (
    <>
      <div>
        <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Background type</label>
        <select value={type} onChange={e => actions.setTemplateBackgroundType(e.target.value as BackgroundType)} className="w-full px-2 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500">
          <option value="color">Plain color</option>
          <option value="gradient">Linear gradient</option>
          <option value="image">Image</option>
        </select>
      </div>
      {type === 'color' && (
        <div>
          <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Color</label>
          <input type="color" value={template.backgroundColor || '#ffffff'} onChange={e => actions.setTemplateBackground(e.target.value)} className="w-full h-8 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500 cursor-pointer" />
        </div>
      )}
      {type === 'gradient' && (
        <>
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Angle (degrees)</label>
            <input type="number" min={0} max={360} value={template.backgroundGradient?.angle ?? 90} onChange={e => actions.setTemplateBackgroundGradient({ ...template.backgroundGradient, angle: Number(e.target.value) })} className="w-full px-2 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500" />
          </div>
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Gradient colors</label>
            {(template.backgroundGradient?.colors ?? ['#ffffff', '#e5e7eb']).map((color, i) => (
              <div key={i} className="flex items-center gap-2 mb-2">
                <input type="color" value={color.startsWith('#') && color.length >= 4 ? color : '#ffffff'} onChange={e => { const c = [...(template.backgroundGradient?.colors ?? ['#ffffff', '#e5e7eb'])]; c[i] = e.target.value; actions.setTemplateBackgroundGradient({ ...template.backgroundGradient, colors: c }); }} className="h-8 w-10 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500 cursor-pointer flex-shrink-0" />
                <input type="text" value={color} onChange={e => { const c = [...(template.backgroundGradient?.colors ?? ['#ffffff', '#e5e7eb'])]; c[i] = e.target.value; actions.setTemplateBackgroundGradient({ ...template.backgroundGradient, colors: c }); }} className="flex-1 px-2 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500" placeholder="#hex or name" />
                {(template.backgroundGradient?.colors ?? ['#ffffff', '#e5e7eb']).length > 2 && (
                  <button type="button" onClick={() => { const c = (template.backgroundGradient?.colors ?? ['#ffffff', '#e5e7eb']).filter((_, j) => j !== i); actions.setTemplateBackgroundGradient({ ...template.backgroundGradient, colors: c }); }} className="p-1.5 rounded text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 hover:text-slate-800 dark:hover:text-slate-100" aria-label="Remove color">×</button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => { const cur = template.backgroundGradient?.colors ?? ['#ffffff', '#e5e7eb']; const last = cur[cur.length - 1] ?? '#e5e7eb'; actions.setTemplateBackgroundGradient({ ...template.backgroundGradient, colors: [...cur, last] }); }} className="mt-1 text-xs text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 rounded px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300">+ Add color</button>
          </div>
        </>
      )}
      {type === 'image' && (
        <>
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Image URL</label>
            <input type="text" value={template.backgroundImageUrl ?? ''} onChange={e => actions.setTemplateBackgroundImage(e.target.value, template.backgroundImageSize, template.backgroundImagePosition)} className="w-full px-2 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500" placeholder="https://..." />
          </div>
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Size</label>
            <select value={template.backgroundImageSize ?? 'cover'} onChange={e => actions.setTemplateBackgroundImage(template.backgroundImageUrl ?? '', e.target.value as 'cover' | 'contain' | 'auto', template.backgroundImagePosition)} className="w-full px-2 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500">
              <option value="cover">Cover</option>
              <option value="contain">Contain</option>
              <option value="auto">Auto</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Position</label>
            <input type="text" value={template.backgroundImagePosition ?? 'center'} onChange={e => actions.setTemplateBackgroundImage(template.backgroundImageUrl ?? '', template.backgroundImageSize, e.target.value)} className="w-full px-2 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500" placeholder="center" />
          </div>
        </>
      )}
    </>
  );
}

function SectionBackgroundFields({ sectionId }: { sectionId: string }) {
  const section = useEditorStore(s => s.template.sections.find(x => x.id === sectionId));
  if (!section) return null;
  const type = section.backgroundType ?? 'color';
  return (
    <>
      <div>
        <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Background type</label>
        <select value={type} onChange={e => actions.setSectionBackgroundType(sectionId, e.target.value as BackgroundType)} className="w-full px-2 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500">
          <option value="color">Plain color</option>
          <option value="gradient">Linear gradient</option>
          <option value="image">Image</option>
        </select>
      </div>
      {type === 'color' && (
        <div>
          <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Color</label>
          <input type="color" value={section.backgroundColor ?? '#ffffff'} onChange={e => actions.setSectionBackground(sectionId, e.target.value)} className="w-full h-8 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500 cursor-pointer" />
        </div>
      )}
      {type === 'gradient' && (
        <>
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Angle (degrees)</label>
            <input type="number" min={0} max={360} value={section.backgroundGradient?.angle ?? 90} onChange={e => actions.setSectionBackgroundGradient(sectionId, { ...section.backgroundGradient, angle: Number(e.target.value) })} className="w-full px-2 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500" />
          </div>
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Gradient colors</label>
            {(section.backgroundGradient?.colors ?? ['#ffffff', '#e5e7eb']).map((color, i) => (
              <div key={i} className="flex items-center gap-2 mb-2">
                <input type="color" value={color.startsWith('#') && color.length >= 4 ? color : '#ffffff'} onChange={e => { const c = [...(section.backgroundGradient?.colors ?? ['#ffffff', '#e5e7eb'])]; c[i] = e.target.value; actions.setSectionBackgroundGradient(sectionId, { ...section.backgroundGradient, colors: c }); }} className="h-8 w-10 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500 cursor-pointer flex-shrink-0" />
                <input type="text" value={color} onChange={e => { const c = [...(section.backgroundGradient?.colors ?? ['#ffffff', '#e5e7eb'])]; c[i] = e.target.value; actions.setSectionBackgroundGradient(sectionId, { ...section.backgroundGradient, colors: c }); }} className="flex-1 px-2 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500" placeholder="#hex or name" />
                {(section.backgroundGradient?.colors ?? ['#ffffff', '#e5e7eb']).length > 2 && (
                  <button type="button" onClick={() => { const c = (section.backgroundGradient?.colors ?? ['#ffffff', '#e5e7eb']).filter((_, j) => j !== i); actions.setSectionBackgroundGradient(sectionId, { ...section.backgroundGradient, colors: c }); }} className="p-1.5 rounded text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 hover:text-slate-800 dark:hover:text-slate-100" aria-label="Remove color">×</button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => { const cur = section.backgroundGradient?.colors ?? ['#ffffff', '#e5e7eb']; const last = cur[cur.length - 1] ?? '#e5e7eb'; actions.setSectionBackgroundGradient(sectionId, { ...section.backgroundGradient, colors: [...cur, last] }); }} className="mt-1 text-xs text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 rounded px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300">+ Add color</button>
          </div>
        </>
      )}
      {type === 'image' && (
        <>
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Image URL</label>
            <input type="text" value={section.backgroundImageUrl ?? ''} onChange={e => actions.setSectionBackgroundImage(sectionId, e.target.value, section.backgroundImageSize, section.backgroundImagePosition)} className="w-full px-2 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500" placeholder="https://..." />
          </div>
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Size</label>
            <select value={section.backgroundImageSize ?? 'cover'} onChange={e => actions.setSectionBackgroundImage(sectionId, section.backgroundImageUrl ?? '', e.target.value as 'cover' | 'contain' | 'auto', section.backgroundImagePosition)} className="w-full px-2 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500">
              <option value="cover">Cover</option>
              <option value="contain">Contain</option>
              <option value="auto">Auto</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Position</label>
            <input type="text" value={section.backgroundImagePosition ?? 'center'} onChange={e => actions.setSectionBackgroundImage(sectionId, section.backgroundImageUrl ?? '', section.backgroundImageSize, e.target.value)} className="w-full px-2 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500" placeholder="center" />
          </div>
        </>
      )}
    </>
  );
}

function TemplateProps() {
  const template = useEditorStore(s => s.template);
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-shrink-0 px-4 py-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-slate-800 dark:bg-blue-700 flex items-center justify-center text-white">
            <IconProperties />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Properties</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">Template settings: width, padding, background.</p>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30 dark:bg-slate-800/50">
      <TemplateBackgroundFields />
      <div>
        <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Width</label>
        <input type="text" value={template.width || '600px'} onChange={e => actions.setTemplateWidth(e.target.value)} className="w-full px-2 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500" placeholder="600px" />
      </div>
      <div>
        <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Main padding</label>
        <input type="text" value={template.padding ?? '24px'} onChange={e => actions.setTemplatePadding(e.target.value)} className="w-full px-2 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500" placeholder="24px or 10px 20px (top/bottom left/right)" title="CSS padding: 10px for all sides, or 10px 20px for top/bottom and left/right" />
      </div>
      </div>
    </div>
  );
}

function SectionProps({ sectionId }: { sectionId: string }) {
  const section = useEditorStore(s => s.template.sections.find(x => x.id === sectionId));
  if (!section) return null;
  const multiColumn = section.columns.length > 1;
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-shrink-0 px-4 py-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white"><IconColumns /></div>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Section</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">Layout, padding, background, columns.</p>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button type="button" className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600" onClick={() => actions.duplicateSection(sectionId)} title="Copy section" aria-label="Copy section">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            </button>
            <ConfirmTooltip message="Remove this section?" onConfirm={() => actions.removeSection(sectionId)} placement="bottom">
              <button type="button" className="p-1.5 rounded-lg border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/50" title="Remove section" aria-label="Remove section">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </ConfirmTooltip>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30 dark:bg-slate-800/50">
      <div>
        <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Layout</label>
        <div className="flex gap-2">
          <button type="button" onClick={() => actions.setSectionLayout(sectionId, 'row')} className={`px-3 py-1.5 text-sm rounded border ${(section.layout ?? 'row') === 'row' ? 'border-blue-500 bg-blue-100 dark:bg-slate-800 dark:bg-blue-700/80 text-blue-700 dark:text-white' : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200'}`}>Row</button>
          <button type="button" onClick={() => actions.setSectionLayout(sectionId, 'column')} className={`px-3 py-1.5 text-sm rounded border ${section.layout === 'column' ? 'border-blue-500 bg-blue-100 dark:bg-slate-800 dark:bg-blue-700/80 text-blue-700 dark:text-white' : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200'}`}>Column</button>
        </div>
      </div>
      <div>
        <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Padding</label>
        <input type="text" value={section.padding ?? ''} onChange={e => actions.setSectionPadding(sectionId, e.target.value)} className="w-full px-2 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500" placeholder="16px" />
      </div>
      <div>
        <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Margin</label>
        <input type="text" value={section.margin ?? ''} onChange={e => actions.setSectionMargin(sectionId, e.target.value)} className="w-full px-2 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500" placeholder="0 or 16px 0" />
      </div>
      <SectionBackgroundFields sectionId={sectionId} />
      {multiColumn && (
        <>
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Column widths</label>
            <div className="space-y-2">
              {section.columns.map((col, i) => (
                <div key={col.id} className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400 w-8">Col {i + 1}</span>
                  <input type="text" value={col.width ?? ''} onChange={e => actions.setColumnWidth(sectionId, col.id, e.target.value)} className="flex-1 px-2 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500" placeholder="e.g. 50%" />
                </div>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Column gap</label>
            <div className="flex flex-wrap gap-1">
              {['0', '8px', '12px', '16px', '24px', '32px'].map(g => (
                <button key={g} type="button" onClick={() => actions.setSectionColumnGap(sectionId, g)} className={`px-2 py-1 text-xs rounded border ${(section.columnGap ?? '8px') === g ? 'border-blue-500 bg-blue-100 dark:bg-blue-700/50 text-blue-700 dark:text-blue-200' : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600'}`}>{g}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Column separator</label>
            <div className="flex flex-wrap gap-1">
              {(['none', 'border', 'line'] as ColumnSeparatorType[]).map(sep => (
                <button key={sep} type="button" onClick={() => actions.setSectionColumnSeparator(sectionId, sep)} className={`px-2 py-1 text-xs rounded border capitalize ${(section.columnSeparator ?? 'none') === sep ? 'border-blue-500 bg-blue-100 dark:bg-blue-700/50 text-blue-700 dark:text-blue-200' : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600'}`}>{sep}</button>
              ))}
            </div>
          </div>
          {section.columnSeparator && section.columnSeparator !== 'none' && (
            <div>
              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Separator color</label>
              <input type="color" value={section.columnSeparatorColor ?? '#e5e7eb'} onChange={e => actions.setSectionColumnSeparatorColor(sectionId, e.target.value)} className="w-full h-8 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 cursor-pointer" />
            </div>
          )}
        </>
      )}
      <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
        <button type="button" onClick={() => actions.addColumnToSection(sectionId)} className="px-4 py-2 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 shadow-sm">+ Add column</button>
      </div>
      </div>
    </div>
  );
}

function BlockProps({ block }: { block: AnyBlock }) {
  const c = block.config as Record<string, unknown>;
  const update = (key: string, value: unknown) => actions.updateBlock(block.id, b => ({ ...b, config: { ...(b.config as object), [key]: value } } as AnyBlock));

  const commonTextFields = (
    <>
      <div>
        <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Font size</label>
        <input type="text" value={String(c.fontSize ?? '')} onChange={e => update('fontSize', e.target.value)} className="w-full px-2 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500" />
      </div>
      <div>
        <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Color</label>
        <input type="color" value={String(c.color ?? '#374151')} onChange={e => update('color', e.target.value)} className="w-full h-8 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500 cursor-pointer" />
      </div>
      <div className="flex gap-2">
        <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={(c.fontWeight as string) === 'bold'} onChange={e => update('fontWeight', e.target.checked ? 'bold' : 'normal')} /> Bold</label>
        <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={(c.fontStyle as string) === 'italic'} onChange={e => update('fontStyle', e.target.checked ? 'italic' : 'normal')} /> Italic</label>
      </div>
      <div>
        <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Alignment</label>
        <select value={String(c.alignment ?? 'left')} onChange={e => update('alignment', e.target.value)} className="w-full px-2 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500">
          <option value="left">Left</option><option value="center">Center</option><option value="right">Right</option><option value="justify">Justify</option>
        </select>
      </div>
      <div>
        <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Font family</label>
        <input type="text" value={String(c.fontFamily ?? '')} onChange={e => update('fontFamily', e.target.value)} className="w-full px-2 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500" placeholder="inherit" />
      </div>
      <div>
        <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Line height</label>
        <input type="text" value={String(c.lineHeight ?? '')} onChange={e => update('lineHeight', e.target.value)} className="w-full px-2 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500" placeholder="1.5" />
      </div>
      <div>
        <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Padding</label>
        <input type="text" value={String(c.padding ?? '')} onChange={e => update('padding', e.target.value)} className="w-full px-2 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500" placeholder="16px or 16px 24px" title="CSS padding: 16px for all sides, or 16px 24px for top/bottom and left/right" />
      </div>
      <div>
        <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Margin</label>
        <input type="text" value={String(c.margin ?? '')} onChange={e => update('margin', e.target.value)} className="w-full px-2 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500" placeholder="0 0 12px" />
      </div>
    </>
  );
  const commonText = (
    <>
      {commonTextFields}
      <div>
        <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Background</label>
        <input type="color" value={String(c.backgroundColor ?? '')} onChange={e => update('backgroundColor', e.target.value)} className="w-full h-8 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500 cursor-pointer" />
      </div>
    </>
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-shrink-0 px-4 py-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-slate-800 dark:bg-blue-700 flex items-center justify-center text-white">
              <BlockIcon type={block.type} />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 capitalize">{block.type}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Edit block settings</p>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button type="button" className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600" onClick={() => actions.duplicateBlock(block.id)} title="Copy block" aria-label="Copy block">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            </button>
            <ConfirmTooltip message="Remove this block?" onConfirm={() => actions.deleteBlock(block.id)} placement="bottom">
              <button type="button" className="p-1.5 rounded-lg border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/50" title="Remove block" aria-label="Remove block">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </ConfirmTooltip>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30 dark:bg-slate-800/50">
      {(block.type === 'text' || block.type === 'heading') && (
        <>
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Content</label>
            <textarea value={String(c.content ?? '')} onChange={e => update('content', e.target.value)} rows={3} className="w-full px-2 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500" />
          </div>
          {block.type === 'heading' && (
            <div>
              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Level</label>
              <select value={Number(c.level ?? 2)} onChange={e => update('level', Number(e.target.value))} className="w-full px-2 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500">
                {[1, 2, 3, 4].map(n => <option key={n} value={n}>H{n}</option>)}
              </select>
            </div>
          )}
          {commonText}
        </>
      )}
      {block.type === 'header' && (
        <>
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Logo URL</label>
            <input type="text" value={String(c.logoUrl ?? '')} onChange={e => update('logoUrl', e.target.value)} className="w-full px-2 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500" placeholder="https://..." />
          </div>
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Content</label>
            <textarea value={String(c.content ?? '')} onChange={e => update('content', e.target.value)} rows={2} className="w-full px-2 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500" />
          </div>
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1 font-medium">Background</label>
            <BlockBackgroundFields config={c} update={update} />
          </div>
          {commonTextFields}
        </>
      )}
      {block.type === 'image' && (
        <>
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Src</label>
            <input type="text" value={String(c.src ?? '')} onChange={e => update('src', e.target.value)} className="w-full px-2 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500" placeholder="https://..." />
          </div>
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Alt</label>
            <input type="text" value={String(c.alt ?? '')} onChange={e => update('alt', e.target.value)} className="w-full px-2 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500" />
          </div>
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Resize</label>
            <div className="flex gap-1 mb-2">
              {(['25%', '50%', '75%', '100%'] as const).map(pct => (
                <button key={pct} type="button" onClick={() => update('width', pct)} className={`flex-1 px-2 py-1.5 text-xs rounded border font-medium transition-colors ${String(c.width ?? '100%') === pct ? 'bg-slate-800 dark:bg-slate-700 text-white border-slate-800 dark:border-slate-700' : 'border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600'}`}>{pct}</button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input type="range" min={10} max={100} value={Math.min(100, Math.max(10, parseInt(String(c.width ?? '100%').replace(/%|px/g, ''), 10) || 100))} onChange={e => update('width', e.target.value + '%')} className="flex-1 h-2 rounded bg-slate-200 appearance-none cursor-pointer accent-slate-600" />
              <span className="text-xs text-slate-600 w-10">{String(c.width ?? '100%')}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div><label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Width</label><input type="text" value={String(c.width ?? '')} onChange={e => update('width', e.target.value)} className="w-full px-2 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500" placeholder="100%" /></div>
            <div><label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Height</label><input type="text" value={String(c.height ?? '')} onChange={e => update('height', e.target.value)} className="w-full px-2 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500" placeholder="auto" /></div>
          </div>
        </>
      )}
      {block.type === 'button' && (
        <>
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Text</label>
            <input type="text" value={String(c.text ?? '')} onChange={e => update('text', e.target.value)} className="w-full px-2 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500" />
          </div>
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Link (href)</label>
            <input type="text" value={String(c.href ?? '')} onChange={e => update('href', e.target.value)} className="w-full px-2 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500" />
          </div>
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Padding</label>
            <input type="text" value={String(c.padding ?? '12px 24px')} onChange={e => update('padding', e.target.value)} className="w-full px-2 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500" placeholder="12px 24px" />
          </div>
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Background type</label>
            <select value={String(c.backgroundColorType ?? 'color')} onChange={e => update('backgroundColorType', e.target.value as ButtonBackgroundType)} className="w-full px-2 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500">
              <option value="color">Plain color</option>
              <option value="gradient">Gradient</option>
            </select>
          </div>
          {(c.backgroundColorType ?? 'color') === 'color' && (
            <div>
              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Background color</label>
              <input type="color" value={String(c.backgroundColor ?? '#3b82f6')} onChange={e => update('backgroundColor', e.target.value)} className="w-full h-8 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500 cursor-pointer" />
            </div>
          )}
          {(c.backgroundColorType ?? 'color') === 'gradient' && (
            <>
              <div>
                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Angle (degrees)</label>
                <input type="number" min={0} max={360} value={Number((c.backgroundGradient as { angle?: number })?.angle ?? 90)} onChange={e => update('backgroundGradient', { ...(c.backgroundGradient as object), angle: Number(e.target.value) })} className="w-full px-2 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Gradient colors</label>
                {((c.backgroundGradient as { colors?: string[] })?.colors ?? ['#3b82f6', '#2563eb']).map((color, i) => (
                  <div key={i} className="flex items-center gap-2 mb-2">
                    <input type="color" value={color.startsWith('#') && color.length >= 4 ? color : '#3b82f6'} onChange={e => { const arr = [...((c.backgroundGradient as { colors?: string[] })?.colors ?? ['#3b82f6', '#2563eb'])]; arr[i] = e.target.value; update('backgroundGradient', { ...(c.backgroundGradient as object), colors: arr }); }} className="h-8 w-10 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500 cursor-pointer flex-shrink-0" />
                    <input type="text" value={color} onChange={e => { const arr = [...((c.backgroundGradient as { colors?: string[] })?.colors ?? ['#3b82f6', '#2563eb'])]; arr[i] = e.target.value; update('backgroundGradient', { ...(c.backgroundGradient as object), colors: arr }); }} className="flex-1 px-2 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500" placeholder="#hex" />
                    {((c.backgroundGradient as { colors?: string[] })?.colors ?? ['#3b82f6', '#2563eb']).length > 2 && (
                      <button type="button" onClick={() => { const cur = ((c.backgroundGradient as { colors?: string[] })?.colors ?? ['#3b82f6', '#2563eb']).filter((_, j) => j !== i); update('backgroundGradient', { ...(c.backgroundGradient as object), colors: cur }); }} className="p-1.5 rounded text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600" aria-label="Remove">×</button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={() => { const cur = (c.backgroundGradient as { colors?: string[] })?.colors ?? ['#3b82f6', '#2563eb']; const last = cur[cur.length - 1] ?? '#2563eb'; update('backgroundGradient', { ...(c.backgroundGradient as object), colors: [...cur, last] }); }} className="mt-1 text-xs text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 rounded px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300">+ Add color</button>
              </div>
            </>
          )}
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Text color</label>
            <input type="color" value={String(c.textColor ?? '#fff')} onChange={e => update('textColor', e.target.value)} className="w-full h-8 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500 cursor-pointer" />
          </div>
        </>
      )}
      {block.type === 'divider' && (
        <>
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Border color type</label>
            <select value={String(c.borderColorType ?? 'color')} onChange={e => update('borderColorType', e.target.value as DividerBorderType)} className="w-full px-2 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500">
              <option value="color">Plain color</option>
              <option value="gradient">Gradient</option>
            </select>
          </div>
          {(c.borderColorType ?? 'color') === 'color' && (
            <div><label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Border color</label><input type="color" value={String(c.borderColor ?? '#e5e7eb')} onChange={e => update('borderColor', e.target.value)} className="w-full h-8 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500 cursor-pointer" /></div>
          )}
          {(c.borderColorType ?? 'color') === 'gradient' && (
            <>
              <div>
                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Angle (degrees)</label>
                <input type="number" min={0} max={360} value={Number((c.borderGradient as { angle?: number })?.angle ?? 90)} onChange={e => update('borderGradient', { ...(c.borderGradient as object), angle: Number(e.target.value) })} className="w-full px-2 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Gradient colors</label>
                {((c.borderGradient as { colors?: string[] })?.colors ?? ['#e5e7eb', '#d1d5db']).map((color, i) => (
                  <div key={i} className="flex items-center gap-2 mb-2">
                    <input type="color" value={color.startsWith('#') && color.length >= 4 ? color : '#e5e7eb'} onChange={e => { const arr = [...((c.borderGradient as { colors?: string[] })?.colors ?? ['#e5e7eb', '#d1d5db'])]; arr[i] = e.target.value; update('borderGradient', { ...(c.borderGradient as object), colors: arr }); }} className="h-8 w-10 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500 cursor-pointer flex-shrink-0" />
                    <input type="text" value={color} onChange={e => { const arr = [...((c.borderGradient as { colors?: string[] })?.colors ?? ['#e5e7eb', '#d1d5db'])]; arr[i] = e.target.value; update('borderGradient', { ...(c.borderGradient as object), colors: arr }); }} className="flex-1 px-2 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500" placeholder="#hex" />
                    {((c.borderGradient as { colors?: string[] })?.colors ?? ['#e5e7eb', '#d1d5db']).length > 2 && (
                      <button type="button" onClick={() => { const cur = ((c.borderGradient as { colors?: string[] })?.colors ?? ['#e5e7eb', '#d1d5db']).filter((_, j) => j !== i); update('borderGradient', { ...(c.borderGradient as object), colors: cur }); }} className="p-1.5 rounded text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600" aria-label="Remove">×</button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={() => { const cur = (c.borderGradient as { colors?: string[] })?.colors ?? ['#e5e7eb', '#d1d5db']; const last = cur[cur.length - 1] ?? '#d1d5db'; update('borderGradient', { ...(c.borderGradient as object), colors: [...cur, last] }); }} className="mt-1 text-xs text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 rounded px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300">+ Add color</button>
              </div>
            </>
          )}
          <div><label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Border width</label><input type="text" value={String(c.borderWidth ?? '1px')} onChange={e => update('borderWidth', e.target.value)} className="w-full px-2 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500" /></div>
          <div><label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Margin</label><input type="text" value={String(c.margin ?? '16px 0')} onChange={e => update('margin', e.target.value)} className="w-full px-2 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500" placeholder="16px 0" /></div>
          <div><label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Width</label><input type="text" value={String(c.width ?? '100%')} onChange={e => update('width', e.target.value)} className="w-full px-2 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500" placeholder="100%" /></div>
        </>
      )}
      {block.type === 'spacer' && (
        <div><label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Height</label><input type="text" value={String(c.height ?? '24px')} onChange={e => update('height', e.target.value)} className="w-full px-2 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500" /></div>
      )}
      {block.type === 'footer' && (
        <>
          <div><label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Content</label><textarea value={String(c.content ?? '')} onChange={e => update('content', e.target.value)} rows={2} className="w-full px-2 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500" /></div>
          <div><label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Background</label><input type="color" value={String(c.backgroundColor ?? '')} onChange={e => update('backgroundColor', e.target.value)} className="w-full h-8 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500 cursor-pointer" /></div>
        </>
      )}
      {block.type === 'html' && (
        <div><label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">HTML</label><textarea value={String(c.html ?? '')} onChange={e => update('html', e.target.value)} rows={6} className="w-full px-2 py-1.5 text-sm font-mono rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500" /></div>
      )}
      {block.type === 'table' && (
        <>
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Headers (comma-separated)</label>
            <input type="text" value={((c.headers as string[]) ?? []).join(', ')} onChange={e => update('headers', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} className="w-full px-2 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500" placeholder="Header 1, Header 2, Header 3" />
          </div>
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Rows (one per line, comma-separated cells)</label>
            <textarea value={((c.rows as string[][]) ?? []).map(r => r.join(', ')).join('\n')} onChange={e => update('rows', e.target.value.split('\n').map(line => line.split(',').map(s => s.trim())))}
              rows={4} className="w-full px-2 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500 font-mono" placeholder="Cell 1, Cell 2, Cell 3" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div><label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Border color</label><input type="color" value={String(c.borderColor ?? '#e5e7eb')} onChange={e => update('borderColor', e.target.value)} className="w-full h-8 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500 cursor-pointer" /></div>
            <div><label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Font size</label><input type="text" value={String(c.fontSize ?? '14px')} onChange={e => update('fontSize', e.target.value)} className="w-full px-2 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500" /></div>
          </div>
        </>
      )}
      {block.type === 'section' && (
        <>
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Padding</label>
            <input type="text" value={String(c.padding ?? '16px')} onChange={e => update('padding', e.target.value)} className="w-full px-2 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500" placeholder="16px" />
          </div>
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Margin</label>
            <input type="text" value={String(c.margin ?? '0')} onChange={e => update('margin', e.target.value)} className="w-full px-2 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500" placeholder="0 or 16px 0" />
          </div>
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1 font-medium">Background</label>
            <BlockBackgroundFields config={c} update={update} />
          </div>
        </>
      )}
      {block.type === 'list' && (
        <>
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">List type</label>
            <select value={String(c.listType ?? 'ul')} onChange={e => update('listType', e.target.value as 'ul' | 'ol')} className="w-full px-2 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500">
              <option value="ul">Bullet list</option>
              <option value="ol">Numbered list</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Items (one per line)</label>
            <textarea value={((c.items as string[]) ?? []).join('\n')} onChange={e => update('items', e.target.value.split('\n').filter(Boolean))}
              rows={4} className="w-full px-2 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500" placeholder={'Item 1\nItem 2\nItem 3'} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div><label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Font size</label><input type="text" value={String(c.fontSize ?? '14px')} onChange={e => update('fontSize', e.target.value)} className="w-full px-2 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500" /></div>
            <div><label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Color</label><input type="color" value={String(c.color ?? '#374151')} onChange={e => update('color', e.target.value)} className="w-full h-8 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500 cursor-pointer" /></div>
          </div>
        </>
      )}
      </div>
    </div>
  );
}

export function PropertiesPanel() {
  const selectedBlockId = useEditorStore(s => s.selectedBlockId);
  const selectedSectionId = useEditorStore(s => s.selectedSectionId);
  const template = useEditorStore(s => s.template);

  let block: AnyBlock | null = null;
  if (selectedBlockId) {
    for (const s of template.sections)
      for (const col of s.columns) {
        const b = col.blocks.find(x => x.id === selectedBlockId);
        if (b) { block = b; break; }
      }
  }

  if (block) return <BlockProps block={block} />;
  if (selectedSectionId) return <SectionProps sectionId={selectedSectionId} />;
  return <TemplateProps />;
}
