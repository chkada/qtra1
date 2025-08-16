import supabase from '../supabaseClient';
import { v4 as uuidv4 } from 'uuid';

interface TeacherData {
  name: string;
  avatar?: string;
  rating?: number;
  hourlyRate: number;
  subjects: string[];
  languages: string[];
  education?: string;
  experience?: string;
  bio: string;
  availability?: any;
  location?: string;
  subscriptionActive?: boolean;
}

export async function getTeachers() {
  const { data, error } = await supabase
    .from('teachers')
    .select('*')
    .eq('subscription_active', true);

  if (error) {
    console.error('Error fetching teachers:', error);
    throw error;
  }

  return data;
}

export async function getTeacherById(id: string) {
  const { data, error } = await supabase
    .from('teachers')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching teacher with ID ${id}:`, error);
    throw error;
  }

  return data;
}

export async function createTeacher(teacherData: TeacherData) {
  const id = uuidv4();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('teachers')
    .insert({
      id,
      name: teacherData.name,
      avatar: teacherData.avatar || null,
      rating: teacherData.rating || 0,
      hourly_rate: teacherData.hourlyRate,
      subjects: teacherData.subjects,
      languages: teacherData.languages,
      education: teacherData.education || null,
      experience: teacherData.experience || null,
      bio: teacherData.bio,
      availability: teacherData.availability || {},
      location: teacherData.location || null,
      subscription_active: teacherData.subscriptionActive !== false,
      created_at: now,
      updated_at: now
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating teacher:', error);
    throw error;
  }

  return data;
}

export async function updateTeacher(id: string, teacherData: Partial<TeacherData>) {
  const now = new Date().toISOString();
  
  // Convert camelCase to snake_case for database fields
  const dbData: any = {};
  if (teacherData.name) dbData.name = teacherData.name;
  if (teacherData.avatar !== undefined) dbData.avatar = teacherData.avatar;
  if (teacherData.rating !== undefined) dbData.rating = teacherData.rating;
  if (teacherData.hourlyRate !== undefined) dbData.hourly_rate = teacherData.hourlyRate;
  if (teacherData.subjects) dbData.subjects = teacherData.subjects;
  if (teacherData.languages) dbData.languages = teacherData.languages;
  if (teacherData.education !== undefined) dbData.education = teacherData.education;
  if (teacherData.experience !== undefined) dbData.experience = teacherData.experience;
  if (teacherData.bio) dbData.bio = teacherData.bio;
  if (teacherData.availability) dbData.availability = teacherData.availability;
  if (teacherData.location !== undefined) dbData.location = teacherData.location;
  if (teacherData.subscriptionActive !== undefined) dbData.subscription_active = teacherData.subscriptionActive;
  dbData.updated_at = now;

  const { data, error } = await supabase
    .from('teachers')
    .update(dbData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating teacher with ID ${id}:`, error);
    throw error;
  }

  return data;
}

export async function deleteTeacher(id: string) {
  const { error } = await supabase
    .from('teachers')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting teacher with ID ${id}:`, error);
    throw error;
  }

  return { success: true };
}