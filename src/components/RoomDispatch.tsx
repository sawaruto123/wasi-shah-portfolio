import React, { useState } from 'react';
import { Mail, MessageCircle, MapPin, Copy, ExternalLink, Send } from 'lucide-react';
import { useContent } from '../lib/content';
import { supabase } from '../lib/supabase';

interface RoomDispatchProps {
  onShowToast: (message: string) => void;
}

export const RoomDispatch: React.FC<RoomDispatchProps> = ({ onShowToast }) => {
  const { settings } = useContent();
  const { contact, profile } = settings;
  const [domainScope, setDomainScope] = useState<'motion' | 'code' | 'ai' | 'brand'>('motion');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [parameters, setParameters] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(
      () => onShowToast(`${label} copied`),
      () => onShowToast(`Copied: ${text}`)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !clientEmail.trim() || !parameters.trim()) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      if (!supabase) {
        throw new Error('Message service unavailable — please email me directly.');
      }
      const { error } = await supabase.from('messages').insert({
        name: clientName.trim(),
        email: clientEmail.trim(),
        scope: domainScope,
        details: parameters.trim(),
      });
      if (error) throw error;
      onShowToast('Message sent to Wasi Shah (峻山). Usually replies within 6 hours.');
      setClientName('');
      setClientEmail('');
      setParameters('');
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Something went wrong. Please email me directly.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="room-dispatch"
      className="room-anchor min-h-full flex flex-col justify-center px-5 sm:px-8 lg:px-12 max-w-[1720px] mx-auto pt-24 pb-28 md:pb-20"
    >
      <div className="flex items-center gap-3 mb-8">
        <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/70 border border-border-crisp font-mono text-[11px] font-bold text-ink">
          <span className="w-2 h-2 rounded-full bg-accent-yellow" />
          05 · CONNECT
        </span>
        <div className="h-px flex-1 bg-border-crisp" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* 左：聯絡方式（無框） */}
        <div className="lg:col-span-5">
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-ink tracking-tight leading-[1.02] mb-5">
            {contact.headline}
          </h2>
          <p className="font-body text-base text-ink-muted leading-relaxed mb-10">
            {contact.subtext}
          </p>

          <div className="flex flex-col mb-10">
            <div className="flex items-center gap-4 py-3 border-b border-border-crisp">
              <Mail className="w-5 h-5 text-primary shrink-0" />
              <button
                onClick={() => copyToClipboard(contact.email, 'Email')}
                className="font-mono text-sm text-ink font-bold hover:text-primary transition-colors cursor-pointer bg-transparent border-none p-0 text-left"
              >
                {contact.email}
              </button>
              <Copy
                className="w-4 h-4 text-ink-muted ml-auto cursor-pointer hover:text-primary"
                onClick={() => copyToClipboard(contact.email, 'Email')}
              />
            </div>
            <div className="flex items-center gap-4 py-3 border-b border-border-crisp">
              <MessageCircle className="w-5 h-5 text-[#FFB15E] shrink-0" />
              <span className="font-mono text-sm text-ink font-bold">{contact.phone}</span>
              <a
                href={`https://wa.me/${contact.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="ml-auto text-ink-muted hover:text-primary"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
            <div className="flex items-center gap-4 py-3">
              <MapPin className="w-5 h-5 text-[#FF9DB2] shrink-0" />
              <span className="font-mono text-sm text-ink font-bold">{contact.location}</span>
            </div>
          </div>

          <span className="font-mono text-xs uppercase tracking-widest text-ink-muted font-bold">
            Social
          </span>
          <div className="flex flex-wrap gap-2 mt-3">
            {contact.socials.map((s) => (
              <a
                key={s.name}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-1.5 rounded-full bg-white/60 border border-border-crisp font-mono text-xs font-bold text-ink hover:text-white hover:bg-ink transition-colors"
              >
                {s.name}
              </a>
            ))}
          </div>
        </div>

        {/* 右：表單（柔軟無框容器） */}
        <div className="lg:col-span-7">
          <div className="p-8 sm:p-10 rounded-3xl bg-white/60">
            <div className="flex items-center justify-between mb-8 pb-5 border-b border-border-crisp">
              <div>
                <h3 className="font-display text-2xl font-black uppercase text-ink">Send a Message</h3>
                <p className="font-mono text-xs text-ink-muted mt-1">Usually replies within 6 hours</p>
              </div>
              <span className="w-3 h-3 rounded-full bg-primary animate-pulse" />
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="font-mono text-xs uppercase tracking-wider text-ink font-bold block mb-2.5">
                  What do you need?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['motion', 'code', 'ai', 'brand'] as const).map((scope) => (
                    <button
                      key={scope}
                      type="button"
                      onClick={() => setDomainScope(scope)}
                      className={`p-3 rounded-xl border font-mono text-xs text-center transition-all cursor-pointer ${
                        domainScope === scope
                          ? 'bg-primary text-white border-primary font-bold'
                          : 'bg-surface-warm border-border-crisp text-ink hover:bg-surface-container'
                      }`}
                    >
                      {scope === 'motion' ? '3D / Motion' : scope === 'code' ? 'Creative Code' : scope === 'ai' ? 'AI Systems' : 'Brand & Type'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-mono text-xs uppercase tracking-wider text-ink font-bold block mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. Maya Chen"
                    className="w-full px-4 py-3 rounded-xl bg-surface-warm border border-border-crisp text-ink placeholder:text-ink-muted font-body text-sm focus:outline-none focus:border-primary focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="font-mono text-xs uppercase tracking-wider text-ink font-bold block mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="e.g. maya@domain.hk"
                    className="w-full px-4 py-3 rounded-xl bg-surface-warm border border-border-crisp text-ink placeholder:text-ink-muted font-body text-sm focus:outline-none focus:border-primary focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="font-mono text-xs uppercase tracking-wider text-ink font-bold block mb-2">
                  Project details
                </label>
                <textarea
                  rows={4}
                  required
                  value={parameters}
                  onChange={(e) => setParameters(e.target.value)}
                  placeholder="Tell me about your project, timeline and budget..."
                  className="w-full px-4 py-3 rounded-xl bg-surface-warm border border-border-crisp text-ink placeholder:text-ink-muted font-body text-sm focus:outline-none focus:border-primary focus:bg-white transition-all resize-none"
                />
              </div>

              {submitError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  {submitError}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-6 rounded-2xl bg-ink text-white font-mono text-xs font-bold uppercase tracking-widest hover:bg-primary transition-colors flex items-center justify-center gap-2 cursor-pointer border-none disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* 頁尾 */}
      <div className="mt-14 pt-6 border-t border-border-crisp flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-[11px] text-ink-muted">
        <span className="font-display text-sm font-bold text-ink">
          {profile.name} <span className="font-chinese text-primary">{profile.name_cn}</span>
        </span>
        <span>HKMU BSc CS · ADOBE AMBASSADOR · CREATIVE DEVELOPER</span>
        <span>© {new Date().getFullYear()} · Hong Kong SAR</span>
        <a
          href="/privacy"
          className="text-ink-muted hover:text-primary transition-colors underline underline-offset-2"
        >
          Privacy
        </a>
      </div>
    </section>
  );
};
