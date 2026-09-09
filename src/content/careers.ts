export type JobPosting = {
  slug: string;
  title: string;
  department: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract';
  level: 'Entry level' | 'Mid level' | 'Senior level';
  summary: string;
  posted: string;
  responsibilities: string[];
  requirements: string[];
  niceToHave: string[];
};

export const jobPostings: JobPosting[] = [
  {
    slug: 'software-engineer',
    title: 'Software Engineer',
    department: 'Engineering',
    location: 'Kigali, Rwanda',
    type: 'Full-time',
    level: 'Mid level',
    summary:
      'Build the technology behind a more trustworthy way to buy, sell and rent vehicles in Rwanda.',
    posted: 'Open',
    responsibilities: [
      'Build and maintain production features across the Voltaris marketplace.',
      'Design reliable APIs and data flows for vehicles, accounts and transactions.',
      'Work closely with product and operations to turn real problems into simple software.',
      'Improve performance, reliability, testing and developer experience.',
    ],
    requirements: [
      'Strong TypeScript or JavaScript experience.',
      'Experience building web applications with React or Next.js.',
      'Understanding of REST APIs, databases and Git.',
      'Ability to write maintainable, tested and documented code.',
    ],
    niceToHave: [
      'Node.js and PostgreSQL experience.',
      'Experience with Docker and cloud deployments.',
      'Interest in mobility, EVs or marketplace products.',
    ],
  },
  {
    slug: 'frontend-engineer',
    title: 'Frontend Engineer',
    department: 'Engineering',
    location: 'Kigali, Rwanda',
    type: 'Full-time',
    level: 'Mid level',
    summary:
      'Shape the digital showroom and create fast, beautiful experiences for people finding their next vehicle.',
    posted: 'Open',
    responsibilities: [
      'Build polished interfaces using React, Next.js and TypeScript.',
      'Translate product ideas into responsive, accessible experiences.',
      'Create reusable components and maintain a consistent design system.',
      'Work with backend engineers to integrate APIs and real marketplace data.',
    ],
    requirements: [
      'Strong React and TypeScript fundamentals.',
      'Good understanding of responsive web design.',
      'Experience with modern CSS or Tailwind CSS.',
      'Strong attention to interaction details and visual quality.',
    ],
    niceToHave: [
      'Next.js App Router experience.',
      'Animation and interaction design experience.',
      'Interest in automotive or mobility products.',
    ],
  },
  {
    slug: 'backend-engineer',
    title: 'Backend Engineer',
    department: 'Engineering',
    location: 'Kigali, Rwanda',
    type: 'Full-time',
    level: 'Mid level',
    summary:
      'Build the services that make vehicle discovery, verification, rental and transactions dependable.',
    posted: 'Open',
    responsibilities: [
      'Design and implement APIs powering the Voltaris platform.',
      'Build reliable data models and business workflows.',
      'Improve security, observability, performance and system reliability.',
      'Collaborate with frontend, product and operations teams.',
    ],
    requirements: [
      'Experience with Node.js, Python or a comparable backend stack.',
      'Strong SQL and relational database fundamentals.',
      'Experience designing and consuming REST APIs.',
      'Understanding of authentication, authorization and secure application design.',
    ],
    niceToHave: [
      'PostgreSQL and Prisma experience.',
      'Docker and cloud deployment experience.',
      'Experience working on marketplaces or transaction systems.',
    ],
  },
  {
    slug: 'ev-operations-specialist',
    title: 'EV Operations Specialist',
    department: 'Operations',
    location: 'Kigali, Rwanda',
    type: 'Full-time',
    level: 'Entry level',
    summary:
      'Help us make electric-vehicle ownership easier by connecting vehicle knowledge, inspections and real-world operations.',
    posted: 'Open',
    responsibilities: [
      'Coordinate vehicle inspections and listing verification.',
      'Help maintain accurate vehicle and charging information.',
      'Work with dealers, owners and mobility partners.',
      'Identify operational problems and improve the processes around them.',
    ],
    requirements: [
      'Strong organizational and communication skills.',
      'Genuine interest in electric vehicles and mobility.',
      'Ability to work carefully with detailed information.',
      'Comfort working directly with people and vehicles.',
    ],
    niceToHave: [
      'Automotive or EV experience.',
      'Mechanical or technical background.',
      'Experience in logistics, fleet or mobility operations.',
    ],
  },
  {
    slug: 'sales-partnerships-associate',
    title: 'Sales & Partnerships Associate',
    department: 'Commercial',
    location: 'Kigali, Rwanda',
    type: 'Full-time',
    level: 'Entry level',
    summary:
      'Build relationships with vehicle owners, dealers, fleets and mobility businesses across Rwanda.',
    posted: 'Open',
    responsibilities: [
      'Develop relationships with dealers, vehicle owners and commercial partners.',
      'Identify new opportunities for Voltaris.',
      'Support partner onboarding and account management.',
      'Represent Voltaris professionally in meetings and the wider market.',
    ],
    requirements: [
      'Strong communication and relationship-building skills.',
      'Confidence speaking with customers and businesses.',
      'Commercial curiosity and a strong sense of ownership.',
      'Ability to work independently and follow through.',
    ],
    niceToHave: [
      'Experience in automotive, mobility or technology.',
      'Sales or business development experience.',
      'Existing knowledge of the Rwandan automotive market.',
    ],
  },
  {
    slug: 'content-marketing-associate',
    title: 'Content & Marketing Associate',
    department: 'Marketing',
    location: 'Kigali, Rwanda',
    type: 'Full-time',
    level: 'Entry level',
    summary:
      'Tell the Voltaris story and make EV ownership, vehicle buying and mobility easier to understand.',
    posted: 'Open',
    responsibilities: [
      'Create useful editorial content for Voltaris customers.',
      'Develop social and digital campaigns around vehicles and mobility.',
      'Research EV ownership questions relevant to Rwanda.',
      'Work with the product and operations teams to turn knowledge into content.',
    ],
    requirements: [
      'Excellent written and verbal communication.',
      'Strong storytelling and research skills.',
      'Comfort creating content for digital platforms.',
      'Curiosity about vehicles, technology and mobility.',
    ],
    niceToHave: [
      'Experience with social media or content marketing.',
      'Photography, video or design skills.',
      'Knowledge of EVs or the automotive market.',
    ],
  },
];
