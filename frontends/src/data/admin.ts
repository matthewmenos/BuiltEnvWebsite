export interface IAdminData {
  name: string;
  value: string;
  date: string;
  status: 'All' | 'Active' | 'Inactive';
  trend?: string;
}

export const adminDashboardData: IAdminData[] = [
  { name: 'Total Programmes', value: '4', date: 'Sep 2026', status: 'Active', trend: '+1 this month' },
  { name: 'Total News Articles', value: '12', date: 'Sep 2026', status: 'Active', trend: '+2 this month' },
  { name: 'Upcoming Events', value: '8', date: 'Sep 2026', status: 'Active', trend: '+1 this month' },
  { name: 'Staff Members', value: '35', date: 'Sep 2026', status: 'Active', trend: '0 this month' },
  { name: 'Gallery Images', value: '4', date: 'Sep 2026', status: 'Active', trend: '+1 this month' },
  { name: 'Notices', value: '6', date: 'Sep 2026', status: 'Active', trend: '0 this month' },
  { name: 'Contacts', value: '3', date: 'Sep 2026', status: 'Active', trend: '0 this month' },
  { name: 'Submitted Files', value: '12', date: 'Sep 2026', status: 'Active', trend: '+2 this month' },
];
