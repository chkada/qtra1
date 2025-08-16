import express from 'express';
import { getTeachers, getTeacherById, createTeacher, updateTeacher, deleteTeacher } from '../services/teacher.service';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = express.Router();

// GET /api/teachers
router.get('/', async (req, res) => {
  try {
    const teachers = await getTeachers();
    return res.json(teachers);
  } catch (error: any) {
    console.error('Error fetching teachers:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// GET /api/teachers/:id
router.get('/:id', async (req, res) => {
  try {
    const teacher = await getTeacherById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }
    return res.json(teacher);
  } catch (error: any) {
    console.error(`Error fetching teacher with ID ${req.params.id}:`, error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// POST /api/teachers
router.post('/', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const teacherData = req.body;
    
    // Validate required fields
    if (!teacherData.name || !teacherData.hourlyRate || !teacherData.subjects || !teacherData.languages || !teacherData.bio) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const teacher = await createTeacher(teacherData);
    return res.status(201).json(teacher);
  } catch (error: any) {
    console.error('Error creating teacher:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// PUT /api/teachers/:id
router.put('/:id', authenticate, authorize(['admin', 'teacher']), async (req, res) => {
  try {
    const teacherId = req.params.id;
    const teacherData = req.body;
    
    // Check if teacher exists
    const existingTeacher = await getTeacherById(teacherId);
    if (!existingTeacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }
    
    // If user is a teacher, they can only update their own profile
    if (req.user.role === 'teacher' && req.user.id !== teacherId) {
      return res.status(403).json({ error: 'Unauthorized to update this teacher profile' });
    }
    
    const updatedTeacher = await updateTeacher(teacherId, teacherData);
    return res.json(updatedTeacher);
  } catch (error: any) {
    console.error(`Error updating teacher with ID ${req.params.id}:`, error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// DELETE /api/teachers/:id
router.delete('/:id', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const teacherId = req.params.id;
    
    // Check if teacher exists
    const existingTeacher = await getTeacherById(teacherId);
    if (!existingTeacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }
    
    await deleteTeacher(teacherId);
    return res.status(204).send();
  } catch (error: any) {
    console.error(`Error deleting teacher with ID ${req.params.id}:`, error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

export default router;