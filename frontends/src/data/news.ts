import { INews } from 'shared/schema';

export const news: INews[] = [
  {
    id: 'news-1',
    title: 'New Research Centre to Tackle Climate Resilience in the Built Environment',
    summary:
      'The centre will focus on developing innovative solutions for sustainable urban infrastructure.',
    body:
      'The Department of Built Environment is thrilled to announce the opening of the Climate Resilience Research Centre. This new facility will bring together researchers, industry partners, and policymakers to develop innovative solutions for sustainable urban infrastructure in the face of climate change.',
    author: 'Dr. Sarah Thompson',
    category: 'Research',
    image: '/assets/news/resilience-centre.jpg',
    publishedAt: '2026-09-15',
  },
  {
    id: 'news-2',
    title: 'Department wins major grant for sustainable construction project',
    summary:
      'The grant will fund research into low-carbon building materials for the UK construction industry.',
    body:
      'We are delighted to announce that our proposed project on low-carbon building materials has been awarded a major grant. The project aims to reduce the carbon footprint of the UK construction industry by promoting the use of sustainable alternatives to traditional materials.',
    author: 'Prof. James Wilson',
    category: 'Funding',
    image: '/assets/news/grant.jpg',
    publishedAt: '2026-09-10',
  },
  {
    id: 'news-3',
    title: 'Student Showcase: Design for Sustainable Communities',
    summary:
      'A selection of student work from the Sustainable Communities module, exploring innovative housing solutions for urban areas.',
    body:
      'This year\'s Student Showcase highlighted the incredible talent and creativity of our students. The exhibition featured innovative housing solutions for urban areas, exploring how we can design communities that are both sustainable and liveable.',
    author: 'Dr. Emily Carter',
    category: 'Student Achievements',
    image: '/assets/news/student-showcase.jpg',
    publishedAt: '2026-09-05',
  },
];
