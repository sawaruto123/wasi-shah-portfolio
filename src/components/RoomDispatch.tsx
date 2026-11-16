import { RoomHeading } from './RoomHeading';
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
  const [honeypot, setHoneypot] = useState('');
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
      const { error } = await supabase.rpc('submit_message', {
        p_name: clientName.trim(),
        p_email: clientEmail.trim(),
        p_scope: domainScope,
        p_details: parameters.trim(),
        p_honeypot: honeypot,
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
      className="room-anchor"
    >
      <RoomHeading number="05" label="Connect" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
        {/* 左：聯絡方式（無框） */}
        <div className="lg:col-span-5 min-w-0">
          <h2 className="section-heading mb-5">
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
                className="min-w-0 break-all font-body text-sm text-ink font-semibold hover:text-primary transition-colors cursor-pointer bg-transparent border-none p-0 text-left"
              >
                {contact.email}
              </button>
              <button type="button" aria-label="Copy email address" className="ml-auto shrink-0 text-ink-muted hover:text-primary p-2" onClick={() => copyToClipboard(contact.email, 'Email')}>
                <Copy className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
            <div className="flex items-center gap-4 py-3 border-b border-border-crisp">
              <MessageCircle className="w-5 h-5 text-[#FFB15E] shrink-0" />
              <span className="font-mono text-sm text-ink font-bold">{contact.phone}</span>
              <a
                aria-label="Open WhatsApp (opens in a new tab)"
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
        <div className="lg:col-span-7 min-w-0">
          <div className="contact-panel p-5 sm:p-8 lg:p-10 rounded-2xl">
            <div className="flex items-center justify-between mb-8 pb-5 border-b border-border-crisp">
              <div>
                <h3 className="font-display text-2xl font-semibold tracking-tight text-ink">Send a Message</h3>
                <p className="font-mono text-xs text-ink-muted mt-1">Usually replies within 6 hours</p>
              </div>
              <span className="w-2 h-2 rounded-full bg-primary shrink-0" aria-hidden="true" />
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <input
                type="text"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                name="company"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="hidden"
              />
              <fieldset>
                <legend className="form-label">What do you need?</legend>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['motion', 'code', 'ai', 'brand'] as const).map((scope) => (
                    <button
                      key={scope}
                      type="button"
                      aria-pressed={domainScope === scope}
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
              </fieldset>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact-name" className="form-label">
                    Name
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    autoComplete="name"
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. Maya Chen"
                    className="w-full px-4 py-3 rounded-xl bg-surface-warm border border-border-crisp text-ink placeholder:text-ink-muted font-body text-sm focus:outline-none focus:border-primary focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="contact-email" className="form-label">
                    Email
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    autoComplete="email"
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
                <label htmlFor="contact-details" className="form-label">
                  Project details
                </label>
                <textarea
                  id="contact-details"
                  name="details"
                  rows={4}
                  required
                  value={parameters}
                  onChange={(e) => setParameters(e.target.value)}
                  placeholder="Tell me about your project, timeline and budget..."
                  className="w-full px-4 py-3 rounded-xl bg-surface-warm border border-border-crisp text-ink placeholder:text-ink-muted font-body text-sm focus:outline-none focus:border-primary focus:bg-white transition-all resize-none"
                />
              </div>

              {submitError && (
                <p role="alert" className="text-sm text-red-200 bg-red-950/60 border border-red-400/30 rounded-xl px-4 py-3">
                  {submitError}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="button-primary w-full disabled:opacity-50"
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
        <span>{profile.role_line}</span>
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
