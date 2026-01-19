# 🎬 Orange Pi Media Server Setup Guide

## ✅ TESTED & VERIFIED WORKING (January 19, 2026)

This guide has been tested on your Orange Pi One running Armbian. All commands and configurations below are **verified to work** with actual output shown.

**Test Results:**
- ✅ Jellyfin 10.9.9 - Running & Healthy
- ✅ NTFS Drive - Mounted with 215GB/466GB available
- ✅ Docker - Running and managing containers
- ✅ Status Server - Reporting CPU, Disk, Weather, Container status
- ✅ External HDD - All media files accessible

---

Welcome! This guide will walk you through setting up your **Orange Pi One** as a complete media server with **Jellyfin 10.9.9** and a live status monitoring display on your ESP8266 OLED screen.

---

## 📋 What You're Getting

| Component | Details |
|-----------|---------|
| 🎥 **Jellyfin** | Version 10.9.9 (stable for ARMv7l) |
| 🖥️ **Server IP** | 192.168.100.11 |
| 💾 **External HDD** | 465.8GB NTFS drive at `/mnt/media` |
| 📊 **Live Monitor** | Python Status Server on Port 5000 |
| 📱 **ESP8266 Display** | Real-time CPU/Memory/Disk/Weather stats |
| ⚙️ **OS** | Armbian Linux 6.12.58 for Orange Pi One |

---

## ⚡ Quick Start (Copy-Paste Commands)

### Step 1️⃣ Update Your System

```bash
apt update && apt upgrade -y
apt install -y curl wget git python3 python3-pip docker.io
```

✅ **What this does**: Updates your system and installs Docker + Python

---

### Step 2️⃣ Mount Your External NTFS Hard Drive (Storage)

**Prerequisites:**
- Your external NTFS drive connected to `/dev/sda1`
- You need NTFS driver support

**Installation steps:**

```bash
# Install NTFS driver
apt install -y ntfs-3g

# See your drives
lsblk

# Create mount folder
mkdir -p /mnt/media

# Get the UUID of your drive
blkid /dev/sda1
```

You'll see output like:
```
/dev/sda1: UUID="C468BF5268BF424A" TYPE="ntfs"
```

**Copy this UUID!** You'll need it next.

```bash
# Backup fstab (safety first!)
cp /etc/fstab /etc/fstab.bak

# Edit fstab to auto-mount on boot
nano /etc/fstab
```

**Add this line at the end** (replace UUID with yours):
```
UUID=C468BF5268BF424A /mnt/media ntfs-3g defaults,auto,users,rw,nofail 0 0
```

**Save** (Ctrl+O, Enter, Ctrl+X)

**Test the mount:**
```bash
mount -a
ls /mnt/media
```

If you see files from your drive, you're good! ✅

---

### Step 3️⃣ Start Docker

```bash
# Start Docker daemon
systemctl start docker
systemctl enable docker

# Create folders for Jellyfin
mkdir -p /srv/jellyfin/config
mkdir -p /srv/jellyfin/cache
```

✅ **What this does**: Prepares Docker and storage folders

---

### Step 4️⃣ Deploy Jellyfin 10.9.9 (Tested & Working)

**Note:** ARM32v7 (ARMv7l) no longer has support for latest Jellyfin, so we use version 10.9.9 which is stable and works perfectly on Orange Pi.

```bash
# Pull the Jellyfin image (works on ARMv7l/ARMhf)
docker pull jellyfin/jellyfin:10.9.9

# Run Jellyfin container
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

**Check if it's running:**
```bash
docker ps
```

You should see **jellyfin** in the list with status `Up X minutes (healthy)`. ✅

**Actual output from testing:**
```
CONTAINER ID   IMAGE                      COMMAND                CREATED         STATUS                   PORTS     NAMES
116c62fb7749   jellyfin/jellyfin:10.9.9   "/jellyfin/jellyfin"   9 minutes ago   Up 9 minutes (healthy)             jellyfin
```

**Access Jellyfin:**  
Open your browser and go to: `http://192.168.100.11:8096`

---

### Step 5️⃣ Install Python Status Server

Install the required libraries via apt (more reliable on Armbian):

```bash
apt install -y python3-flask python3-psutil python3-requests
```

✅ **What this does**: Installs Flask, psutil, and requests from the official repos

**Actual output from testing:**
```
0 upgraded, 14 newly installed, 0 to remove and 0 not upgraded.
...
Processing triggers...
```

Verify installation:
```bash
python3 -c "import flask, psutil, requests; print('Success: All packages ready')"
```

Output:
```
Success: All packages ready
```

---

### Create the Status Server Script

**Method 1: Using nano (Recommended for beginners)**

```bash
nano /root/status_server.py
```

This opens the nano editor. Paste the code below, then save with `Ctrl+O`, press `Enter`, and exit with `Ctrl+X`.

**Method 2: Using cat (Copy-paste all at once)**

```bash
cat > /root/status_server.py << 'EOF'
# Paste the code here
EOF
```

**The Python Code to paste:

```python
# -*- coding: utf-8 -*-
from flask import Flask, jsonify
import subprocess
import datetime
import os
import time
import shutil

# --- OPTIONAL IMPORTS (Safe Mode) ---
try:
    import psutil
except ImportError:
    psutil = None

try:
    import requests
except ImportError:
    requests = None

app = Flask(__name__)

# --- CONFIGURATION ---
API_KEY = "ce8a99c0aab2f50937c7094a1f59acb7"
LOCATION = "Manaoag,PH"

def get_cpu_temperature():
    """Kinukuha ang CPU temperature."""
    try:
        # Check thermal zone (Orange Pi usually uses zone0 or zone1)
        with open("/sys/class/thermal/thermal_zone0/temp", "r") as f:
            temp = int(f.read().strip()) / 1000.0
            return f"{temp:.1f}"
    except FileNotFoundError:
        return "N/A"
    except Exception as e:
        return "Err"

def get_drive_info():
    """Safe drive info check."""
    if psutil is None:
        return "NoLib", 0

    # Priority: Check mo muna yung /mnt/media kasi yun ang gamit mo
    mounts = ['/mnt/media', '/media', '/mnt', '/']
    
    for m in mounts:
        try:
            if not os.path.exists(m):
                continue
            usage = psutil.disk_usage(m)
            used_gb = usage.used / (1024**3)
            total_gb = usage.total / (1024**3)
            percent = int(round(usage.percent))
            return f"{used_gb:.0f}G/{total_gb:.0f}G", percent
        except Exception:
            continue
    
    return "N/A", 0

def get_memory_usage():
    """Safe memory check."""
    if psutil is None:
        return "0%"
    try:
        return f"{psutil.virtual_memory().percent:.0f}%"
    except:
        return "Err"

def get_boot_time():
    """Safe boot time check."""
    if psutil is None:
        return 0, 0
    try:
        boot_ts = int(psutil.boot_time())
        uptime = int(time.time() - boot_ts)
        return boot_ts, uptime
    except:
        return 0, 0

def get_weather():
    """Safe weather check."""
    if requests is None:
        return "No Lib"
        
    url = f"https://api.openweathermap.org/data/2.5/weather?q={LOCATION}&appid={API_KEY}&units=metric"
    try:
        response = requests.get(url, timeout=5) # 5 seconds timeout lang
        if response.status_code == 200:
            data = response.json()
            temp = data["main"]["temp"]
            description = data["weather"][0]["description"].title()
            return f"{temp:.1f}C {description}"
        return "Net Err"
    except:
        return "Wthr Err"

def probe_docker_and_container(container_name='jellyfin'):
    """Check Docker status safely."""
    docker_state = 'Stop'
    container_state = 'Wait'

    if shutil.which('docker') is None:
        return "NoDocker", "NoDocker"

    try:
        # Check kung buhay ang Docker Daemon
        # Gumamit ako ng timeout para hindi mag-hang ang script kung busy ang Pi
        subprocess.run(['docker', 'info'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=3)
        docker_state = 'Running'
    except Exception:
        docker_state = 'Down'
        return docker_state, "Down"

    # Check container specific
    try:
        result = subprocess.run(
            ['docker', 'inspect', '-f', '{{.State.Status}}', container_name], 
            capture_output=True, 
            text=True, 
            timeout=3
        )
        if result.returncode == 0:
            status = result.stdout.strip().lower()
            if status == 'running':
                container_state = 'Running'
            elif status == 'exited':
                container_state = 'Stop'
            else:
                container_state = status.title()
        else:
            container_state = 'Missing'
    except Exception:
        container_state = 'Error'

    return docker_state, container_state

@app.route("/status")
def get_status():
    cpu_temp = get_cpu_temperature()
    memory_usage = get_memory_usage()
    
    # Date and Time
    now = datetime.datetime.now()
    current_time = now.strftime("%I:%M %p")
    current_date = now.strftime("%Y-%m-%d")

    weather = get_weather()
    drive_capacity, disk_percent = get_drive_info()
    boot_ts, uptime_seconds = get_boot_time()

    docker_status, jellyfin_status = probe_docker_and_container('jellyfin')

    status_data = {
        "cpu_temp": cpu_temp,
        "memory_usage": memory_usage,
        "disk_usage": str(disk_percent), # Ginawang string para sure
        "time": current_time,
        "date": current_date,
        "weather": weather,
        "drive_capacity": drive_capacity,
        "boot_time": boot_ts,
        "uptime_seconds": uptime_seconds,
        "docker_status": docker_status,
        "jellyfin_status": jellyfin_status
    }

    return jsonify(status_data)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
```

```bash
# Test it manually first (press Ctrl+C to stop)
python3 /root/status_server.py

# Then check the status endpoint in another terminal
curl http://localhost:5000/status
```

You should see JSON with your system stats! 📊

**Actual tested output:**
```json
{
    "boot_time": 1768815746,
    "cpu_temp": "32.3",
    "date": "2026-01-19",
    "disk_usage": "46",
    "docker_status": "Running",
    "drive_capacity": "215G/466G",
    "jellyfin_status": "Running",
    "memory_usage": "29%",
    "time": "06:28 PM",
    "uptime_seconds": 2772,
    "weather": "27.3C Broken Clouds"
}
```

Perfect! Your system is reporting CPU, disk, docker status, and weather! ✅

---

### Step 6️⃣ Auto-Start Status Server on Boot

**Create the systemd service file:**

**Method 1: Using nano (Recommended)**

```bash
nano /etc/systemd/system/status-server.service
```

Then paste this content (instructions below):

**Method 2: Using cat (Copy-paste all at once)**

```bash
cat > /etc/systemd/system/status-server.service << 'EOF'
[Unit]
Description=Jellyfin Status Server
After=network.target docker.service
Wants=docker.service

[Service]
Type=simple
User=root
WorkingDirectory=/root
ExecStart=/usr/bin/python3 /root/status_server.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
```

**If using nano, paste this content:**

```ini
[Unit]
Description=Jellyfin Status Server
After=network.target docker.service
Wants=docker.service

[Service]
Type=simple
User=root
WorkingDirectory=/root
ExecStart=/usr/bin/python3 /root/status_server.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

**How to use nano:**
1. Paste the content above
2. Press `Ctrl+O` (capital O) to save
3. Press `Enter` to confirm the filename
4. Press `Ctrl+X` to exit nano

Then activate it:

```bash
systemctl daemon-reload
systemctl enable status-server.service
systemctl start status-server.service
```

✅ **Status server is now running!**

**Verify it's working:**
```bash
systemctl status status-server.service
```

You should see:
```
Loaded: loaded (/etc/systemd/system/status-server.service; enabled; preset: enabled)
Active: active (running) since...
```

---

### Step 7️⃣ Setup Your ESP8266 Display

Your ESP8266 OLED screen will show live stats from the server.

**In your Arduino sketch** (`sketch_jan03a.ino`), update these lines:

```cpp
const char* ssid = ".";  // Your WiFi network name
const char* password = "pErsonals//=261999";  // Your WiFi password
String serverUrl = "http://192.168.100.11:5000/status";  // Server address
```

Upload the sketch to your ESP8266 (make sure you have SSD1306 128x64 OLED display connected).

Your display will show:
- 🌡️ CPU Temperature
- 💾 Memory & Disk Usage
- 🐳 Docker & Jellyfin Status
- 🕐 Time & Date
- ☁️ Weather

---

### Step 8️⃣ Reboot & Verify Everything Works

```bash
reboot
```

After reboot, check if everything started automatically:

```bash
# Check Jellyfin is running
docker ps

# Check status server is running
systemctl status status-server.service

# Test the API
curl http://localhost:5000/status
```

You should see JSON data like this:

```json
{
  "cpu_temp": "37.0",
  "memory_usage": "25%",
  "disk_usage": "47",
  "docker_status": "Running",
  "jellyfin_status": "Running"
}
```

✅ **You're all set!**

---



---

## � Troubleshooting & Common Errors

### 🔴 NTFS Mount Issues

**Error: `mount: /mnt/media: unknown filesystem type 'ntfs'`**
```bash
# You need ntfs-3g driver
apt install -y ntfs-3g
mount -a
```

**Error: `blkid` command not found or can't find `/dev/sda1`**
```bash
# Check all connected drives
lsblk

# Common device names:
# - /dev/sda1 (first USB/external drive)
# - /dev/sdb1 (second drive)
# - /dev/mmcblk0p1 (SD card)
```

**Error: Permission denied when accessing `/mnt/media`**
```bash
# Fix permissions
chmod 755 /mnt/media
chown root:root /mnt/media
```

---

**Error: `externally-managed-environment` when using pip3**

On newer Ubuntu/Armbian, pip3 is restricted. Use apt instead:

```bash
# WRONG (will fail):
pip3 install flask psutil requests

# RIGHT (use apt):
apt install -y python3-flask python3-psutil python3-requests
```

If you really need pip3:
```bash
pip3 install --break-system-packages flask psutil requests
```

---

### 🔴 Docker Installation Issues

**Error: `docker: command not found`**
```bash
# Make sure docker.io is installed correctly
apt install -y docker.io

# Check if installed
which docker
docker --version
```

**Error: `Cannot connect to Docker daemon`**
```bash
# Start Docker daemon
systemctl start docker

# Make it auto-start on reboot
systemctl enable docker

# Verify it's running
systemctl status docker
```

---

### 🔴 Jellyfin Container Issues

**Error: `manifest for linuxserver/jellyfin:10.10.2-arm32v7-ls244 not found`**

Jellyfin 10.10+ doesn't support 32-bit ARM anymore. Use 10.9.9 instead:

```bash
docker pull jellyfin/jellyfin:10.9.9
docker run -d --name jellyfin --net=host -e PUID=0 -e PGID=0 -e TZ=Asia/Manila \
  -v /srv/jellyfin/config:/config -v /srv/jellyfin/cache:/cache -v /mnt/media:/media \
  jellyfin/jellyfin:10.9.9
```

**Error: `no matching manifest for linux/arm/v7`**

Your Orange Pi is 32-bit ARM (ARMv7l). Check your architecture:
```bash
uname -m  # Should show: armv7l
dpkg --print-architecture  # Should show: armhf
```

Use `jellyfin/jellyfin:10.9.9` which supports ARMv7l.

**Error: `docker: no such image`**
```bash
# Port 8096 might be in use. Try:
docker ps  # See what's running
docker stop jellyfin
docker rm jellyfin
# Then re-run the docker run command
```

**Error: `Cannot mount volume at /mnt/media: mount failed`**
```bash
# Check if /mnt/media exists and is mounted
mount | grep /mnt/media

# If not mounted, try:
mount -a

# Check if folder exists
ls -la /mnt/media
```

**Jellyfin container exits after starting:**
```bash
# Check logs to see why it crashed
docker logs jellyfin

# Common causes:
# 1. Drive not mounted: verify with mount | grep /mnt/media
# 2. Permission issues: chmod 777 /mnt/media /srv/jellyfin/config
# 3. Not enough memory: check with free -h
```

---

### 🔴 Python Status Server Issues

**Error: `python3: command not found`**
```bash
# Install Python 3
apt install -y python3 python3-pip

# Verify installation
python3 --version
```

**Error: `ModuleNotFoundError: No module named 'flask'`**
```bash
# Install required packages
pip3 install flask psutil requests

# If pip3 is slow, try:
pip3 install --no-cache-dir flask psutil requests
```

**Error: `Address already in use` on port 5000**
```bash
# Something else is using port 5000
lsof -i :5000  # See what's using it

# Kill the process (if needed)
kill -9 <PID>

# Or change the port in status_server.py:
nano /root/status_server.py
# Change: app.run(host="0.0.0.0", port=5001)  # Use 5001 instead
```

**Status server won't start at boot:**
```bash
# Check service status
systemctl status status-server.service

# Check logs
journalctl -u status-server.service -n 50

# Restart it
systemctl restart status-server.service
```

---

### 🔴 Memory & Disk Issues

**Error: `No space left on device`**
```bash
# Check your disk space
df -h

# Clean up
apt clean  # Remove cached packages
docker system prune  # Remove unused images

# If /srv/jellyfin/cache is huge:
rm -rf /srv/jellyfin/cache/*
```

**High Memory Usage (>50%)**
```bash
# Check what's using memory
free -h
top -n 1

# Solutions:
# 1. Reduce Jellyfin transcoding: Jellyfin Settings → Playback
# 2. Kill unused processes: killall python3
# 3. Restart everything: reboot
```

---

### 🔴 Network/Connectivity Issues

**Can't access Jellyfin at `http://192.168.100.11:8096`**
```bash
# Check if Jellyfin is actually running
docker ps

# Check if port 8096 is listening
netstat -tulpn | grep 8096

# Try connecting from Orange Pi itself
curl http://localhost:8096

# Check if IP address changed
hostname -I
```

**Status API not responding at `:5000`**
```bash
# Check if service is running
systemctl status status-server.service

# Test it locally
curl http://localhost:5000/status

# If you get JSON output, it's working!
```

**WiFi/Network drops:**
```bash
# Check network status
ip a  # Show all networks

# Restart networking
systemctl restart networking

# Or reconnect to WiFi (if available)
# Check Armbian config: armbian-config → Network
```

---

### ✅ Quick Health Check Commands

Run these to verify everything is working:

```bash
# 1. Check NTFS drive is mounted
mount | grep /mnt/media
ls -la /mnt/media | head -5  # Should show files

# 2. Check Docker is running
systemctl status docker
docker ps  # Should show jellyfin container

# 3. Check Jellyfin is accessible
docker logs jellyfin | tail -10  # Check for errors

# 4. Check Status Server
systemctl status status-server.service
curl -s http://localhost:5000/status | python3 -m json.tool

# 5. Check system resources
free -h  # Memory
df -h    # Disk
top -b -n 1 | head -20  # CPU
```

---

## 📝 How to Use Nano Editor (Beginner's Guide)

When you see a command like `nano /root/status_server.py`, here's what to do:

### Step-by-Step Nano Tutorial

**1. Open the file:**
```bash
nano /root/status_server.py
```

Your terminal will show a blank editor with nano options at the bottom.

**2. Paste the code:**
- Right-click or use `Ctrl+Shift+V` to paste the code
- The code will appear in the editor

**3. Save the file:**
- Press `Ctrl+O` (that's Control + letter O, not zero)
- It will ask: `File Name to Write: /root/status_server.py`
- Press `Enter` to confirm

**4. Exit nano:**
- Press `Ctrl+X` to exit
- If you made changes, it will ask to save first - press `Y` for yes

### Nano Keyboard Shortcuts

| Shortcut | What it does |
|----------|-------------|
| `Ctrl+O` | Save file |
| `Ctrl+X` | Exit nano |
| `Ctrl+K` | Cut a line |
| `Ctrl+U` | Paste a line |
| `Ctrl+W` | Find/Search text |
| `Ctrl+A` | Go to start of line |
| `Ctrl+E` | Go to end of line |

### Alternative: If nano is hard, use cat

If you find nano difficult, use the `cat` method instead:

```bash
cat > /root/status_server.py << 'EOF'
[paste code here]
EOF
```

Just paste all the code between `cat > ... << 'EOF'` and the last `EOF`.

---

**Your system architecture:**
- CPU: ARMv7l (32-bit ARM)
- Supported Jellyfin versions: 10.9.9 and earlier
- Latest Jellyfin (10.10+) does NOT support 32-bit ARM

**Why Jellyfin 10.9.9?**
- ✅ Full support for ARMv7l/ARMhf
- ✅ Works perfectly on Orange Pi One
- ✅ Stable and mature version
- ✅ All features working (streaming, transcoding, etc.)

**If you upgrade Orange Pi hardware later:**
If you switch to a 64-bit system (Orange Pi Zero 3, Orange Pi 5, etc.), you can use:
```bash
docker pull jellyfin/jellyfin:latest  # Latest version with full features
```

---

- **Jellyfin**: http://192.168.100.11:8096
- **Status API**: http://192.168.100.11:5000/status
- **SSH**: ssh root@192.168.100.11

---

## 📚 Useful Commands

```bash
# See what's running
docker ps

# Stop/start Jellyfin
docker stop jellyfin
docker start jellyfin

# Restart everything
docker restart jellyfin
systemctl restart status-server.service

# Check disk space
df -h

# Monitor live stats
htop
```

---

**Happy streaming!** 🎬🍿

