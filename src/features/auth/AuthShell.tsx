import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import './auth-shell.css';

type Props = {
  active: 'login' | 'register';
  title: string;
  subtitle: ReactNode;
  children: ReactNode;
};

export function AuthShell({ active, title, subtitle, children }: Props) {
  return (
    <div className="auth-shell">
      <section className="auth-panel">
        <div className="auth-panel-in">
          <nav className="auth-tabs" aria-label="Account">
            <Link href="/login" aria-current={active === 'login' ? 'page' : undefined}>
              Sign in
            </Link>
            <Link href="/register" aria-current={active === 'register' ? 'page' : undefined}>
              Create account
            </Link>
          </nav>
          <h1 className="auth-title">{title}</h1>
          <p className="auth-sub">{subtitle}</p>
          {children}
        </div>
      </section>

      <aside className="auth-art" aria-hidden="true">
        <Image
          src="/images/voltaris-form-background.png"
          alt=""
          fill
          priority
          sizes="(min-width: 1024px) 55vw, 100vw"
          className="auth-img"
        />
        <div className="auth-shade" />
        <div className="auth-glass">
          <h2>Drive electric, effortlessly.</h2>
          <p>Compare vehicles, book test drives and track your enquiries in one place.</p>
          <ul>
            <li>Saved vehicles</li>
            <li>Test drives</li>
            <li>Enquiries</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}
