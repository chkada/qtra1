import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../src/contexts/AuthContext';
import Navbar from '../../components/UI/Navbar';
import { Button } from '../../src/components/UI/Button';
import { Input } from '../../src/components/UI/Input';
import supabase, { isValidConfig } from '../../src/utils/supabaseClient';
import mockTeachers from '../../src/data/mockTeachers';
import { Calendar, Clock, User, Mail, Phone, CreditCard, ArrowLeft, Check } from 'lucide-react';

interface Teacher {
  id: string;
  name: string;
  avatar?: string;
  hourly_rate: number;
  subjects: string[];
  languages: string[];
  bio: string;
  rating: number;
}

interface BookingFormData {
  date: string;
  time: string;
  duration: number;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  subject: string;
  notes: string;
}

export default function BookingFormPage() {
  const router = useRouter();
  const { teacherId } = router.query;
  const { user } = useAuth();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<BookingFormData>({
    date: '',
    time: '',
    duration: 60,
    studentName: '',
    studentEmail: '',
    studentPhone: '',
    subject: '',
    notes: ''
  });

  useEffect(() => {
    if (!teacherId) return;

    async function fetchTeacher() {
      try {
        setLoading(true);

        if (!isValidConfig) {
          // Use mock data when Supabase is not configured
          const mockTeacher = mockTeachers.find(t => t.id === teacherId);
          if (mockTeacher) {
            setTeacher(mockTeacher);
          } else {
            setError('Teacher not found');
          }
          return;
        }

        const { data, error } = await supabase
          .from('teachers')
          .select('*')
          .eq('id', teacherId)
          .single();

        if (error) throw error;
        setTeacher(data);
      } catch (err: any) {
        console.error('Error fetching teacher:', err);
        // Fallback to mock data
        const mockTeacher = mockTeachers.find(t => t.id === teacherId);
        if (mockTeacher) {
          setTeacher(mockTeacher);
        } else {
          setError('Teacher not found');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchTeacher();
  }, [teacherId]);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        studentName: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
        studentEmail: user.email || ''
      }));
    }
  }, [user]);

  const handleInputChange = (field: keyof BookingFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): string | null => {
    if (!formData.date) return 'Please select a date';
    if (!formData.time) return 'Please select a time';
    if (!formData.studentName.trim()) return 'Please enter your name';
    if (!formData.studentEmail.trim()) return 'Please enter your email';
    if (!formData.studentPhone.trim()) return 'Please enter your phone number';
    if (!formData.subject) return 'Please select a subject';
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.studentEmail)) {
      return 'Please enter a valid email address';
    }
    
    // Validate phone format (basic)
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(formData.studentPhone.replace(/[\s\-\(\)]/g, ''))) {
      return 'Please enter a valid phone number';
    }
    
    // Validate date is in the future
    const selectedDateTime = new Date(`${formData.date}T${formData.time}`);
    const now = new Date();
    if (selectedDateTime <= now) {
      return 'Please select a future date and time';
    }
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    if (!user) {
      router.push('/login?redirect=' + router.asPath);
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      const requestedTime = new Date(`${formData.date}T${formData.time}`);
      
      if (!isValidConfig) {
        // Mock booking success
        console.warn('Mock booking created - Supabase not configured');
        // Redirect to confirmation page
        router.push(`/book/confirmation?teacherId=${teacherId}&date=${formData.date}&time=${formData.time}`);
        return;
      }
      
      // Create booking via API
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teacherId,
          studentName: formData.studentName,
          studentPhone: formData.studentPhone,
          studentEmail: formData.studentEmail,
          requestedTime: requestedTime.toISOString(),
          durationMinutes: formData.duration,
          subject: formData.subject,
          notes: formData.notes
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create booking');
      }
      
      const result = await response.json();
      
      // Redirect to confirmation page
      router.push(`/book/confirmation?bookingId=${result.bookingId}&teacherId=${teacherId}`);
      
    } catch (err: any) {
      console.error('Error creating booking:', err);
      setError(err.message || 'Failed to create booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Generate time slots (9 AM to 9 PM)
  const timeSlots = [];
  for (let hour = 9; hour <= 21; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    if (hour < 21) {
      timeSlots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
  }

  // Get minimum date (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  // Get maximum date (3 months from now)
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 3);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !teacher) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Teacher Not Found</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => router.push('/teachers')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Teachers
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!teacher) return null;

  const totalCost = (teacher.hourly_rate * formData.duration) / 60;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Book a Session</h1>
          <p className="text-gray-600">Schedule your learning session with {teacher.name}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Teacher Info Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
              <div className="text-center mb-6">
                <img
                  src={teacher.avatar || 'https://via.placeholder.com/150'}
                  alt={teacher.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="text-xl font-bold text-gray-900">{teacher.name}</h3>
                <div className="flex items-center justify-center mt-2">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className={`w-4 h-4 ${i < Math.floor(teacher.rating) ? 'fill-current' : 'text-gray-300'}`} viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-gray-600">({teacher.rating})</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Subjects</h4>
                  <div className="flex flex-wrap gap-2">
                    {teacher.subjects?.map(subject => (
                      <span key={subject} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Languages</h4>
                  <div className="flex flex-wrap gap-2">
                    {teacher.languages?.map(language => (
                      <span key={language} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                        {language}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Hourly Rate:</span>
                    <span className="font-bold text-lg">${teacher.hourly_rate}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-semibold">{formData.duration} minutes</span>
                  </div>
                  <div className="flex justify-between items-center text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span className="text-blue-600">${totalCost.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-700">{error}</p>
                  </div>
                )}
                
                {/* Date and Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-2" />
                      Date
                    </label>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleInputChange('date', e.target.value)}
                      min={minDate}
                      max={maxDateStr}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Clock className="w-4 h-4 inline mr-2" />
                      Time
                    </label>
                    <select
                      value={formData.time}
                      onChange={(e) => handleInputChange('time', e.target.value)}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select time</option>
                      {timeSlots.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration
                  </label>
                  <select
                    value={formData.duration.toString()}
                    onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="90">1.5 hours</option>
                    <option value="120">2 hours</option>
                  </select>
                </div>

                {/* Student Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                    Student Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <User className="w-4 h-4 inline mr-2" />
                        Full Name
                      </label>
                      <Input
                        type="text"
                        value={formData.studentName}
                        onChange={(e) => handleInputChange('studentName', e.target.value)}
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Mail className="w-4 h-4 inline mr-2" />
                        Email
                      </label>
                      <Input
                        type="email"
                        value={formData.studentEmail}
                        onChange={(e) => handleInputChange('studentEmail', e.target.value)}
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="w-4 h-4 inline mr-2" />
                      Phone Number
                    </label>
                    <Input
                      type="tel"
                      value={formData.studentPhone}
                      onChange={(e) => handleInputChange('studentPhone', e.target.value)}
                      placeholder="Enter your phone number"
                      required
                    />
                  </div>
                </div>

                {/* Subject and Notes */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select a subject</option>
                      {teacher.subjects?.map(subject => (
                        <option key={subject} value={subject}>{subject}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Notes (Optional)
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      placeholder="Any specific topics or requirements you'd like to discuss..."
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-6">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 text-lg"
                    size="lg"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5 mr-2" />
                        Book Session - ${totalCost.toFixed(2)}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}