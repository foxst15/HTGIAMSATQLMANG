const mockHosts = [
  { hostid: "FX-01", name: "Core-Switch-Cisco", ip: "192.168.1.254", status: "0" },
  { hostid: "FX-02", name: "Web-Server-Nginx", ip: "192.168.1.10", status: "0" },
  { hostid: "FX-03", name: "Database-MySQL", ip: "192.168.1.11", status: "0" },
  { hostid: "FX-04", name: "Router-Gateway", ip: "192.168.1.1", status: "0" },
  { hostid: "FX-05", name: "Client-PC-ZoneA", ip: "192.168.1.45", status: "1" }, 
];

let trafficChart;
let timeLabels = ["10:00", "10:05", "10:10", "10:15", "10:20", "10:25"];
let inboundData = [45, 60, 55, 80, 70, 95];
let outboundData = [20, 35, 30, 45, 40, 60];

function initChart() {
  const ctx = document.getElementById("trafficChart").getContext("2d");
  
  // Custom gradient cho Chart
  let inGradient = ctx.createLinearGradient(0, 0, 0, 400);
  inGradient.addColorStop(0, 'rgba(6, 182, 212, 0.5)'); // Cyan
  inGradient.addColorStop(1, 'rgba(6, 182, 212, 0)');

  let outGradient = ctx.createLinearGradient(0, 0, 0, 400);
  outGradient.addColorStop(0, 'rgba(217, 70, 239, 0.5)'); // Fuchsia
  outGradient.addColorStop(1, 'rgba(217, 70, 239, 0)');

  trafficChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: timeLabels,
      datasets: [
        {
          label: "Inbound (Mbps)",
          borderColor: "#06b6d4",
          backgroundColor: inGradient,
          data: inboundData,
          tension: 0.4, fill: true, borderWidth: 2,
          pointBackgroundColor: "#000", pointBorderColor: "#06b6d4", pointBorderWidth: 2,
        },
        {
          label: "Outbound (Mbps)",
          borderColor: "#d946ef",
          backgroundColor: outGradient,
          data: outboundData,
          tension: 0.4, fill: true, borderWidth: 2,
          pointBackgroundColor: "#000", pointBorderColor: "#d946ef", pointBorderWidth: 2,
        }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color: '#cbd5e1', font: { family: 'monospace' } } } },
      scales: { 
        x: { grid: { color: "#334155", borderDash: [5, 5] }, ticks: { color: '#94a3b8' } }, 
        y: { grid: { color: "#334155", borderDash: [5, 5] }, ticks: { color: '#94a3b8' } } 
      },
      animation: { duration: 400 }
    }
  });
}

// Render Host
function loadHosts() {
  document.getElementById("total-hosts").textContent = mockHosts.length;
  document.getElementById("hosts-online").textContent = mockHosts.filter(h => h.status === "0").length;

  document.getElementById("hosts-table-body").innerHTML = mockHosts.map(h => `
    <tr class="hover:bg-slate-800/50 transition-colors">
      <td class="p-4 font-mono text-slate-400">${h.hostid}</td>
      <td class="p-4 font-bold text-white">${h.name}</td>
      <td class="p-4 font-mono text-cyan-400">${h.ip}</td>
      <td class="p-4">
        <span class="px-3 py-1 rounded-full text-[10px] font-black tracking-wider ${
          h.status === "0" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.4)]" 
          : "bg-rose-500/20 text-rose-400 border border-rose-500/50 shadow-[0_0_8px_rgba(244,63,94,0.4)] animate-pulse"
        }">
          ${h.status === "0" ? "ONLINE" : "OFFLINE"}
        </span>
      </td>
    </tr>
  `).join("");
}

// Random tài nguyên CPU/RAM
function updateResources() {
  const cpu = Math.floor(Math.random() * (85 - 20) + 20);
  const ram = Math.floor(Math.random() * (95 - 40) + 40);
  
  document.getElementById("cpu-bar").style.width = cpu + "%";
  document.getElementById("cpu-text").textContent = cpu + "%";
  
  document.getElementById("ram-bar").style.width = ram + "%";
  document.getElementById("ram-text").textContent = ram + "%";

  // Cảnh báo nếu CPU > 80%
  if(cpu > 80) addTerminalLog(`[WARN] CPU Usage critical high: ${cpu}%`, "text-yellow-400");
}

// Chạy mã Terminal
const terminalLogs = [];
function addTerminalLog(msg, colorClass = "text-green-400") {
  const now = new Date().toLocaleTimeString();
  terminalLogs.push(`<p class="${colorClass}">[${now}] ${msg}</p>`);
  if (terminalLogs.length > 10) terminalLogs.shift();
  
  const terminalObj = document.getElementById("terminal-log");
  terminalObj.innerHTML = terminalLogs.join("");
  terminalObj.scrollTop = terminalObj.scrollHeight;
}

// Tạo log ngẫu nhiên
function generateRandomLogs() {
  const logs = [
    "Ping statistics for 192.168.1.1: bytes=32 time=2ms TTL=64",
    "Fetching SNMP data from Core-Switch...",
    "Scanning network interfaces... OK",
    "[INFO] Authorized user 'FoxST' session active.",
    "Firewall rule check: Passed",
  ];
  
  if(Math.random() > 0.6) {
    const randomLog = logs[Math.floor(Math.random() * logs.length)];
    addTerminalLog(randomLog);
  }
}

// Cập nhật biểu đồ
function updateChartData() {
  const now = new Date();
  const timeString = String(now.getMinutes()).padStart(2, '0') + ":" + String(now.getSeconds()).padStart(2, '0');
  
  timeLabels.shift(); timeLabels.push(timeString);
  inboundData.shift(); inboundData.push(Math.floor(Math.random() * 80) + 20);
  outboundData.shift(); outboundData.push(Math.floor(Math.random() * 50) + 10);
  
  trafficChart.update();
}

// Loop chính
function heartbeat() {
  updateChartData();
  updateResources();
  generateRandomLogs();
  
  // Tình huống rớt mạng ngẫu nhiên
  if(Math.random() > 0.8) {
    addTerminalLog("[ERROR] Connection lost to FX-05 (Client-PC-ZoneA)!", "text-rose-500 font-bold");
  }
}

window.onload = () => {
  initChart();
  loadHosts();
  addTerminalLog("Booting FoxST Network System...");
  addTerminalLog("Establishing connection to nodes...");
  
  setInterval(heartbeat, 3000); // 3 giây nháy 1 lần cho lẹ!
};