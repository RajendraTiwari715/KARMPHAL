const path = require('path');
const fs = require('fs');
const db = require('../database');
const logger = require('../utils/logger');

async function performBackup() {
  const backupDir = process.env.BACKUP_DIR || path.resolve(__dirname, '../backups');
  fs.mkdirSync(backupDir, { recursive: true });

  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, '-');
  const backupFileName = `karmphal-backup-${timestamp}.db`;
  const backupFilePath = path.join(backupDir, backupFileName);

  logger.info(`Starting SQLite online backup...`, { destination: backupFilePath });
  const startTime = Date.now();

  try {
    // SQLite online backup API ensures safe, non-blocking backup while DB is running
    await db.backup(backupFilePath, {
      progress({ totalPages, remainingPages }) {
        if (totalPages > 0 && remainingPages === 0) {
          logger.info(`Online backup pages transferred: ${totalPages}/${totalPages}`);
        }
      }
    });

    const elapsed = Date.now() - startTime;
    const stats = fs.statSync(backupFilePath);
    logger.info(`Online backup completed successfully in ${elapsed}ms`, {
      file: backupFileName,
      sizeBytes: stats.size,
      sizeKb: (stats.size / 1024).toFixed(2)
    });

    // Enforce retention policy (default: keep last 7 backups)
    const retentionCount = parseInt(process.env.BACKUP_RETENTION, 10) || 7;
    const existingBackups = fs.readdirSync(backupDir)
      .filter(f => f.startsWith('karmphal-backup-') && f.endsWith('.db'))
      .map(f => ({
        name: f,
        fullPath: path.join(backupDir, f),
        mtime: fs.statSync(path.join(backupDir, f)).mtimeMs
      }))
      .sort((a, b) => b.mtime - a.mtime); // Newest first

    if (existingBackups.length > retentionCount) {
      const toDelete = existingBackups.slice(retentionCount);
      for (const item of toDelete) {
        fs.unlinkSync(item.fullPath);
        logger.info(`Pruned old backup per retention policy (${retentionCount} max): ${item.name}`);
      }
    }

    console.log(`✅ Backup successfully created at: ${backupFilePath}`);
    return backupFilePath;
  } catch (err) {
    logger.error('SQLite online backup failed', { error: err.message, stack: err.stack });
    console.error(`❌ Backup failed: ${err.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  performBackup().then(() => {
    process.exit(0);
  });
}

module.exports = { performBackup };
