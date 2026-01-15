const axios = require('axios');
const EventEmitter = require('events');

class DeepSeekService extends EventEmitter {
    constructor() {
        super();
        this.apiKey = process.env.DEEPSEEK_API_KEY;
        this.baseURL = 'https://api.deepseek.com/v1';
        this.context = this.getBIMContext();
        this.automations = [];
    }
    
    getBIMContext() {
        return `You are the BIM AI Assistant for DatumAuto, specializing in construction project management.
        
        ROLE: Director of Projects / Head of Project Delivery
        RESPONSIBILITIES:
        1. Single point of contact for all clients on technical and delivery matters
        2. Lead all technical and BIM teams across Architecture, Structure, MEP
        3. Define BIM-driven project delivery strategies
        4. Control project schedules, budgets, risks, and quality
        5. Resolve cross-discipline technical and BIM coordination issues
        6. Standardize BIM, QA/QC, and project management processes
        
        PROJECTS YOU MANAGE (from Excel):
        1. Waterpark Project
        2. Four Season Resort (MEP)
        3. Wadi Al Sail Zone 3 and Zone 4
        4. TRANSPORT HUB
        5. STRATEGIC FOOD SECURITY FACILITY
        6. King Salman KD, PKG 02 &03 - ARC-Fitouts
        7. AMANSAMAR ZONE 2
        8. 251103_ELE_CP07B-LUSAIL Plaza
        
        YOUR EXPERTISE:
        - 15+ years in project delivery with BIM-led projects
        - Leading multi-discipline technical and BIM teams
        - BIM workflows, coordination, and digital delivery
        - Project management (PMP certified)
        - Primavera P6 planning and scheduling
        - Middle East project delivery experience
        
        CAPABILITIES:
        1. Automated project reporting
        2. Risk analysis and prediction
        3. Schedule optimization
        4. Team efficiency analysis
        5. BIM model validation
        6. Clash detection automation
        7. Compliance checking (ISO-19650, BEP)
        8. Budget forecasting
        9. Resource allocation optimization
        10. Real-time project health monitoring`;
    }
    
    async initializeAutomations() {
        this.automations = [
            {
                name: 'Daily Director Report',
                schedule: '0 8 * * *', // 8 AM daily
                action: async () => {
                    console.log('🤖 Generating Daily Director Report...');
                    const report = await this.generateDirectorReport();
                    this.emit('automation_completed', {
                        type: 'daily_report',
                        data: report
                    });
                    return report;
                }
            },
            {
                name: 'Project Risk Analysis',
                trigger: 'project_progress_update',
                action: async (projectId) => {
                    console.log(`🤖 Analyzing risks for project ${projectId}...`);
                    const analysis = await this.analyzeProjectRisks(projectId);
                    this.emit('risk_analysis_completed', analysis);
                    return analysis;
                }
            },
            {
                name: 'Team Efficiency Report',
                schedule: '0 18 * * 5', // 6 PM every Friday
                action: async () => {
                    console.log('🤖 Generating Team Efficiency Report...');
                    const report = await this.analyzeTeamEfficiency();
                    this.emit('team_report_completed', report);
                    return report;
                }
            },
            {
                name: 'Schedule Optimization',
                trigger: 'task_delayed',
                action: async (projectId, taskId) => {
                    console.log(`🤖 Optimizing schedule for project ${projectId}...`);
                    const optimization = await this.optimizeSchedule(projectId);
                    this.emit('schedule_optimized', optimization);
                    return optimization;
                }
            },
            {
                name: 'BIM Compliance Check',
                trigger: 'file_uploaded',
                action: async (projectId, fileData) => {
                    console.log(`🤖 Checking BIM compliance for project ${projectId}...`);
                    const compliance = await this.checkBIMCompliance(projectId, fileData);
                    this.emit('compliance_checked', compliance);
                    return compliance;
                }
            }
        ];
        
        console.log('✅ DeepSeek AI automations initialized');
        
        // Start scheduled automations
        this.startScheduledAutomations();
    }
    
    startScheduledAutomations() {
        // Simplified scheduling - in production use node-cron
        setInterval(async () => {
            const now = new Date();
            const hour = now.getHours();
            const day = now.getDay();
            
            // Check for scheduled automations
            for (const automation of this.automations) {
                if (automation.schedule) {
                    // Parse simple schedule (hour only for demo)
                    const [scheduledHour] = automation.schedule.split(' ');
                    if (parseInt(scheduledHour) === hour) {
                        if (automation.name === 'Daily Director Report' || 
                            (automation.name === 'Team Efficiency Report' && day === 5)) {
                            await automation.action();
                        }
                    }
                }
            }
        }, 60 * 60 * 1000); // Check every hour
    }
    
    async chat(message, context = {}) {
        try {
            const response = await axios.post(
                `${this.baseURL}/chat/completions`,
                {
                    model: 'deepseek-chat',
                    messages: [
                        {
                            role: 'system',
                            content: this.context
                        },
                        {
                            role: 'user',
                            content: `${JSON.stringify(context)}\n\n${message}`
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 2000,
                    stream: false
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            const reply = response.data.choices[0].message.content;
            
            // Parse actionable items
            const actions = this.parseActions(reply, context);
            
            return {
                success: true,
                reply: reply,
                actions: actions,
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            console.error('DeepSeek API error:', error.response?.data || error.message);
            return {
                success: false,
                reply: "I'm experiencing technical difficulties. Please try again later.",
                error: error.message
            };
        }
    }
    
    parseActions(reply, context) {
        const actions = [];
        
        // Check for task creation
        if (reply.toLowerCase().includes('create task') || 
            reply.toLowerCase().includes('assign task') ||
            reply.match(/task.*should.*be.*created/i)) {
            actions.push({
                type: 'create_task',
                data: this.extractTaskDetails(reply, context)
            });
        }
        
        // Check for report generation
        if (reply.toLowerCase().includes('generate report') ||
            reply.toLowerCase().includes('create report') ||
            reply.match(/report.*attached|report.*generated/i)) {
            actions.push({
                type: 'generate_report',
                data: this.extractReportDetails(reply, context)
            });
        }
        
        // Check for risk identification
        if (reply.toLowerCase().includes('risk') && 
            (reply.toLowerCase().includes('high') || 
             reply.toLowerCase().includes('medium') || 
             reply.toLowerCase().includes('low'))) {
            actions.push({
                type: 'identify_risk',
                data: this.extractRiskDetails(reply, context)
            });
        }
        
        // Check for schedule changes
        if (reply.toLowerCase().includes('reschedule') ||
            reply.toLowerCase().includes('delay') ||
            reply.toLowerCase().includes('expedite')) {
            actions.push({
                type: 'update_schedule',
                data: this.extractScheduleChanges(reply, context)
            });
        }
        
        return actions;
    }
    
    async generateDirectorReport() {
        // Get database instance
        const Database = require('../config/database');
        const db = new Database();
        
        // Get all projects data
        const projects = await db.all(`
            SELECT p.*, 
                   COUNT(t.id) as total_tasks,
                   SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completed_tasks,
                   COUNT(DISTINCT pt.id) as team_size
            FROM projects p
            LEFT JOIN tasks t ON p.id = t.project_id
            LEFT JOIN project_teams pt ON p.id = pt.project_id
            GROUP BY p.id
            ORDER BY p.priority DESC, p.progress ASC
        `);
        
        // Get overdue tasks
        const overdueTasks = await db.all(`
            SELECT COUNT(*) as count 
            FROM tasks 
            WHERE end_date < DATE('now') AND status != 'completed'
        `);
        
        // Get upcoming deadlines (next 7 days)
        const upcomingDeadlines = await db.all(`
            SELECT t.*, p.name as project_name
            FROM tasks t
            JOIN projects p ON t.project_id = p.id
            WHERE t.end_date BETWEEN DATE('now') AND DATE('now', '+7 days')
            AND t.status != 'completed'
            ORDER BY t.end_date ASC
        `);
        
        // Generate AI report
        const report = await this.chat(`
            Generate a comprehensive Director's Daily Report.
            
            PROJECT OVERVIEW:
            Total Projects: ${projects.length}
            
            Project Status Summary:
            ${projects.map(p => `- ${p.name}: ${p.progress}% complete, ${p.priority} priority`).join('\n')}
            
            PERFORMANCE METRICS:
            - Total Tasks: ${projects.reduce((sum, p) => sum + (p.total_tasks || 0), 0)}
            - Completed Tasks: ${projects.reduce((sum, p) => sum + (p.completed_tasks || 0), 0)}
            - Overdue Tasks: ${overdueTasks[0]?.count || 0}
            - Team Members: ${projects.reduce((sum, p) => sum + (p.team_size || 0), 0)}
            
            UPCOMING DEADLINES (Next 7 days):
            ${upcomingDeadlines.map(t => `- ${t.project_name}: ${t.name} due ${t.end_date}`).join('\n')}
            
            CRITICAL ISSUES:
            ${projects.filter(p => p.progress < 50 && p.priority === 'high').map(p => `- ${p.name} is behind schedule (${p.progress}%)`).join('\n')}
            
            Please provide:
            1. Executive Summary
            2. Key Achievements
            3. Critical Issues Requiring Attention
            4. Recommendations
            5. Priority Actions for Today
            6. Risk Assessment
            7. Resource Allocation Status
            8. Budget vs Actual Analysis
            9. Client Communication Updates Needed
            10. Team Performance Highlights
        `);
        
        return report;
    }
    
    async analyzeProjectRisks(projectId) {
        const Database = require('../config/database');
        const db = new Database();
        
        const project = await db.get('SELECT * FROM projects WHERE id = ?', [projectId]);
        const tasks = await db.all('SELECT * FROM tasks WHERE project_id = ?', [projectId]);
        const team = await db.all('SELECT * FROM project_teams WHERE project_id = ?', [projectId]);
        
        const analysis = await this.chat(`
            Perform risk analysis for project: ${project.name}
            
            PROJECT DETAILS:
            - Progress: ${project.progress}%
            - Timeline: ${project.timeline_start} to ${project.timeline_end}
            - Budget: ${project.budget}
            - Priority: ${project.priority}
            
            TASK STATUS:
            Total Tasks: ${tasks.length}
            Completed: ${tasks.filter(t => t.status === 'completed').length}
            In Progress: ${tasks.filter(t => t.status === 'in_progress').length}
            Delayed: ${tasks.filter(t => t.status === 'delayed').length}
            
            TEAM COMPOSITION:
            ${team.map(m => `- ${m.role}: ${m.custom_name || 'Unassigned'}, Efficiency: ${m.efficiency || 'N/A'}%`).join('\n')}
            
            Analyze:
            1. Schedule Risks
            2. Budget Risks
            3. Resource Risks
            4. Technical Risks
            5. Quality Risks
            6. Client Satisfaction Risks
            
            For each risk category, provide:
            - Risk Level (High/Medium/Low)
            - Probability
            - Impact
            - Mitigation Strategy
            - Owner Recommendation
            - Timeline for Resolution
        `);
        
        return analysis;
    }
    
    async optimizeSchedule(projectId) {
        const Database = require('../config/database');
        const db = new Database();
        
        const tasks = await db.all(`
            SELECT * FROM tasks 
            WHERE project_id = ? 
            ORDER BY start_date ASC
        `, [projectId]);
        
        const optimization = await this.chat(`
            Optimize project schedule based on current task status.
            
            CURRENT TASKS:
            ${tasks.map((t, i) => `${i + 1}. ${t.name}: ${t.status}, ${t.progress}%, ${t.start_date} to ${t.end_date}`).join('\n')}
            
            CONSTRAINTS:
            1. Critical path tasks must be prioritized
            2. Resource availability must be considered
            3. Dependencies between tasks
            4. Client deadlines are fixed
            
            Please provide:
            1. Critical Path Analysis
            2. Recommended Schedule Adjustments
            3. Resource Reallocation Suggestions
            4. Buffer Time Recommendations
            5. Early Finish Opportunities
            6. Risk Mitigation through Schedule
        `);
        
        return optimization;
    }
    
    async checkBIMCompliance(projectId, fileData) {
        const Database = require('../config/database');
        const db = new Database();
        
        const project = await db.get('SELECT * FROM projects WHERE id = ?', [projectId]);
        
        const complianceCheck = await this.chat(`
            Check BIM file compliance for project: ${project.name}
            
            FILE DETAILS:
            - Name: ${fileData.file_name}
            - Type: ${fileData.file_type}
            - Size: ${fileData.file_size}
            - LOD Requirement: ${project.bim_requirements}
            
            COMPLIANCE STANDARDS TO CHECK:
            1. ISO-19650 Requirements
            2. BEP (BIM Execution Plan) Compliance
            3. LOD (Level of Development) Requirements
            4. COBie Data Requirements
            5. File Naming Standards
            6. Model Organization Standards
            7. Parameter Standards
            8. Geometry Standards
            9. Coordination Readiness
            10. Clash Detection Preparedness
            
            Please provide:
            1. Compliance Score (0-100%)
            2. Issues Found (Critical/Major/Minor)
            3. Specific Non-Compliances
            4. Recommendations for Correction
            5. Impact on Project Timeline
            6. Required Actions
            7. Validation Checklist
        `);
        
        return complianceCheck;
    }
    
    async analyzeTeamEfficiency() {
        const Database = require('../config/database');
        const db = new Database();
        
        const teams = await db.all(`
            SELECT pt.*, p.name as project_name
            FROM project_teams pt
            JOIN projects p ON pt.project_id = p.id
            WHERE pt.efficiency IS NOT NULL
            ORDER BY pt.efficiency DESC
        `);
        
        const efficiencyReport = await this.chat(`
            Analyze team efficiency across all projects.
            
            TEAM PERFORMANCE DATA:
            ${teams.map(t => `- ${t.project_name}: ${t.role} (${t.custom_name}) - Efficiency: ${t.efficiency}%`).join('\n')}
            
            ANALYSIS REQUIRED:
            1. Overall Team Performance
            2. Top Performing Teams/Individuals
            3. Areas for Improvement
            4. Training Needs Identification
            5. Resource Reallocation Opportunities
            6. Workload Balancing Recommendations
            7. Skill Gap Analysis
            8. Performance Improvement Plan
            9. Recognition Recommendations
            10. Career Development Suggestions
        `);
        
        return efficiencyReport;
    }
    
    extractTaskDetails(reply, context) {
        // Extract task details from AI response
        const taskPatterns = [
            /task.*["']([^"']+)["']/i,
            /create.*task.*?:?\s*([^.]+)/i,
            /assign.*task.*?:?\s*([^.]+)/i
        ];
        
        for (const pattern of taskPatterns) {
            const match = reply.match(pattern);
            if (match) {
                return {
                    name: match[1].trim(),
                    description: `AI-generated task: ${reply.substring(0, 200)}...`,
                    project_id: context.project_id || 1,
                    priority: this.extractPriority(reply),
                    estimated_hours: this.extractHours(reply)
                };
            }
        }
        
        return {
            name: `AI Task ${new Date().toLocaleDateString()}`,
            description: `Automatically created by AI: ${reply.substring(0, 200)}...`
        };
    }
    
    extractPriority(text) {
        if (text.toLowerCase().includes('critical') || text.toLowerCase().includes('urgent')) {
            return 'critical';
        }
        if (text.toLowerCase().includes('high')) {
            return 'high';
        }
        if (text.toLowerCase().includes('low')) {
            return 'low';
        }
        return 'medium';
    }
    
    extractHours(text) {
        const hourMatch = text.match(/(\d+)\s*(?:hour|hr)/i);
        return hourMatch ? parseInt(hourMatch[1]) : 8;
    }
    
    extractReportDetails(reply, context) {
        return {
            type: 'ai_generated',
            title: `AI Report - ${new Date().toLocaleDateString()}`,
            content: reply,
            project_id: context.project_id,
            generated_at: new Date().toISOString()
        };
    }
    
    extractRiskDetails(reply, context) {
        const riskLevels = ['high', 'medium', 'low'];
        const foundRisks = [];
        
        for (const level of riskLevels) {
            if (reply.toLowerCase().includes(`${level} risk`)) {
                const startIndex = reply.toLowerCase().indexOf(`${level} risk`);
                const riskText = reply.substring(startIndex, Math.min(startIndex + 500, reply.length));
                foundRisks.push({
                    level: level,
                    description: riskText,
                    project_id: context.project_id
                });
            }
        }
        
        return foundRisks;
    }
    
    extractScheduleChanges(reply, context) {
        const changes = [];
        
        // Look for date mentions
        const datePattern = /\b(\d{4}-\d{2}-\d{2})\b/g;
        const dates = [...reply.matchAll(datePattern)].map(m => m[1]);
        
        if (dates.length >= 2) {
            changes.push({
                type: 'reschedule',
                from_date: dates[0],
                to_date: dates[1],
                reason: 'AI-optimized schedule'
            });
        }
        
        return changes;
    }
    
    // Method to execute actions
    async executeActions(actions, db) {
        const results = [];
        
        for (const action of actions) {
            try {
                switch (action.type) {
                    case 'create_task':
                        const taskResult = await db.run(
                            `INSERT INTO tasks (project_id, task_code, name, description, priority, estimated_hours, status, created_by)
                             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                            [
                                action.data.project_id,
                                `TASK-AI-${Date.now()}`,
                                action.data.name,
                                action.data.description,
                                action.data.priority,
                                action.data.estimated_hours,
                                'not_started',
                                0 // AI user
                            ]
                        );
                        results.push({ type: 'task_created', id: taskResult.id });
                        break;
                        
                    case 'generate_report':
                        // Save report to database or file system
                        results.push({ type: 'report_generated', data: action.data });
                        break;
                        
                    case 'identify_risk':
                        for (const risk of action.data) {
                            const riskResult = await db.run(
                                `INSERT INTO project_risks (project_id, risk_level, description, status, identified_by)
                                 VALUES (?, ?, ?, ?, ?)`,
                                [risk.project_id, risk.level, risk.description, 'open', 'AI']
                            );
                            results.push({ type: 'risk_identified', id: riskResult.id });
                        }
                        break;
                        
                    case 'update_schedule':
                        for (const change of action.data) {
                            // Update tasks with new dates
                            results.push({ type: 'schedule_updated', data: change });
                        }
                        break;
                }
            } catch (error) {
                console.error(`Error executing action ${action.type}:`, error);
                results.push({ type: action.type, error: error.message });
            }
        }
        
        return results;
    }
}

module.exports = DeepSeekService;