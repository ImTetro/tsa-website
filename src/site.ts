import { CATEGORIES } from './lib/categories';

export const SITE = {
  name: 'טטרו שחר אדריכלים בע״מ',
  shortName: 'טטרו שחר אדריכלים',
  url: 'https://www.tsa.co.il',
  phones: ['09-8820022', '09-8871126'],
  address: 'אוסישקין 40, נתניה',
  wazeUrl: 'https://waze.com/ul?q=' + encodeURIComponent('אוסישקין 40 נתניה') + '&navigate=yes',
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('אוסישקין 40 נתניה'),
  /** fill in to show WhatsApp buttons, digits only with country code, e.g. 972501234567 */
  whatsapp: '',
  /** fill in to show an email link */
  email: '',
  founded: 1978,
};

export const tel = (p: string) => 'tel:' + p.replace(/\D/g, '');

export interface NavItem { label: string; href: string; children?: NavItem[] }

export const NAV: NavItem[] = [
  {
    label: 'פרויקטים', href: '/projects',
    children: [
      { label: 'כל הפרויקטים', href: '/projects' },
      ...CATEGORIES.map((c) => ({ label: c.label, href: `/projects/${c.slug}` })),
    ],
  },
  { label: 'התחדשות עירונית', href: '/urban-renewal' },
  { label: 'אודות', href: '/about' },
  { label: 'הצוות', href: '/team' },
  { label: 'לקוחות', href: '/clients' },
  { label: 'צור קשר', href: '/contact' },
];

/** old Wix paths → new paths (301) */
export const OLD_URLS: [string, string][] = [
  ['/home', '/'],
  ['/meet-the-team', '/team'],
  ['/copy-of-התחדשות-עירונית', '/urban-renewal'],
  ...CATEGORIES.map((c) => [c.oldPath, `/projects/${c.slug}`] as [string, string]),
];
