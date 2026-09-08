// Dữ liệu giả lập danh sách thiết bị
const mockHosts = [
  { hostid: "1001", name: "Core-Switch-Cisco", ip: "192.168.1.254", status: "0" },
  { hostid: "1002", name: "Web-Server-Nginx", ip: "192.168.1.10", status: "0" },
  { hostid: "1003", name: "Database-MySQL", ip: "192.168.1.11", status: "0" },
  { hostid: "1004", name: "Router-Gateway", ip: "192.168.1.1", status: "0" },
  { hostid: "1005", name: "Client-PC-Ketoan", ip: "192.168.1.45", status: "1" }, // Cố tình để status = 1 (Down)
];

// Khởi tạo biểu đồ
let trafficChart;
let timeLabels = ["10:00", "10:05", "10:10", "10:15", "10:20", "10:25"];
let inboundData = [12, 19, 35, 42, 28, 45];
let outboundData = [8, 15, 20, 25, 18, 30];

function initChart() {
  const ctx = document.getElementById("trafficChart").getContext("2d");
  trafficChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: timeLabels,
      datasets: [
        {
          label: "Inbound (Mbps)",
          borderColor: "#06b6d4",
          backgroundColor: "rgba(6, 182, 212, 0.1)",
          data: inboundData,
          tension: 0.3, fill: true,
        },
        {
          label: "Outbound (Mbps)",
          borderColor: "#f43f5e",
          backgroundColor: "rgba(244, 63, 94, 0.1)",
          data: outboundData,
          tension: 0.3, fill: true,
        }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      scales: { x: { grid: { color: "#334155" } }, y: { grid: { color: "#334155" } } },
      animation: { duration: 500 }
    }
  });
}

// Hàm giả lập Load danh sách thiết bị
function loadHosts() {
  document.getElementById("api-status").textContent = "Connected (Mock)";
  document.getElementById("api-status").className = "text-xl font-bold text-emerald-400 mt-2";
  
  document.getElementById("total-hosts").textContent = mockHosts.length;
  const onlineHosts = mockHosts.filter(h => h.status === "0").length;
  document.getElementById("hosts-online").textContent = onlineHosts;

  const tbody = document.getElementById("hosts-table-body");
  tbody.innerHTML = mockHosts.map(h => `
    <tr class="hover:bg-slate-800/40">
      <td class="p-3 font-mono text-slate-400">${h.hostid}</td>
      <td class="p-3 font-medium text-white">${h.name}</td>
      <td class="p-3 font-mono text-cyan-400">${h.ip}</td>
      <td class="p-3">
        <span class="px-2 py-0.5 rounded text-[10px] font-bold ${
          h.status === "0" ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
        }">
          ${h.status === "0" ? "ACTIVE" : "DOWN"}
        </span>
      </td>
    </tr>
  `).join("");
}

// Hàm giả lập tạo sự cố ngẫu nhiên
function loadProblems() {
  // Random số lượng lỗi từ 0 đến 3
  const randomErrorCount = Math.floor(Math.random() * 4);
  document.getElementById("active-problems").textContent = randomErrorCount;
  
  const pContainer = document.getElementById("problems-list");
  
  if (randomErrorCount === 0) {
    pContainer.innerHTML = `<p class="text-emerald-400 font-medium">Hệ thống an toàn! Không có sự cố nào 🎉</p>`;
    return;
  }

  const errorMessages = [
    "Cảnh báo: CPU Web-Server quá tải (>90%)",
    "Mất kết nối PING đến Client-PC-Ketoan",
    "Lưu lượng mạng cổng Eth0 bất thường",
    "Cảnh báo: Hết dung lượng ổ cứng Database",
    "Nhiệt độ Core-Switch vượt ngưỡng an toàn"
  ];

  let html = '';
  for(let i=0; i<randomErrorCount; i++) {
    const randomMsg = errorMessages[Math.floor(Math.random() * errorMessages.length)];
    const timeNow = new Date().toLocaleTimeString();
    html += `
      <div class="p-2.5 rounded bg-rose-950/40 border border-rose-800/50">
        <div class="font-semibold text-rose-300">${randomMsg}</div>
        <div class="text-[10px] text-slate-400 mt-1">${timeNow}</div>
      </div>
    `;
  }
  pContainer.innerHTML = html;
}

// Hàm giả lập biểu đồ băng thông chạy liên tục
function updateChartData() {
  const now = new Date();
  const timeString = now.getHours() + ":" + String(now.getMinutes()).padStart(2, '0') + ":" + String(now.getSeconds()).padStart(2, '0');
  
  // Xóa điểm dữ liệu cũ nhất, thêm điểm mới
  timeLabels.shift();
  timeLabels.push(timeString);
  
  inboundData.shift();
  inboundData.push(Math.floor(Math.random() * 50) + 10); // Random 10-60 Mbps
  
  outboundData.shift();
  outboundData.push(Math.floor(Math.random() * 30) + 5);  // Random 5-35 Mbps
  
  trafficChart.update();
}

function refreshData() {
  loadHosts();
  loadProblems();
  updateChartData();
}

window.onload = () => {
  initChart();
  refreshData();
  // Cho tự động nhảy số sau mỗi 5 giây cho thật sinh động!
  setInterval(refreshData, 5000); 
};