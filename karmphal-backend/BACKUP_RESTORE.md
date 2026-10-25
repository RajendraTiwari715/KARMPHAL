# SQLite Online Backup and Restore Guide for Karmphal Backend

This document details the automated backup and disaster recovery procedures for the SQLite database (`karmphal.db`) used in `karmphal-backend`.

---

## 1. Online Backup Mechanism

The backup script utilizes SQLite's **native Online Backup API** via `better-sqlite3` (`db.backup()`).

### Key Benefits:
- **Zero Downtime**: The database remains fully open for concurrent reads and writes (WAL mode) while the backup is performed.
- **Consistent Snapshot**: Transactions committed during the backup are safely included; partial uncommitted writes are never copied.
- **Non-blocking**: Does not lock the database or stall active user requests.
- **Automated Retention**: By default, keeps the **last 7 backups** (`BACKUP_RETENTION=7`), automatically purging older snapshots.

---

## 2. Running Backups

### Manual Execution:
Run the backup script directly using npm:
```bash
npm run backup
```

### Environment Variables:
- `DB_PATH`: Path to the SQLite database (default: `./karmphal.db`).
- `BACKUP_DIR`: Directory where backups are written (default: `./backups/`).
- `BACKUP_RETENTION`: Number of recent backups to keep (default: `7`).

### Scheduled Cron Job (Production Linux):
To run backups daily at 02:00 AM UTC:
```bash
0 2 * * * cd /opt/karmphal/karmphal-backend && npm run backup >> /var/log/karmphal-backup.log 2>&1
```

---

## 3. Database Restore Procedure

In the event of database corruption, accidental data deletion, or disaster recovery, follow these steps to restore from a backup:

### Step 1: Stop the Backend Server
Stop the backend process cleanly so that no new writes or WAL locks are held:
```bash
# Systemd
sudo systemctl stop karmphal-backend

# PM2
pm2 stop karmphal-backend

# Or kill process gracefully (SIGTERM)
```

### Step 2: Verify the Backup File Integrity
Before restoring, verify that the backup file is healthy:
```bash
# Using sqlite3 CLI
sqlite3 ./backups/karmphal-backup-YYYY-MM-DD_HH-mm-ss.db "PRAGMA integrity_check;"
```
Expected output:
```
ok
```

### Step 3: Archive the Current Corrupted / Failing Database
Save the current database state for forensics:
```bash
mv karmphal.db karmphal.db.corrupt.$(date +%s)
rm -f karmphal.db-wal karmphal.db-shm
```

### Step 4: Restore from Backup
Copy the chosen backup file to the database location:
```bash
cp ./backups/karmphal-backup-YYYY-MM-DD_HH-mm-ss.db karmphal.db
```

### Step 5: Start the Backend Server
Start the backend service:
```bash
# Systemd
sudo systemctl start karmphal-backend

# PM2
pm2 start karmphal-backend
```

### Step 6: Verify Database Connectivity
Check the health and readiness probe:
```bash
curl -i http://localhost:5000/ready
```
Expected response:
```json
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{
  "status": "ready",
  "database": "connected"
}
```
