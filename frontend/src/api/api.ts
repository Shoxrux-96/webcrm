// src/api/api.ts

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

// Asosiy request funksiyasi
const request = async (endpoint: string, options?: RequestInit) => {
  try {
    console.log(`API Request: ${options?.method || 'GET'} ${API_URL}${endpoint}`);
    
    const res = await fetch(`${API_URL}${endpoint}`, {
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      ...options,
    });
    
    console.log(`API Response status: ${res.status}`);
    
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error(`API endpoint topilmadi: ${endpoint}`);
      }
      
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
    }
    
    if (res.status === 204) {
      return { success: true };
    }
    
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

// ============================================================================
// APPLICATIONS (ARIZALAR)
// ============================================================================
export const getApplications = () => request("/applications/");
export const getApplication = (id: number) => request(`/applications/${id}`);
export const createApplication = (data: any) => 
  request("/applications/", { method: "POST", body: JSON.stringify(data) });
export const updateApplication = (id: number, data: any) => 
  request(`/applications/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const patchApplication = (id: number, data: any) => 
  request(`/applications/${id}`, { method: "PATCH", body: JSON.stringify(data) });
export const deleteApplication = (id: number) => 
  request(`/applications/${id}`, { method: "DELETE" });

// Status alohida funksiyalar
export const approveApplication = (id: number) => 
  patchApplication(id, { status: 'active' });
export const rejectApplication = (id: number) => 
  patchApplication(id, { status: 'rejected' });
export const pendingApplication = (id: number) => 
  patchApplication(id, { status: 'pending' });

// ============================================================================
// STUDENTS (O'QUVCHILAR)
// ============================================================================
export const getStudents = () => request("/students/");
export const getStudent = (id: string | number) => request(`/students/${id}`);
export const createStudent = (data: any) => 
  request("/students/", { method: "POST", body: JSON.stringify(data) });
export const updateStudent = (id: string | number, data: any) => 
  request(`/students/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const patchStudent = (id: string | number, data: any) => 
  request(`/students/${id}`, { method: "PATCH", body: JSON.stringify(data) });
export const deleteStudent = (id: string | number) => 
  request(`/students/${id}`, { method: "DELETE" });

// Student status
export const activateStudent = (id: number) => 
  patchStudent(id, { status: 'active' });
export const deactivateStudent = (id: number) => 
  patchStudent(id, { status: 'inactive' });

// ============================================================================
// TEACHERS (O'QITUVCHILAR)
// ============================================================================
export const getTeachers = () => request("/teachers/");
export const getTeacher = (id: number) => request(`/teachers/${id}`);
export const createTeacher = (data: any) => 
  request("/teachers/", { method: "POST", body: JSON.stringify(data) });
export const updateTeacher = (id: number, data: any) => 
  request(`/teachers/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const patchTeacher = (id: number, data: any) => 
  request(`/teachers/${id}`, { method: "PATCH", body: JSON.stringify(data) });
export const deleteTeacher = (id: number) => 
  request(`/teachers/${id}`, { method: "DELETE" });

// ============================================================================
// COURSES (KURSLAR)
// ============================================================================
export const getCourses = () => request("/courses/");
export const getCourse = (id: number) => request(`/courses/${id}`);
export const createCourse = (data: any) => 
  request("/courses/", { method: "POST", body: JSON.stringify(data) });
export const updateCourse = (id: number, data: any) => 
  request(`/courses/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const patchCourse = (id: number, data: any) => 
  request(`/courses/${id}`, { method: "PATCH", body: JSON.stringify(data) });
export const deleteCourse = (id: number) => 
  request(`/courses/${id}`, { method: "DELETE" });

// ============================================================================
// GROUPS (GURUHLAR)
// ============================================================================
export const getGroups = () => request("/groups/");
export const getGroup = (id: number) => request(`/groups/${id}`);
export const createGroup = (data: any) => 
  request("/groups/", { method: "POST", body: JSON.stringify(data) });
export const updateGroup = (id: number, data: any) => 
  request(`/groups/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const patchGroup = (id: number, data: any) => 
  request(`/groups/${id}`, { method: "PATCH", body: JSON.stringify(data) });
export const deleteGroup = (id: number) => 
  request(`/groups/${id}`, { method: "DELETE" });

// Guruhga student qo'shish/olib tashlash (ESKI USUL)
export const addStudentToGroupOld = (groupId: number, studentId: number) => 
  request(`/groups/${groupId}/students/${studentId}`, { method: "POST" });
export const removeStudentFromGroupOld = (groupId: number, studentId: number) => 
  request(`/groups/${groupId}/students/${studentId}`, { method: "DELETE" });

// ============================================================================
// GROUP STUDENTS (YANGI ROUTER)
// ============================================================================
export const getGroupStudents = () => request("/group-students/");
export const getGroupStudentsByGroup = (groupId: number) => 
  request(`/group-students/group/${groupId}`);
export const getStudentGroups = (studentId: number) => 
  request(`/group-students/student/${studentId}`);

// Studentni guruhga qo'shish
export const addStudentToGroup = (data: { group_id: number; student_id: number }) => 
  request("/group-students/", { 
    method: "POST", 
    body: JSON.stringify(data) 
  });

// Studentni guruhdan o'chirish (ID bo'yicha)
export const removeStudentFromGroup = (relationId: number) => 
  request(`/group-students/${relationId}`, { method: "DELETE" });

// Studentni guruhdan o'chirish (group_id va student_id bo'yicha)
export const removeStudentFromGroupByIds = (groupId: number, studentId: number) => 
  request(`/group-students/group/${groupId}/student/${studentId}`, { method: "DELETE" });

// ============================================================================
// ENROLLMENTS (RO'YXATGA OLISHLAR)
// ============================================================================
export const getEnrollments = () => request("/enrollments/");
export const getEnrollment = (id: number) => request(`/enrollments/${id}`);
export const createEnrollment = (data: any) => 
  request("/enrollments/", { method: "POST", body: JSON.stringify(data) });
export const updateEnrollment = (id: number, data: any) => 
  request(`/enrollments/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const patchEnrollment = (id: number, data: any) => 
  request(`/enrollments/${id}`, { method: "PATCH", body: JSON.stringify(data) });
export const deleteEnrollment = (id: number) => 
  request(`/enrollments/${id}`, { method: "DELETE" });

// ============================================================================
// VACANCIES (VAKANSIYALAR)
// ============================================================================
export const getVacancies = () => request("/vacancies/");
export const getVacancy = (id: number) => request(`/vacancies/${id}`);
export const createVacancy = (data: any) => 
  request("/vacancies/", { method: "POST", body: JSON.stringify(data) });
export const updateVacancy = (id: number, data: any) => 
  request(`/vacancies/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const patchVacancy = (id: number, data: any) => 
  request(`/vacancies/${id}`, { method: "PATCH", body: JSON.stringify(data) });
export const deleteVacancy = (id: number) => 
  request(`/vacancies/${id}`, { method: "DELETE" });

// ============================================================================
// VACANCY APPLICATIONS (VAKANSIYA ARIZALARI)
// ============================================================================
export const getVacancyApplications = () => request("/vacancy-applications/");
export const getVacancyApplication = (id: number) => request(`/vacancy-applications/${id}`);
export const createVacancyApplication = (data: any) => 
  request("/vacancy-applications/", { method: "POST", body: JSON.stringify(data) });
export const updateVacancyApplication = (id: number, data: any) => 
  request(`/vacancy-applications/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const patchVacancyApplication = (id: number, data: any) => 
  request(`/vacancy-applications/${id}`, { method: "PATCH", body: JSON.stringify(data) });
export const deleteVacancyApplication = (id: number) => 
  request(`/vacancy-applications/${id}`, { method: "DELETE" });

// Status alohida funksiyalar
export const approveVacancyApplication = (id: number) => 
  patchVacancyApplication(id, { status: 'active' });
export const rejectVacancyApplication = (id: number) => 
  patchVacancyApplication(id, { status: 'rejected' });
export const pendingVacancyApplication = (id: number) => 
  patchVacancyApplication(id, { status: 'pending' });

// ============================================================================
// BLOGS
// ============================================================================
export const getBlogs = () => request("/blogs/");
export const getBlog = (id: number) => request(`/blogs/${id}`);
export const createBlog = (data: any) => 
  request("/blogs/", { method: "POST", body: JSON.stringify(data) });
export const updateBlog = (id: number, data: any) => 
  request(`/blogs/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const patchBlog = (id: number, data: any) => 
  request(`/blogs/${id}`, { method: "PATCH", body: JSON.stringify(data) });
export const deleteBlog = (id: number) => 
  request(`/blogs/${id}`, { method: "DELETE" });

// ============================================================================
// DASHBOARD STATISTICS
// ============================================================================
export const getDashboardStats = () => request("/dashboard/stats/");
export const getMonthlyStats = (year?: number) => 
  request(`/dashboard/monthly${year ? `?year=${year}` : ''}`);
export const getCourseStats = () => request("/dashboard/courses/");

// ============================================================================
// AUTH / USER
// ============================================================================
export const login = async (username: string, password: string) => {
  try {
    const response = await request("/auth/login/", { 
      method: "POST", 
      body: JSON.stringify({ username, password }) 
    });
    
    if (response.token) {
      localStorage.setItem('token', response.token);
    }
    
    return response;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  return request("/auth/logout/", { method: "POST" });
};

export const getCurrentUser = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No token found');
  }
  
  return request("/auth/me/", {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
};

// ============================================================================
// FILE UPLOAD
// ============================================================================
export const uploadFile = async (file: File, endpoint: string = "/upload/") => {
  const formData = new FormData();
  formData.append('file', file);
  
  const token = localStorage.getItem('token');
  
  const res = await fetch(`${API_URL}${endpoint}`, {
    method: 'POST',
    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    body: formData,
  });
  
  if (!res.ok) throw new Error('Upload failed');
  return res.json();
};

// ============================================================================
// SEARCH
// ============================================================================
export const searchAll = (query: string) => 
  request(`/search/?q=${encodeURIComponent(query)}`);

// ============================================================================
// EXPORT
// ============================================================================
export const exportData = async (type: string, format: 'excel' | 'pdf' = 'excel') => {
  const token = localStorage.getItem('token');
  
  const res = await fetch(`${API_URL}/export/${type}/?format=${format}`, {
    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
  });
  
  if (!res.ok) throw new Error('Export failed');
  
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${type}_${new Date().toISOString().split('T')[0]}.${format}`;
  a.click();
  window.URL.revokeObjectURL(url);
};

// ============================================================================
// API STATUS
// ============================================================================
export const checkApiStatus = async () => {
  try {
    const response = await fetch(`${API_URL}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (response.ok) {
      return { status: 'online', message: 'API is working' };
    } else {
      return { status: 'error', message: `API returned status ${response.status}` };
    }
  } catch (error) {
    return { status: 'offline', message: 'Cannot connect to API' };
  }
};

// ============================================================================
// TYPESCRIPT INTERFACES
// ============================================================================

export interface Application {
  id: number;
  full_name: string;
  phone: string;
  email?: string;
  address?: string;
  school?: string;
  grade?: string;
  course_name?: string;
  status: 'pending' | 'active' | 'rejected';
  created_at: string;
  updated_at?: string;
  notes?: string;
  parent_name?: string;
  parent_phone?: string;
  birth_date?: string;
}

export interface Student {
  id: number;
  full_name: string;
  phone: string;
  email?: string;
  school: string;
  grade: string;
  address?: string;
  course_name?: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  application_id?: number;
  group_id?: number;
  parent_name?: string;
  parent_phone?: string;
  birth_date?: string;
  notes?: string;
}

export interface Teacher {
  id: number;
  full_name: string;
  phone: string;
  email: string;
  subject: string;
  experience?: number;
  education?: string;
  address?: string;
  status: 'active' | 'inactive';
  created_at: string;
}

export interface Course {
  id: number;
  name: string;
  description?: string;
  duration: number;
  price: number;
  teacher_id?: number;
  status: 'active' | 'inactive';
  created_at: string;
}

export interface Group {
  id: number;
  name: string;
  course_id: number;
  teacher_id: number;
  start_date?: string;
  end_date?: string;
  schedule?: string;
  room?: string;
  max_students?: number;
  current_students?: number;
  status: 'active' | 'completed' | 'cancelled';
  created_at: string;
}

export interface GroupStudent {
  id: number;
  group_id: number;
  student_id: number;
  created_at: string;
  updated_at: string;
}

export interface Enrollment {
  id: number;
  student_id: number;
  course_id: number;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export interface Vacancy {
  id: number;
  title: string;
  description?: string;
  requirements?: string[];
  salary: string;
  type: string;
  location: string;
  status: string;
  date?: string;
}

export interface VacancyApplication {
  id: number;
  full_name: string;
  phone: string;
  education: string;
  certificates: string[];
  certificate_level?: string;
  vacancy_id: number;
  status: 'pending' | 'active' | 'rejected';
  created_at: string;
  updated_at?: string;
  notes?: string;
}

export interface Blog {
  id: number;
  title: string;
  image?: string;
  youtube_link?: string;
  short_text: string;
  content: string;
  status: 'draft' | 'published';
  created_at: string;
  updated_at: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export const getActiveStudents = async () => {
  try {
    const students = await getStudents();
    return students.filter((s: Student) => s.status === 'active');
  } catch (error) {
    console.error('getActiveStudents error:', error);
    return [];
  }
};

export const getPendingApplications = async () => {
  try {
    const apps = await getApplications();
    return apps.filter((a: Application) => a.status === 'pending');
  } catch (error) {
    console.error('getPendingApplications error:', error);
    return [];
  }
};

export const getApplicationsByStatus = async (status: string) => {
  try {
    const apps = await getApplications();
    return apps.filter((a: Application) => a.status === status);
  } catch (error) {
    console.error('getApplicationsByStatus error:', error);
    return [];
  }
};

export const getVacanciesByStatus = async (status: string) => {
  try {
    const vacancies = await getVacancies();
    return vacancies.filter((v: Vacancy) => v.status === status);
  } catch (error) {
    console.error('getVacanciesByStatus error:', error);
    return [];
  }
};

export const getVacancyApplicationsByStatus = async (status: string) => {
  try {
    const apps = await getVacancyApplications();
    return apps.filter((a: VacancyApplication) => a.status === status);
  } catch (error) {
    console.error('getVacancyApplicationsByStatus error:', error);
    return [];
  }
};

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default {
  // Applications
  getApplications,
  getApplication,
  createApplication,
  updateApplication,
  patchApplication,
  deleteApplication,
  approveApplication,
  rejectApplication,
  pendingApplication,
  
  // Students
  getStudents,
  getStudent,
  createStudent,
  updateStudent,
  patchStudent,
  deleteStudent,
  activateStudent,
  deactivateStudent,
  getActiveStudents,
  
  // Teachers
  getTeachers,
  getTeacher,
  createTeacher,
  updateTeacher,
  patchTeacher,
  deleteTeacher,
  
  // Courses
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  patchCourse,
  deleteCourse,
  
  // Groups
  getGroups,
  getGroup,
  createGroup,
  updateGroup,
  patchGroup,
  deleteGroup,
  addStudentToGroupOld,
  removeStudentFromGroupOld,
  
  // Group Students
  getGroupStudents,
  getGroupStudentsByGroup,
  getStudentGroups,
  addStudentToGroup,
  removeStudentFromGroup,
  removeStudentFromGroupByIds,
  
  // Enrollments
  getEnrollments,
  getEnrollment,
  createEnrollment,
  updateEnrollment,
  patchEnrollment,
  deleteEnrollment,
  
  // Vacancies
  getVacancies,
  getVacancy,
  createVacancy,
  updateVacancy,
  patchVacancy,
  deleteVacancy,
  getVacanciesByStatus,
  
  // Vacancy Applications
  getVacancyApplications,
  getVacancyApplication,
  createVacancyApplication,
  updateVacancyApplication,
  patchVacancyApplication,
  deleteVacancyApplication,
  approveVacancyApplication,
  rejectVacancyApplication,
  pendingVacancyApplication,
  getVacancyApplicationsByStatus,
  
  // Blogs
  getBlogs,
  getBlog,
  createBlog,
  updateBlog,
  patchBlog,
  deleteBlog,
  
  // Dashboard
  getDashboardStats,
  getMonthlyStats,
  getCourseStats,
  
  // Auth
  login,
  logout,
  getCurrentUser,
  
  // Utility
  checkApiStatus,
  uploadFile,
  searchAll,
  exportData
};