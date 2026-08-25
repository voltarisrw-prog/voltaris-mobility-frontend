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
