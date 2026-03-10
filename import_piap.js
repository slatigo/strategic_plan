const XLSX = require('xlsx');
const mysql = require('mysql2/promise');
//const config = require('./config'); // Your config file
var config={}
class PIAPMasterDataImporter {
    constructor() {
        // Use your database configuration
        this.dbConfig = {
            host: config.db_host || '127.0.0.1',
            user: config.db_user || 'root',
            password: config.db_pass || '',
            database: config.db_url || 'npa',
            port: config.db_port || '3306',
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        };
        
        this.pool = mysql.createPool(this.dbConfig);
        
        // Caches to avoid duplicate lookups
        this.programmeCache = new Map();
        this.objectiveCache = new Map();
        this.outcomeCache = new Map();
        this.interventionCache = new Map();
        this.outputCache = new Map();
        
        // Statistics
        this.stats = {
            programmes: 0,
            objectives: 0,
            outcomes: 0,
            intermediateOutcomes: 0,
            interventions: 0,
            outputs: 0,
            outcomeIndicators: 0,
            outputIndicators: 0,
            actions: 0
        };
    }

    async importFromExcel(filePath) {
        const connection = await this.pool.getConnection();
        
        try {
            await connection.beginTransaction();
            
            // Read Excel file
            console.log(`📂 Reading Excel file: ${filePath}`);
            const workbook = XLSX.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            
            // Remove header row
            rows.shift();
            
            console.log(`📊 Found ${rows.length} rows to process...\n`);
            
            let rowCount = 0;
            for (const row of rows) {
                rowCount++;
                if (rowCount % 10 === 0) {
                    console.log(`⏳ Processing row ${rowCount}/${rows.length}...`);
                }
                await this.processRow(connection, row);
            }
            
            await connection.commit();
            
            // Print statistics
            console.log('\n✅ IMPORT COMPLETED SUCCESSFULLY!');
            console.log('📊 STATISTICS:');
            console.log(`   Programmes: ${this.stats.programmes}`);
            console.log(`   Objectives: ${this.stats.objectives}`);
            console.log(`   Outcomes: ${this.stats.outcomes}`);
            console.log(`   Intermediate Outcomes: ${this.stats.intermediateOutcomes}`);
            console.log(`   Interventions: ${this.stats.interventions}`);
            console.log(`   Outputs: ${this.stats.outputs}`);
            console.log(`   Outcome Indicators: ${this.stats.outcomeIndicators}`);
            console.log(`   Output Indicators: ${this.stats.outputIndicators}`);
            console.log(`   Actions: ${this.stats.actions}`);
            console.log(`\n📁 Database: ${config.db_url} on ${config.db_host}`);
            
        } catch (error) {
            await connection.rollback();
            console.error('\n❌ IMPORT FAILED:', error);
        } finally {
            connection.release();
            await this.pool.end();
        }
    }

    async processRow(connection, row) {
        // Map columns based on your Excel structure
        const [
            progCode, programme, objCode, objective,
            outcomeCode, outcome, intermediateCode, intermediate,
            interventionCode, intervention, outputCode, output,
            indicatorActionCode, result, indicator, baseline,
            target2526, target2627, target2728, target2829, target2930,
            dataSource, responsible
        ] = row;

        // Skip empty rows
        if (!progCode && !objCode && !outcomeCode && !intermediateCode && 
            !interventionCode && !outputCode && !indicatorActionCode) {
            return;
        }

        // 1. PROGRAMME
        let programmeId = null;
        if (progCode && programme) {
            programmeId = await this.getOrCreateProgramme(connection, progCode.toString().trim(), programme.toString().trim());
        }

        // 2. OBJECTIVE
        let objectiveId = null;
        if (objCode && objective && programmeId) {
            objectiveId = await this.getOrCreateObjective(connection, objCode.toString().trim(), objective.toString().trim(), programmeId);
        }

        // 3. OUTCOMES (regular and intermediate)
        let outcomeId = null;
        let intermediateId = null;
        
        if (outcomeCode && outcome && objectiveId) {
            outcomeId = await this.getOrCreateOutcome(connection, outcomeCode.toString().trim(), outcome.toString().trim(), objectiveId, 0);
        }
        
        if (intermediateCode && intermediate && objectiveId) {
            intermediateId = await this.getOrCreateOutcome(connection, intermediateCode.toString().trim(), intermediate.toString().trim(), objectiveId, 1);
        }

        // 4. INTERVENTION
        let interventionId = null;
        if (interventionCode && intervention) {
            const parentId = intermediateId || outcomeId;
            if (parentId) {
                interventionId = await this.getOrCreateIntervention(connection, 
                    interventionCode.toString().trim(), 
                    intervention.toString().trim(), 
                    parentId
                );
            }
        }

        // 5. OUTPUT
        let outputId = null;
        if (outputCode && output && interventionId) {
            outputId = await this.getOrCreateOutput(connection, 
                outputCode.toString().trim(), 
                output.toString().trim(), 
                interventionId
            );
        }

        // 6. INDICATOR (based on code pattern)
        if (indicatorActionCode && indicator) {
            await this.processIndicator(
                connection,
                indicatorActionCode.toString().trim(),
                indicator.toString().trim(),
                outcomeId,
                intermediateId,
                outputId,
                dataSource ? dataSource.toString().trim() : null,
                baseline ? baseline.toString().trim() : null
            );
        }

        // 7. ACTION (based on code pattern - 10+ digits)
        if (indicatorActionCode && result && indicatorActionCode.toString().length >= 10) {
            if (outputId) {
                await this.getOrCreateAction(connection, 
                    indicatorActionCode.toString().trim(), 
                    result.toString().trim(), 
                    outputId, 
                    responsible ? responsible.toString().trim() : null
                );
            }
        }
    }

    async getOrCreateProgramme(connection, code, name) {
        if (this.programmeCache.has(code)) {
            return this.programmeCache.get(code);
        }

        const [rows] = await connection.execute(
            'SELECT id FROM programmes WHERE programme_code = ?',
            [code]
        );

        if (rows.length > 0) {
            this.programmeCache.set(code, rows[0].id);
            return rows[0].id;
        }

        const [result] = await connection.execute(
            'INSERT INTO programmes (programme_code, programme_name) VALUES (?, ?)',
            [code, name]
        );
        
        this.programmeCache.set(code, result.insertId);
        this.stats.programmes++;
        console.log(`  ✅ Programme: ${code} - ${name.substring(0, 30)}...`);
        return result.insertId;
    }

    async getOrCreateObjective(connection, code, description, programmeId) {
        if (this.objectiveCache.has(code)) {
            return this.objectiveCache.get(code);
        }

        const [rows] = await connection.execute(
            'SELECT id FROM objectives WHERE objective_code = ?',
            [code]
        );

        if (rows.length > 0) {
            this.objectiveCache.set(code, rows[0].id);
            return rows[0].id;
        }

        const [result] = await connection.execute(
            'INSERT INTO objectives (objective_code, objective_description, programme_id) VALUES (?, ?, ?)',
            [code, description, programmeId]
        );
        
        this.objectiveCache.set(code, result.insertId);
        this.stats.objectives++;
        console.log(`  ✅ Objective: ${code}`);
        return result.insertId;
    }

    async getOrCreateOutcome(connection, code, description, objectiveId, isIntermediate) {
        const cacheKey = `${code}_${isIntermediate}`;
        if (this.outcomeCache.has(cacheKey)) {
            return this.outcomeCache.get(cacheKey);
        }

        const [rows] = await connection.execute(
            'SELECT id FROM outcomes WHERE outcome_code = ? AND is_intermediate = ?',
            [code, isIntermediate]
        );

        if (rows.length > 0) {
            this.outcomeCache.set(cacheKey, rows[0].id);
            return rows[0].id;
        }

        const [result] = await connection.execute(
            'INSERT INTO outcomes (outcome_code, outcome_description, objective_id, is_intermediate) VALUES (?, ?, ?, ?)',
            [code, description, objectiveId, isIntermediate]
        );
        
        this.outcomeCache.set(cacheKey, result.insertId);
        
        if (isIntermediate) {
            this.stats.intermediateOutcomes++;
            console.log(`  ✅ Intermediate Outcome: ${code}`);
        } else {
            this.stats.outcomes++;
            console.log(`  ✅ Outcome: ${code}`);
        }
        
        return result.insertId;
    }

    async getOrCreateIntervention(connection, code, description, outcomeId) {
        if (this.interventionCache.has(code)) {
            return this.interventionCache.get(code);
        }

        const [rows] = await connection.execute(
            'SELECT id FROM interventions WHERE intervention_code = ?',
            [code]
        );

        if (rows.length > 0) {
            this.interventionCache.set(code, rows[0].id);
            return rows[0].id;
        }

        const [result] = await connection.execute(
            'INSERT INTO interventions (intervention_code, intervention_description, outcome_id) VALUES (?, ?, ?)',
            [code, description, outcomeId]
        );
        
        this.interventionCache.set(code, result.insertId);
        this.stats.interventions++;
        console.log(`  ✅ Intervention: ${code}`);
        return result.insertId;
    }

    async getOrCreateOutput(connection, code, description, interventionId) {
        if (this.outputCache.has(code)) {
            return this.outputCache.get(code);
        }

        const [rows] = await connection.execute(
            'SELECT id FROM outputs WHERE output_code = ?',
            [code]
        );

        if (rows.length > 0) {
            this.outputCache.set(code, rows[0].id);
            return rows[0].id;
        }

        const [result] = await connection.execute(
            'INSERT INTO outputs (output_code, output_description, intervention_id) VALUES (?, ?, ?)',
            [code, description, interventionId]
        );
        
        this.outputCache.set(code, result.insertId);
        this.stats.outputs++;
        console.log(`  ✅ Output: ${code}`);
        return result.insertId;
    }

    async processIndicator(connection, code, description, outcomeId, intermediateId, outputId, dataSource, baseline) {
        const codeStr = code.toString();
        
        try {
            if (codeStr.includes('pi') && (outcomeId || intermediateId)) {
                // Outcome indicator
                const targetId = outcomeId || intermediateId;
                await connection.execute(
                    `INSERT IGNORE INTO outcome_indicators 
                     (indicator_code, indicator_description, outcome_id, data_source, baseline_value) 
                     VALUES (?, ?, ?, ?, ?)`,
                    [code, description, targetId, dataSource, baseline]
                );
                this.stats.outcomeIndicators++;
                
            } else if (codeStr.includes('ii') && intermediateId) {
                // Intermediate outcome indicator
                await connection.execute(
                    `INSERT IGNORE INTO outcome_indicators 
                     (indicator_code, indicator_description, outcome_id, data_source, baseline_value) 
                     VALUES (?, ?, ?, ?, ?)`,
                    [code, description, intermediateId, dataSource, baseline]
                );
                this.stats.outcomeIndicators++;
                
            } else if (codeStr.includes('oi') && outputId) {
                // Output indicator
                await connection.execute(
                    `INSERT IGNORE INTO output_indicators 
                     (indicator_code, indicator_description, output_id, data_source, baseline_value) 
                     VALUES (?, ?, ?, ?, ?)`,
                    [code, description, outputId, dataSource, baseline]
                );
                this.stats.outputIndicators++;
            }
        } catch (error) {
            // Ignore duplicate errors
            if (!error.message.includes('Duplicate')) {
                console.warn(`  ⚠️ Indicator ${code} not inserted:`, error.message);
            }
        }
    }

    async getOrCreateAction(connection, code, description, outputId, responsible) {
        try {
            const [rows] = await connection.execute(
                'SELECT id FROM output_actions WHERE action_code = ?',
                [code]
            );

            if (rows.length > 0) {
                return rows[0].id;
            }

            const [result] = await connection.execute(
                'INSERT INTO output_actions (action_code, action_description, output_id, responsible_mda) VALUES (?, ?, ?, ?)',
                [code, description, outputId, responsible]
            );
            
            this.stats.actions++;
            console.log(`  ✅ Action: ${code}`);
            return result.insertId;
        } catch (error) {
            if (!error.message.includes('Duplicate')) {
                console.warn(`  ⚠️ Action ${code} not inserted:`, error.message);
            }
        }
    }
}

// ============================================
// RUN THE IMPORTER
// ============================================

async function main() {
    console.log('🚀 PIAP Master Data Importer Started');
    console.log('=====================================');
    console.log(`📁 Database: ${config.db_url} @ ${config.db_host}:${config.db_port}\n`);

    const importer = new PIAPMasterDataImporter();
    
    try {
        // Update this path to your Excel file
        const excelFile = 'PIAP-X.xlsx'; // Make sure this file is in the same folder
        
        await importer.importFromExcel(excelFile);
    } catch (error) {
        console.error('❌ Fatal error:', error);
    }
}

// Run the import
main();