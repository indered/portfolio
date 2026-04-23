import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './BrandingSection.module.scss';

// Email signature — two formats so users can paste into any client.
// HTML version: rich preview with the Ask link emphasized.
// Plain text: minimal fallback for clients that strip HTML.
const SIGNATURE_HTML = `<table cellpadding="0" cellspacing="0" border="0" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1f1f1f; font-size: 14px; line-height: 1.5;">
  <tr>
    <td style="padding-top: 4px;">
      <div style="color: #5f6368; font-size: 13px; margin-bottom: 6px;">Regards,</div>
      <div style="font-weight: 600; font-size: 15px; color: #111;">Mahesh Inder</div>
      <div style="color: #5f6368; font-size: 13px; margin-top: 2px;">Full Stack AI Engineer</div>
      <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #e8eaed; font-size: 13px;">
        <a href="https://maheshinder.in" style="color: #1a73e8; text-decoration: none;">maheshinder.in</a>
        <span style="color: #9aa0a6; margin: 0 6px;">&middot;</span>
        <a href="https://maheshinder.in/ask" style="color: #1a73e8; text-decoration: none; font-weight: 600;">Chat with my AI &rarr;</a>
      </div>
    </td>
  </tr>
</table>`;

const SIGNATURE_TEXT = `Regards,
Mahesh Inder
Full Stack AI Engineer

maheshinder.in · Chat with my AI → maheshinder.in/ask`;

const LOGOS = [
  {
    id: 'mono-light',
    title: 'Monogram · Light',
    subtitle: 'For dark backgrounds',
    preview: '/branding/mahesh-inder-logo-light.png',
    previewBg: '#111',
    files: [
      { label: 'PNG 400×300', href: '/branding/mahesh-inder-logo-light.png', download: 'mahesh-inder-logo-light.png' },
      { label: 'PNG 1024', href: '/branding/mahesh-inder-logo-light-1024.png', download: 'mahesh-inder-logo-light-1024.png' },
      { label: 'SVG', href: '/logo.svg', download: 'mahesh-inder-logo-light.svg' },
    ],
  },
  {
    id: 'mono-dark',
    title: 'Monogram · Dark',
    subtitle: 'For light backgrounds',
    preview: '/branding/mahesh-inder-logo-dark.png',
    previewBg: '#fafaf8',
    files: [
      { label: 'PNG 400×300', href: '/branding/mahesh-inder-logo-dark.png', download: 'mahesh-inder-logo-dark.png' },
      { label: 'PNG 1024', href: '/branding/mahesh-inder-logo-dark-1024.png', download: 'mahesh-inder-logo-dark-1024.png' },
      { label: 'SVG', href: '/logo-dark.svg', download: 'mahesh-inder-logo-dark.svg' },
    ],
  },
  {
    id: 'wordmark',
    title: 'Horizontal Wordmark',
    subtitle: 'For headers and signatures',
    preview: '/branding/mahesh-inder-wordmark-horizontal.png',
    previewBg: '#fafaf8',
    files: [
      { label: 'PNG 1200w', href: '/branding/mahesh-inder-wordmark-horizontal.png', download: 'mahesh-inder-wordmark.png' },
      { label: 'SVG', href: '/logo-horizontal.svg', download: 'mahesh-inder-wordmark.svg' },
    ],
  },
  {
    id: 'favicon',
    title: 'Favicon',
    subtitle: 'Apple touch icon + 32×32',
    preview: '/apple-touch-icon.png',
    previewBg: '#111',
    files: [
      { label: 'Apple touch icon PNG', href: '/apple-touch-icon.png', download: 'mahesh-inder-apple-touch.png' },
      { label: 'Favicon 32×32 PNG', href: '/favicon-32x32.png', download: 'mahesh-inder-favicon-32.png' },
      { label: 'Favicon SVG', href: '/favicon.svg', download: 'mahesh-inder-favicon.svg' },
    ],
  },
];

const COLORS = [
  { name: 'Ink', hex: '#111111', usage: 'Primary text, dark mark' },
  { name: 'Paper', hex: '#FAFAF8', usage: 'Light background' },
  { name: 'Accent Blue', hex: '#4285F4', usage: 'CTAs, highlights' },
  { name: 'Accent Purple', hex: '#9B72CB', usage: 'Gradients, AI surfaces' },
  { name: 'Signal Green', hex: '#4ADE80', usage: 'Availability, success' },
  { name: 'Alert Red', hex: '#C5221F', usage: 'Destructive actions' },
];

export default function BrandingSection() {
  const navigate = useNavigate();
  const [copiedLabel, setCopiedLabel] = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light');
    document.title = 'Branding — Mahesh Inder';
  }, []);

  const copy = async (kind) => {
    try {
      if (kind === 'html') {
        // Copy with text/html MIME so Gmail preserves styling on paste
        if (navigator.clipboard?.write && window.ClipboardItem) {
          const blob = new Blob([SIGNATURE_HTML], { type: 'text/html' });
          const textBlob = new Blob([SIGNATURE_TEXT], { type: 'text/plain' });
          await navigator.clipboard.write([
            new ClipboardItem({ 'text/html': blob, 'text/plain': textBlob }),
          ]);
        } else {
          await navigator.clipboard.writeText(SIGNATURE_HTML);
        }
      } else if (kind === 'text') {
        await navigator.clipboard.writeText(SIGNATURE_TEXT);
      } else if (kind === 'source') {
        await navigator.clipboard.writeText(SIGNATURE_HTML);
      }
      setCopiedLabel(kind);
      setTimeout(() => setCopiedLabel(null), 1600);
    } catch {
      setCopiedLabel('error');
      setTimeout(() => setCopiedLabel(null), 1600);
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/')}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span>Solar System</span>
        </button>
        <div className={styles.titleBlock}>
          <h1 className={styles.title}>Brand Kit</h1>
          <p className={styles.sub}>Logos, wordmark, and colors. Grab whatever you need.</p>
        </div>
      </header>

      <section className={styles.grid}>
        {LOGOS.map((logo) => (
          <article key={logo.id} className={styles.card}>
            <div className={styles.preview} style={{ background: logo.previewBg }}>
              <img src={logo.preview} alt={logo.title} />
            </div>
            <div className={styles.meta}>
              <h2 className={styles.cardTitle}>{logo.title}</h2>
              <p className={styles.cardSub}>{logo.subtitle}</p>
              <div className={styles.fileRow}>
                {logo.files.map((f) => (
                  <a key={f.label} href={f.href} download={f.download} className={styles.fileBtn}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    {f.label}
                  </a>
                ))}
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className={styles.signatureSection}>
        <h2 className={styles.sectionTitle}>Email signature</h2>
        <p className={styles.sectionSub}>Paste into Gmail, Outlook, or any mail client that supports rich signatures.</p>

        <div className={styles.signatureCard}>
          <div className={styles.signaturePreview}>
            <div className={styles.mailHeader}>
              <span>To: someone@company.com</span>
              <span>Subject: Quick intro</span>
            </div>
            <div className={styles.mailBody}>
              <p>Hi there, great to connect.</p>
              <p>Happy to chat more whenever you're free.</p>
              <div
                className={styles.renderedSignature}
                dangerouslySetInnerHTML={{
                  // Preview uses relative URLs so images load from the current host (localhost or preview env).
                  // The copied-to-clipboard version keeps the absolute https://maheshinder.in URL for recipients' inboxes.
                  __html: SIGNATURE_HTML.replace(/https:\/\/maheshinder\.in\//g, '/'),
                }}
              />
            </div>
          </div>

          <div className={styles.signatureActions}>
            <button
              type="button"
              className={styles.primaryCopy}
              onClick={() => copy('html')}
            >
              {copiedLabel === 'html' ? 'Copied — now paste into Gmail' : 'Copy rich signature'}
            </button>
            <button
              type="button"
              className={styles.secondaryCopy}
              onClick={() => copy('text')}
            >
              {copiedLabel === 'text' ? 'Copied plain text' : 'Copy plain text'}
            </button>
            <button
              type="button"
              className={styles.secondaryCopy}
              onClick={() => copy('source')}
            >
              {copiedLabel === 'source' ? 'Copied HTML source' : 'Copy HTML source'}
            </button>
          </div>

          <details className={styles.howTo}>
            <summary>How to install (Gmail)</summary>
            <ol>
              <li>Click Copy rich signature above.</li>
              <li>Open Gmail → Settings (gear icon) → See all settings.</li>
              <li>Scroll to Signature, click Create new, paste.</li>
              <li>Set defaults for New emails + On reply/forward, then Save changes at the bottom.</li>
            </ol>
          </details>
        </div>
      </section>

      <section className={styles.colorsSection}>
        <h2 className={styles.sectionTitle}>Colors</h2>
        <div className={styles.colorGrid}>
          {COLORS.map((c) => (
            <div key={c.hex} className={styles.swatch}>
              <div className={styles.swatchChip} style={{ background: c.hex }} />
              <div className={styles.swatchMeta}>
                <span className={styles.swatchName}>{c.name}</span>
                <button
                  type="button"
                  className={styles.swatchHex}
                  onClick={() => navigator.clipboard?.writeText(c.hex)}
                  aria-label={`Copy ${c.hex}`}
                >
                  {c.hex}
                </button>
                <span className={styles.swatchUsage}>{c.usage}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className={styles.footer}>
        <p>Questions? <a href="mailto:mahesh.inder85@gmail.com">mahesh.inder85@gmail.com</a></p>
      </footer>
    </div>
  );
}
