import { useState } from 'react';
import { useEditorStore, actions } from '../store/useEditorStore';
import { generateTemplateFromAI } from '../utils/aiTemplate';

const DEFAULT_PROMPT = 'Create a colorful welcome email: header with logo image and colored background, a hero/banner image, short intro text, one CTA button, and a footer. Use vibrant colors and include template-related images so the preview looks complete.';

interface AskAIModalProps {
  onClose: () => void;
}

export function AskAIModal({ onClose }: AskAIModalProps) {
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setError(null);
    setLoading(true);
    try {
      const template = await generateTemplateFromAI(prompt);
      actions.setTemplate(template);
      actions.setShowPreview(false);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to generate template');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} aria-hidden />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">Ask AI</h2>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-600" aria-label="Close">✕</button>
        </div>
        <div className="p-4 space-y-3">
          <p className="text-sm text-slate-600">Describe the email you want. AI will generate a colorful template with relevant images (hero, logo, etc.) and load it here.</p>
          <label className="block">
            <span className="block text-xs font-medium text-slate-600 mb-1">What kind of email?</span>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder={DEFAULT_PROMPT}
              rows={4}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y"
              disabled={loading}
            />
          </label>
          {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
        </div>
        <div className="px-4 py-3 border-t border-slate-200 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
          <button type="button" onClick={handleGenerate} disabled={loading} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg">
            {loading ? 'Generating…' : 'Generate template'}
          </button>
        </div>
      </div>
    </>
  );
}
