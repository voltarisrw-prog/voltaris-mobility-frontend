'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { FileText, Upload, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button, Field, inputClass, useToast } from '@/components/ui';
import {
  jobApplicationSchema,
  type JobApplicationForm as Values,
} from '@/lib/validation/schemas';

const MAX_CV_SIZE = 8 * 1024 * 1024;

const ACCEPTED_CV_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export function JobApplicationForm({
  jobSlug,
  jobTitle,
}: {
  jobSlug: string;
  jobTitle: string;
}) {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(jobApplicationSchema),
    defaultValues: {
      job_slug: jobSlug,
      full_name: '',
      email: '',
      phone: '',
      linkedin_url: '',
      portfolio_url: '',
      cover_letter: '',
      cv_file_name: '',
      consent: undefined,
    },
  });

  function selectCv(file: File | undefined) {
    if (!file) return;

    if (!ACCEPTED_CV_TYPES.includes(file.type)) {
      toast.push('error', 'Please upload your CV as a PDF or Word document.');
      return;
    }

    if (file.size > MAX_CV_SIZE) {
      toast.push('error', 'Your CV must be smaller than 8 MB.');
      return;
    }

    setCvFile(file);
    setValue('cv_file_name', file.name, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  function removeCv() {
    setCvFile(null);
    setValue('cv_file_name', '', {
      shouldDirty: true,
      shouldValidate: true,
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  const onSubmit = handleSubmit(async () => {
    /*
     * Submission is intentionally not faked here.
     *
     * The next step will connect this form to the Voltaris application
     * endpoint and CV storage flow. Keeping the UI separate from the
     * transport layer prevents applicants from seeing a false success.
     */
    toast.push(
      'error',
      `Application submission for ${jobTitle} is not connected to the backend yet.`,
    );
  });

  return (
    <div className="rounded-[2rem] border border-black/10 bg-white p-7 text-black shadow-[0_18px_50px_rgba(0,0,0,0.12)] sm:p-9 lg:p-10">
      <div className="border-b border-black/10 pb-6">
        <p className="font-data text-[9px] uppercase tracking-[0.18em] text-volt">
          Application
        </p>

        <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Tell us about yourself.
        </h2>

        <p className="mt-3 max-w-xl text-sm leading-6 text-black/60">
          Apply for <span className="font-medium text-black">{jobTitle}</span>. Keep it simple,
          specific and honest.
        </p>
      </div>

      <form onSubmit={onSubmit} noValidate className="mt-8 space-y-7">
        <input type="hidden" {...register('job_slug')} />

        <section>
          <div className="flex items-end justify-between gap-5 border-b border-black/10 pb-3">
            <div>
              <p className="font-data text-[9px] uppercase tracking-[0.18em] text-volt">
                01 / Contact
              </p>
              <h3 className="mt-2 font-display text-xl font-semibold tracking-tight">
                Your details
              </h3>
            </div>
          </div>

          <div className="mt-6 space-y-5">
            <Field label="Full name" error={errors.full_name?.message} required>
              {(props) => (
                <input
                  {...props}
                  {...register('full_name')}
                  autoComplete="name"
                  className={inputClass}
                />
              )}
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Email" error={errors.email?.message} required>
                {(props) => (
                  <input
                    {...props}
                    {...register('email')}
                    type="email"
                    autoComplete="email"
                    className={inputClass}
                  />
                )}
              </Field>

              <Field label="Phone" error={errors.phone?.message} required>
                {(props) => (
                  <input
                    {...props}
                    {...register('phone')}
                    type="tel"
                    autoComplete="tel"
                    className={inputClass}
                  />
                )}
              </Field>
            </div>
          </div>
        </section>

        <section>
          <div className="border-b border-black/10 pb-3">
            <p className="font-data text-[9px] uppercase tracking-[0.18em] text-volt">
              02 / Online
            </p>
            <h3 className="mt-2 font-display text-xl font-semibold tracking-tight">
              Your work
            </h3>
          </div>

          <div className="mt-6 space-y-5">
            <Field
              label="LinkedIn"
              hint="Optional"
              error={errors.linkedin_url?.message}
            >
              {(props) => (
                <input
                  {...props}
                  {...register('linkedin_url')}
                  type="url"
                  placeholder="https://linkedin.com/in/..."
                  className={inputClass}
                />
              )}
            </Field>

            <Field
              label="Portfolio / GitHub"
              hint="Optional"
              error={errors.portfolio_url?.message}
            >
              {(props) => (
                <input
                  {...props}
                  {...register('portfolio_url')}
                  type="url"
                  placeholder="https://..."
                  className={inputClass}
                />
              )}
            </Field>
          </div>
        </section>

        <section>
          <div className="border-b border-black/10 pb-3">
            <p className="font-data text-[9px] uppercase tracking-[0.18em] text-volt">
              03 / CV
            </p>
            <h3 className="mt-2 font-display text-xl font-semibold tracking-tight">
              Show us your work.
            </h3>
          </div>

          <div className="mt-6">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="sr-only"
              onChange={(event) => selectCv(event.target.files?.[0])}
            />

            {cvFile ? (
              <div className="flex items-center justify-between gap-4 rounded-[1.5rem] border border-volt/30 bg-black/[0.025] p-5">
                <div className="flex min-w-0 items-center gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-black text-white">
                    <FileText className="h-5 w-5" />
                  </span>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-black">
                      {cvFile.name}
                    </p>
                    <p className="mt-1 font-data text-[8px] uppercase tracking-[0.14em] text-black/40">
                      {(cvFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={removeCv}
                  aria-label="Remove CV"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-black/10 text-black/45 transition-colors hover:border-black hover:text-black"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="group flex w-full flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-black/15 bg-black/[0.02] px-6 py-10 text-center transition-all duration-300 hover:border-volt hover:bg-volt/[0.04]"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-white transition-transform duration-300 group-hover:scale-105">
                  <Upload className="h-5 w-5" />
                </span>

                <span className="mt-4 font-data text-[9px] uppercase tracking-[0.16em] text-black">
                  Upload your CV
                </span>

                <span className="mt-2 text-xs text-black/45">
                  PDF or Word · maximum 8 MB
                </span>
              </button>
            )}

            {errors.cv_file_name?.message && (
              <p className="mt-2 text-xs text-red-600">{errors.cv_file_name.message}</p>
            )}
          </div>
        </section>

        <section>
          <div className="border-b border-black/10 pb-3">
            <p className="font-data text-[9px] uppercase tracking-[0.18em] text-volt">
              04 / Your story
            </p>
            <h3 className="mt-2 font-display text-xl font-semibold tracking-tight">
              Why Voltaris?
            </h3>
          </div>

          <div className="mt-6">
            <Field
              label="Cover letter"
              hint="Tell us what you have built, what you know and why this role interests you."
              error={errors.cover_letter?.message}
              required
            >
              {(props) => (
                <textarea
                  {...props}
                  {...register('cover_letter')}
                  rows={9}
                  className={inputClass}
                />
              )}
            </Field>

            <p className="mt-2 text-right font-data text-[8px] uppercase tracking-[0.12em] text-black/35">
              Minimum 80 characters · Maximum 5,000
            </p>
          </div>
        </section>

        <section className="border-t border-black/10 pt-6">
          <Field label="" error={errors.consent?.message}>
            {(props) => (
              <label className="flex items-start gap-3 text-sm leading-6 text-black/60">
                <input
                  {...props}
                  {...register('consent')}
                  type="checkbox"
                  className="mt-1 h-4 w-4 shrink-0 accent-volt"
                />
                I agree that Voltaris may use the information in this application to evaluate me
                for employment opportunities.
              </label>
            )}
          </Field>
        </section>

        <Button type="submit" loading={isSubmitting}>
          Submit application
        </Button>
      </form>
    </div>
  );
}
