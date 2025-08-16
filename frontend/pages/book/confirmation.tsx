import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../src/contexts/AuthContext';
import Navbar from '../../components/UI/Navbar';
import { Button } from '../../src/components/UI/Button';
import { Card } from '../../src/components/UI/Card';
import supabase, { isValidConfig } from '../../src/utils/supabaseClient';
import { mockTeachers } from '../../src/data/mockTeachers';
import { 
  CheckCircle, 
  Calendar, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  BookOpen, 
  MessageSquare, 
  Home, 
  Download,
  Share2
} from 'lucide-react';

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

interface Booking {
  id: string;
  teacherId: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  requestedTime: string;
  durationMinutes: number;
  subject: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  totalCost: number;
  createdAt: string;
}

export default function BookingConfirmationPage() {
  const router = useRouter();
  const { bookingId, teacherId, date, time } = router.query;
  const { user } = useAuth();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!teacherId) return;

    async function fetchData() {
      try {
        setLoading(true);

        // Fetch teacher data
        let teacherData: Teacher | null = null;
        if (!isValidConfig) {
          // Use mock data when Supabase is not configured
          teacherData = mockTeachers.find(t => t.id === teacherId) || null;
        } else {
          const { data: teacherResult, error: teacherError } = await supabase
            .from('teachers')
            .select('*')
            .eq('id', teacherId)
            .single();

          if (teacherError) {
            console.error('Error fetching teacher:', teacherError);
            // Fallback to mock data
            teacherData = mockTeachers.find(t => t.id === teacherId) || null;
          } else {
            teacherData = teacherResult;
          }
        }

        if (!teacherData) {
          setError('Teacher not found');
          return;
        }
        setTeacher(teacherData);

        // Fetch booking data if bookingId is provided
        if (bookingId && isValidConfig) {
          const { data: bookingResult, error: bookingError } = await supabase
            .from('bookings')
            .select('*')
            .eq('id', bookingId)
            .single();

          if (bookingError) {
            console.error('Error fetching booking:', bookingError);
            // Create mock booking data
            createMockBooking(teacherData);
          } else {
            setBooking(bookingResult);
          }
        } else {
          // Create mock booking data when no bookingId or Supabase not configured
          createMockBooking(teacherData);
        }
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError('Failed to load booking information');
      } finally {
        setLoading(false);
      }
    }

    function createMockBooking(teacherData: Teacher) {
      const mockBooking: Booking = {
        id: bookingId as string || 'mock-booking-' + Date.now(),
        teacherId: teacherId as string,
        studentName: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Student',
        studentEmail: user?.email || 'student@example.com',
        studentPhone: '+1234567890',
        requestedTime: date && time ? `${date}T${time}:00.000Z` : new Date().toISOString(),
        durationMinutes: 60,
        subject: teacherData.subjects?.[0] || 'General',
        notes: 'Mock booking for demonstration',
        status: 'confirmed',
        totalCost: teacherData.hourly_rate,
        createdAt: new Date().toISOString()
      };
      setBooking(mockBooking);
    }

    fetchData();
  }, [bookingId, teacherId, date, time, user]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleDownloadReceipt = () => {
    if (!booking || !teacher) return;
    
    // Create a simple text receipt
    const receipt = `
QINDIL BOOKING CONFIRMATION
============================

Booking ID: ${booking.id}
Date: ${formatDate(booking.requestedTime)}
Time: ${formatTime(booking.requestedTime)}
Duration: ${booking.durationMinutes} minutes

Teacher: ${teacher.name}
Subject: ${booking.subject}
Student: ${booking.studentName}
Email: ${booking.studentEmail}
Phone: ${booking.studentPhone}

Total Cost: $${booking.totalCost.toFixed(2)}
Status: ${booking.status.toUpperCase()}

Notes: ${booking.notes || 'None'}

Thank you for choosing Qindil!
`;
    
    const blob = new Blob([receipt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qindil-booking-${booking.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    if (!booking || !teacher) return;
    
    const shareData = {
      title: 'Qindil Booking Confirmation',
      text: `I've booked a session with ${teacher.name} on ${formatDate(booking.requestedTime)} at ${formatTime(booking.requestedTime)}`,
      url: window.location.href
    };
    
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      const text = `${shareData.text} - ${shareData.url}`;
      navigator.clipboard.writeText(text).then(() => {
        alert('Booking details copied to clipboard!');
      });
    }
  };

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

  if (error || !booking || !teacher) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Booking Not Found</h1>
            <p className="text-gray-600 mb-6">{error || 'Unable to load booking information'}</p>
            <Button onClick={() => router.push('/')}>
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
          <p className="text-gray-600 text-lg">Your session has been successfully booked</p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Booking Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Session Information */}
              <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Session Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-blue-600 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Date</p>
                      <p className="font-semibold">{formatDate(booking.requestedTime)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-blue-600 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Time</p>
                      <p className="font-semibold">{formatTime(booking.requestedTime)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <BookOpen className="w-5 h-5 text-blue-600 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Subject</p>
                      <p className="font-semibold">{booking.subject}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-blue-600 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Duration</p>
                      <p className="font-semibold">{booking.durationMinutes} minutes</p>
                    </div>
                  </div>
                </div>
                
                {booking.notes && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-gray-600 mb-1">Notes</p>
                    <p className="text-gray-900">{booking.notes}</p>
                  </div>
                )}
              </Card>

              {/* Student Information */}
              <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Student Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <User className="w-5 h-5 text-blue-600 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-semibold">{booking.studentName}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Mail className="w-5 h-5 text-blue-600 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-semibold">{booking.studentEmail}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 text-blue-600 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-semibold">{booking.studentPhone}</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Next Steps */}
              <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">What's Next?</h2>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-blue-600 font-semibold text-sm">1</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Confirmation Email</h3>
                      <p className="text-gray-600 text-sm">You'll receive a confirmation email with session details and meeting link.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-blue-600 font-semibold text-sm">2</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Teacher Contact</h3>
                      <p className="text-gray-600 text-sm">Your teacher may reach out to discuss session goals and materials.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-blue-600 font-semibold text-sm">3</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Join Session</h3>
                      <p className="text-gray-600 text-sm">Join your session at the scheduled time using the provided link.</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Teacher Info & Actions */}
            <div className="lg:col-span-1 space-y-6">
              {/* Teacher Card */}
              <Card className="p-6">
                <div className="text-center mb-4">
                  <img
                    src={teacher.avatar || 'https://via.placeholder.com/150'}
                    alt={teacher.name}
                    className="w-20 h-20 rounded-full mx-auto mb-3 object-cover"
                  />
                  <h3 className="text-lg font-bold text-gray-900">{teacher.name}</h3>
                  <div className="flex items-center justify-center mt-1">
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
                
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm mb-1">Subjects</h4>
                    <div className="flex flex-wrap gap-1">
                      {teacher.subjects?.map(subject => (
                        <span key={subject} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          {subject}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm mb-1">Languages</h4>
                    <div className="flex flex-wrap gap-1">
                      {teacher.languages?.map(language => (
                        <span key={language} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                          {language}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Booking Summary */}
              <Card className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Booking Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Booking ID:</span>
                    <span className="font-mono text-sm">{booking.id.slice(0, 8)}...</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span>{booking.durationMinutes} minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rate:</span>
                    <span>${teacher.hourly_rate}/hour</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span className="text-blue-600">${booking.totalCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded capitalize">
                      {booking.status}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button 
                  onClick={handleDownloadReceipt}
                  variant="outline"
                  className="w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Receipt
                </Button>
                
                <Button 
                  onClick={handleShare}
                  variant="outline"
                  className="w-full"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Booking
                </Button>
                
                <Button 
                  onClick={() => router.push('/proxy/' + booking.id)}
                  className="w-full"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Message Teacher
                </Button>
                
                <Button 
                  onClick={() => router.push('/')}
                  variant="outline"
                  className="w-full"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}