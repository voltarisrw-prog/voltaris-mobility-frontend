'use client';

import { useWindowDimensions } from '@/hooks/useWindowDimensions';
import './FluidDashboard.css';

const cards = [
  {
    title: 'Vehicles',
    value: '128',
    description: 'Vehicles currently available',
  },
  {
    title: 'Customers',
    value: '2,481',
    description: 'Active customers',
  },
  {
    title: 'Bookings',
    value: '364',
    description: 'Bookings this month',
  },
  {
    title: 'Revenue',
    value: '$84.2K',
    description: 'Monthly revenue',
  },
  {
    title: 'Charging',
    value: '76%',
    description: 'Charging network utilization',
  },
  {
    title: 'Satisfaction',
    value: '94%',
    description: 'Customer satisfaction',
  },
];

export default function FluidDashboard() {
  const { width, height, devicePixelRatio } = useWindowDimensions();

  return (
    <main className="fluid-dashboard">
      <header className="fluid-dashboard__header">
        <div>
          <p className="fluid-dashboard__eyebrow">Dashboard</p>

          <h1 className="fluid-dashboard__title">
            Everything in motion.
          </h1>

          <p className="fluid-dashboard__description">
            A fluid interface that adapts continuously to the available space.
          </p>
        </div>

        <div
          className="fluid-dashboard__viewport"
          aria-label="Current viewport dimensions"
        >
          <span>
            {width > 0 ? `${width} × ${height}` : 'Loading…'}
          </span>

          <span>{devicePixelRatio.toFixed(2)}×</span>
        </div>
      </header>

      <section
        className="fluid-dashboard__grid"
        aria-label="Dashboard metrics"
      >
        {cards.map((card) => (
          <article className="fluid-dashboard__card" key={card.title}>
            <div className="fluid-dashboard__card-content">
              <p className="fluid-dashboard__card-label">
                {card.title}
              </p>

              <strong className="fluid-dashboard__card-value">
                {card.value}
              </strong>

              <p className="fluid-dashboard__card-description">
                {card.description}
              </p>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
