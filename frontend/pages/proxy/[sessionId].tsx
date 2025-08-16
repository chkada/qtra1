import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../src/contexts/AuthContext';
import Navbar from '../../components/UI/Navbar';
import { Button } from '../../src/components/UI/Button';
import { Input } from '../../src/components/UI/Input';
import { Card } from '../../src/components/UI/Card';
import supabase, { isValidConfig } from '../../src/utils/supabaseClient';
import { mockTeachers } from '../../src/data/mockTeachers';
import { 
  Send, 
  Paperclip, 
  Smile, 
  Phone, 
  Video, 
  MoreVertical, 
  ArrowLeft,
  User,
  Clock,
  CheckCheck,
  Check,
  AlertCircle,
  FileText,
  Image as ImageIcon,
  Download
} from 'lucide-react';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderType: 'teacher' | 'student';
  content: string;
  type: 'text' | 'file' | 'image';
  timestamp: string;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  fileUrl?: string;
  fileName?: string;
}

interface ProxySession {
  id: string;
  bookingId: string;
  teacherId: string;
  studentId: string;
  teacherName: string;
  studentName: string;
  status: 'active' | 'ended' | 'scheduled';
  startTime: string;
  endTime?: string;
  subject: string;
}

interface Teacher {
  id: string;
  name: string;
  avatar?: string;
  subjects: string[];
  rating: number;
}

export default function ProxyMessagingPage() {
  const router = useRouter();
  const { sessionId } = router.query;
  const { user } = useAuth();
  const [session, setSession] = useState<ProxySession | null>(null);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock data for demonstration
  const mockMessages: Message[] = [
    {
      id: '1',
      senderId: 'teacher-1',
      senderName: 'Dr. Sarah Johnson',
      senderType: 'teacher',
      content: 'Hello! I\'m excited to work with you today. Have you prepared any specific questions about mathematics?',
      type: 'text',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      status: 'read'
    },
    {
      id: '2',
      senderId: 'student-1',
      senderName: 'Student',
      senderType: 'student',
      content: 'Hi Dr. Johnson! Yes, I\'m struggling with calculus derivatives. Could we go over some examples?',
      type: 'text',
      timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
      status: 'read'
    },
    {
      id: '3',
      senderId: 'teacher-1',
      senderName: 'Dr. Sarah Johnson',
      senderType: 'teacher',
      content: 'Absolutely! Let me share a worksheet with some practice problems.',
      type: 'text',
      timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
      status: 'read'
    },
    {
      id: '4',
      senderId: 'teacher-1',
      senderName: 'Dr. Sarah Johnson',
      senderType: 'teacher',
      content: 'calculus-derivatives-worksheet.pdf',
      type: 'file',
      timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
      status: 'read',
      fileName: 'calculus-derivatives-worksheet.pdf',
      fileUrl: '#'
    },
    {
      id: '5',
      senderId: 'student-1',
      senderName: 'Student',
      senderType: 'student',
      content: 'Thank you! This looks very helpful. Should we start with problem 1?',
      type: 'text',
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      status: 'read'
    }
  ];

  useEffect(() => {
    if (!sessionId) return;

    async function fetchSessionData() {
      try {
        setLoading(true);

        if (!isValidConfig) {
          // Use mock data when Supabase is not configured
          const mockTeacher = mockTeachers[0];
          setTeacher(mockTeacher);
          
          const mockSession: ProxySession = {
            id: sessionId as string,
            bookingId: 'booking-1',
            teacherId: mockTeacher.id,
            studentId: user?.id || 'student-1',
            teacherName: mockTeacher.name,
            studentName: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Student',
            status: 'active',
            startTime: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            subject: 'Mathematics'
          };
          setSession(mockSession);
          setMessages(mockMessages);
          return;
        }

        // Fetch session data from Supabase
        const { data: sessionData, error: sessionError } = await supabase
          .from('proxy_sessions')
          .select('*')
          .eq('id', sessionId)
          .single();

        if (sessionError) throw sessionError;
        setSession(sessionData);

        // Fetch teacher data
        const { data: teacherData, error: teacherError } = await supabase
          .from('teachers')
          .select('*')
          .eq('id', sessionData.teacherId)
          .single();

        if (teacherError) {
          // Fallback to mock teacher
          setTeacher(mockTeachers[0]);
        } else {
          setTeacher(teacherData);
        }

        // Fetch messages
        const { data: messagesData, error: messagesError } = await supabase
          .from('proxy_messages')
          .select('*')
          .eq('sessionId', sessionId)
          .order('timestamp', { ascending: true });

        if (messagesError) {
          console.error('Error fetching messages:', messagesError);
          setMessages(mockMessages);
        } else {
          setMessages(messagesData || []);
        }

      } catch (err: any) {
        console.error('Error fetching session data:', err);
        setError('Failed to load session data');
        // Fallback to mock data
        setTeacher(mockTeachers[0]);
        setMessages(mockMessages);
      } finally {
        setLoading(false);
      }
    }

    fetchSessionData();
  }, [sessionId, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending || !session || !user) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    setSending(true);

    const tempMessage: Message = {
      id: 'temp-' + Date.now(),
      senderId: user.id,
      senderName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'You',
      senderType: 'student',
      content: messageContent,
      type: 'text',
      timestamp: new Date().toISOString(),
      status: 'sending'
    };

    setMessages(prev => [...prev, tempMessage]);

    try {
      if (!isValidConfig) {
        // Mock sending success
        setTimeout(() => {
          setMessages(prev => prev.map(msg => 
            msg.id === tempMessage.id 
              ? { ...msg, id: 'msg-' + Date.now(), status: 'sent' }
              : msg
          ));
          
          // Simulate teacher typing and response
          setTimeout(() => {
            setIsTyping(true);
            setTimeout(() => {
              setIsTyping(false);
              const teacherResponse: Message = {
                id: 'response-' + Date.now(),
                senderId: session.teacherId,
                senderName: session.teacherName,
                senderType: 'teacher',
                content: 'Great question! Let me explain that concept in detail.',
                type: 'text',
                timestamp: new Date().toISOString(),
                status: 'sent'
              };
              setMessages(prev => [...prev, teacherResponse]);
            }, 2000);
          }, 1000);
        }, 1000);
        return;
      }

      // Send message via API
      const response = await fetch('/api/proxy/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          content: messageContent,
          type: 'text'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const result = await response.json();
      
      // Update message with real ID and status
      setMessages(prev => prev.map(msg => 
        msg.id === tempMessage.id 
          ? { ...msg, id: result.messageId, status: 'sent' }
          : msg
      ));

    } catch (err: any) {
      console.error('Error sending message:', err);
      // Update message status to show error
      setMessages(prev => prev.map(msg => 
        msg.id === tempMessage.id 
          ? { ...msg, status: 'sent', content: msg.content + ' (Failed to send)' }
          : msg
      ));
    } finally {
      setSending(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Mock file upload
    const fileMessage: Message = {
      id: 'file-' + Date.now(),
      senderId: user?.id || 'student-1',
      senderName: user?.user_metadata?.full_name || 'You',
      senderType: 'student',
      content: file.name,
      type: file.type.startsWith('image/') ? 'image' : 'file',
      timestamp: new Date().toISOString(),
      status: 'sent',
      fileName: file.name,
      fileUrl: URL.createObjectURL(file)
    };

    setMessages(prev => [...prev, fileMessage]);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getMessageStatusIcon = (status: Message['status']) => {
    switch (status) {
      case 'sending':
        return <Clock className="w-3 h-3 text-gray-400" />;
      case 'sent':
        return <Check className="w-3 h-3 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="w-3 h-3 text-gray-400" />;
      case 'read':
        return <CheckCheck className="w-3 h-3 text-blue-500" />;
      default:
        return null;
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

  if (error || !session || !teacher) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Session Not Found</h1>
            <p className="text-gray-600 mb-6">{error || 'Unable to load messaging session'}</p>
            <Button onClick={() => router.push('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const currentUserId = user?.id || 'student-1';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <Card className="mb-4">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => router.back()}
                    className="mr-4"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  
                  <img
                    src={teacher.avatar || 'https://via.placeholder.com/40'}
                    alt={teacher.name}
                    className="w-10 h-10 rounded-full mr-3 object-cover"
                  />
                  
                  <div>
                    <h1 className="text-lg font-bold text-gray-900">{teacher.name}</h1>
                    <p className="text-sm text-gray-600">{session.subject} • Session Active</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Video className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Messages Container */}
          <Card className="h-[600px] flex flex-col">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => {
                const isOwnMessage = message.senderId === currentUserId;
                
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                      {!isOwnMessage && (
                        <div className="flex items-center mb-1">
                          <User className="w-4 h-4 text-gray-400 mr-1" />
                          <span className="text-xs text-gray-600">{message.senderName}</span>
                        </div>
                      )}
                      
                      <div
                        className={`rounded-lg px-4 py-2 ${
                          isOwnMessage
                            ? 'bg-blue-500 text-white'
                            : 'bg-white border border-gray-200 text-gray-900'
                        }`}
                      >
                        {message.type === 'text' && (
                          <p className="text-sm">{message.content}</p>
                        )}
                        
                        {message.type === 'file' && (
                          <div className="flex items-center space-x-2">
                            <FileText className="w-4 h-4" />
                            <span className="text-sm">{message.fileName}</span>
                            <Button size="sm" variant="outline" className="ml-2">
                              <Download className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                        
                        {message.type === 'image' && (
                          <div>
                            <img
                              src={message.fileUrl}
                              alt={message.fileName}
                              className="max-w-full h-auto rounded mb-2"
                            />
                            <p className="text-xs opacity-75">{message.fileName}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className={`flex items-center mt-1 space-x-1 ${
                        isOwnMessage ? 'justify-end' : 'justify-start'
                      }`}>
                        <span className="text-xs text-gray-500">
                          {formatTime(message.timestamp)}
                        </span>
                        {isOwnMessage && getMessageStatusIcon(message.status)}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="max-w-xs lg:max-w-md">
                    <div className="flex items-center mb-1">
                      <User className="w-4 h-4 text-gray-400 mr-1" />
                      <span className="text-xs text-gray-600">{teacher.name}</span>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg px-4 py-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="border-t p-4">
              <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.gif"
                />
                
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip className="w-4 h-4" />
                </Button>
                
                <div className="flex-1">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    disabled={sending}
                    className="w-full"
                  />
                </div>
                
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                >
                  <Smile className="w-4 h-4" />
                </Button>
                
                <Button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  size="sm"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}