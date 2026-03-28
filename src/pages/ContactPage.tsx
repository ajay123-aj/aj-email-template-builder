import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/landing/Header';
import { Footer } from '../components/landing/Footer';
import { LandingPageBackground } from '../components/landing/LandingPageBackground';
import { submitContactForm } from '../utils/contactApi';
import { getAjEmailEditorApiUrl } from '../utils/ajBackendUrl';

const inputClass =
  'w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 shadow-inner shadow-black/20 outline-none transition-colors focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/30';

const labelClass = 'mb-1.5 block text-sm font-medium text-slate-300';

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
}

export function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const apiConfigured = Boolean(getAjEmailEditorApiUrl('contacts'));

  useEffect(() => {
    const prev = document.title;
    document.title = 'Contact — AJ Email Editor';
    return () => {
      document.title = prev;
    };
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!subject.trim()) {
      setError('Please enter a subject.');
      return;
    }
    if (!message.trim()) {
      setError('Please enter a message.');
      return;
    }

    setSubmitting(true);
    const result = await submitContactForm({ name, email, phone, subject, message });
    setSubmitting(false);

    if (result.ok && 'skipped' in result && result.skipped) {
      setError('Contact form is not available (API URL not configured).');
      return;
    }
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setSuccess(true);
    setName('');
    setEmail('');
    setPhone('');
    setSubject('');
    setMessage('');
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <LandingPageBackground />
      <Header />

      <main className="pt-20 sm:pt-24 lg:pt-28 pb-12 sm:pb-20 px-3 sm:px-6 lg:px-8 max-w-3xl mx-auto">
        <div className="mb-8 sm:mb-10 text-center">
          <p className="text-xs sm:text-sm font-medium uppercase tracking-wider text-violet-400/90 mb-2">Get in touch</p>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight mb-3">
            Contact us
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
            Questions about AJ Email Editor or template building? Send a message and we will get back to you.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 sm:p-8 shadow-xl shadow-violet-950/20">
          {!apiConfigured && (
            <p className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200/90">
              Set <code className="rounded bg-black/30 px-1.5 py-0.5 text-xs text-amber-100">VITE_LEAD_COLLECT_API_ORIGIN</code> and{' '}
              <code className="rounded bg-black/30 px-1.5 py-0.5 text-xs text-amber-100">VITE_API_PREFIX</code> in your env to enable submissions.
            </p>
          )}

          {success ? (
            <div className="text-center py-6">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-white mb-2">Message sent</h2>
              <p className="text-slate-400 text-sm mb-6">Thank you for reaching out. We will respond as soon as we can.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  to="/"
                  className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:from-violet-400 hover:to-fuchsia-400 hover:shadow-violet-500/40"
                >
                  Back to home
                </Link>
                <button
                  type="button"
                  onClick={() => setSuccess(false)}
                  className="text-sm font-medium text-violet-400 hover:text-violet-300 transition-colors"
                >
                  Send another message
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-5" noValidate>
              <div>
                <label htmlFor="contact-name" className={labelClass}>
                  Name <span className="text-fuchsia-400">*</span>
                </label>
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(ev) => setName(ev.target.value)}
                  className={inputClass}
                  disabled={submitting}
                  maxLength={200}
                />
              </div>
              <div>
                <label htmlFor="contact-email" className={labelClass}>
                  Email <span className="text-fuchsia-400">*</span>
                </label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(ev) => setEmail(ev.target.value)}
                  className={inputClass}
                  disabled={submitting}
                  maxLength={320}
                />
              </div>
              <div>
                <label htmlFor="contact-phone" className={labelClass}>
                  Phone <span className="text-slate-500 font-normal">(optional)</span>
                </label>
                <input
                  id="contact-phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(ev) => setPhone(ev.target.value)}
                  className={inputClass}
                  disabled={submitting}
                  maxLength={40}
                />
              </div>
              <div>
                <label htmlFor="contact-subject" className={labelClass}>
                  Subject <span className="text-fuchsia-400">*</span>
                </label>
                <input
                  id="contact-subject"
                  name="subject"
                  type="text"
                  value={subject}
                  onChange={(ev) => setSubject(ev.target.value)}
                  className={inputClass}
                  disabled={submitting}
                  maxLength={300}
                />
              </div>
              <div>
                <label htmlFor="contact-message" className={labelClass}>
                  Message <span className="text-fuchsia-400">*</span>
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={5}
                  value={message}
                  onChange={(ev) => setMessage(ev.target.value)}
                  className={`${inputClass} resize-y min-h-[120px]`}
                  disabled={submitting}
                  maxLength={8000}
                />
              </div>

              {error && (
                <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200" role="alert">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting || !apiConfigured}
                className="w-full rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:from-violet-400 hover:to-fuchsia-400 hover:shadow-violet-500/40 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:from-violet-500 disabled:hover:to-fuchsia-500"
              >
                {submitting ? 'Sending…' : 'Send message'}
              </button>
            </form>
          )}
        </div>

        <p className="mt-8 text-center text-sm text-slate-500">
          <Link to="/" className="text-violet-400 hover:text-violet-300 transition-colors">
            ← Home
          </Link>
          <span className="mx-2 text-slate-600">·</span>
          <Link to="/editor" className="text-violet-400 hover:text-violet-300 transition-colors">
            Open editor
          </Link>
        </p>
      </main>

      <Footer />
    </div>
  );
}
