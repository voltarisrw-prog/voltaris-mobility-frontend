import { HomeInquiryForm } from '@/features/home/HomeInquiryForm';

export function EnquireHome() {
  return (
    <section
      aria-labelledby="enquire-home-title"
      className="relative isolate overflow-hidden border-b border-[color:var(--vds-border)] vds-section bg-[color:var(--vds-bg)]"
    >
      <div className="shell py-20 sm:py-24 lg:py-32">
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <p className="font-data text-[0.62rem] uppercase tracking-[0.18em] text-[color:var(--vds-text-muted)] sm:text-[0.68rem]">
              Enquire
            </p>

            <h2
              id="enquire-home-title"
              className="mt-7 max-w-4xl font-display text-[clamp(4rem,10vw,9.5rem)] font-medium uppercase leading-[0.76] tracking-[-0.06em] text-[color:var(--vds-text)]"
            >
              Tell us
              <br />
              what you
              <br />
              need
            </h2>

            <p className="mt-8 max-w-md font-display text-[clamp(1.45rem,2.8vw,2.4rem)] leading-[0.98] tracking-[-0.02em] text-[color:var(--vds-text-secondary)] lg:mt-12">
              Looking to buy, sell, rent, or work with Voltaris?
            </p>

            <p className="mt-5 max-w-md font-data text-[0.62rem] uppercase leading-[1.65] tracking-[0.14em] text-[color:var(--vds-text-muted)] sm:text-[0.68rem]">
              Tell us what you are looking for and the Voltaris team will
              take it from there.
            </p>
          </div>

          <div className="relative lg:pt-3">
            <div className="mb-8 flex items-center justify-between border-b border-[color:var(--vds-border)] vds-section pb-5">
              <span className="font-data text-[0.58rem] uppercase tracking-[0.18em] text-[color:var(--vds-text-muted)]">
                Start a conversation
              </span>

              <span className="font-data text-[0.58rem] uppercase tracking-[0.18em] text-[color:var(--vds-text-disabled)]">
                09
              </span>
            </div>

            <HomeInquiryForm />
          </div>
        </div>
      </div>
    </section>
  );
}
