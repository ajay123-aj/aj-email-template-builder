import { useEditorStore, actions } from '../store/useEditorStore';
import type { AnyBlock, BackgroundType } from '../types/template';

function TemplateBackgroundFields() {
  const template = useEditorStore(s => s.template);
  const type = template.backgroundType ?? 'color';
  return (
    <>
      <div>
        <label className="block text-xs text-slate-600 mb-1">Background type</label>
        <select value={type} onChange={e => actions.setTemplateBackgroundType(e.target.value as BackgroundType)} className="w-full px-2 py-1.5 text-sm rounded border border-slate-300">
          <option value="color">Plain color</option>
          <option value="gradient">Linear gradient</option>
          <option value="image">Image</option>
        </select>
      </div>
      {type === 'color' && (
        <div>
          <label className="block text-xs text-slate-600 mb-1">Color</label>
          <input type="color" value={template.backgroundColor || '#ffffff'} onChange={e => actions.setTemplateBackground(e.target.value)} className="w-full h-8 rounded border border-slate-300 cursor-pointer" />
        </div>
      )}
      {type === 'gradient' && (
        <>
          <div>
            <label className="block text-xs text-slate-600 mb-1">Angle (degrees)</label>
            <input type="number" min={0} max={360} value={template.backgroundGradient?.angle ?? 90} onChange={e => actions.setTemplateBackgroundGradient({ ...template.backgroundGradient, angle: Number(e.target.value) })} className="w-full px-2 py-1.5 text-sm rounded border border-slate-300" />
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1">Colors (comma-separated hex)</label>
            <input type="text" value={(template.backgroundGradient?.colors ?? ['#ffffff', '#e5e7eb']).join(', ')} onChange={e => actions.setTemplateBackgroundGradient({ ...template.backgroundGradient, colors: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} className="w-full px-2 py-1.5 text-sm rounded border border-slate-300" placeholder="#ffffff, #e5e7eb" />
          </div>
        </>
      )}
      {type === 'image' && (
        <>
          <div>
            <label className="block text-xs text-slate-600 mb-1">Image URL</label>
            <input type="text" value={template.backgroundImageUrl ?? ''} onChange={e => actions.setTemplateBackgroundImage(e.target.value, template.backgroundImageSize, template.backgroundImagePosition)} className="w-full px-2 py-1.5 text-sm rounded border border-slate-300" placeholder="https://..." />
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1">Size</label>
            <select value={template.backgroundImageSize ?? 'cover'} onChange={e => actions.setTemplateBackgroundImage(template.backgroundImageUrl ?? '', e.target.value as 'cover' | 'contain' | 'auto', template.backgroundImagePosition)} className="w-full px-2 py-1.5 text-sm rounded border border-slate-300">
              <option value="cover">Cover</option>
              <option value="contain">Contain</option>
              <option value="auto">Auto</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1">Position</label>
            <input type="text" value={template.backgroundImagePosition ?? 'center'} onChange={e => actions.setTemplateBackgroundImage(template.backgroundImageUrl ?? '', template.backgroundImageSize, e.target.value)} className="w-full px-2 py-1.5 text-sm rounded border border-slate-300" placeholder="center" />
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
        <label className="block text-xs text-slate-600 mb-1">Background type</label>
        <select value={type} onChange={e => actions.setSectionBackgroundType(sectionId, e.target.value as BackgroundType)} className="w-full px-2 py-1.5 text-sm rounded border border-slate-300">
          <option value="color">Plain color</option>
          <option value="gradient">Linear gradient</option>
          <option value="image">Image</option>
        </select>
      </div>
      {type === 'color' && (
        <div>
          <label className="block text-xs text-slate-600 mb-1">Color</label>
          <input type="color" value={section.backgroundColor ?? '#ffffff'} onChange={e => actions.setSectionBackground(sectionId, e.target.value)} className="w-full h-8 rounded border border-slate-300 cursor-pointer" />
        </div>
      )}
      {type === 'gradient' && (
        <>
          <div>
            <label className="block text-xs text-slate-600 mb-1">Angle (degrees)</label>
            <input type="number" min={0} max={360} value={section.backgroundGradient?.angle ?? 90} onChange={e => actions.setSectionBackgroundGradient(sectionId, { ...section.backgroundGradient, angle: Number(e.target.value) })} className="w-full px-2 py-1.5 text-sm rounded border border-slate-300" />
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1">Colors (comma-separated hex)</label>
            <input type="text" value={(section.backgroundGradient?.colors ?? ['#ffffff', '#e5e7eb']).join(', ')} onChange={e => actions.setSectionBackgroundGradient(sectionId, { ...section.backgroundGradient, colors: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} className="w-full px-2 py-1.5 text-sm rounded border border-slate-300" placeholder="#ffffff, #e5e7eb" />
          </div>
        </>
      )}
      {type === 'image' && (
        <>
          <div>
            <label className="block text-xs text-slate-600 mb-1">Image URL</label>
            <input type="text" value={section.backgroundImageUrl ?? ''} onChange={e => actions.setSectionBackgroundImage(sectionId, e.target.value, section.backgroundImageSize, section.backgroundImagePosition)} className="w-full px-2 py-1.5 text-sm rounded border border-slate-300" placeholder="https://..." />
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1">Size</label>
            <select value={section.backgroundImageSize ?? 'cover'} onChange={e => actions.setSectionBackgroundImage(sectionId, section.backgroundImageUrl ?? '', e.target.value as 'cover' | 'contain' | 'auto', section.backgroundImagePosition)} className="w-full px-2 py-1.5 text-sm rounded border border-slate-300">
              <option value="cover">Cover</option>
              <option value="contain">Contain</option>
              <option value="auto">Auto</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1">Position</label>
            <input type="text" value={section.backgroundImagePosition ?? 'center'} onChange={e => actions.setSectionBackgroundImage(sectionId, section.backgroundImageUrl ?? '', section.backgroundImageSize, e.target.value)} className="w-full px-2 py-1.5 text-sm rounded border border-slate-300" placeholder="center" />
          </div>
        </>
      )}
    </>
  );
}

function TemplateProps() {
  const template = useEditorStore(s => s.template);
  return (
    <div className="p-3 space-y-3">
      <h3 className="text-sm font-semibold text-slate-800">Template</h3>
      <TemplateBackgroundFields />
      <div>
        <label className="block text-xs text-slate-600 mb-1">Width</label>
        <input type="text" value={template.width || '600px'} onChange={e => actions.setTemplateWidth(e.target.value)} className="w-full px-2 py-1.5 text-sm rounded border border-slate-300" placeholder="600px" />
      </div>
    </div>
  );
}

function SectionProps({ sectionId }: { sectionId: string }) {
  const section = useEditorStore(s => s.template.sections.find(x => x.id === sectionId));
  if (!section) return null;
  return (
    <div className="p-3 space-y-3">
      <h3 className="text-sm font-semibold text-slate-800">Section</h3>
      <div>
        <label className="block text-xs text-slate-600 mb-1">Padding</label>
        <input type="text" value={section.padding ?? ''} onChange={e => actions.setSectionPadding(sectionId, e.target.value)} className="w-full px-2 py-1.5 text-sm rounded border border-slate-300" placeholder="16px" />
      </div>
      <SectionBackgroundFields sectionId={sectionId} />
    </div>
  );
}

function BlockProps({ block }: { block: AnyBlock }) {
  const c = block.config as Record<string, unknown>;
  const update = (key: string, value: unknown) => actions.updateBlock(block.id, b => ({ ...b, config: { ...(b.config as object), [key]: value } } as AnyBlock));

  const commonText = (
    <>
      <div>
        <label className="block text-xs text-slate-600 mb-1">Font size</label>
        <input type="text" value={String(c.fontSize ?? '')} onChange={e => update('fontSize', e.target.value)} className="w-full px-2 py-1.5 text-sm rounded border border-slate-300" />
      </div>
      <div>
        <label className="block text-xs text-slate-600 mb-1">Color</label>
        <input type="color" value={String(c.color ?? '#374151')} onChange={e => update('color', e.target.value)} className="w-full h-8 rounded border border-slate-300 cursor-pointer" />
      </div>
      <div className="flex gap-2">
        <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={(c.fontWeight as string) === 'bold'} onChange={e => update('fontWeight', e.target.checked ? 'bold' : 'normal')} /> Bold</label>
        <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={(c.fontStyle as string) === 'italic'} onChange={e => update('fontStyle', e.target.checked ? 'italic' : 'normal')} /> Italic</label>
      </div>
      <div>
        <label className="block text-xs text-slate-600 mb-1">Alignment</label>
        <select value={String(c.alignment ?? 'left')} onChange={e => update('alignment', e.target.value)} className="w-full px-2 py-1.5 text-sm rounded border border-slate-300">
          <option value="left">Left</option><option value="center">Center</option><option value="right">Right</option><option value="justify">Justify</option>
        </select>
      </div>
      <div>
        <label className="block text-xs text-slate-600 mb-1">Font family</label>
        <input type="text" value={String(c.fontFamily ?? '')} onChange={e => update('fontFamily', e.target.value)} className="w-full px-2 py-1.5 text-sm rounded border border-slate-300" placeholder="inherit" />
      </div>
      <div>
        <label className="block text-xs text-slate-600 mb-1">Background</label>
        <input type="color" value={String(c.backgroundColor ?? '')} onChange={e => update('backgroundColor', e.target.value)} className="w-full h-8 rounded border border-slate-300 cursor-pointer" />
      </div>
    </>
  );

  return (
    <div className="p-3 space-y-3 overflow-y-auto">
      <h3 className="text-sm font-semibold text-slate-800 capitalize">{block.type}</h3>
      {(block.type === 'text' || block.type === 'heading') && (
        <>
          <div>
            <label className="block text-xs text-slate-600 mb-1">Content</label>
            <textarea value={String(c.content ?? '')} onChange={e => update('content', e.target.value)} rows={3} className="w-full px-2 py-1.5 text-sm rounded border border-slate-300" />
          </div>
          {block.type === 'heading' && (
            <div>
              <label className="block text-xs text-slate-600 mb-1">Level</label>
              <select value={Number(c.level ?? 2)} onChange={e => update('level', Number(e.target.value))} className="w-full px-2 py-1.5 text-sm rounded border border-slate-300">
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
            <label className="block text-xs text-slate-600 mb-1">Logo URL</label>
            <input type="text" value={String(c.logoUrl ?? '')} onChange={e => update('logoUrl', e.target.value)} className="w-full px-2 py-1.5 text-sm rounded border border-slate-300" placeholder="https://..." />
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1">Content</label>
            <textarea value={String(c.content ?? '')} onChange={e => update('content', e.target.value)} rows={2} className="w-full px-2 py-1.5 text-sm rounded border border-slate-300" />
          </div>
          {commonText}
        </>
      )}
      {block.type === 'image' && (
        <>
          <div>
            <label className="block text-xs text-slate-600 mb-1">Src</label>
            <input type="text" value={String(c.src ?? '')} onChange={e => update('src', e.target.value)} className="w-full px-2 py-1.5 text-sm rounded border border-slate-300" placeholder="https://..." />
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1">Alt</label>
            <input type="text" value={String(c.alt ?? '')} onChange={e => update('alt', e.target.value)} className="w-full px-2 py-1.5 text-sm rounded border border-slate-300" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div><label className="block text-xs text-slate-600 mb-1">Width</label><input type="text" value={String(c.width ?? '')} onChange={e => update('width', e.target.value)} className="w-full px-2 py-1.5 text-sm rounded border border-slate-300" /></div>
            <div><label className="block text-xs text-slate-600 mb-1">Height</label><input type="text" value={String(c.height ?? '')} onChange={e => update('height', e.target.value)} className="w-full px-2 py-1.5 text-sm rounded border border-slate-300" /></div>
          </div>
        </>
      )}
      {block.type === 'button' && (
        <>
          <div>
            <label className="block text-xs text-slate-600 mb-1">Text</label>
            <input type="text" value={String(c.text ?? '')} onChange={e => update('text', e.target.value)} className="w-full px-2 py-1.5 text-sm rounded border border-slate-300" />
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1">Link (href)</label>
            <input type="text" value={String(c.href ?? '')} onChange={e => update('href', e.target.value)} className="w-full px-2 py-1.5 text-sm rounded border border-slate-300" />
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1">Background</label>
            <input type="color" value={String(c.backgroundColor ?? '#3b82f6')} onChange={e => update('backgroundColor', e.target.value)} className="w-full h-8 rounded border border-slate-300 cursor-pointer" />
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1">Text color</label>
            <input type="color" value={String(c.textColor ?? '#fff')} onChange={e => update('textColor', e.target.value)} className="w-full h-8 rounded border border-slate-300 cursor-pointer" />
          </div>
        </>
      )}
      {block.type === 'divider' && (
        <>
          <div><label className="block text-xs text-slate-600 mb-1">Border color</label><input type="color" value={String(c.borderColor ?? '#e5e7eb')} onChange={e => update('borderColor', e.target.value)} className="w-full h-8 rounded border border-slate-300 cursor-pointer" /></div>
          <div><label className="block text-xs text-slate-600 mb-1">Border width</label><input type="text" value={String(c.borderWidth ?? '1px')} onChange={e => update('borderWidth', e.target.value)} className="w-full px-2 py-1.5 text-sm rounded border border-slate-300" /></div>
        </>
      )}
      {block.type === 'spacer' && (
        <div><label className="block text-xs text-slate-600 mb-1">Height</label><input type="text" value={String(c.height ?? '24px')} onChange={e => update('height', e.target.value)} className="w-full px-2 py-1.5 text-sm rounded border border-slate-300" /></div>
      )}
      {block.type === 'footer' && (
        <>
          <div><label className="block text-xs text-slate-600 mb-1">Content</label><textarea value={String(c.content ?? '')} onChange={e => update('content', e.target.value)} rows={2} className="w-full px-2 py-1.5 text-sm rounded border border-slate-300" /></div>
          <div><label className="block text-xs text-slate-600 mb-1">Background</label><input type="color" value={String(c.backgroundColor ?? '')} onChange={e => update('backgroundColor', e.target.value)} className="w-full h-8 rounded border border-slate-300 cursor-pointer" /></div>
        </>
      )}
      {block.type === 'html' && (
        <div><label className="block text-xs text-slate-600 mb-1">HTML</label><textarea value={String(c.html ?? '')} onChange={e => update('html', e.target.value)} rows={6} className="w-full px-2 py-1.5 text-sm font-mono rounded border border-slate-300" /></div>
      )}
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
