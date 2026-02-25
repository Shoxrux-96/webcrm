const API_URL = "http://127.0.0.1:8000";

export async function getCourses() {
  return (await fetch(`${API_URL}/courses`)).json();
}

export async function createCourse(data: any) {
  return fetch(`${API_URL}/courses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function updateCourse(id: number, data: any) {
  return fetch(`${API_URL}/courses/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function deleteCourse(id: number) {
  return fetch(`${API_URL}/courses/${id}`, {
    method: "DELETE",
  });
}