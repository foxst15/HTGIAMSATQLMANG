// Gọi API thông qua Serverless Function của Vercel
async function callZabbixAPI(method, params = {}) {
  try {
    const response = await fetch('/api/zabbix', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ method, params }),
    });
    
    if (!response.ok) throw new Error("Lỗi kết nối Serverless Vercel");
    const data = await response.json();
    if (data.error) throw new Error(data.error.data || data.error.message);
    
    document.getElementById("api-status").textContent = "Connected";
    document.getElementById("api-status").className = "text-xl font-bold text-emerald-400 mt-2";
    return data.result;
  } catch (err) {
    document.getElementById("api-status").textContent = "Lỗi kết nối";
    document.getElementById("api-status").className = "text-xl font-bold text-rose-400 mt-2";
    console.error("API Error:", err);
    return null;
  }
}

// Khởi tạo biểu đồ Demo (vì Zabbix cần lấy History Items khá phức tạp)
let trafficChart;
function initChart() {
  const ctx = document.getElementById("trafficChart").getContext("2d");
  trafficChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: ["10:00", "10:05", "10:10", "10:15", "10:20", "10:25"],
      datasets: [
        {
          label: "Inbound (Mbps)",
          borderColor: "#06b6d4",
          backgroundColor: "rgba(6, 182, 212, 0.1)",
          data: [12, 19, 35, 42, 28, 45],
          tension: 0.3, fill: true,
        },
        {
          label: "Outbound (Mbps)",
          borderColor: "#f43f5e",
          backgroundColor: "rgba(244, 63, 94, 0.1)",
          data: [8, 15, 20, 25, 18, 30],
          tension: 0.3, fill: true,
        }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      scales: { x: { grid: { color: "#334155" } }, y: { grid: { color: "#334155" } } }
    }
  });
}

// Lấy danh sách thiết bị
async function loadHosts() {
  const hosts = await callZabbixAPI("host.get", {
    output: ["hostid", "host", "name", "status"],
    selectInterfaces: ["ip"],
  });

  if (!hosts) return;

  document.getElementById("total-hosts").textContent = hosts.length;
  const onlineHosts = hosts.filter(h => h.status === "0");
  document.getElementById("hosts-online").textContent = onlineHosts.length;

  const tbody = document.getElementById("hosts-table-body");
  tbody.innerHTML = hosts.map(h => `
    <tr class="hover:bg-slate-800/40">
      <td class="p-3 font-mono text-slate-400">${h.hostid}</td>
      <td class="p-3 font-medium text-white">${h.name || h.host}</td>
      <td class="p-3 font-mono text-cyan-400">${h.interfaces[0]?.ip || "N/A"}</td>
      <td class="p-3">
        <span class="px-2 py-0.5 rounded text-[10px] font-bold ${
          h.status === "0" ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
        }">
          ${h.status === "0" ? "ACTIVE" : "DISABLED"}
        </span>
      </td>
    </tr>
  `).join("");
}

// Lấy sự cố
async function loadProblems() {
  const problems = await callZabbixAPI("problem.get", {
    output: ["eventid", "name", "severity", "clock"],
    recent: true, limit: 10,
  });

  if (!problems) return;
  document.getElementById("active-problems").textContent = problems.length;
  
  const pContainer = document.getElementById("problems-list");
  if (problems.length === 0) {
    pContainer.innerHTML = `<p class="text-emerald-400 font-medium">Hệ thống an toàn! 🎉</p>`;
    return;
  }

  pContainer.innerHTML = problems.map(p => `
    <div class="p-2.5 rounded bg-rose-950/40 border border-rose-800/50">
      <div class="font-semibold text-rose-300">${p.name}</div>
      <div class="text-[10px] text-slate-400 mt-1">${new Date(p.clock * 1000).toLocaleString()}</div>
    </div>
  `).join("");
}

function refreshData() {
  loadHosts();
  loadProblems();
}

window.onload = () => {
  initChart();
  refreshData();
  setInterval(refreshData, 15000); // 15s tự làm mới
};
