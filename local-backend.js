// local-backend.js
class NexusLocalBackend {
  constructor() {
    this.idbql = new KuhulIDBQL();
    this.encryption = new LocalEncryption();
    this.fileSystem = new LocalFileSystemManager();
    this.session = null;
  }

  async initialize() {
    // 1. Load KUHUL schema
    const schema = await this.loadSchema();

    // 2. Initialize IDB-QL
    await this.idbql.init(schema);

    // 3. Check for existing user session
    this.session = await this.restoreSession();

    // 4. Initialize file watchers for current project
    if (this.session?.currentProject) {
      await this.fileSystem.watchProject(this.session.currentProject);
    }

    console.log('🏠 Nexus Local Backend Ready');
    return this;
  }

  // USER MANAGEMENT
  async registerUser(username, password) {
    // Generate user ID with SCXQ2
    const userId = SCXQ2.hashToGlyph(username);

    // Derive encryption key from password
    const masterKey = await this.encryption.deriveKey(password, userId);

    // Create user in local DB
    await this.idbql.transaction(async (tx) => {
      // Create user record
      await tx.objectStore('users').add({
        id: userId,
        username,
        email: '', // Can be added later
        password_hash: await this.encryption.hashPassword(password),
        created: new Date().toISOString(),
        active: true,
      });

      // Create user directory
      await this.fileSystem.createUserDirectory(userId);

      // Store encryption key in OS keychain (local)
      await this.encryption.storeMasterKey(userId, masterKey);
    });

    return { userId, message: 'User created locally' };
  }

  async loginUser(username, password) {
    const userId = SCXQ2.hashToGlyph(username);

    // Get user from local DB
    const user = await this.idbql.query()
      .from('users')
      .where({ id: userId, active: true })
      .execute();

    if (!user.length) {
      throw new Error('User not found');
    }

    // Verify password (local)
    const isValid = await this.encryption.verifyPassword(
      password,
      user[0].password_hash
    );

    if (!isValid) {
      throw new Error('Invalid password');
    }

    // Create session (local)
    const sessionToken = crypto.randomUUID();
    const sessionData = {
      id: sessionToken,
      user_id: userId,
      token: sessionToken,
      created: new Date().toISOString(),
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      ip: '127.0.0.1',
      user_agent: 'nexus-local',
    };

    // Store session in local DB
    await this.idbql.create('sessions', sessionData);

    // Also store in browser localStorage for web version
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('nexus_session', JSON.stringify(sessionData));
    }

    this.session = { ...sessionData, user: user[0] };

    return this.session;
  }

  // FILE MANAGEMENT WITH GLYPHS
  async indexProjectFiles(projectPath) {
    const files = await this.fileSystem.getAllFiles(projectPath);
    const projectId = SCXQ2.hashToGlyph(projectPath);

    // Create or get project record
    let project = await this.idbql.query()
      .from('projects')
      .where({ path: projectPath })
      .execute();

    if (!project.length) {
      project = [
        await this.idbql.create('projects', {
          id: projectId,
          user_id: this.session?.user_id,
          name: path.basename(projectPath),
          path: projectPath,
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
          config: {},
        }),
      ];
    }

    // Index each file with glyph
    for (const filePath of files) {
      const fileGlyph = SCXQ2.compressFilePath(filePath);
      const stats = fs.statSync(filePath);
      const contentHash = await this.fileSystem.hashFile(filePath);

      // Check if file already indexed
      const existing = await this.idbql.query()
        .from('files')
        .where({ glyph: fileGlyph })
        .execute();

      if (!existing.length) {
        // Create file record
        await this.idbql.create('files', {
          project_id: project[0].id,
          glyph: fileGlyph,
          path: filePath,
          content_hash: contentHash,
          size: stats.size,
          created: new Date().toISOString(),
          modified: new Date(stats.mtimeMs).toISOString(),
        });

        // Store glyph mapping
        await this.idbql.create('glyph_mappings', {
          glyph: fileGlyph,
          original_path: filePath,
          project_id: project[0].id,
          created: new Date().toISOString(),
          compression_ratio:
            ((filePath.length - fileGlyph.length) / filePath.length) * 100,
        });
      }
    }

    return { indexed: files.length, project: project[0] };
  }

  async getFileByGlyph(glyph) {
    // Get file info from local DB
    const file = await this.idbql.query().from('files').where({ glyph }).execute();

    if (!file.length) {
      throw new Error(`File not found for glyph: ${glyph}`);
    }

    // Read actual file content
    const content = await this.fileSystem.readFile(file[0].path);

    return {
      ...file[0],
      content,
      glyph,
    };
  }

  async updateFileByGlyph(glyph, content) {
    // Get file info
    const file = await this.idbql.query().from('files').where({ glyph }).execute();

    if (!file.length) {
      throw new Error(`File not found for glyph: ${glyph}`);
    }

    // Write to actual file
    await this.fileSystem.writeFile(file[0].path, content);

    // Update file record
    const newHash = await this.fileSystem.hashFile(file[0].path);
    const stats = fs.statSync(file[0].path);

    await this.idbql.update(
      'files',
      {
        content_hash: newHash,
        size: stats.size,
        modified: new Date().toISOString(),
      },
      { glyph }
    );

    // Record change history
    await this.idbql.create('file_changes', {
      file_id: file[0].id,
      change_type: 'UPDATE',
      old_content: file[0].content_hash,
      new_content: newHash,
      changed_at: new Date().toISOString(),
      user_id: this.session?.user_id,
    });

    return { success: true, glyph, path: file[0].path };
  }

  // API KEY MANAGEMENT (LOCAL ENCRYPTED)
  async storeAPIKey(provider, apiKey) {
    if (!this.session) {
      throw new Error('Not authenticated');
    }

    const glyph = this.getProviderGlyph(provider);
    const encryptedKey = await this.encryption.encryptData(
      apiKey,
      this.session.user_id
    );

    // Store in local DB
    await this.idbql.create('api_keys', {
      user_id: this.session.user_id,
      provider,
      glyph,
      encrypted_key: encryptedKey,
      created: new Date().toISOString(),
      last_used: null,
      usage_count: 0,
    });

    return { success: true, glyph, provider };
  }

  async getAPIKey(providerGlyph) {
    if (!this.session) {
      throw new Error('Not authenticated');
    }

    // Get encrypted key from local DB
    const keyRecord = await this.idbql.query()
      .from('api_keys')
      .where({ glyph: providerGlyph, user_id: this.session.user_id })
      .execute();

    if (!keyRecord.length) {
      throw new Error(`No API key found for glyph: ${providerGlyph}`);
    }

    // Decrypt locally
    const decryptedKey = await this.encryption.decryptData(
      keyRecord[0].encrypted_key,
      this.session.user_id
    );

    // Update usage stats
    await this.idbql.update(
      'api_keys',
      {
        last_used: new Date().toISOString(),
        usage_count: keyRecord[0].usage_count + 1,
      },
      { id: keyRecord[0].id }
    );

    return decryptedKey;
  }

  // USAGE TRACKING
  async trackGlyphUsage(glyphType) {
    if (!this.session) return;

    const today = new Date().toISOString().split('T')[0];

    // Check existing record
    const existing = await this.idbql.query()
      .from('usage_stats')
      .where({
        user_id: this.session.user_id,
        date: today,
        glyph_type: glyphType,
      })
      .execute();

    if (existing.length) {
      // Update count
      await this.idbql.update(
        'usage_stats',
        { count: existing[0].count + 1 },
        { id: existing[0].id }
      );
    } else {
      // Create new record
      await this.idbql.create('usage_stats', {
        user_id: this.session.user_id,
        date: today,
        glyph_type: glyphType,
        count: 1,
      });
    }
  }

  // BACKUP SYSTEM
  async createBackup(name) {
    if (!this.session) {
      throw new Error('Not authenticated');
    }

    // Export all user data
    const backupData = {
      users: await this.idbql.query().from('users').execute(),
      projects: await this.idbql.query().from('projects').execute(),
      files: await this.idbql.query().from('files').execute(),
      api_keys: await this.idbql.query().from('api_keys').execute(),
      migrations: await this.idbql.query().from('migrations').execute(),
    };

    // Encrypt backup with user's key
    const encryptedBackup = await this.encryption.encryptData(
      JSON.stringify(backupData),
      this.session.user_id
    );

    // Create backup record
    await this.idbql.create('backups', {
      name,
      created: new Date().toISOString(),
      size: encryptedBackup.length,
      encrypted_data: encryptedBackup,
      checksum: await this.encryption.hashData(encryptedBackup),
      user_id: this.session.user_id,
    });

    // Also save to file system
    const backupPath = `~/.nexus/backups/${name}_${Date.now()}.nexusbackup`;
    await this.fileSystem.writeFile(backupPath, encryptedBackup);

    return { success: true, path: backupPath };
  }

  async restoreBackup(backupId) {
    // Get backup from local DB
    const backup = await this.idbql.query()
      .from('backups')
      .where({ id: backupId })
      .execute();

    if (!backup.length) {
      throw new Error('Backup not found');
    }

    // Decrypt backup data
    const decrypted = await this.encryption.decryptData(
      backup[0].encrypted_data,
      this.session.user_id
    );

    const backupData = JSON.parse(decrypted);

    // Clear existing data (except current session)
    await this.idbql.transaction(async (tx) => {
      const stores = ['projects', 'files', 'api_keys'];

      for (const storeName of stores) {
        const store = tx.objectStore(storeName);
        const clearRequest = store.clear();

        await new Promise((resolve, reject) => {
          clearRequest.onsuccess = resolve;
          clearRequest.onerror = reject;
        });
      }

      // Restore data
      for (const [storeName, data] of Object.entries(backupData)) {
        if (storeName === 'users') continue; // Don't restore users

        const store = tx.objectStore(storeName);

        for (const item of data) {
          await new Promise((resolve, reject) => {
            const request = store.add(item);
            request.onsuccess = resolve;
            request.onerror = reject;
          });
        }
      }
    });

    return { success: true, restored: Object.keys(backupData).length };
  }

  // UTILITIES
  getProviderGlyph(provider) {
    const glyphs = {
      openai: '⚡▣',
      anthropic: '⚡◈',
      deepseek: '⚡⟁',
      mistral: '⚡🌀',
      gemma: '⚡💎',
      custom: '⚡⚙️',
    };

    return glyphs[provider] || '⚡⚙️';
  }

  async restoreSession() {
    // Try to restore from localStorage first
    if (typeof localStorage !== 'undefined') {
      const sessionStr = localStorage.getItem('nexus_session');
      if (sessionStr) {
        const sessionData = JSON.parse(sessionStr);

        // Check if session is still valid
        if (new Date(sessionData.expires) > new Date()) {
          // Get user data
          const user = await this.idbql.query()
            .from('users')
            .where({ id: sessionData.user_id })
            .execute();

          if (user.length) {
            return { ...sessionData, user: user[0] };
          }
        }
      }
    }

    return null;
  }
}

export { NexusLocalBackend };
