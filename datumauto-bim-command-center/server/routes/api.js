const express = require('express');
const router = express.Router();

// In-memory database (replace with SQLite later)
let projects = [
  {
    id: 1,
    name: 'Wadi Al Sail Zone 3 and Zone 4',
    sector: 'Residential',
    client: 'LREDC – Qatari Diar',
    switzel_client: 'QBEC',
    location: 'Doha Qatar',
    scope: 'BIM Consultancy Services',
    progress: 65,
    status: 'active',
    priority: 'high',
    timeline_start: '2024-01-01',
    timeline_end: '2024-12-31',
    team_size: 8,
    budget: 2500000,
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
    description: 'Complete BIM implementation for residential development'
  }
];

let tasks = [
  {
    id: 1,
    title: 'Create Architectural Model LOD 350',
    description: 'Develop detailed architectural BIM model',
    project_id: 1,
    assigned_to: 'engineer@datumauto.com',
    due_date: '2024-06-30',
    priority: 'high',
    status: 'in_progress',
    progress: 75,
    created_at: '2024-01-15T00:00:00.000Z',
    updated_at: '2024-01-15T00:00:00.000Z',
    tags: ['architecture', 'modeling', 'LOD350']
  },
  {
    id: 2,
    title: 'Coordination Meeting with MEP Team',
    description: 'Weekly coordination meeting',
    project_id: 1,
    assigned_to: 'manager@datumauto.com',
    due_date: '2024-02-10',
    priority: 'medium',
    status: 'pending',
    progress: 0,
    created_at: '2024-01-15T00:00:00.000Z',
    updated_at: '2024-01-15T00:00:00.000Z',
    tags: ['meeting', 'coordination', 'MEP']
  }
];

let team = [
  {
    id: 1,
    name: 'John Smith',
    email: 'john.smith@datumauto.com',
    role: 'BIM Manager',
    department: 'Management',
    projects: [1],
    skills: ['Revit', 'Navisworks', 'Project Management'],
    status: 'active',
    join_date: '2023-01-15'
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    email: 'sarah.j@datumauto.com',
    role: 'BIM Architect',
    department: 'Architecture',
    projects: [1],
    skills: ['Revit', 'AutoCAD', 'Enscape'],
    status: 'active',
    join_date: '2023-03-20'
  }
];

// Middleware to check authentication
const requireAuth = (req, res, next) => {
  if (req.session && req.session.user) {
    next();
  } else {
    res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }
};

// Apply authentication to all API routes
router.use(requireAuth);

// ==================== PROJECTS CRUD ====================

// Get all projects
router.get('/projects', (req, res) => {
  res.json({
    success: true,
    count: projects.length,
    projects: projects
  });
});

// Get single project
router.get('/projects/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const project = projects.find(p => p.id === id);
  
  if (!project) {
    return res.status(404).json({
      success: false,
      error: 'Project not found'
    });
  }
  
  res.json({
    success: true,
    project: project
  });
});

// Create new project
router.post('/projects', (req, res) => {
  const newId = projects.length > 0 ? Math.max(...projects.map(p => p.id)) + 1 : 1;
  const now = new Date().toISOString();
  
  const newProject = {
    id: newId,
    ...req.body,
    progress: req.body.progress || 0,
    status: req.body.status || 'planning',
    priority: req.body.priority || 'medium',
    team_size: req.body.team_size || 1,
    created_at: now,
    updated_at: now
  };
  
  projects.push(newProject);
  
  res.status(201).json({
    success: true,
    project: newProject,
    message: 'Project created successfully'
  });
});

// Update project
router.put('/projects/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = projects.findIndex(p => p.id === id);
  
  if (index === -1) {
    return res.status(404).json({
      success: false,
      error: 'Project not found'
    });
  }
  
  const updatedProject = {
    ...projects[index],
    ...req.body,
    updated_at: new Date().toISOString()
  };
  
  projects[index] = updatedProject;
  
  res.json({
    success: true,
    project: updatedProject,
    message: 'Project updated successfully'
  });
});

// Delete project
router.delete('/projects/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = projects.findIndex(p => p.id === id);
  
  if (index === -1) {
    return res.status(404).json({
      success: false,
      error: 'Project not found'
    });
  }
  
  const deletedProject = projects.splice(index, 1)[0];
  
  res.json({
    success: true,
    message: 'Project deleted successfully',
    project: deletedProject
  });
});

// ==================== TASKS CRUD ====================

// Get all tasks
router.get('/tasks', (req, res) => {
  // Optional query parameters for filtering
  const { project_id, status, priority } = req.query;
  
  let filteredTasks = [...tasks];
  
  if (project_id) {
    filteredTasks = filteredTasks.filter(t => t.project_id === parseInt(project_id));
  }
  
  if (status) {
    filteredTasks = filteredTasks.filter(t => t.status === status);
  }
  
  if (priority) {
    filteredTasks = filteredTasks.filter(t => t.priority === priority);
  }
  
  res.json({
    success: true,
    count: filteredTasks.length,
    tasks: filteredTasks
  });
});

// Get single task
router.get('/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const task = tasks.find(t => t.id === id);
  
  if (!task) {
    return res.status(404).json({
      success: false,
      error: 'Task not found'
    });
  }
  
  res.json({
    success: true,
    task: task
  });
});

// Create new task
router.post('/tasks', (req, res) => {
  const newId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;
  const now = new Date().toISOString();
  
  const newTask = {
    id: newId,
    ...req.body,
    progress: req.body.progress || 0,
    status: req.body.status || 'pending',
    priority: req.body.priority || 'medium',
    created_at: now,
    updated_at: now
  };
  
  tasks.push(newTask);
  
  res.status(201).json({
    success: true,
    task: newTask,
    message: 'Task created successfully'
  });
});

// Update task
router.put('/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = tasks.findIndex(t => t.id === id);
  
  if (index === -1) {
    return res.status(404).json({
      success: false,
      error: 'Task not found'
    });
  }
  
  const updatedTask = {
    ...tasks[index],
    ...req.body,
    updated_at: new Date().toISOString()
  };
  
  tasks[index] = updatedTask;
  
  res.json({
    success: true,
    task: updatedTask,
    message: 'Task updated successfully'
  });
});

// Delete task
router.delete('/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = tasks.findIndex(t => t.id === id);
  
  if (index === -1) {
    return res.status(404).json({
      success: false,
      error: 'Task not found'
    });
  }
  
  const deletedTask = tasks.splice(index, 1)[0];
  
  res.json({
    success: true,
    message: 'Task deleted successfully',
    task: deletedTask
  });
});

// ==================== TEAM CRUD ====================

// Get all team members
router.get('/team', (req, res) => {
  res.json({
    success: true,
    count: team.length,
    team: team
  });
});

// Get single team member
router.get('/team/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const member = team.find(m => m.id === id);
  
  if (!member) {
    return res.status(404).json({
      success: false,
      error: 'Team member not found'
    });
  }
  
  res.json({
    success: true,
    member: member
  });
});

// Create new team member
router.post('/team', (req, res) => {
  const newId = team.length > 0 ? Math.max(...team.map(m => m.id)) + 1 : 1;
  const now = new Date().toISOString();
  
  const newMember = {
    id: newId,
    ...req.body,
    status: req.body.status || 'active',
    join_date: req.body.join_date || now.split('T')[0],
    projects: req.body.projects || [],
    skills: req.body.skills || []
  };
  
  team.push(newMember);
  
  res.status(201).json({
    success: true,
    member: newMember,
    message: 'Team member added successfully'
  });
});

// Update team member
router.put('/team/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = team.findIndex(m => m.id === id);
  
  if (index === -1) {
    return res.status(404).json({
      success: false,
      error: 'Team member not found'
    });
  }
  
  const updatedMember = {
    ...team[index],
    ...req.body
  };
  
  team[index] = updatedMember;
  
  res.json({
    success: true,
    member: updatedMember,
    message: 'Team member updated successfully'
  });
});

// Delete team member
router.delete('/team/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = team.findIndex(m => m.id === id);
  
  if (index === -1) {
    return res.status(404).json({
      success: false,
      error: 'Team member not found'
    });
  }
  
  const deletedMember = team.splice(index, 1)[0];
  
  res.json({
    success: true,
    message: 'Team member deleted successfully',
    member: deletedMember
  });
});

// ==================== STATISTICS ====================

// Get dashboard statistics
router.get('/stats', (req, res) => {
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const totalTeam = team.length;
  
  const projectProgress = totalProjects > 0 
    ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / totalProjects)
    : 0;
  
  res.json({
    success: true,
    stats: {
      total_projects: totalProjects,
      active_projects: activeProjects,
      total_tasks: totalTasks,
      completed_tasks: completedTasks,
      total_team: totalTeam,
      project_progress: projectProgress
    }
  });
});

// Get recent activity
router.get('/activity', (req, res) => {
  const recentProjects = [...projects]
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
    .slice(0, 5);
  
  const recentTasks = [...tasks]
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
    .slice(0, 5);
  
  res.json({
    success: true,
    recent_projects: recentProjects,
    recent_tasks: recentTasks
  });
});

module.exports = router;