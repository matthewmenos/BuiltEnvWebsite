export interface IAdminData {
  name: string;
  value: string;
  date: string;
  status: 'All' | 'Active' | 'Inactive';
}

export const adminDashboardData: IAdminData[] = [
  { name: 'Total Programmes', value: '4', date: 'Sep 2026', status: 'Active' },
  { name: 'Total News Articles', value: '12', date: 'Sep 2026', status: 'Active' },
  { name: 'Upcoming Events', value: '8', date: 'Sep 2026', status: 'Active' },
  { name: 'Staff Members', value: '35', date: 'Sep 2026', status: 'Active' },
  { name: 'Gallery Images', value: '4', date: 'Sep 2026', status: 'Active' },
  { name: 'Notices', value: '6', date: 'Sep 2026', status: 'Active' },
  { name: 'Contacts', value: '3', date: 'Sep 2026', status: 'Active' },
  { name: 'Submitted Files', value: '12', date: 'Sep 2026', status: 'Active' },
];
