import { motion } from 'framer-motion';
import { Users, BookOpen, Star } from 'lucide-react';

const stats = [
  {
    icon: <Users className="w-8 h-8 text-aguirre-blue-500" />,
    value: '500+',
    label: 'Qualified Teachers',
  },
  {
    icon: <BookOpen className="w-8 h-8 text-aguirre-sky-500" />,
    value: '50+',
    label: 'Subjects Available',
  },
  {
    icon: <Star className="w-8 h-8 text-aguirre-red-500" />,
    value: '4.9',
    label: 'Average Rating',
  },
];

const Stats = () => {
  return (
    <div className="bg-white py-24">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
            >
              <div className="flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mx-auto mb-6">
                {stat.icon}
              </div>
              <h3 className="text-4xl font-bold text-gray-900">{stat.value}</h3>
              <p className="text-gray-500 mt-2">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Stats;