export type Category = 'towers' | 'commercial' | 'offices' | 'villas' | 'synagogues';

export interface CategoryInfo {
  key: Category;
  label: string;
  slug: string;
  /** path on the old Wix site, used for 301 redirects */
  oldPath: string;
  intro: string;
}

export const CATEGORIES: CategoryInfo[] = [
  { key: 'towers', label: 'מגדלים ומגורים', slug: 'towers', oldPath: '/מגדלים',
    intro: 'מגדלי מגורים, בנייה רוויה ושכונות מגורים ברחבי הארץ, כולל פרויקטים של התחדשות עירונית.' },
  { key: 'commercial', label: 'מסחר', slug: 'commercial', oldPath: '/מסחר',
    intro: 'מרכזי מסחר ופנאי, מבנים לשימוש מעורב ובתי מלון.' },
  { key: 'offices', label: 'משרדים', slug: 'offices', oldPath: '/משרדים',
    intro: 'בנייני משרדים ומבני תעסוקה, מהמעטפת ועד תכנון החללים הפנימיים.' },
  { key: 'villas', label: 'וילות', slug: 'villas', oldPath: '/וילות',
    intro: 'בתים פרטיים ווילות בתכנון אישי, המותאם לכל משפחה ולכל מגרש.' },
  { key: 'synagogues', label: 'בתי כנסת', slug: 'synagogues', oldPath: '/copy-of-משרדים',
    intro: 'בתי כנסת ומבני ציבור, המשלבים מסורת עם שפה אדריכלית עכשווית.' },
];

export const categoryByKey = (key: string) => CATEGORIES.find((c) => c.key === key);
