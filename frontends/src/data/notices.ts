export interface Notice {
  id: string;
  title: string;
  content: string;
  date: string;
  status: 'Active' | 'Inactive';
}

export const Notice: Notice[] = [
  {
    id: 'notice-1',
    title: 'Examination Period 2026',
    content: 'The upcoming examination period will run from October 2026. Please check the student portal for timetables and results.',
    date: '2026-08-01',
    status: 'Active',
  },
  {
    id: 'notice-2',
    title: 'Press Release: Research Centre Opening',
    content: 'The Climate Resilience Research Centre will officially open on 15 October 2026. All staff are invited to the opening ceremony.',
    date: '2026-08-15',
    status: 'Active',
  },
  {
    id: 'notice-3',
    title: 'Staff Development Day',
    content: 'A staff development day will be held on 12 November 2026. Please book your place by 30 September.',
    date: '2026-09-01',
    status: 'Inactive',
  },
];
