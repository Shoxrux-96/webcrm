// src/api/api.ts

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const request = async (endpoint: string, options?: RequestInit) => {
  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return res.json();
};

// ─── COURSES ───────────────────────────────────────────
export const getCourses = () => request("/courses/");
export const getCourse = (id: number) => request(`/courses/${id}`);
export const createCourse = (data: any) => request("/courses/", { method: "POST", body: JSON.stringify(data) });
export const updateCourse = (id: number, data: any) => request(`/courses/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteCourse = (id: number) => request(`/courses/${id}`, { method: "DELETE" });

// ─── STUDENTS ──────────────────────────────────────────
export const getStudents = () => request("/students/");
export const getStudent = (id: string | number) => request(`/students/${id}`);
export const createStudent = (data: any) => request("/students/", { method: "POST", body: JSON.stringify(data) });
export const updateStudent = (id: string | number, data: any) => request(`/students/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteStudent = (id: string | number) => request(`/students/${id}`, { method: "DELETE" });

// ─── TEACHERS ──────────────────────────────────────────
export const getTeachers = () => request("/teachers/");
export const getTeacher = (id: number) => request(`/teachers/${id}`);
export const createTeacher = (data: any) => request("/teachers/", { method: "POST", body: JSON.stringify(data) });
export const updateTeacher = (id: number, data: any) => request(`/teachers/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteTeacher = (id: number) => request(`/teachers/${id}`, { method: "DELETE" });

// ─── GROUPS ────────────────────────────────────────────
export const getGroups = () => request("/groups/");
export const getGroup = (id: number) => request(`/groups/${id}`);
export const createGroup = (data: any) => request("/groups/", { method: "POST", body: JSON.stringify(data) });
export const updateGroup = (id: number, data: any) => request(`/groups/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteGroup = (id: number) => request(`/groups/${id}`, { method: "DELETE" });

// ─── ENROLLMENTS ───────────────────────────────────────
export const getEnrollments = () => request("/enrollments/");
export const createEnrollment = (data: any) => request("/enrollments/", { method: "POST", body: JSON.stringify(data) });
export const deleteEnrollment = (id: number) => request(`/enrollments/${id}`, { method: "DELETE" });

// ─── VACANCIES ─────────────────────────────────────────
export const getVacancies = () => request("/vacancies/");
export const getVacancy = (id: number) => request(`/vacancies/${id}`);
export const createVacancy = (data: any) => request("/vacancies/", { method: "POST", body: JSON.stringify(data) });
export const updateVacancy = (id: number, data: any) => request(`/vacancies/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteVacancy = (id: number) => request(`/vacancies/${id}`, { method: "DELETE" });

// ─── BLOGS ─────────────────────────────────────────────
export const getBlogs = () => request("/blogs/");
export const getBlog = (id: number) => request(`/blogs/${id}`);
export const createBlog = (data: any) => request("/blogs/", { method: "POST", body: JSON.stringify(data) });
export const updateBlog = (id: number, data: any) => request(`/blogs/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteBlog = (id: number) => request(`/blogs/${id}`, { method: "DELETE" });
