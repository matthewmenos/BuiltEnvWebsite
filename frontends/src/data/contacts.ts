export interface Contact {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  date: string;
  status: 'New' | 'Read' | 'Replied';
}

export const Contact: Contact[] = [
  {
    id: 'contact-1',
    name: 'Anna Mitchell',
    email: 'anna.mitchell@gmail.com',
    subject: 'Programme Enquiry',
    message: 'Hello, I would like to know more about the MSc Quantity Surveying programme.',
    date: '2026-08-20',
    status: 'New',
  },
  {
    id: 'contact-2',
    name: 'James Wilson',
    email: 'j.wilson@company.co.uk',
    subject: 'Industry Partnership',
    message: 'I would like to discuss potential collaboration opportunities with the department.',
    date: '2026-08-15',
    status: 'Read',
  },
  {
    id: 'contact-3',
    name: 'Elena Rossi',
    email: 'elena.rossi@email.com',
    subject: 'Media Inquiry',
    message: 'We would like to interview a professor for our article on sustainable construction.',
    date: '2026-08-10',
    status: 'Replied',
  },
];
