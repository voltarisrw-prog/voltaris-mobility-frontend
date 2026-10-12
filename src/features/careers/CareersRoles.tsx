'use client';

import { useMemo, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { ArrowRight, MapPin } from 'lucide-react';
import { cn } from '@/lib/format';
import type { jobPostings } from '@/content/careers';

type Job = (typeof jobPostings)[number];

const DEPT_COLORS: Record<string, string> = {
  Engineering: '#5CC8FF',
  Operations: '#12d6b0',
  Commercial: '#ffb15c',
  Marketing: '#a48bff',
};
const FALLBACK = ['#5CC8FF', '#12d6b0', '#ffb15c', '#a48bff', '#ff8fa3'];

const RANKS: [RegExp, number][] = [
  [/intern|entry|junior/i, 1],
  [/mid/i, 2],
  [/senior|lead|principal/i, 3],
];
const rank = (level: string) => RANKS.find(([re]) => re.test(level))?.[1] ?? 2;

export function CareersRoles({ jobs }: { jobs: readonly Job[] }) {
  const [dept, setDept] = useState('All');
  const [level, setLevel] = useState('Any');

  const depts = useMemo(() => Array.from(new Set(jobs.map((j) => j.department))), [jobs]);
  const levels = useMemo(
    () => Array.from(new Set(jobs.map((j) => j.level))).sort((a, b) => rank(a) - rank(b)),
    [jobs],
  );
  const color = (d: string) => DEPT_COLORS[d] ?? FALLBACK[Math.max(depts.indexOf(d), 0) % FALLBACK.length]!;
  const matches = (j: Job) => (dept === 'All' || j.department === dept) && (level === 'Any' || j.level === level);
  const shown = jobs.filter(matches).length;

  return (
    <>
      <div className="cr-fl" role="region" aria-label="Filter roles" data-cr-in>
        <div className="cr-chips" role="group" aria-label="Department">
          {['All', ...depts].map((d) => (
            <button
              key={d}
              type="button"
              aria-pressed={dept === d}
              className={cn('cr-fc', dept === d && 'is-on')}
              onClick={() => setDept(d)}
            >
              {d === 'All' ? 'All roles' : d}
              <small>{d === 'All' ? jobs.length : jobs.filter((j) => j.department === d).length}</small>
            </button>
          ))}
        </div>
        {levels.length > 1 && (
          <div className="cr-seg" role="group" aria-label="Level">
            {['Any', ...levels].map((l) => (
              <button
                key={l}
                type="button"
                aria-pressed={level === l}
                className={level === l ? 'is-on' : ''}
                onClick={() => setLevel(l)}
              >
                {l === 'Any' ? 'Any level' : l}
              </button>
            ))}
          </div>
        )}
      </div>
      <p className="cr-sr" aria-live="polite">
        {shown} {shown === 1 ? 'role' : 'roles'} shown
      </p>

      <div className="cr-grid">
        {jobs.map((job, i) => {
          const on = matches(job);
          return (
            <Link
              key={job.slug}
              href={`/careers/${job.slug}`}
              data-cr-in
              tabIndex={on ? undefined : -1}
              aria-hidden={on ? undefined : true}
              className={cn('cr-card', !on && 'is-gone')}
              style={{ '--c': color(job.department), '--i': i % 2 } as CSSProperties}
              onPointerMove={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                e.currentTarget.style.setProperty('--gx', `${e.clientX - r.left}px`);
                e.currentTarget.style.setProperty('--gy', `${e.clientY - r.top}px`);
              }}
            >
              <div className="cr-tg">
                <span>{job.department}</span>
                <span>{job.type}</span>
              </div>
              <h3>{job.title}</h3>
              <p>{job.summary}</p>
              <div className="cr-ft">
                <div className="cr-mt">
                  <span>
                    <MapPin size={16} aria-hidden="true" />
                    {job.location}
                  </span>
                  <span className="cr-lv">
                    <i aria-hidden="true">
                      {[1, 2, 3].map((n) => (
                        <b key={n} className={n <= rank(job.level) ? 'f' : ''} />
                      ))}
                    </i>
                    {job.level}
                  </span>
                </div>
                <span className="cr-go">
                  View role
                  <span>
                    <ArrowRight size={20} strokeWidth={2.2} />
                  </span>
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {shown === 0 && (
        <div className="cr-empty">
          <h3>No roles match those filters</h3>
          <p>Try another department or level, or introduce yourself below.</p>
          <button
            type="button"
            onClick={() => {
              setDept('All');
              setLevel('Any');
            }}
          >
            Show all roles
          </button>
        </div>
      )}
    </>
  );
}
