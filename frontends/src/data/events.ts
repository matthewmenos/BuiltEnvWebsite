import { IEvent } from 'shared/schema';

export const events: IEvent[] = [
  {
    id: 'ev-1',
    title: '2026 Sustainable Construction Conference',
    description:
      'Join us for a two-day conference exploring the latest innovations in sustainable construction, featuring keynotes from industry leaders and expert panels.',
    location: 'University of Bristol, Engineering Building',
    startTime: '2026-10-15T09:00:00',
    endTime: '2026-10-16T17:00:00',
    category: 'Conference',
    image: '/assets/events/sustainable-construction.jpg',
  },
  {
    id: 'ev-2',
    title: 'Guest Lecture: The Future of Urban Design',
    description:
      'Dr. James Carter will explore the role of technology in shaping the cities of tomorrow.',
    location: 'Bristol, UK',
    startTime: '2026-11-03T16:00:00',
    endTime: '2026-11-03T18:00:00',
    category: 'Lecture',
    image: '/assets/events/urban-design.jpg',
  },
  {
    id: 'ev-3',
    title: 'Workshop: Introduction to Building Information Modeling (BIM)',
    description:
      'A practical workshop for students learning the fundamentals of BIM software and workflows.',
    location: 'Bristol, UK',
    startTime: '2026-10-28T10:00:00',
    endTime: '2026-10-28T16:00:00',
    category: 'Workshop',
    image: '/assets/events/bim-workshop.jpg',
  },
  {
    id: 'ev-4',
    title: 'Postgraduate Research Symposium',
    description:
      'An opportunity for postgraduate researchers to present their work and network with peers and academics.',
    location: 'University of Bristol, Conference Centre',
    startTime: '2026-12-10T09:00:00',
    endTime: '2026-12-10T17:00:00',
    category: 'Conference',
    image: '/assets/events/postgrad-symposium.jpg',
  },
];
