const xlsx = require('xlsx');
const path = require('path');

class ExcelService {
    constructor(db) {
        this.db = db;
        this.projects = [];
        this.workbook = null;
    }
    
    async importAllProjects() {
        try {
            const filePath = path.join(__dirname, '../../data/Projects DashBoard.xlsx');
            this.workbook = xlsx.readFile(filePath);
            
            console.log('📊 Importing ALL projects from Excel...');
            
            // Process each sheet
            await this.processSheet1();  // Main project data
            await this.processProjectsSheet();  // Project list
            await this.processTasksSheet();  // Tasks
            await this.processTeamSheet();  // Team data
            
            console.log(`✅ Successfully imported ${this.projects.length} projects`);
            return this.projects;
            
        } catch (error) {
            console.error('❌ Excel import error:', error);
            throw error;
        }
    }
    
    async processSheet1() {
        const sheet = this.workbook.Sheets['Sheet1'];
        const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
        
        // Parse the structured layout
        const projects = [];
        let currentProject = null;
        
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            
            // Find project headers (Project 1, Project 2, etc.)
            if (row[1] && typeof row[1] === 'string' && row[1].startsWith('Project')) {
                if (currentProject) {
                    projects.push(currentProject);
                }
                
                const projectNumber = this.extractProjectNumber(row[1]);
                currentProject = {
                    project_number: projectNumber,
                    name: '',
                    sector: '',
                    authority_client: '',
                    switzel_client: '',
                    location: '',
                    scope_of_work: '',
                    bim_requirements: [],
                    timeline_start: null,
                    timeline_end: null,
                    teams: {
                        management: [],
                        site: [],
                        production_arch: [],
                        production_mep: []
                    }
                };
            }
            
            // Extract project details
            if (currentProject) {
                await this.extractProjectData(currentProject, row, i, data);
            }
        }
        
        // Add the last project
        if (currentProject) {
            projects.push(currentProject);
        }
        
        // Save projects to database
        for (const project of projects) {
            await this.saveProjectToDatabase(project);
        }
        
        this.projects = projects;
    }
    
    extractProjectNumber(projectText) {
        const match = projectText.match(/Project\s+(\d+)/);
        return match ? parseInt(match[1]) : 1;
    }
    
    async extractProjectData(project, row, rowIndex, allData) {
        for (let col = 0; col < row.length; col++) {
            const cell = row[col];
            if (!cell || typeof cell !== 'string') continue;
            
            const cellText = cell.trim();
            
            switch(cellText) {
                case 'Project Name:':
                    project.name = this.getNextCellValue(row, col);
                    break;
                    
                case 'Sector:':
                    project.sector = this.getNextCellValue(row, col);
                    break;
                    
                case 'Authority / Main claint':
                    project.authority_client = this.getNextCellValue(row, col);
                    break;
                    
                case 'Switzel Client Name:':
                    project.switzel_client = this.getNextCellValue(row, col);
                    break;
                    
                case 'Project Location':
                    project.location = this.getNextCellValue(row, col);
                    break;
                    
                case 'Scope of Work':
                    project.scope_of_work = this.getNextCellValue(row, col);
                    break;
                    
                case 'Project Time line':
                    const timeline = this.getNextCellValue(row, col);
                    const [start, end] = this.parseTimeline(timeline);
                    project.timeline_start = start;
                    project.timeline_end = end;
                    break;
                    
                case 'Management Team:':
                    project.teams.management = this.extractTeamMembers(allData, rowIndex, 'management');
                    break;
                    
                case 'Site Team:':
                    project.teams.site = this.extractTeamMembers(allData, rowIndex, 'site');
                    break;
                    
                case 'Production Team:':
                    project.teams.production_arch = this.extractTeamMembers(allData, rowIndex, 'production_arch');
                    break;
                    
                case 'MEP':
                    // Check if this is part of production team
                    const nextRow = allData[rowIndex + 1];
                    if (nextRow && nextRow[col] && nextRow[col].toString().includes('BIM')) {
                        project.teams.production_mep = this.extractTeamMembers(allData, rowIndex, 'production_mep');
                    }
                    break;
            }
            
            // Extract BIM requirements
            if (cellText.includes('LOD') || cellText.includes('COBie') || cellText.includes('BOQ') || cellText.includes('Laser Scanning')) {
                if (!project.bim_requirements.includes(cellText)) {
                    project.bim_requirements.push(cellText);
                }
            }
        }
    }
    
    getNextCellValue(row, currentCol) {
        return row[currentCol + 1] ? row[currentCol + 1].toString().trim() : '';
    }
    
    parseTimeline(timeline) {
        // Format: "June-2025 to May-2026"
        const months = {
            'January': '01', 'February': '02', 'March': '03', 'April': '04',
            'May': '05', 'June': '06', 'July': '07', 'August': '08',
            'September': '09', 'October': '10', 'November': '11', 'December': '12'
        };
        
        try {
            const parts = timeline.split(' to ');
            if (parts.length === 2) {
                const [startMonthYear, endMonthYear] = parts;
                const [startMonth, startYear] = startMonthYear.split('-');
                const [endMonth, endYear] = endMonthYear.split('-');
                
                return [
                    `${startYear}-${months[startMonth] || '01'}-01`,
                    `${endYear}-${months[endMonth] || '12'}-31`
                ];
            }
        } catch (error) {
            console.error('Error parsing timeline:', error);
        }
        
        return [null, null];
    }
    
    extractTeamMembers(allData, startRow, teamType) {
        const teamMembers = [];
        let rowIndex = startRow + 2; // Skip header and empty row
        
        while (rowIndex < allData.length) {
            const row = allData[rowIndex];
            
            // Check if this is still the team section
            if (row && row[0] && typeof row[0] === 'string' && 
                (row[0].includes('Team:') || row[0].includes('MEP') || 
                 row[0].includes('Architecture') || row[0] === '')) {
                break;
            }
            
            // Extract team member
            if (row && row[2] && typeof row[2] === 'string') {
                const role = row[2].toString().trim();
                const name = row[3] ? row[3].toString().trim() : '';
                
                if (role && name && !role.includes('Team:')) {
                    teamMembers.push({
                        role: role.replace(':', '').trim(),
                        name: name,
                        team_type: teamType
                    });
                }
            }
            
            rowIndex++;
        }
        
        return teamMembers;
    }
    
    async saveProjectToDatabase(project) {
        try {
            // Generate project code
            const projectCode = this.generateProjectCode(project.name);
            
            // Save project
            const result = await this.db.run(
                `INSERT INTO projects (
                    project_number, project_code, name, sector, authority_client, 
                    switzel_client, location, scope_of_work, bim_requirements,
                    timeline_start, timeline_end, status, priority
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    project.project_number,
                    projectCode,
                    project.name,
                    project.sector,
                    project.authority_client,
                    project.switzel_client,
                    project.location,
                    project.scope_of_work,
                    JSON.stringify(project.bim_requirements),
                    project.timeline_start,
                    project.timeline_end,
                    'active',
                    'high'
                ]
            );
            
            const projectId = result.id;
            
            // Save team members
            for (const teamType in project.teams) {
                for (const member of project.teams[teamType]) {
                    await this.db.run(
                        `INSERT INTO project_teams (
                            project_id, team_type, role, custom_name, is_lead
                        ) VALUES (?, ?, ?, ?, ?)`,
                        [
                            projectId,
                            teamType,
                            member.role,
                            member.name,
                            member.role.toLowerCase().includes('manager') ? 1 : 0
                        ]
                    );
                }
            }
            
            console.log(`✅ Saved project: ${project.name} (ID: ${projectId})`);
            return projectId;
            
        } catch (error) {
            console.error(`❌ Error saving project ${project.name}:`, error);
            throw error;
        }
    }
    
    generateProjectCode(projectName) {
        // Create unique project code from name
        const words = projectName.split(' ');
        let code = '';
        
        for (const word of words) {
            if (word.length > 0 && /[A-Z]/.test(word[0])) {
                code += word[0];
            }
        }
        
        if (code.length < 3) {
            code = projectName.substring(0, 3).toUpperCase();
        }
        
        return `${code}-${Date.now().toString().substring(8)}`;
    }
    
    async processProjectsSheet() {
        const sheet = this.workbook.Sheets['Projects'];
        if (!sheet) return;
        
        const data = xlsx.utils.sheet_to_json(sheet);
        
        for (const row of data) {
            if (row['Project ID'] && row['Project Name']) {
                // Update existing projects or create new ones
                const existingProject = await this.db.get(
                    'SELECT id FROM projects WHERE project_code = ?',
                    [row['Project ID']]
                );
                
                if (existingProject) {
                    // Update project
                    await this.db.run(
                        `UPDATE projects SET 
                         progress = ?,
                         updated_at = CURRENT_TIMESTAMP
                         WHERE project_code = ?`,
                        [row['% Complete'] || 0, row['Project ID']]
                    );
                }
            }
        }
    }
    
    async processTasksSheet() {
        const sheet = this.workbook.Sheets['Tasks'];
        if (!sheet) return;
        
        const data = xlsx.utils.sheet_to_json(sheet);
        
        for (const row of data) {
            if (row['Project ID'] && row['Task Name']) {
                // Find project
                const project = await this.db.get(
                    'SELECT id FROM projects WHERE project_code = ?',
                    [row['Project ID']]
                );
                
                if (project) {
                    // Save task
                    await this.db.run(
                        `INSERT OR REPLACE INTO tasks (
                            project_id, task_code, name, assigned_to, 
                            start_date, end_date, progress, status
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                        [
                            project.id,
                            `TASK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                            row['Task Name'],
                            row['Assigned To'] || 'Unassigned',
                            row['Start Date'] || new Date().toISOString().split('T')[0],
                            row['End Date'] || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                            row['% Complete'] || 0,
                            this.determineTaskStatus(row['Status'], row['% Complete'])
                        ]
                    );
                }
            }
        }
    }
    
    async processTeamSheet() {
        const sheet = this.workbook.Sheets['Team'];
        if (!sheet) return;
        
        const data = xlsx.utils.sheet_to_json(sheet);
        
        for (const row of data) {
            if (row['Name'] && row['Role']) {
                // Create or update user
                await this.db.run(
                    `INSERT OR REPLACE INTO users (
                        company_id, email, password_hash, first_name, last_name, role
                    ) VALUES (
                        1, ?, ?, ?, ?, ?
                    )`,
                    [
                        `${row['Name'].toLowerCase().replace(/\s+/g, '.')}@datumauto.com`,
                        '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // default hash
                        row['Name'].split(' ')[0] || row['Name'],
                        row['Name'].split(' ')[1] || '',
                        this.mapRoleToUserRole(row['Role'])
                    ]
                );
            }
        }
    }
    
    determineTaskStatus(statusText, progress) {
        if (progress === 100) return 'completed';
        if (statusText && statusText.toLowerCase().includes('delayed')) return 'delayed';
        if (statusText && statusText.toLowerCase().includes('progress')) return 'in_progress';
        return 'not_started';
    }
    
    mapRoleToUserRole(excelRole) {
        const roleMap = {
            'BIM Lead': 'bim_manager',
            'BIM Modeler': 'bim_modeler',
            'BIM Coordinator': 'bim_coordinator',
            'Project Manager': 'project_manager',
            'Director': 'director'
        };
        
        return roleMap[excelRole] || 'bim_modeler';
    }
}

module.exports = ExcelService;