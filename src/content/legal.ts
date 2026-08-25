/**
 * Company and legal copy.
 *
 * IMPORTANT: the legal pages below are a working draft written to be accurate
 * about what this platform actually does — what data it collects, why, and who
 * it goes to. They are NOT legal advice and have not been reviewed by a lawyer
 * qualified in Rwanda.
 *
 * Before taking money or scaling, have them reviewed against Rwanda's Law
 * No. 058/2021 on the protection of personal data and privacy, which requires
 * a lawful basis for processing, a registered data controller, and defined
 * retention periods. The placeholders marked TODO need real answers from the
 * business, not from an engineer.
 */

export const lastUpdated = '2026-08-25';

export const company = {
  legalName: 'Voltaris Mobility Ltd',
  tradingName: 'Voltaris',
  //  TODO: replace with the registered company number and address.
  registration: 'TODO — RDB company registration number',
  address: 'Kigali, Rwanda',
  email: 'hello@voltaris.rw',
  privacyEmail: 'privacy@voltaris.rw',
  phone: '+250 788 000 000',
};

export const terms = {
  title: 'Terms of service',
  intro: `These terms govern your use of ${company.tradingName}. By using the site you accept them. If you do not, please do not use the service.`,
  sections: [
    {
      heading: 'What Voltaris is',
      body: `Voltaris is a marketplace and agency. We do not own most of the vehicles listed here — they are supplied by dealers, private owners, and mobility partners. We connect buyers with sellers, verify what we reasonably can, and arrange test drives. The contract of sale is between you and the seller unless we state otherwise in writing for a specific vehicle.`,
    },
    {
      heading: 'What verification means',
      body: `A "verified" mark means four specific checks were completed: registration documents matched to the seller, import and duty status confirmed where applicable, a battery state-of-health reading taken from the vehicle's own diagnostics, and a physical inspection by a Voltaris agent. It is not a warranty, a guarantee of mechanical condition, or a valuation. Listings without the mark have not been through all four checks, and say so.`,
    },
    {
      heading: 'Listing information',
      body: `Specifications, mileage, and photographs are supplied by sellers. We check what we can and correct what we find, but we cannot guarantee that every figure is accurate. Manufacturer range figures are laboratory measurements; real range on Rwandan roads with a loaded vehicle will be lower. Inspect any vehicle and take a test drive before committing.`,
    },
    {
      heading: 'Pricing',
      body: `Prices shown are the price to you. Voltaris earns a commission from the seller, which is already reflected in the listed price — you do not pay it separately. Prices may change and a listing may be withdrawn at any time before a sale is agreed.`,
    },
    {
      heading: 'Your account',
      body: `You are responsible for keeping your password secure and for activity under your account. Tell us immediately at ${company.email} if you think someone else has access. We may suspend an account that is being used to defraud, harass, or scrape the platform.`,
    },
    {
      heading: 'Acceptable use',
      body: `Do not submit false listings, impersonate another person, scrape the site in bulk, or attempt to interfere with its operation. Do not use contact details obtained here for unsolicited marketing.`,
    },
    {
      heading: 'Our liability',
      body: `We provide the platform as it is. We are not liable for the condition of a vehicle we did not sell, for a seller's conduct, or for losses arising from a transaction we were not party to. Nothing here limits liability that cannot lawfully be limited, including for death, personal injury, or fraud.`,
    },
    {
      heading: 'Governing law',
      body: `These terms are governed by the laws of Rwanda, and the courts of Rwanda have exclusive jurisdiction.`,
    },
    {
      heading: 'Changes',
      body: `We may update these terms. Material changes will be notified on the site. Continuing to use Voltaris after a change means accepting the updated terms.`,
    },
  ],
};

export const privacy = {
  title: 'Privacy policy',
  intro: `This explains what personal data ${company.legalName} collects, why, and what we do with it. We are the data controller for the purposes of Rwanda's data protection law.`,
  sections: [
    {
      heading: 'What we collect',
      body: `When you enquire, request a test drive, or create an account we collect your name, email address, phone number, and whatever you write in your message. If you create an account we also store a hashed version of your password — never the password itself. We record which vehicles you view and save so we can show you your own activity and make the marketplace more useful.`,
    },
    {
      heading: 'Photographs you upload',
      body: `If you submit photographs of a vehicle, we strip the embedded metadata before publishing them. That metadata often includes the GPS coordinates of where the photograph was taken — frequently a home address. We remove it so that publishing a photograph of your car does not publish where you live. The original file, which still contains that metadata, is deleted once the published versions have been created.`,
    },
    {
      heading: 'Why we hold it',
      body: `To answer your enquiry, to arrange a test drive, to operate your account, and to keep records of transactions we are required to keep. Where we rely on your consent — for example, to pass your contact details to a seller — you gave it explicitly on the form, and you can withdraw it.`,
    },
    {
      heading: 'Who sees it',
      body: `When you enquire about a specific vehicle, your name and contact details are shared with that seller so they can reply — the form says so before you submit. We use service providers for hosting, database storage, file storage, and email delivery, who process data on our instructions only. We do not sell personal data.`,
    },
    {
      heading: 'Payment details',
      body: `We do not see or store card details. Payment is taken on the payment provider's own secure page; we receive only a reference and a status.`,
    },
    {
      heading: 'How long we keep it',
      body: `Enquiries and test drive records: TODO — confirm retention period with the business. Account data: for as long as your account is open, and a limited period afterwards. Financial and audit records: retained as required by Rwandan tax and company law.`,
    },
    {
      heading: 'Your rights',
      body: `You can ask for a copy of the data we hold about you, ask us to correct it, ask us to delete it, or object to how we use it. Write to ${company.privacyEmail}. We will respond within the period the law requires.`,
    },
    {
      heading: 'Security',
      body: `Passwords are hashed with Argon2id. Sessions are held in cookies that JavaScript cannot read. Administrative access is restricted by role and every action on a record is logged. No system is perfectly secure, but we design on the assumption that any single layer may fail.`,
    },
    {
      heading: 'Cookies',
      body: `We use cookies that are necessary for the site to work: keeping you signed in, and protecting forms against cross-site request forgery. We do not use advertising cookies.`,
    },
    {
      heading: 'Contact',
      body: `Questions or complaints: ${company.privacyEmail}. You also have the right to complain to Rwanda's data protection supervisory authority.`,
    },
  ],
};

export const about = {
  title: 'About Voltaris',
  lead: 'Everything worth driving, in one place.',
  body: [
    `Voltaris is a vehicle marketplace built in Kigali, for Rwanda. We connect people who want a car with the dealers, owners, and mobility partners who have one — and we check the paperwork before a listing goes live.`,
    `Rwanda moved on electric vehicles before most of the region had a policy: no import duty, VAT relief, and electricity cheap enough that the running cost is a fraction of petrol. What was missing was somewhere to see what is actually available, compare it honestly, and arrange to drive it.`,
    `We do not own most of the vehicles listed here. That is deliberate. It means our job is to be useful to buyers rather than to move our own stock, and it is why every listing shows real driving range, real odometer readings, and what we have and have not verified.`,
  ],
  values: [
    {
      title: 'Say what is checked',
      body: 'A verification badge names the four checks behind it. An unexplained tick is worth nothing.',
    },
    {
      title: 'Show the number that matters',
      body: 'Range decides whether a car fits your week. It is on every listing, measured against the market, not buried in a specification table.',
    },
    {
      title: 'No invented claims',
      body: 'We do not publish inventory counts, customer numbers, or testimonials we do not have.',
    },
  ],
};

export const howItWorks = {
  title: 'How it works',
  buying: [
    { n: '01', title: 'Find it', body: 'Filter by range, battery, price, body type, and location. Every listing shows what has been verified and what has not.' },
    { n: '02', title: 'Compare it', body: 'Put up to four vehicles side by side. We work out cost per kilometre of range, efficiency, and real charging times.' },
    { n: '03', title: 'Drive it', body: 'Request a test drive and we arrange the slot with the seller. Range on paper and range on the Nyabugogo climb are different numbers.' },
    { n: '04', title: 'Buy it', body: 'We handle the paperwork between you and the seller and confirm the vehicle is what the listing said it was.' },
  ],
  selling: [
    { n: '01', title: 'Tell us about it', body: 'Vehicle details, photographs, and documents. Roughly ten minutes.' },
    { n: '02', title: 'We check and prepare', body: 'Documents verified, battery health read from the vehicle, price agreed with you.' },
    { n: '03', title: 'We find the buyer', body: 'Enquiries and test drives come to you already qualified. Our commission is in the listed price; you receive what we agreed.' },
  ],
};


/** The verification story. Linked from every listing badge and the footer. */
export const trust = {
  title: 'Trust and verification',
  intro:
    'Voltaris does not own most of the vehicles listed here. Our job is to check them, and to be precise about what "checked" means — an unexplained tick is worth nothing.',
  checks: [
    {
      title: 'Ownership documents',
      body: 'The registration document is matched to the person or business listing the vehicle. A seller who cannot produce it does not get listed, whatever the vehicle is worth.',
    },
    {
      title: 'Import and duty status',
      body: 'Confirmed against Rwanda Revenue Authority records where applicable. This is where most problems with imported vehicles surface, and it is far cheaper to find before a sale than after.',
    },
    {
      title: 'Battery state of health',
      body: 'Read from the vehicle’s own diagnostics, never estimated from the dashboard range display and never taken from the seller. On a used EV this single number determines what the car is actually worth.',
    },
    {
      title: 'Physical inspection',
      body: 'A Voltaris agent has seen the vehicle in person — not photographs, not a video call.',
    },
  ],
  badge: {
    title: 'What the verified mark means',
    body: 'All four checks completed. Nothing less earns it. A listing without the mark says so plainly rather than staying quiet about it, and you can ask us which checks are outstanding before you view.',
  },
  limits: {
    title: 'What it does not mean',
    body: 'Verification is not a warranty, not a mechanical guarantee, and not a valuation. It confirms the vehicle is what the listing says it is and that the paperwork is sound. Inspect it and take a test drive before committing — we arrange both.',
  },
  reporting: {
    title: 'If something is wrong',
    body: 'If a listing is inaccurate, tell us and we will check it. If it is misleading, we take it down. Write to hello@voltaris.rw with the listing link.',
  },
};

export const help = {
  title: 'Help',
  intro: 'The questions people actually ask. If yours is not here, a person reads every message sent through the contact form.',
  sections: [
    {
      heading: 'Buying',
      faqs: [
        {
          q: 'Do I pay Voltaris or the seller?',
          a: 'The price shown is the price to you. Our commission comes from the seller and is already inside that number — there is no separate fee.',
        },
        {
          q: 'Can I see the vehicle before buying?',
          a: 'Yes, and you should. Request a test drive from any listing and we arrange the slot with the seller. Range on paper and range on the Nyabugogo climb are different numbers.',
        },
        {
          q: 'Is the battery report available for used EVs?',
          a: 'For verified listings, yes — ask through the enquiry form. It is read from the vehicle’s diagnostics, not estimated.',
        },
        {
          q: 'Do I pay import duty on an electric vehicle?',
          a: 'Electric vehicles are exempt from import duty in Rwanda, with relief on VAT and withholding tax. Confirm the current position with RRA before purchase — incentive schemes are reviewed periodically.',
        },
      ],
    },
    {
      heading: 'Selling',
      faqs: [
        {
          q: 'How do I list my vehicle?',
          a: 'Self-service listing is not open yet. Use the form on the Sell page and a member of the team will come back within a working day to photograph the vehicle and agree a price.',
        },
        {
          q: 'What do you charge?',
          a: 'A commission on the sale, agreed with you before the listing goes live. You receive the figure we agreed; the commission sits in the difference between that and the listed price.',
        },
        {
          q: 'Who sees my phone number?',
          a: 'Private sellers’ numbers are never published. Enquiries reach you through Voltaris. Dealers can opt into showing contact details publicly.',
        },
      ],
    },
    {
      heading: 'Account',
      faqs: [
        {
          q: 'I have forgotten my password.',
          a: 'Self-service reset is not live yet. Email hello@voltaris.rw from the address on the account and we will reset it.',
        },
        {
          q: 'Do I need an account to enquire?',
          a: 'No. Enquiries and test drive requests are open to anyone. An account lets you save vehicles and track your enquiries in one place.',
        },
      ],
    },
    {
      heading: 'Charging and ownership',
      faqs: [
        {
          q: 'Can I charge from a normal household socket?',
          a: 'Yes. Most EVs include a cable for a standard socket, adding roughly 10–15 km of range per hour — enough to refill a typical day’s driving overnight. A wall box is several times faster.',
        },
        {
          q: 'How long does an EV battery last?',
          a: 'Modern batteries typically hold 80–90% of capacity after eight years, and manufacturers usually warrant them for eight years or a set mileage. For a used EV, ask for the battery health report rather than relying on the seller’s estimate.',
        },
      ],
    },
  ],
};

export const careers = {
  title: 'Careers',
  intro: 'Voltaris is small and based in Kigali. We are not running open vacancies right now, but we read every message and keep good ones on file.',
  interests: [
    'Engineering — TypeScript, Python, and the boring reliability work that makes a marketplace trustworthy',
    'Vehicle inspection — mechanical knowledge, EV diagnostics, and the judgement to say no to a listing',
    'Sales and partnerships — dealers, fleets, and mobility operators across Rwanda',
    'Content — writing about EV ownership for this market rather than translating it from another',
  ],
  closing:
    'If one of those describes you, write to hello@voltaris.rw with what you have built or done. We would rather see something real than a CV template.',
};
