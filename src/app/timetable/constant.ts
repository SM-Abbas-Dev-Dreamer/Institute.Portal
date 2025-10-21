
import { Day, Subject, TimetableData } from './types';

// Define Subjects with Tailwind CSS color classes
const SUBJECTS: { [key: string]: Subject } = {
  MATH: { name: 'Mathematics', teacher: 'Mr. Armstrong', colorClasses: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-200 dark:border-blue-800' },
  SCIENCE: { name: 'Science', teacher: 'Ms. Curie', colorClasses: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-200 dark:border-green-800' },
  HISTORY: { name: 'History', teacher: 'Mr. Jones', colorClasses: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-200 dark:border-yellow-800' },
  ENGLISH: { name: 'English', teacher: 'Ms. Austen', colorClasses: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/50 dark:text-purple-200 dark:border-purple-800' },
  ART: { name: 'Art', teacher: 'Mrs. O\'Keeffe', colorClasses: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-200 dark:border-red-800' },
  PE: { name: 'P.E.', teacher: 'Coach Thompson', colorClasses: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/50 dark:text-orange-200 dark:border-orange-800' },
  LUNCH: { name: 'Lunch Break', teacher: '', colorClasses: 'bg-slate-200 text-slate-600 border-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600' }
};

// Define Time Headers
export const timeHeaders: string[] = [
  '09:00 - 10:00',
  '10:00 - 11:00',
  '11:00 - 12:00',
  '12:00 - 13:00',
  '13:00 - 14:00',
  '14:00 - 15:00',
];

// Define the Timetable Data
export const timetableData: TimetableData = {
  [Day.Monday]: [
    { subject: SUBJECTS.MATH },
    { subject: SUBJECTS.SCIENCE },
    { subject: SUBJECTS.ENGLISH },
    { subject: SUBJECTS.LUNCH },
    { subject: SUBJECTS.HISTORY },
    { subject: SUBJECTS.PE },
  ],
  [Day.Tuesday]: [
    { subject: SUBJECTS.ENGLISH },
    { subject: SUBJECTS.MATH },
    { subject: SUBJECTS.HISTORY },
    { subject: SUBJECTS.LUNCH },
    { subject: SUBJECTS.SCIENCE },
    { subject: SUBJECTS.ART },
  ],
  [Day.Wednesday]: [
    { subject: SUBJECTS.SCIENCE },
    { subject: SUBJECTS.PE },
    { subject: SUBJECTS.MATH },
    { subject: SUBJECTS.LUNCH },
    { subject: SUBJECTS.ENGLISH },
    { subject: SUBJECTS.HISTORY },
  ],
  [Day.Thursday]: [
    { subject: SUBJECTS.HISTORY },
    { subject: SUBJECTS.ENGLISH },
    { subject: SUBJECTS.ART },
    { subject: SUBJECTS.LUNCH },
    { subject: SUBJECTS.MATH },
    { subject: SUBJECTS.SCIENCE },
  ],
  [Day.Friday]: [
    { subject: SUBJECTS.PE },
    { subject: SUBJECTS.HISTORY },
    { subject: SUBJECTS.SCIENCE },
    { subject: SUBJECTS.LUNCH },
    { subject: SUBJECTS.ENGLISH },
    { subject: SUBJECTS.MATH },
  ],
};
