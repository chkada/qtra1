/**
 * Mock data for teachers to be used in development
 */
export interface Teacher {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  currency: string;
  subjects: string[];
  languages: string[];
  education: string;
  experience: number; // years
  bio: string;
  availability: {
    days: string[];
    hours: string[];
  };
  location: string;
  featured?: boolean;
}

const mockTeachers: Teacher[] = [
  {
    id: '1',
    name: 'Ahmed Hassan',
    avatar: '/assets/teachers/teacher1.jpg',
    rating: 4.8,
    reviewCount: 124,
    hourlyRate: 35,
    currency: 'USD',
    subjects: ['Mathematics', 'Physics'],
    languages: ['Arabic', 'English'],
    education: 'PhD in Mathematics, Cairo University',
    experience: 8,
    bio: 'Experienced mathematics and physics teacher with a passion for making complex concepts easy to understand. I specialize in preparing students for university entrance exams.',
    availability: {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      hours: ['9:00 AM - 12:00 PM', '2:00 PM - 6:00 PM'],
    },
    location: 'Cairo, Egypt',
    featured: true,
  },
  {
    id: '2',
    name: 'Fatima Al-Zahrawi',
    avatar: '/assets/teachers/teacher2.jpg',
    rating: 4.9,
    reviewCount: 89,
    hourlyRate: 40,
    currency: 'USD',
    subjects: ['Chemistry', 'Biology'],
    languages: ['Arabic', 'English', 'French'],
    education: 'MSc in Biochemistry, Alexandria University',
    experience: 6,
    bio: 'Dedicated science teacher with experience in both high school and university level education. I focus on practical applications and real-world examples.',
    availability: {
      days: ['Monday', 'Wednesday', 'Friday', 'Saturday'],
      hours: ['10:00 AM - 2:00 PM', '4:00 PM - 8:00 PM'],
    },
    location: 'Alexandria, Egypt',
  },
  {
    id: '3',
    name: 'Omar Khalid',
    avatar: '/assets/teachers/teacher3.jpg',
    rating: 4.7,
    reviewCount: 56,
    hourlyRate: 30,
    currency: 'USD',
    subjects: ['Arabic Literature', 'Islamic Studies'],
    languages: ['Arabic', 'English'],
    education: 'BA in Arabic Literature, Al-Azhar University',
    experience: 10,
    bio: 'Passionate about Arabic language and literature. I help students appreciate the beauty and depth of Arabic texts while improving their language skills.',
    availability: {
      days: ['Sunday', 'Tuesday', 'Thursday', 'Saturday'],
      hours: ['9:00 AM - 1:00 PM', '3:00 PM - 7:00 PM'],
    },
    location: 'Riyadh, Saudi Arabia',
  },
  {
    id: '4',
    name: 'Layla Mahmoud',
    avatar: '/assets/teachers/teacher4.jpg',
    rating: 4.6,
    reviewCount: 78,
    hourlyRate: 38,
    currency: 'USD',
    subjects: ['Computer Science', 'Programming'],
    languages: ['Arabic', 'English'],
    education: 'MSc in Computer Science, American University in Cairo',
    experience: 5,
    bio: 'Software engineer turned educator. I teach programming languages, algorithms, and computer science fundamentals with a hands-on approach.',
    availability: {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'],
      hours: ['11:00 AM - 3:00 PM', '5:00 PM - 9:00 PM'],
    },
    location: 'Dubai, UAE',
    featured: true,
  },
  {
    id: '5',
    name: 'Youssef Nabil',
    avatar: '/assets/teachers/teacher5.jpg',
    rating: 4.9,
    reviewCount: 112,
    hourlyRate: 45,
    currency: 'USD',
    subjects: ['History', 'Geography'],
    languages: ['Arabic', 'English', 'German'],
    education: 'PhD in Middle Eastern History, University of Jordan',
    experience: 12,
    bio: 'History professor with extensive knowledge of Middle Eastern and European history. I make historical events come alive through storytelling and analysis.',
    availability: {
      days: ['Monday', 'Wednesday', 'Friday', 'Sunday'],
      hours: ['8:00 AM - 12:00 PM', '2:00 PM - 6:00 PM'],
    },
    location: 'Amman, Jordan',
  },
  {
    id: '6',
    name: 'Nour Al-Salem',
    avatar: '/assets/teachers/teacher6.jpg',
    rating: 4.7,
    reviewCount: 65,
    hourlyRate: 32,
    currency: 'USD',
    subjects: ['English Language', 'Literature'],
    languages: ['Arabic', 'English', 'Spanish'],
    education: 'MA in English Literature, Lebanese American University',
    experience: 7,
    bio: 'English language specialist with experience teaching students of all levels. I focus on communication skills, grammar, and literary analysis.',
    availability: {
      days: ['Tuesday', 'Thursday', 'Saturday', 'Sunday'],
      hours: ['10:00 AM - 2:00 PM', '4:00 PM - 8:00 PM'],
    },
    location: 'Beirut, Lebanon',
  },
  {
    id: '7',
    name: 'Karim Mostafa',
    avatar: '/assets/teachers/teacher7.jpg',
    rating: 4.8,
    reviewCount: 94,
    hourlyRate: 37,
    currency: 'USD',
    subjects: ['Economics', 'Business Studies'],
    languages: ['Arabic', 'English', 'French'],
    education: 'MBA, INSEAD',
    experience: 9,
    bio: 'Business professional and educator specializing in economics, finance, and business strategy. I bring real-world experience to my teaching.',
    availability: {
      days: ['Monday', 'Wednesday', 'Friday'],
      hours: ['9:00 AM - 1:00 PM', '5:00 PM - 9:00 PM'],
    },
    location: 'Doha, Qatar',
    featured: true,
  },
  {
    id: '8',
    name: 'Samira Al-Farsi',
    avatar: '/assets/teachers/teacher8.jpg',
    rating: 4.9,
    reviewCount: 76,
    hourlyRate: 42,
    currency: 'USD',
    subjects: ['Art', 'Design'],
    languages: ['Arabic', 'English', 'Italian'],
    education: 'BFA in Fine Arts, Parsons School of Design',
    experience: 8,
    bio: 'Artist and designer teaching traditional and digital art techniques. I help students develop their creative voice and technical skills.',
    availability: {
      days: ['Tuesday', 'Thursday', 'Saturday', 'Sunday'],
      hours: ['11:00 AM - 3:00 PM', '4:00 PM - 8:00 PM'],
    },
    location: 'Abu Dhabi, UAE',
  },
];

export default mockTeachers;
