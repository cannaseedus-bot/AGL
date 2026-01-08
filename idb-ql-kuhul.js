// idb-ql-kuhul.js
class IDBQL_KUHUL {
  constructor() {
    this.db = null;
    this.connection = null;
    this.schema = new Map();
  }

  // 1. KUHUL NATIVE SYNTAX
  static SYNTAX = {
    // Database Operations
    "⟁DB": "database",
    "⟁TB": "table",
    "⟁IX": "index",
    "⟁SC": "schema",

    // CRUD Operations
    "⟁CR": "create",
    "⟁RD": "read",
    "⟁UP": "update",
    "⟁DL": "delete",

    // Query Operations
    "⟁WH": "where",
    "⟁OR": "order",
    "⟁LM": "limit",
    "⟁OF": "offset",
    "⟁JO": "join",

    // Data Types
    "⟁TX": "text",
    "⟁NM": "number",
    "⟁BL": "boolean",
    "⟁DT": "datetime",
    "⟁JS": "json",
    "⟁BF": "buffer",

    // Constraints
    "⟁PK": "primary_key",
    "⟁FK": "foreign_key",
    "⟁UQ": "unique",
    "⟁NN": "not_null",
    "⟁DF": "default",

    // Relationships
    "⟁1-1": "one_to_one",
    "⟁1-M": "one_to_many",
    "⟁M-M": "many_to_many",
  };

  // 2. KUHUL YAML-STYLE SCHEMA DEFINITION
  async defineSchema(kuhulYAML) {
    const parsed = this.parseKuhulYAML(kuhulYAML);
    this.schema = parsed;

    // Create IndexedDB with schema
    await this.createDatabase(parsed);

    return this.schema;
  }

  // 3. KUHUL QUERY LANGUAGE
  async query(kuhulQuery) {
    const parsedQuery = this.parseKuhulQuery(kuhulQuery);
    return await this.executeQuery(parsedQuery);
  }

  // 4. KUHUL TRANSACTION FLOW
  async transaction(kuhulFlow) {
    return await this.executeTransactionFlow(kuhulFlow);
  }

  // 5. KUHUL MIGRATION SYSTEM
  async migrate(kuhulMigration) {
    return await this.applyMigration(kuhulMigration);
  }
}

// Implementation
class IDBQL_KUHUL_Impl extends IDBQL_KUHUL {
  // Parse KUHUL YAML
  parseKuhulYAML(yaml) {
    const lines = yaml.trim().split('\n');
    const schema = {
      database: null,
      tables: new Map(),
      indices: new Map(),
      relationships: [],
    };

    let currentTable = null;

    for (const line of lines) {
      if (!line.trim() || line.trim().startsWith('#')) continue;

      const content = line.trim();

      // Database definition
      if (content.startsWith('⟁DB:')) {
        schema.database = content.split(':')[1].trim();
      }

      // Table definition
      else if (content.startsWith('⟁TB:')) {
        const tableName = content.split(':')[1].trim();
        currentTable = tableName;
        schema.tables.set(tableName, {
          name: tableName,
          columns: new Map(),
          indices: [],
        });
      }

      // Column definition
      else if (content.includes(':') && currentTable) {
        const [colName, colDef] = content.split(':').map((s) => s.trim());
        const table = schema.tables.get(currentTable);

        table.columns.set(colName, {
          name: colName,
          type: this.parseColumnType(colDef),
          constraints: this.parseConstraints(colDef),
        });
      }

      // Index definition
      else if (content.startsWith('⟁IX:')) {
        const indexDef = content.substring(4).trim();
        const table = schema.tables.get(currentTable);

        if (table) {
          table.indices.push(this.parseIndex(indexDef));
        }
      }
    }

    return schema;
  }

  parseColumnType(definition) {
    const types = {
      '⟁TX': 'TEXT',
      '⟁NM': 'INTEGER',
      '⟁BL': 'BOOLEAN',
      '⟁DT': 'DATETIME',
      '⟁JS': 'JSON',
      '⟁BF': 'BLOB',
    };

    for (const [kuhul, type] of Object.entries(types)) {
      if (definition.includes(kuhul)) return type;
    }

    return 'TEXT';
  }

  parseConstraints(definition) {
    const constraints = [];

    if (definition.includes('⟁PK')) constraints.push('PRIMARY KEY');
    if (definition.includes('⟁UQ')) constraints.push('UNIQUE');
    if (definition.includes('⟁NN')) constraints.push('NOT NULL');
    if (definition.includes('⟁FK')) {
      const match = definition.match(/⟁FK:\s*(\w+\.\w+)/);
      if (match) constraints.push(`REFERENCES ${match[1]}`);
    }

    // Default value
    const defaultMatch = definition.match(/⟁DF:\s*(\w+\(\)|\S+)/);
    if (defaultMatch) {
      constraints.push(`DEFAULT ${defaultMatch[1]}`);
    }

    return constraints;
  }

  // Create IndexedDB from KUHUL schema
  async createDatabase(schema) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(schema.database, 1);

      request.onerror = (event) => reject(event.target.error);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create tables (object stores)
        for (const [tableName, table] of schema.tables) {
          const store = db.createObjectStore(tableName, {
            keyPath: 'id',
            autoIncrement: true,
          });

          // Create indices
          for (const column of table.columns.values()) {
            if (column.constraints.includes('UNIQUE')) {
              store.createIndex(`${column.name}_idx`, column.name, {
                unique: true,
              });
            } else {
              store.createIndex(`${column.name}_idx`, column.name, {
                unique: false,
              });
            }
          }

          // Custom indices from schema
          for (const index of table.indices) {
            store.createIndex(index.name, index.columns, index.options);
          }
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        this.connection = this.db;
        resolve(this.db);
      };
    });
  }

  // Execute KUHUL query
  async executeQuery(parsedQuery) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(
        [parsedQuery.table],
        parsedQuery.operation === '⟁RD' ? 'readonly' : 'readwrite'
      );

      const store = transaction.objectStore(parsedQuery.table);
      let request;

      switch (parsedQuery.operation) {
        case '⟁RD': // READ
          if (parsedQuery.where) {
            const index = store.index(`${parsedQuery.where.field}_idx`);
            request = index.getAll(parsedQuery.where.value);
          } else {
            request = store.getAll();
          }
          break;

        case '⟁CR': // CREATE
          request = store.add(parsedQuery.data);
          break;

        case '⟁UP': // UPDATE
          request = store.put(parsedQuery.data);
          break;

        case '⟁DL': // DELETE
          request = store.delete(parsedQuery.where.value);
          break;
        default:
          reject(new Error(`Unsupported operation: ${parsedQuery.operation}`));
          return;
      }

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}

export { IDBQL_KUHUL, IDBQL_KUHUL_Impl };
