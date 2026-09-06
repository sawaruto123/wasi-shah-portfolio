import React from 'react';

export const PrivacyPolicy: React.FC = () => (
  <div className="min-h-screen bg-[#F6FAFF] text-ink px-4 sm:px-6 py-16">
    <div className="max-w-2xl mx-auto">
      <a href="/" className="font-mono text-xs text-primary hover:underline mb-8 inline-block">
        ← Back to site
      </a>
      <h1 className="font-display text-4xl sm:text-5xl font-black uppercase tracking-tight mb-6">
        Privacy Policy
      </h1>
      <p className="font-mono text-xs text-ink-muted mb-10">Last updated: {new Date().getFullYear()}</p>

      <div className="space-y-8 font-body text-sm leading-relaxed text-ink-muted">
        <Section title="Who this applies to">
          This policy explains how Syed Wasi Shah (峻山) handles information when you visit this portfolio
          site. By using the site, you agree to the practices described below.
        </Section>

        <Section title="What we collect">
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong className="text-ink">Contact form</strong> — if you submit the contact form, we collect
              your name, email address, the type of project you're enquiring about, and the message you write.
              This is used solely to reply to your enquiry.
            </li>
            <li>
              <strong className="text-ink">Technical data</strong> — our hosting provider (Vercel) and database
              provider (Supabase) may process basic technical data (such as IP address) to keep the site secure
              and available. This is standard for any website.
            </li>
          </ul>
        </Section>

        <Section title="What we do NOT do">
          <ul className="list-disc pl-5 space-y-1">
            <li>We do not use third-party analytics or advertising trackers.</li>
            <li>We do not sell, rent, or share your personal information with anyone.</li>
            <li>We do not set tracking cookies for site visitors.</li>
          </ul>
        </Section>

        <Section title="Cookies & local storage">
          <ul className="list-disc pl-5 space-y-1">
            <li>Public visitors: no cookies are set. We store only a small local preference to remember your
              cookie-consent choice.</li>
            <li>Admin area (/admin): a session is stored locally so you stay signed in to the CMS. This is
              essential for the admin to function.</li>
          </ul>
        </Section>

        <Section title="Where data is stored">
          Contact messages are stored in a Supabase Postgres database. Files you upload through the CMS are
          stored in Supabase Storage. Both are hosted in the ap-southeast-1 (Singapore) region.
        </Section>

        <Section title="Your rights">
          You may request access to, correction of, or deletion of your personal data at any time by emailing{' '}
          <a href="mailto:syedwasi983@gmail.com" className="text-primary underline underline-offset-2">
            syedwasi983@gmail.com
          </a>
          . We respond to all requests within 30 days.
        </Section>

        <Section title="Contact">
          For any privacy questions, contact Syed Wasi Shah at{' '}
          <a href="mailto:syedwasi983@gmail.com" className="text-primary underline underline-offset-2">
            syedwasi983@gmail.com
          </a>
          .
        </Section>
      </div>
    </div>
  </div>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section>
    <h2 className="font-display text-lg font-bold text-ink mb-2">{title}</h2>
    <div>{children}</div>
  </section>
);
