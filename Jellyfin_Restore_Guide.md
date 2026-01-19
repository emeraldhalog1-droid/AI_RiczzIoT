# 🔄 Jellyfin Restore Guide

## ✅ TESTED & VERIFIED BACKUP (January 19, 2026)

This guide shows how to restore your **Jellyfin 10.9.9** and **Docker** from the backup we created on your external NTFS drive (`/dev/sda1`).

**Backup Location:** `/mnt/media/jellyfin_backups/`

**Backup Contents:**
- ✅ Jellyfin 10.9.9 Docker image (374MB)
- ✅ Jellyfin configuration & cache (55MB)
- ✅ Container configuration (12KB)
- ✅ Total: 429MB

---

## 📋 When to Use This Guide

Use this guide when:
- ✅ You accidentally deleted the Jellyfin container
- ✅ Jellyfin stopped working and needs a fresh start
- ✅ You updated Docker/system and things broke
- ✅ You want to rollback to this exact working version
- ✅ You're setting up on a new Orange Pi and want your old config back

---

## ⚡ Quick Start (Copy-Paste Commands)

### Option 1: Full Restore (Recommended)

If you're starting fresh or Jellyfin is completely broken, use this:

```bash
# 1. Stop and remove old container (if it exists)
docker stop jellyfin 2>/dev/null || true
docker rm jellyfin 2>/dev/null || true

# 2. Remove old image (optional, saves space)
docker rmi jellyfin/jellyfin:10.9.9 2>/dev/null || true

# 3. Load the backup image
docker load < /mnt/media/jellyfin_backups/jellyfin_10.9.9_image.tar

# 4. Verify image loaded
docker images | grep jellyfin

# 5. Restore configuration
cd /
tar -xzf /mnt/media/jellyfin_backups/jellyfin_config_backup_20260119_190237.tar.gz

# 6. Create Docker container
docker run -d \
  --name jellyfin \
  --net=host \
  -e PUID=0 \
  -e PGID=0 \
  -e TZ=Asia/Manila \
  -v /srv/jellyfin/config:/config \
  -v /srv/jellyfin/cache:/cache \
  -v /mnt/media:/media \
  jellyfin/jellyfin:10.9.9

# 7. Verify it's running
docker ps

# 8. Test it
curl http://localhost:8096
```

✅ **Done!** Your Jellyfin should be back online!

---

## 📊 Detailed Step-by-Step Restore

### Step 1️⃣ Connect to Your Orange Pi

```bash
ssh root@192.168.100.11
```

### Step 2️⃣ Stop Current Jellyfin Container (if running)

```bash
# Stop the container gracefully
docker stop jellyfin

# Remove the container
docker rm jellyfin

# Check it's gone
docker ps
```

**If you get errors like "container not found", that's OK - it means it's already gone.**

```bash
# These commands handle errors gracefully:
docker stop jellyfin 2>/dev/null || true
docker rm jellyfin 2>/dev/null || true
```

---

### Step 3️⃣ Verify Backup Files Exist

Before restoring, make sure all backup files are on your external drive:

```bash
ls -lh /mnt/media/jellyfin_backups/
```

You should see:
```
-rwxrwxrwx 1 root root   77 Jan 19 19:10 BACKUP_INFO.txt
-rwxrwxrwx 1 root root 374M Jan 19 19:11 jellyfin_10.9.9_image.tar
-rwxrwxrwx 1 root root  55M Jan 19 19:03 jellyfin_config_backup_20260119_190237.tar.gz
-rwxrwxrwx 1 root root  12K Jan 19 19:10 jellyfin_container_config.json
-rwxrwxrwx 1 root root 1.3K Jan 19 19:11 RESTORE_GUIDE.txt
```

✅ **All files present?** Continue to Step 4!

---

### Step 4️⃣ Load Docker Image from Backup

This restores the exact Jellyfin 10.9.9 image we backed up:

```bash
# Load the image (this may take 2-3 minutes)
docker load < /mnt/media/jellyfin_backups/jellyfin_10.9.9_image.tar

# Verify it loaded successfully
docker images | grep jellyfin
```

You should see:
```
jellyfin/jellyfin   10.9.9   <IMAGE_ID>   17 months ago   385MB
```

---

### Step 5️⃣ Restore Configuration & Cache

This restores all your settings, libraries, and watched history:

```bash
# Go to root directory
cd /

# Restore from backup
tar -xzf /mnt/media/jellyfin_backups/jellyfin_config_backup_20260119_190237.tar.gz

# Verify files were restored
ls -la /srv/jellyfin/config/ | head -10
ls -la /srv/jellyfin/cache/ | head -10
```

You should see configuration files like `system.xml`, database files, etc.

---

### Step 6️⃣ Start Jellyfin Container

Now start your restored Jellyfin:

```bash
docker run -d \
  --name jellyfin \
  --net=host \
  -e PUID=0 \
  -e PGID=0 \
  -e TZ=Asia/Manila \
  -v /srv/jellyfin/config:/config \
  -v /srv/jellyfin/cache:/cache \
  -v /mnt/media:/media \
  jellyfin/jellyfin:10.9.9
```

---

### Step 7️⃣ Verify Restoration

Check if everything is working:

```bash
# Check container status
docker ps

# Check logs
docker logs jellyfin | tail -20

# Test the API endpoint
curl http://localhost:8096

# Test status server
curl http://localhost:5000/status | python3 -m json.tool
```

**Expected output:**
```
CONTAINER ID   IMAGE                      COMMAND                CREATED         STATUS                   PORTS     NAMES
116c62fb7749   jellyfin/jellyfin:10.9.9   "/jellyfin/jellyfin"   5 seconds ago   Up 4 seconds (healthy)             jellyfin
```

✅ **Status shows "healthy"? You're done!**

---

### Step 8️⃣ Access Your Jellyfin

Open your browser and go to:
```
http://192.168.100.11:8096
```

**Your Jellyfin should load with:**
- ✅ All your libraries (Movies, TV Shows, Music)
- ✅ All your settings and preferences
- ✅ Your watch history
- ✅ User accounts

---

## 🔧 Troubleshooting Restore Issues

### ❌ Error: "Image load failed"

**Problem:** Docker image file is corrupted or incomplete

```bash
# Check file size (should be 374M)
ls -lh /mnt/media/jellyfin_backups/jellyfin_10.9.9_image.tar

# If too small, backup was incomplete. Re-backup:
docker save jellyfin/jellyfin:10.9.9 > /mnt/media/jellyfin_backups/jellyfin_image_new.tar
```

---

### ❌ Error: "Port 8096 already in use"

**Problem:** Another container or service is using port 8096

```bash
# Find what's using the port
netstat -tulpn | grep 8096

# Stop the conflicting service and try again
docker stop <container_name>
docker run -d --name jellyfin ... (retry the docker run command)
```

---

### ❌ Error: "Cannot connect to Docker daemon"

**Problem:** Docker service stopped

```bash
# Start Docker
systemctl start docker

# Make it auto-start
systemctl enable docker

# Check status
systemctl status docker
```

---

### ❌ Error: "Mount point /mnt/media not found"

**Problem:** External drive not mounted

```bash
# Check if drive is mounted
mount | grep /mnt/media

# If not, mount it manually
mount -a

# Or mount specific drive
mount /mnt/media

# Check it's mounted
ls /mnt/media
```

---

### ❌ Error: "tar: Cannot open: No such file or directory"

**Problem:** Config backup file name might be different (date/time changed)

```bash
# List all backup files
ls /mnt/media/jellyfin_backups/jellyfin_config_backup_*

# Use the exact filename in your command
tar -xzf /mnt/media/jellyfin_backups/jellyfin_config_backup_YYYYMMDD_HHMMSS.tar.gz
```

---

### ❌ Container starts but shows unhealthy

**Problem:** Jellyfin is still initializing

```bash
# Wait a minute and check again
sleep 60
docker ps

# Check logs for errors
docker logs jellyfin | tail -30

# If there are errors, read the full logs
docker logs jellyfin
```

---

### ❌ Jellyfin loads but libraries are empty

**Problem:** Media drive not mounted or permissions wrong

```bash
# Check if media drive is mounted
mount | grep /mnt/media

# Check if you can access files
ls /mnt/media/movies

# Fix permissions if needed
chmod 755 /mnt/media
chown root:root /mnt/media

# Restart Jellyfin
docker restart jellyfin
```

---

### ✅ Health Check Commands

```bash
# 1. Verify Docker image exists
docker images | grep jellyfin

# 2. Verify config was restored
ls -la /srv/jellyfin/config/ | wc -l  # Should show many files

# 3. Verify external drive mounted
mount | grep /mnt/media

# 4. Verify container running
docker ps | grep jellyfin

# 5. Verify port is open
netstat -tulpn | grep 8096

# 6. Verify you can connect
curl -s http://localhost:8096/web/index.html | head -20
```

---

## 📝 How to Use Nano Editor (if editing files needed)

If you need to edit any configuration files during restore:

```bash
nano /srv/jellyfin/config/system.xml
```

**Nano keyboard shortcuts:**
- `Ctrl+O` - Save file
- `Ctrl+X` - Exit nano
- `Ctrl+W` - Find text
- `Ctrl+K` - Cut line
- `Ctrl+U` - Paste line

---

## 🆘 Emergency Restore (Last Resort)

If the standard restore doesn't work, try this nuclear option:

```bash
# 1. Completely remove everything
docker stop jellyfin 2>/dev/null || true
docker rm jellyfin 2>/dev/null || true
docker rmi jellyfin/jellyfin:10.9.9 2>/dev/null || true
rm -rf /srv/jellyfin/* 2>/dev/null || true

# 2. Fresh directories
mkdir -p /srv/jellyfin/config
mkdir -p /srv/jellyfin/cache

# 3. Extract backup from scratch
cd /
tar -xzf /mnt/media/jellyfin_backups/jellyfin_config_backup_20260119_190237.tar.gz

# 4. Load image fresh
docker load < /mnt/media/jellyfin_backups/jellyfin_10.9.9_image.tar

# 5. Verify image
docker images | grep jellyfin

# 6. Start fresh container
docker run -d \
  --name jellyfin \
  --net=host \
  -e PUID=0 \
  -e PGID=0 \
  -e TZ=Asia/Manila \
  -v /srv/jellyfin/config:/config \
  -v /srv/jellyfin/cache:/cache \
  -v /mnt/media:/media \
  jellyfin/jellyfin:10.9.9

# 7. Check status
docker ps
curl http://localhost:8096
```

---

## 📁 Backup Files Reference

**File Details:**

**jellyfin_10.9.9_image.tar (374MB)**
- Complete Docker image
- Contains the entire Jellyfin application
- Can be loaded with: `docker load < jellyfin_10.9.9_image.tar`

**jellyfin_config_backup_20260119_190237.tar.gz (55MB)**
- `/srv/jellyfin/config/` - All settings and metadata
- `/srv/jellyfin/cache/` - Cache files
- Contains database, user accounts, library data

**jellyfin_container_config.json (12KB)**
- Full Docker container configuration
- Port mappings, environment variables
- Reference only (for documentation)

**BACKUP_INFO.txt**
- When backup was created
- Jellyfin version
- Reference information

**RESTORE_GUIDE.txt**
- Quick restore steps
- Command reference

---

## ✅ Success Checklist

After restore, verify:

- [ ] Docker image loaded successfully (`docker images | grep jellyfin`)
- [ ] Container running and healthy (`docker ps`)
- [ ] Jellyfin accessible at `http://192.168.100.11:8096`
- [ ] Libraries showing (Movies, TV Shows, Music)
- [ ] Status server working (`curl http://localhost:5000/status`)
- [ ] Can play a video
- [ ] Settings are preserved
- [ ] Watch history intact
- [ ] User accounts working

---

## 🚨 If Something Goes Wrong

**Before asking for help, gather this information:**

```bash
# Collect logs
docker logs jellyfin > /mnt/media/jellyfin_restore_error.log

# Check system resources
free -h
df -h
top -b -n 1 | head -20

# Check network
ip a
netstat -tulpn | grep 8096

# Check mounts
mount | grep /mnt
lsblk
```

Then share:
1. The error message
2. The output of these commands
3. What step failed

---

## 📞 Quick Reference

| Command | What it does |
|---------|-------------|
| `docker ps` | See running containers |
| `docker logs jellyfin` | See Jellyfin logs |
| `docker restart jellyfin` | Restart Jellyfin |
| `docker stop jellyfin` | Stop Jellyfin |
| `docker rm jellyfin` | Delete Jellyfin container |
| `docker rmi jellyfin/jellyfin:10.9.9` | Delete Jellyfin image |
| `curl http://localhost:8096` | Test Jellyfin connection |
| `ls -lh /mnt/media/jellyfin_backups/` | List backup files |
| `docker save jellyfin/jellyfin:10.9.9 \| gzip > backup.tar.gz` | Create new backup |

---

**Your Jellyfin backup is safe and can be restored anytime!** 🎬✨
