const express = require('express');
const router = express.Router();

// Authentication middleware
const authenticate = (req, res, next) => {
    if (req.session && req.session.user) {
        return next();
    }
    return res.status(401).json({ error: 'Unauthorized' });
};

// Apply authentication to all API routes
router.use(authenticate);

// Sample in-memory database (replace with SQLite)
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
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
    }
];

let tasks = [];
let team = [];

// ==================== PROJECTS CRUD ====================
// Get all projects
router.get('/projects', (req, res) => {
    res.json(projects);
});

// Get single project
router.get('/projects/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const project = projects.find(p => p.id === id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
});

// Create new project
router.post('/projects', (req, res) => {
    const newProject = {
        id: projects.length > 0 ? Math.max(...projects.map(p => p.id)) + 1 : 1,
        ...req.body,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };
    projects.push(newProject);
    res.status(201).json(newProject);
});

// Update project
router.put('/projects/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = projects.findIndex(p => p.id === id);
    if (index === -1) return res.status(404).json({ error: 'Project not found' });
    
    projects[index] = {
        ...projects[index],
        ...req.body,
        updated_at: new Date().toISOString()
    };
    
    res.json(projects[index]);
});

// Delete project
router.delete('/projects/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = projects.findIndex(p => p.id === id);
    if (index === -1) return res.status(404).json({ error: 'Project not found' });
    
    const deletedProject = projects.splice(index, 1)[0];
    res.json({ message: 'Project deleted', project: deletedProject });
});

// ==================== TASKS CRUD ====================
router.get('/tasks', (req, res) => {
    res.json(tasks);
});

router.get('/tasks/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const task = tasks.find(t => t.id === id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
});

router.post('/tasks', (req, res) => {
    const newTask = {
        id: tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1,
        ...req.body,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };
    tasks.push(newTask);
    res.status(201).json(newTask);
});

router.put('/tasks/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = tasks.findIndex(t => t.id === id);
    if (index === -1) return res.status(404).json({ error: 'Task not found' });
    
    tasks[index] = {
        ...tasks[index],
        ...req.body,
        updated_at: new Date().toISOString()
    };
    
    res.json(tasks[index]);
});

router.delete('/tasks/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = tasks.findIndex(t => t.id === id);
    if (index === -1) return res.status(404).json({ error: 'Task not found' });
    
    const deletedTask = tasks.splice(index, 1)[0];
    res.json({ message: 'Task deleted', task: deletedTask });
});

// ==================== TEAM CRUD ====================
router.get('/team', (req, res) => {
    res.json(team);
});

router.post('/team', (req, res) => {
    const newMember = {
        id: team.length > 0 ? Math.max(...team.map(m => m.id)) + 1 : 1,
        ...req.body,
        created_at: new Date().toISOString()
    };
    team.push(newMember);
    res.status(201).json(newMember);
});

router.put('/team/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = team.findIndex(m => m.id === id);
    if (index === -1) return res.status(404).json({ error: 'Team member not found' });
    
    team[index] = { ...team[index], ...req.body };
    res.json(team[index]);
});

router.delete('/team/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = team.findIndex(m => m.id === id);
    if (index === -1) return res.status(404).json({ error: 'Team member not found' });
    
    const deletedMember = team.splice(index, 1)[0];
    res.json({ message: 'Team member deleted', member: deletedMember });
});

module.exports = router;