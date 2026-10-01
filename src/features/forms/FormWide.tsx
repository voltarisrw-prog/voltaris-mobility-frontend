import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import './form-wide.css';

export function FormWide({
  crumb,
  title,
  intro,
  children,
}: {
  crumb: string;
  title: string;
  intro: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="fw">
      <header className="fw-hero">
        <Image
          src="/images/voltaris-form-background.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="fw-img"
        />
        <div className="fw-shade" aria-hidden="true" />
        <div className="shell fw-hero-in">
          <nav aria-label="Breadcrumb" className="fw-crumbs">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{crumb}</span>
          </nav>
          <h1 className="fw-h1">{title}</h1>
          <p className="fw-lede">{intro}</p>
        </div>
      </header>
      <div className="shell fw-body">{children}</div>
    </div>
  );
}
