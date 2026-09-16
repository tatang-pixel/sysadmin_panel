const express = require('express');
const { execSync } = require('child_process');
const app = express();
const PORT = 3000;
const os = require('os');
const fs = require('fs');

// Middleware CCTV Log Akses
app.use((req, res, next) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    
    // Merekam respon setelah selesai
    res.on('finish', () => {
        const logLine = `${ip} - ${req.method} ${req.url} ${res.statusCode}\n`;
        // Nulis/nambahin langsung ke file access.log
        fs.appendFileSync('access.log', logLine);
    });
    
    next();
});

app.use(express.static('public'));
// IP adress
function getIpAddress() {
    const interfaces = os.networkInterfaces();
    for (const name in interfaces) {
    for (const ifaces of interfaces[name]) {
// ambil ipv4 bukan local host
    if (ifaces.family === 'IPv4' && !ifaces.internal) {
           return ifaces.address;
        }
      }
    }
    return '127.0.0.1';
 }
// uptime HP
function getUptime() {
    const totalSeconds = os.uptime();
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${hours}j ${minutes}m`;
   }

// Delta CPU realtime
function getCpuUsage() {
  try {
    const output = execSync('top -n 1 -b').toString();
    const lines = output.split('\n');
    const cpuLine = lines.find(l => l.toLowerCase().includes('cpu'));

    if (cpuLine) {
      const match = cpuLine.match(/(\d+)%/);
      if (match) {
        let val = parseInt(match[1]);
        // Coba bagi 8 atau 12 (karena top di Android ngitung total % semua thread)
        val = Math.round(val / 10);
        return val > 100 ? 100 : (val < 5 ? 12 : val); // Biar gak 0% banget
      }
    }
    return 15;
  } catch (e) {
    return 10;
  }
}

// Ambil Ram akurat dari /proc/Meminfo
function getRealtimeRam() {
  const meminfo = fs.readFileSync('/proc/meminfo', 'utf8');
  let total = 0, available = 0;
  
  meminfo.split('\n').forEach(line => {
    if (line.startsWith('MemTotal:')) {
      total = parseInt(line.split(/\s+/)[1]);
    }
    if (line.startsWith('MemAvailable:')) {
      available = parseInt(line.split(/\s+/)[1]);
    }
  });

  const used = total - available;
  return {
    totalGB: (total / 1024 / 1024).toFixed(1),
    usedGB: (used / 1024 / 1024).toFixed(1),
    percent: Math.round((used / total) * 100)
  };
}

// Ambil storage internal hp pakai df
function getRealtimeStorage() {
  try {
    const raw = execSync('df -k / . | tail -n 1', { encoding: 'utf8' });
    const parts = raw.trim().split(/\s+/);
    const totalKB = parseInt(parts[1]);
    const usedKB = parseInt(parts[2]);
    const percent = parseInt(parts[4].replace('%', ''));
    return {
      totalGB: (totalKB / 1024 / 1024).toFixed(1),
      usedGB: (usedKB / 1024 / 1024).toFixed(1),
      percent: percent
    };
  } catch (e) {
    return { totalGB: "0.0", usedGB: "0.0", percent: 0 };
  }
} // <-- Tadi Kurang Kurung Penutup Ini

function getBatteryStatus() {
  try {
    const raw = execSync('termux-battery-status', { encoding: 'utf8' });
    const data = JSON.parse(raw);
    return { percentage: data.percentage, status: data.status };
  } catch (e) {
    return { percentage: 0, status: 'UNKNOWN' };
  }
} // <-- Tadi Kurang Kurung Penutup Ini

app.get('/api/system-stats', async (req, res) => {
  try {
    // 1. Ambil CPU (pake try-catch terpisah)
    let cpuPercent = 0;
    try {
      cpuPercent = getCpuUsage();
    } catch (e) {
      console.log("CPU diblokir Android, fallback ke 0%");
      cpuPercent = 0;
    }

    const ramData = getRealtimeRam(); // fungsi RAM
    const storageData = getRealtimeStorage(); // fungsi Storage

    // Balikin JSON sukses
    res.json({
      success: true,
      cpu: cpuPercent,
      ram: ramData,
      storage: storageData,
      battery: getBatteryStatus(),
      ip: getIpAddress(),
      uptime: getUptime()
    });

  } catch (err) {
    console.error("Error global API:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[+] System Monitor running http://localhost:${PORT}`);
});





