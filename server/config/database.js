const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
    constructor() {
        this.db = null;
        this.dbPath = path.join(__dirname, '../../data/datumauto.db');
    }
    
    async initialize() {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(this.dbPath, (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                
                console.log('📊 Connected to SQLite database');
                
                // Create all tables
                this.createTables()
                    .then(() => resolve())
                    .catch(err => reject(err));
            });
        });
    }
    
    async createTables() {
        const tables = [
            // Companies
            `CREATE TABLE IF NOT EXISTS companies (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255),
                phone VARCHAR(50),
                address TEXT,
                timezone VARCHAR(50) DEFAULT 'Asia/Dubai',
                currency VARCHAR(10) DEFAULT 'AED',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,
            
            // Users with Director/Project roles
            `CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                company_id INTEGER NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                first_name VARCHAR(100) NOT NULL,
                last_name VARCHAR(100) NOT NULL,
                role VARCHAR(50) CHECK(role IN ('director', 'head_of_delivery', 'project_manager', 'bim_manager', 'bim_coordinator', 'bim_modeler', 'admin', 'viewer')),
                department VARCHAR(100),
                phone VARCHAR(20),
                profile_image TEXT,
                is_active BOOLEAN DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (company_id) REFERENCES companies(id)
            )`,
            
            // ALL Projects from Excel
            `CREATE TABLE IF NOT EXISTS projects (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                project_number INTEGER NOT NULL,
                project_code VARCHAR(50) UNIQUE NOT NULL,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                sector VARCHAR(100),
                authority_client VARCHAR(255),
                switzel_client VARCHAR(255),
                location VARCHAR(500),
                scope_of_work TEXT,
                bim_requirements TEXT,
                timeline_start DATE,
                timeline_end DATE,
                status VARCHAR(50) DEFAULT 'planning',
                priority VARCHAR(20) DEFAULT 'medium',
                progress INTEGER DEFAULT 0,
                budget DECIMAL(15,2),
                actual_cost DECIMAL(15,2),
                director_id INTEGER,
                project_manager_id INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (director_id) REFERENCES users(id),
                FOREIGN KEY (project_manager_id) REFERENCES users(id)
            )`,
            
            // Project Teams (from Excel structure)
            `CREATE TABLE IF NOT EXISTS project_teams (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                project_id INTEGER NOT NULL,
                team_type VARCHAR(50) CHECK(team_type IN ('management', 'site', 'production_arch', 'production_mep')),
                role VARCHAR(100) NOT NULL,
                user_id INTEGER,
                custom_name VARCHAR(255),
                is_lead BOOLEAN DEFAULT 0,
                assigned_tasks INTEGER DEFAULT 0,
                completed_tasks INTEGER DEFAULT 0,
                efficiency DECIMAL(5,2),
                assigned_date DATE,
                status VARCHAR(50) DEFAULT 'active',
                FOREIGN KEY (project_id) REFERENCES projects(id),
                FOREIGN KEY (user_id) REFERENCES users(id)
            )`,
            
            // Tasks with Excel integration
            `CREATE TABLE IF NOT EXISTS tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                project_id INTEGER NOT NULL,
                task_code VARCHAR(50) UNIQUE NOT NULL,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                assigned_to INTEGER,
                discipline VARCHAR(50),
                start_date DATE,
                end_date DATE,
                progress INTEGER DEFAULT 0,
                status VARCHAR(50) DEFAULT 'not_started',
                priority VARCHAR(20) DEFAULT 'medium',
                estimated_hours DECIMAL(6,2),
                actual_hours DECIMAL(6,2),
                created_by INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (project_id) REFERENCES projects(id),
                FOREIGN KEY (assigned_to) REFERENCES users(id),
                FOREIGN KEY (created_by) REFERENCES users(id)
            )`,
            
            // BIM Files and Models
            `CREATE TABLE IF NOT EXISTS bim_files (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                project_id INTEGER NOT NULL,
                file_name VARCHAR(255) NOT NULL,
                file_type VARCHAR(10),
                file_path TEXT NOT NULL,
                file_size INTEGER,
                version VARCHAR(20),
                lod_level VARCHAR(10),
                discipline VARCHAR(50),
                status VARCHAR(50) DEFAULT 'uploaded',
                uploaded_by INTEGER,
                upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (project_id) REFERENCES projects(id),
                FOREIGN KEY (uploaded_by) REFERENCES users(id)
            )`,
            
            // Clash Detections
            `CREATE TABLE IF NOT EXISTS clash_detections (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                project_id INTEGER NOT NULL,
                clash_id VARCHAR(50) UNIQUE NOT NULL,
                description TEXT NOT NULL,
                discipline_1 VARCHAR(50),
                discipline_2 VARCHAR(50),
                severity VARCHAR(20) CHECK(severity IN ('critical', 'high', 'medium', 'low')),
                status VARCHAR(50) DEFAULT 'open',
                assigned_to INTEGER,
                due_date DATE,
                resolution TEXT,
                resolved_by INTEGER,
                resolved_date DATE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (project_id) REFERENCES projects(id),
                FOREIGN KEY (assigned_to) REFERENCES users(id),
                FOREIGN KEY (resolved_by) REFERENCES users(id)
            )`,
            
            // AI Automation Logs
            `CREATE TABLE IF NOT EXISTS ai_automation_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                project_id INTEGER,
                automation_type VARCHAR(100),
                trigger_event VARCHAR(100),
                input_data TEXT,
                output_data TEXT,
                status VARCHAR(50),
                execution_time_ms INTEGER,
                ai_model VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (project_id) REFERENCES projects(id)
            )`,
            
            // Project KPIs
            `CREATE TABLE IF NOT EXISTS project_kpis (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                project_id INTEGER NOT NULL,
                kpi_date DATE NOT NULL,
                metric_type VARCHAR(50),
                value DECIMAL(10,2),
                target DECIMAL(10,2),
                variance DECIMAL(10,2),
                notes TEXT,
                recorded_by INTEGER,
                recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (project_id) REFERENCES projects(id),
                FOREIGN KEY (recorded_by) REFERENCES users(id),
                UNIQUE(project_id, kpi_date, metric_type)
            )`
        ];
        
        for (const tableSQL of tables) {
            await this.run(tableSQL);
        }
        
        // Insert default company and director user
        await this.initializeDefaultData();
    }
    
    async run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID, changes: this.changes });
                }
            });
        });
    }
    
    async get(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }
    
    async all(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }
    
    async initializeDefaultData() {
        try {
            // Check if default company exists
            const company = await this.get("SELECT * FROM companies WHERE name = 'DatumAuto'");
            
            if (!company) {
                // Insert default company
                await this.run(
                    `INSERT INTO companies (name, email, phone, address, timezone, currency) 
                     VALUES (?, ?, ?, ?, ?, ?)`,
                    ['DatumAuto', 'info@datumauto.com', '+971-XXXX-XXXX', 
                     'Dubai, UAE', 'Asia/Dubai', 'AED']
                );
                
                // Get company ID
                const companyRow = await this.get("SELECT id FROM companies WHERE name = 'DatumAuto'");
                const companyId = companyRow.id;
                
                // Insert Director/Head of Project Delivery user (you)
                // Password: "admin123" hashed
                const passwordHash = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';
                
                await this.run(
                    `INSERT INTO users (company_id, email, password_hash, first_name, last_name, role, department, phone)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [companyId, 'director@datumauto.com', passwordHash, 
                     'Director', 'Projects', 'director', 'Project Delivery', '+971-XXXX-XXXX']
                );
                
                console.log('✅ Default company and director user created');
            }
        } catch (error) {
            console.error('❌ Error creating default data:', error);
        }
    }
    
    // Transaction support
    async transaction(callback) {
        return new Promise((resolve, reject) => {
            this.db.run('BEGIN TRANSACTION', async (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                
                try {
                    const result = await callback(this);
                    this.db.run('COMMIT', (err) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(result);
                        }
                    });
                } catch (error) {
                    this.db.run('ROLLBACK', () => {
                        reject(error);
                    });
                }
            });
        });
    }
    
    close() {
        if (this.db) {
            this.db.close();
        }
    }
}

module.exports = Database;