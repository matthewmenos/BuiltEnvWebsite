import { IProgramme } from 'shared/schema';

export const programmes: IProgramme[] = [
  {
    id: 'qs',
    title: 'MSc Quantity Surveying',
    shortCode: 'QS',
    description:
      'Develop the skills to manage all aspects of construction cost and contract management. Learn to optimise the financial management and control of capital and maintenance projects.',
    faculty: 'Engineering and Environment',
    duration: '12 months (full-time)',
    admission:
      '2:2 honours degree in a relevant engineering or construction discipline, or equivalent professional experience.',
    euFees: '£15,500',
    nonEuFees: '£26,000',
    accreditation: 'APC accredited – routes to Chartered Surveyor status',
    structure:
      'Core modules include: Construction Technology, Contract Law, Cost Planning, Risk Management, and Project Management. Final assessment includes a dissertation.',
    image: '/assets/programmes/qs.jpg',
    location: 'Bristol, UK',
  },
  {
    id: 'construction',
    title: 'MSc Construction Project Management',
    shortCode: 'CP',
    description:
      'Gain the skills to manage construction projects from inception to completion. Focus on sustainability, digital construction, and industry-leading project delivery methods.',
    faculty: 'Engineering and Environment',
    duration: '12 months (full-time)',
    admission:
      '2:2 honours degree in construction, engineering, architecture, or related field.',
    euFees: '£15,500',
    nonEuFees: '£27,000',
    accreditation: 'JCT and RICS aligned curriculum',
    structure:
      'Core modules include: Construction Methods, Project Planning, Cost Management, Health & Safety, and Research Methods. Optional modules allow specialisation in digital construction or sustainable building.',
    image: '/assets/programmes/construction.jpg',
    location: 'Bristol, UK',
  },
  {
    id: 'architecture',
    title: 'MArch Architecture (Studio Route)',
    shortCode: 'ARCH',
    description:
      'Design for the public realm. Develop your skills as an architect through studio-based learning, technical workshops, and professional practice.',
    faculty: 'Engineering and Environment',
    duration: '18 months (full-time, with placement year)',
    admission:
      'Strong portfolio required. A 2:1 honours degree in architecture or a closely related discipline.',
    euFees: '£20,000',
    nonEuFees: '£32,000',
    accreditation: 'RICS and ARB accredited',
    structure:
      'Studio-based learning across three years, plus technical modules in building services, structures, and sustainability. The placement year provides professional experience.',
    image: '/assets/programmes/architecture.jpg',
    location: 'Bristol, UK',
  },
  {
    id: 'planning',
    title: 'MSc Planning and Regeneration',
    shortCode: 'PLN',
    description:
      'Understand the policies, processes, and practice of urban planning and regeneration. Learn to shape sustainable, inclusive communities.',
    faculty: 'Engineering and Environment',
    duration: '12 months (full-time)',
    admission:
      '2:2 honours degree in a relevant discipline, or equivalent professional experience in planning or related field.',
    euFees: '£15,500',
    nonEuFees: '£26,500',
    accreditation: 'RTPI accredited',
    structure:
      'Core modules include: Planning Theory, Urban Regeneration, Housing Policy, Environmental Policy, and Research Methods. The final project allows you to focus on a specific area of interest.',
    image: '/assets/programmes/planning.jpg',
    location: 'Bristol, UK',
  },
];
