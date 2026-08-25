import {
  Facebook,
  Instagram,
  Linkedin,
  MessageCircle,
  Music2,
  Youtube,
  type LucideIcon,
} from 'lucide-react';
import { socialLinks } from '@/content/home';

/** Lucide has no X mark, so the glyph is drawn to match the icon set's weight. */
function XMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.65l-5.22-6.82-5.96 6.82H1.68l7.73-8.84L1.25 2.25h6.82l4.71 6.23zm-1.16 17.52h1.83L7.08 4.13H5.11z" />
    </svg>
  );
}

const PLATFORMS: { key: string; label: string; Icon: LucideIcon | typeof XMark }[] = [
  { key: 'instagram', label: 'Voltaris on Instagram', Icon: Instagram },
  { key: 'facebook', label: 'Voltaris on Facebook', Icon: Facebook },
  { key: 'tiktok', label: 'Voltaris on TikTok', Icon: Music2 },
  { key: 'youtube', label: 'Voltaris on YouTube', Icon: Youtube },
  { key: 'linkedin', label: 'Voltaris on LinkedIn', Icon: Linkedin },
  { key: 'x', label: 'Voltaris on X', Icon: XMark },
  { key: 'whatsapp', label: 'Message Voltaris on WhatsApp', Icon: MessageCircle },
];

/**
 * Only platforms with a configured URL are rendered. A dead icon linking to an
 * account that does not exist costs more trust than a missing icon does.
 */
export function SocialLinks({ className }: { className?: string }) {
  const active = PLATFORMS.filter((platform) => socialLinks[platform.key]);
  if (active.length === 0) return null;

  return (
    <ul className={className}>
      {active.map(({ key, label, Icon }) => (
        <li key={key}>
          <a
            href={socialLinks[key]}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={label}
            className="inline-flex h-9 w-9 items-center justify-center text-steel-muted transition-colors duration-150 hover:text-volt"
          >
            <Icon className="h-[18px] w-[18px]" />
          </a>
        </li>
      ))}
    </ul>
  );
}
