function getBarColor(percent)
{
 if (percent > 85) return '#ef4444'; //red
 if (percent > 60) return '#f59e0b'; //yellow
 return '#10b981'; // green
 }

async function fetchStats() {
 try {
      const res = await fetch('/api/system-stats');
      const data = await res.json();

 if (data.success) {
// update CPU
  document.getElementById('cpu-text').innerText = `${data.cpu}%`;
  const cpuBar = document.getElementById('cpu-bar');
  cpuBar.style.width = `${data.cpu}%`;
  cpuBar.style.backgroundColor = getBarColor(data.cpu);
// update ram
  document.getElementById('ram-text').innerText = `${data.ram.percent}%`;
  document.getElementById('ram-detail').innerText = `${data.ram.usedGB} GB / ${data.ram.totalGB} GB`;
  const ramBar = document.getElementById('ram-bar');
  ramBar.style.width = `${data.ram.percent}%`;
  ramBar.style.backgroundColor = getBarColor(data.ram.percent);
// update Storage
  document.getElementById('storage-text').innerText = `${data.storage.percent}%`;
  document.getElementById('storage-detail').innerText = `${data.storage.usedGB} GB / ${data.storage.totalGB} GB`;
  const storageBar = document.getElementById('storage-bar');
  storageBar.style.width = `${data.storage.percent}%`;
  storageBar.style.backgroundColor = getBarColor(data.storage.percent);
   }
// teks persent battery
  document.getElementById('battery-text').innerText = `${data.battery.percentage}%`;
// teks detail status battery
  document.getElementById('battery-detail').innerText = `Status: ${data.battery.status}`;
// update data battery dan warna
  const batteryBar = document.getElementById('battery-bar');
  batteryBar.style.width = `${data.battery.percentage}%`;
  batteryBar.style.backgroundColor = getBarColor(data.battery.percentage);
//update IP
  document.getElementById('ip-text').innerText = data.ip;
  document.getElementById('uptime-text').innerText = data.uptime;
 } catch (err) {
   console.error("Gagal fetch data:", err);
   }
 }
// auto refresh tiap 1.5 detik
setInterval(fetchStats, 1500);
fetchStats();
