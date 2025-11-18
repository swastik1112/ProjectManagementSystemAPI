import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

function App() {
  const [activeTab, setActiveTab] = useState('projects');

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Project Management System</h1>
      <div className="flex justify-center mb-6">
        <button
          className={`px-4 py-2 mx-2 rounded font-medium ${
            activeTab === 'projects' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          onClick={() => setActiveTab('projects')}
        >
          Projects
        </button>
        <button
          className={`px-4 py-2 mx-2 rounded font-medium ${
            activeTab === 'tasks' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          onClick={() => setActiveTab('tasks')}
        >
          Tasks
        </button>
        <button
          className={`px-4 py-2 mx-2 rounded font-medium ${
            activeTab === 'users' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
      </div>
      {activeTab === 'projects' && <ProjectList />}
      {activeTab === 'tasks' && <TaskList />}
      {activeTab === 'users' && <UserList />}
    </div>
  );
}

function ProjectList() {
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({ id: 0, name: '', description: '', startDate: '', endDate: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_BASE_URL}/projects`);
      console.log('Projects API response:', response.data); // Log raw response
      // Handle $values structure
      const data = response.data.$values && Array.isArray(response.data.$values) 
        ? response.data.$values.map(project => ({
            ...project,
            tasks: project.tasks && project.tasks.$values && Array.isArray(project.tasks.$values) 
              ? project.tasks.$values 
              : []
          }))
        : [];
      console.log('Processed projects data:', data); // Log processed data
      setProjects(data);
      if (data.length === 0) {
        setError('No projects found. Please add a project or check the backend.');
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      let errorMessage = 'Failed to fetch projects. Ensure the backend is running at http://localhost:5000.';
      if (error.response) {
        errorMessage += ` Status: ${error.response.status}, Details: ${JSON.stringify(error.response.data)}`;
      } else if (error.request) {
        errorMessage += ' No response received. Check if the backend is running.';
      } else {
        errorMessage += ` Error: ${error.message}`;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const project = {
      name: form.name,
      description: form.description,
      startDate: form.startDate + 'T00:00:00',
      endDate: form.endDate ? form.endDate + 'T00:00:00' : null
    };
    try {
      if (isEditing) {
        await axios.put(`${API_BASE_URL}/projects/${form.id}`, { ...project, id: form.id });
      } else {
        await axios.post(`${API_BASE_URL}/projects`, project);
      }
      setForm({ id: 0, name: '', description: '', startDate: '', endDate: '' });
      setIsEditing(false);
      fetchProjects();
    } catch (error) {
      console.error('Error saving project:', error);
      alert(`Failed to save project: ${error.response ? JSON.stringify(error.response.data) : error.message}`);
    }
  };

  const handleEdit = (project) => {
    setForm({
      id: project.id,
      name: project.name,
      description: project.description || '',
      startDate: project.startDate.split('T')[0],
      endDate: project.endDate ? project.endDate.split('T')[0] : ''
    });
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await axios.delete(`${API_BASE_URL}/projects/${id}`);
        fetchProjects();
      } catch (error) {
        console.error('Error deleting project:', error);
        alert(`Failed to delete project: ${error.response ? JSON.stringify(error.response.data) : error.message}`);
      }
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 text-gray-700">Projects</h2>
      <div className="mb-6 bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-medium mb-4">{isEditing ? 'Edit Project' : 'Add Project'}</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Project Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="border p-2 rounded w-full mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="border p-2 rounded w-full mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="date"
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            className="border p-2 rounded w-full mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="date"
            value={form.endDate}
            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            className="border p-2 rounded w-full mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {isEditing ? 'Update Project' : 'Add Project'}
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={() => {
                setForm({ id: 0, name: '', description: '', startDate: '', endDate: '' });
                setIsEditing(false);
              }}
              className="ml-2 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          )}
        </form>
      </div>
      {loading ? (
        <p className="text-gray-600">Loading projects...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : Array.isArray(projects) && projects.length > 0 ? (
        <ul className="space-y-4">
          {projects.map((project) => (
            <li key={project.id} className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-800">{project.name}</h3>
              <p className="text-gray-600">{project.description || 'No description'}</p>
              <p className="text-gray-600">Start Date: {new Date(project.startDate).toLocaleDateString()}</p>
              <p className="text-gray-600">End Date: {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'N/A'}</p>
              <h4 className="mt-3 font-medium text-gray-700">Tasks:</h4>
              <ul className="ml-4 list-disc text-gray-600">
                {project.tasks && Array.isArray(project.tasks) && project.tasks.length > 0 ? (
                  project.tasks.map((task) => (
                    <li key={task.id}>
                      {task.name} ({task.status}) - Assigned to: {task.assignedTo ? task.assignedTo.name : 'Unassigned'}
                    </li>
                  ))
                ) : (
                  <li>No tasks assigned</li>
                )}
              </ul>
              <div className="mt-4">
                <button
                  onClick={() => handleEdit(project)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(project.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-600">No projects available.</p>
      )}
    </div>
  );
}

function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ id: 0, name: '', description: '', status: 'ToDo', projectId: '', assignedToId: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTasks();
    fetchProjects();
    fetchUsers();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_BASE_URL}/tasks`);
      console.log('Tasks API response:', response.data); // Log raw response
      const data = response.data.$values && Array.isArray(response.data.$values) ? response.data.$values : [];
      console.log('Processed tasks data:', data); // Log processed data
      setTasks(data);
      if (data.length === 0) {
        setError('No tasks found. Please add a task or check the backend.');
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      let errorMessage = 'Failed to fetch tasks. Ensure the backend is running at http://localhost:5000.';
      if (error.response) {
        errorMessage += ` Status: ${error.response.status}, Details: ${JSON.stringify(error.response.data)}`;
      } else if (error.request) {
        errorMessage += ' No response received. Check if the backend is running.';
      } else {
        errorMessage += ` Error: ${error.message}`;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/projects`);
      console.log('Projects API response (TaskList):', response.data); // Log raw response
      const data = response.data.$values && Array.isArray(response.data.$values) ? response.data.$values : [];
      console.log('Processed projects data (TaskList):', data); // Log processed data
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users`);
      console.log('Users API response:', response.data); // Log raw response
      const data = response.data.$values && Array.isArray(response.data.$values) ? response.data.$values : [];
      console.log('Processed users data:', data); // Log processed data
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const task = {
      name: form.name,
      description: form.description,
      status: form.status,
      projectId: parseInt(form.projectId),
      assignedToId: form.assignedToId ? parseInt(form.assignedToId) : null
    };
    try {
      if (isEditing) {
        await axios.put(`${API_BASE_URL}/tasks/${form.id}`, { ...task, id: form.id });
      } else {
        await axios.post(`${API_BASE_URL}/tasks`, task);
      }
      setForm({ id: 0, name: '', description: '', status: 'ToDo', projectId: '', assignedToId: '' });
      setIsEditing(false);
      fetchTasks();
    } catch (error) {
      console.error('Error saving task:', error);
      alert(`Failed to save task: ${error.response ? JSON.stringify(error.response.data) : error.message}`);
    }
  };

  const handleEdit = (task) => {
    setForm({
      id: task.id,
      name: task.name,
      description: task.description || '',
      status: task.status,
      projectId: task.projectId.toString(),
      assignedToId: task.assignedToId ? task.assignedToId.toString() : ''
    });
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await axios.delete(`${API_BASE_URL}/tasks/${id}`);
        fetchTasks();
      } catch (error) {
        console.error('Error deleting task:', error);
        alert(`Failed to delete task: ${error.response ? JSON.stringify(error.response.data) : error.message}`);
      }
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 text-gray-700">Tasks</h2>
      <div className="mb-6 bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-medium mb-4">{isEditing ? 'Edit Task' : 'Add Task'}</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Task Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="border p-2 rounded w-full mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="border p-2 rounded w-full mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="border p-2 rounded w-full mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="ToDo">ToDo</option>
            <option value="InProgress">InProgress</option>
            <option value="Done">Done</option>
          </select>
          <select
            value={form.projectId}
            onChange={(e) => setForm({ ...form, projectId: e.target.value })}
            className="border p-2 rounded w-full mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Project</option>
            {Array.isArray(projects) && projects.map((project) => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>
          <select
            value={form.assignedToId}
            onChange={(e) => setForm({ ...form, assignedToId: e.target.value })}
            className="border p-2 rounded w-full mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Unassigned</option>
            {Array.isArray(users) && users.map((user) => (
              <option key={user.id} value={user.id}>{user.name}</option>
            ))}
          </select>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {isEditing ? 'Update Task' : 'Add Task'}
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={() => {
                setForm({ id: 0, name: '', description: '', status: 'ToDo', projectId: '', assignedToId: '' });
                setIsEditing(false);
              }}
              className="ml-2 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          )}
        </form>
      </div>
      {loading ? (
        <p className="text-gray-600">Loading tasks...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : Array.isArray(tasks) && tasks.length > 0 ? (
        <ul className="space-y-4">
          {tasks.map((task) => (
            <li key={task.id} className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-800">{task.name}</h3>
              <p className="text-gray-600">{task.description || 'No description'}</p>
              <p className="text-gray-600">Status: {task.status}</p>
              <p className="text-gray-600">Project: {task.project ? task.project.name : 'N/A'}</p>
              <p className="text-gray-600">Assigned to: {task.assignedTo ? task.assignedTo.name : 'Unassigned'}</p>
              <div className="mt-4">
                <button
                  onClick={() => handleEdit(task)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(task.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-600">No tasks available.</p>
      )}
    </div>
  );
}

function UserList() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ id: 0, name: '', email: '', role: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_BASE_URL}/users`);
      console.log('Users API response:', response.data); // Log raw response
      const data = response.data.$values && Array.isArray(response.data.$values) ? response.data.$values : [];
      console.log('Processed users data:', data); // Log processed data
      setUsers(data);
      if (data.length === 0) {
        setError('No users found. Please add a user or check the backend.');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      let errorMessage = 'Failed to fetch users. Ensure the backend is running at http://localhost:5000.';
      if (error.response) {
        errorMessage += ` Status: ${error.response.status}, Details: ${JSON.stringify(error.response.data)}`;
      } else if (error.request) {
        errorMessage += ' No response received. Check if the backend is running.';
      } else {
        errorMessage += ` Error: ${error.message}`;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = {
      name: form.name,
      email: form.email,
      role: form.role
    };
    try {
      if (isEditing) {
        await axios.put(`${API_BASE_URL}/users/${form.id}`, { ...user, id: form.id });
      } else {
        await axios.post(`${API_BASE_URL}/users`, user);
      }
      setForm({ id: 0, name: '', email: '', role: '' });
      setIsEditing(false);
      fetchUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      alert(`Failed to save user: ${error.response ? JSON.stringify(error.response.data) : error.message}`);
    }
  };

  const handleEdit = (user) => {
    setForm({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`${API_BASE_URL}/users/${id}`);
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        alert(`Failed to delete user: ${error.response ? JSON.stringify(error.response.data) : error.message}`);
      }
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 text-gray-700">Users</h2>
      <div className="mb-6 bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-medium mb-4">{isEditing ? 'Edit User' : 'Add User'}</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="border p-2 rounded w-full mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="border p-2 rounded w-full mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="text"
            placeholder="Role"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="border p-2 rounded w-full mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {isEditing ? 'Update User' : 'Add User'}
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={() => {
                setForm({ id: 0, name: '', email: '', role: '' });
                setIsEditing(false);
              }}
              className="ml-2 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          )}
        </form>
      </div>
      {loading ? (
        <p className="text-gray-600">Loading users...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : Array.isArray(users) && users.length > 0 ? (
        <ul className="space-y-4">
          {users.map((user) => (
            <li key={user.id} className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-800">{user.name}</h3>
              <p className="text-gray-600">Email: {user.email}</p>
              <p className="text-gray-600">Role: {user.role}</p>
              <div className="mt-4">
                <button
                  onClick={() => handleEdit(user)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(user.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-600">No users available.</p>
      )}
    </div>
  );
}

export default App;