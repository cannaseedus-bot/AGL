// kuhul-idbql.js - Complete Implementation
class KuhulIDBQL {
  constructor(databaseName = 'nexus_local') {
    this.db = null;
    this.databaseName = databaseName;
    this.migrationVersion = 0;
    this.cache = new Map();
  }

  // 1. INITIALIZE WITH KUHUL SCHEMA
  async init(kuhulSchema) {
    console.log('🚀 Initializing KUHUL IDB-QL...');

    // Parse and create schema
    const schema = this.parseKuhulSchema(kuhulSchema);

    // Open/create IndexedDB
    await this.openDatabase(schema);

    // Apply migrations if any
    await this.applyPendingMigrations();

    console.log('✅ KUHUL IDB-QL Ready');
    return this;
  }

  // 2. KUHUL QUERY BUILDER (Chainable)
  query() {
    return new KuhulQueryBuilder(this);
  }

  // 3. TRANSACTION SUPPORT
  async transaction(callback) {
    const tx = this.db.transaction(Array.from(this.cache.keys()), 'readwrite');

    try {
      const result = await callback(tx);
      return result;
    } catch (error) {
      tx.abort();
      throw error;
    }
  }

  // 4. MIGRATION SYSTEM
  async migrate(kuhulMigration) {
    const migration = this.parseMigration(kuhulMigration);

    // Store migration in migrations table
    await this.db
      .transaction(['migrations'], 'readwrite')
      .objectStore('migrations')
      .add({
        version: migration.version,
        name: migration.name,
        applied_at: new Date().toISOString(),
        up: migration.up,
        down: migration.down,
      });

    // Apply migration
    await this.applyMigration(migration);

    this.migrationVersion = migration.version;
  }

  // 5. BACKUP/RESTORE
  async backup() {
    const backup = {
      version: this.migrationVersion,
      timestamp: new Date().toISOString(),
      database: this.databaseName,
      data: {},
    };

    // Export all data
    const stores = Array.from(this.cache.keys());

    for (const storeName of stores) {
      const data = await this.getAll(storeName);
      backup.data[storeName] = data;
    }

    return backup;
  }

  async restore(backupData) {
    // Clear existing data
    await this.clearAll();

    // Restore data
    for (const [storeName, data] of Object.entries(backupData.data)) {
      for (const item of data) {
        await this.create(storeName, item);
      }
    }

    this.migrationVersion = backupData.version;
  }

  // 6. QUERY EXAMPLES WITH KUHUL SYNTAX
  async exampleQueries() {
    // CREATE with KUHUL style
    await this.create('users', {
      username: 'alice',
      email: 'alice@nexus.dev',
      created: new Date().toISOString(),
      active: true,
    });

    // READ with conditions
    const activeUsers = await this.query()
      .from('users')
      .where({ active: true })
      .orderBy('created', 'DESC')
      .limit(10)
      .execute();

    // UPDATE
    await this.update('users', { active: false }, { email: 'inactive@nexus.dev' });

    // DELETE
    await this.delete('users', {
      created: { $lt: '2024-01-01' },
    });

    // COMPLEX JOIN (simulated)
    const userProjects = await this.query()
      .from('users')
      .join('projects', 'users.id', 'projects.user_id')
      .select(['users.username', 'projects.name', 'projects.created'])
      .where({ 'users.active': true })
      .execute();

    return { activeUsers, userProjects };
  }
}

// KUHUL QUERY BUILDER (Fluent Interface)
class KuhulQueryBuilder {
  constructor(idbql) {
    this.idbql = idbql;
    this.storeName = null;
    this.conditions = [];
    this.order = null;
    this.limitCount = null;
    this.offsetCount = 0;
    this.joins = [];
    this.selectFields = ['*'];
  }

  from(storeName) {
    this.storeName = storeName;
    return this;
  }

  where(conditions) {
    this.conditions.push(conditions);
    return this;
  }

  orderBy(field, direction = 'ASC') {
    this.order = { field, direction };
    return this;
  }

  limit(count) {
    this.limitCount = count;
    return this;
  }

  offset(count) {
    this.offsetCount = count;
    return this;
  }

  join(otherStore, leftField, rightField) {
    this.joins.push({ otherStore, leftField, rightField });
    return this;
  }

  select(fields) {
    this.selectFields = fields;
    return this;
  }

  async execute() {
    if (!this.storeName) {
      throw new Error('No store specified. Use .from() first.');
    }

    // Get all records from store
    let results = await this.idbql.getAll(this.storeName);

    // Apply WHERE conditions
    for (const condition of this.conditions) {
      results = results.filter((item) => {
        return Object.entries(condition).every(([key, value]) => {
          if (typeof value === 'object' && value !== null) {
            // Handle operators: $eq, $ne, $gt, $lt, $in, etc
            if (value.$eq !== undefined) return item[key] === value.$eq;
            if (value.$ne !== undefined) return item[key] !== value.$ne;
            if (value.$gt !== undefined) return item[key] > value.$gt;
            if (value.$lt !== undefined) return item[key] < value.$lt;
            if (value.$in !== undefined) return value.$in.includes(item[key]);
            if (value.$like !== undefined) {
              const pattern = value.$like.replace(/%/g, '.*');
              return new RegExp(`^${pattern}$`).test(item[key]);
            }
          }
          return item[key] === value;
        });
      });
    }

    // Apply ORDER BY
    if (this.order) {
      results.sort((a, b) => {
        const aVal = a[this.order.field];
        const bVal = b[this.order.field];

        if (this.order.direction === 'ASC') {
          return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        }
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      });
    }

    // Apply LIMIT and OFFSET
    if (this.offsetCount > 0) {
      results = results.slice(this.offsetCount);
    }

    if (this.limitCount !== null) {
      results = results.slice(0, this.limitCount);
    }

    // Apply SELECT (field selection)
    if (!this.selectFields.includes('*')) {
      results = results.map((item) => {
        const selected = {};
        this.selectFields.forEach((field) => {
          selected[field] = item[field];
        });
        return selected;
      });
    }

    // Apply JOINS (simulated in memory)
    for (const join of this.joins) {
      const otherData = await this.idbql.getAll(join.otherStore);

      results = results.map((item) => {
        const joinedItem = { ...item };
        const match = otherData.find(
          (other) => other[join.rightField] === item[join.leftField]
        );

        if (match) {
          Object.assign(joinedItem, match);
        }

        return joinedItem;
      });
    }

    return results;
  }
}

export { KuhulIDBQL, KuhulQueryBuilder };
