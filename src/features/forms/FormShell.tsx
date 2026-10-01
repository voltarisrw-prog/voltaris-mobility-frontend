import Image from 'next/image';
import type { ReactNode } from 'react';
import './form-shell.css';

type Props = {
  title: string;
  intro: ReactNode;
  tagline: string;
  taglineBody?: string;
  chips?: string[];
  breadcrumb?: ReactNode;
  children: ReactNode;
};

export function FormShell({ title, intro, tagline, taglineBody, chips, breadcrumb, children }: Props) {
  return (
    <div className="fs">
      <aside className="fs-art">
        <Image
          src="/images/voltaris-form-background.png"
          alt=""
          fill
          priority
          sizes="(min-width: 900px) 50vw, 100vw"
          className="fs-img"
        />
        <div className="fs-shade" aria-hidden="true" />
        <div className="fs-glass">
          <h2>{tagline}</h2>
          {taglineBody ? <p>{taglineBody}</p> : null}
          {chips?.length ? (
            <ul>
              {chips.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          ) : null}
        </div>
      </aside>

      <section className="fs-panel">
        <div className="fs-in">
          {breadcrumb ? <div className="fs-crumbs">{breadcrumb}</div> : null}
          <h1 className="fs-title">{title}</h1>
          <p className="fs-sub">{intro}</p>
          {children}
        </div>
      </section>
    </div>
  );
}
