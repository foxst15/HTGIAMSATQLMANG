// Dữ liệu thiết bị (Pha trộn Thật & Giả)
const mockHosts = [
  { hostid: "WEB-FOX", name: "FoxAnime Platform", ip: "foxanime.top", status: "0", type: "real" }, 
  { hostid: "FX-07", name: "FoxST-Workstation", ip: "192.168.1.7", status: "0", type: "mock" },
  { hostid: "FX-02", name: "Database-MySQL", ip: "192.168.1.11", status: "0", type: "mock" },
  { hostid: "FX-03", name: "Router-Gateway", ip: "192.168.1.1", status: "0", type: "mock" },
];

let trafficChart;
let timeLabels = ["10:00", "10:05", "10:10", "10:15", "10:20", "10:25"];
let inboundData = [45, 60, 55, 80, 70, 95];
let outboundData = [20, 35, 30, 45, 40, 60];

// 1. Khởi tạo biểu đồ Chart.js
function initChart() {
  const ctx = document.getElementById("trafficChart").getContext("2d");
  
  let inGradient = ctx.createLinearGradient(0, 0, 0, 400);
  inGradient.addColorStop(0, 'rgba(6, 182, 212, 0.5)'); 
  inGradient.addColorStop(1, 'rgba(6, 182, 212, 0)');

  let outGradient = ctx.createLinearGradient(0, 0, 0, 400);
  outGradient.addColorStop(0, 'rgba(217, 70, 239, 0.5)'); 
  outGradient.addColorStop(1, 'rgba(217, 70, 239, 0)');

  trafficChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: timeLabels,
      datasets: [
        {
          label: "Inbound (Mbps)",
          borderColor: "#06b6d4", backgroundColor: inGradient,
          data: inboundData, tension: 0.4, fill: true, borderWidth: 2,
          pointBackgroundColor: "#000", pointBorderColor: "#06b6d4", pointBorderWidth: 2,
        },
        {
          label: "Outbound (Mbps)",
          borderColor: "#d946ef", backgroundColor: outGradient,
          data: outboundData, tension: 0.4, fill: true, borderWidth: 2,
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

// 2. Render Danh sách Hosts lên Table
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
      <td class="p-4 flex gap-2">
        <button onclick="actionPing('${h.ip}', '${h.name}')" class="bg-cyan-600/50 hover:bg-cyan-500 text-white px-3 py-1 rounded text-[10px] transition">PING</button>
        <button onclick="actionRestart('${h.hostid}', '${h.name}')" class="bg-rose-600/50 hover:bg-rose-500 text-white px-3 py-1 rounded text-[10px] transition">RESTART</button>
      </td>

      <td class="p-4 flex gap-2">
        <button onclick="showDetails('${h.name}', '${h.ip}', '${h.status}')" class="bg-indigo-600/50 hover:bg-indigo-500 text-white px-3 py-1 rounded text-[10px] transition font-bold">INFO</button>
        <button onclick="actionPing('${h.ip}', '${h.name}')" class="bg-cyan-600/50 hover:bg-cyan-500 text-white px-3 py-1 rounded text-[10px] transition">PING</button>
        <button onclick="actionRestart('${h.hostid}', '${h.name}')" class="bg-rose-600/50 hover:bg-rose-500 text-white px-3 py-1 rounded text-[10px] transition">REBOOT</button>
      </td>
    </tr>
  `).join("");
}

// 3. Quản lý hệ thống Log ở Terminal
const terminalLogs = [];
function addTerminalLog(msg, colorClass = "text-green-400") {
  const now = new Date().toLocaleTimeString();
  terminalLogs.push(`<p class="${colorClass}">[${now}] ${msg}</p>`);
  if (terminalLogs.length > 10) terminalLogs.shift(); // Chỉ giữ 10 dòng
  
  const terminalObj = document.getElementById("terminal-log");
  terminalObj.innerHTML = terminalLogs.join("");
  terminalObj.scrollTop = terminalObj.scrollHeight;
}

function generateRandomLogs() {
  const logs = [
    "Ping statistics for 192.168.1.1: bytes=32 time=2ms TTL=64",
    "Fetching SNMP data from Core-Switch...",
    "Scanning network interfaces... OK",
    "[INFO] Authorized user 'FoxST' session active.",
    "Firewall rule check: Passed",
  ];
  if(Math.random() > 0.6) {
    addTerminalLog(logs[Math.floor(Math.random() * logs.length)]);
  }
}

// 4. Random tài nguyên CPU/RAM
function updateResources() {
  const cpu = Math.floor(Math.random() * (85 - 20) + 20);
  const ram = Math.floor(Math.random() * (95 - 40) + 40);
  
  document.getElementById("cpu-bar").style.width = cpu + "%";
  document.getElementById("cpu-text").textContent = cpu + "%";
  document.getElementById("ram-bar").style.width = ram + "%";
  document.getElementById("ram-text").textContent = ram + "%";

  if(cpu > 80) addTerminalLog(`[WARN] CPU Usage critical high: ${cpu}%`, "text-yellow-400");
}

// 5. Cập nhật dữ liệu biểu đồ
function updateChartData() {
  const now = new Date();
  const timeString = String(now.getMinutes()).padStart(2, '0') + ":" + String(now.getSeconds()).padStart(2, '0');
  
  timeLabels.shift(); timeLabels.push(timeString);
  inboundData.shift(); inboundData.push(Math.floor(Math.random() * 80) + 20);
  outboundData.shift(); outboundData.push(Math.floor(Math.random() * 50) + 10);
  
  trafficChart.update();
}

// 6. Tính năng tương tác: PING
function actionPing(ip, name) {
  addTerminalLog(`[CMD] Executing PING to ${name} (${ip})...`, "text-cyan-400");
  setTimeout(() => {
    addTerminalLog(`Reply from ${ip}: bytes=32 time=4ms TTL=64`, "text-emerald-400");
    addTerminalLog(`Reply from ${ip}: bytes=32 time=5ms TTL=64`, "text-emerald-400");
  }, 1000);
}

// 7. Tính năng tương tác: RESTART
function actionRestart(id, name) {
  addTerminalLog(`[WARN] Initiating remote reboot for node: ${name} (${id})`, "text-yellow-400");
  document.getElementById("main-body").classList.add("bg-rose-950");
  
  setTimeout(() => {
    addTerminalLog(`[OK] ${name} has been successfully rebooted.`, "text-emerald-400");
    document.getElementById("main-body").classList.remove("bg-rose-950");
  }, 2500);
}

// 8. Tính năng Xuất Báo Cáo CSV
function exportCSV() {
  addTerminalLog("[SYS] Generating CSV Report...", "text-fuchsia-400");
  
  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "ID,Ten Thiet Bi,IP Address,Trang Thai\n"; 
  
  mockHosts.forEach(function(rowArray) {
      let statusText = rowArray.status === "0" ? "ONLINE" : "OFFLINE";
      let row = `${rowArray.hostid},${rowArray.name},${rowArray.ip},${statusText}`;
      csvContent += row + "\n";
  });

  var encodedUri = encodeURI(csvContent);
  var link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `FoxST_Network_Report_${new Date().getTime()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  addTerminalLog("[SYS] CSV Report downloaded successfully.", "text-emerald-400");
}

// 9. Còi Báo Động (Chớp đỏ màn hình + Âm thanh)
function triggerAlarm() {
  if(Math.random() > 0.85) { 
    addTerminalLog("[CRITICAL] MAJOR PACKET LOSS DETECTED!", "text-rose-500 font-bold text-sm bg-rose-900/50");
    document.getElementById("main-body").classList.add("from-rose-950", "to-red-900");
    
    document.getElementById("alert-sound").play().catch(e => console.log("Trình duyệt chặn autoplay"));
    
    setTimeout(() => {
      document.getElementById("main-body").classList.remove("from-rose-950", "to-red-900");
    }, 2000);
  } else if (Math.random() > 0.8) {
    addTerminalLog("[ERROR] Connection lost to FX-05 (Client-PC-ZoneA)!", "text-rose-500 font-bold");
  }
}

// ================= TÍNH NĂNG GIÁM SÁT WEBSITE THẬT =================
async function monitorFoxAnime() {
  const startTime = Date.now();
  try {
    // Gửi request thật tới website của chủ nhân (dùng no-cors để tránh lỗi chặn chéo)
    await fetch('https://foxanime.top/', { mode: 'no-cors', cache: 'no-store' });
    const latency = Date.now() - startTime;
    
    // In log đo ping thật lên Terminal (xác suất 50% để tránh trôi chữ quá nhanh)
    if(Math.random() > 0.5) {
      addTerminalLog(`[LIVE] foxanime.top is ONLINE - Latency: ${latency}ms`, "text-emerald-400 font-bold");
    }

    // Nếu web tải chậm hơn 1 giây (1000ms), báo vàng!
    if(latency > 1000) {
      addTerminalLog(`[WARN] foxanime.top đang tải chậm (${latency}ms)!`, "text-yellow-400");
    }
  } catch (error) {
    // Nếu sập web thật, báo động đỏ luôn!
    addTerminalLog(`[CRITICAL] foxanime.top IS UNREACHABLE!`, "text-rose-500 font-black bg-rose-900/50");
    document.getElementById("main-body").classList.add("bg-rose-950");
    setTimeout(() => { document.getElementById("main-body").classList.remove("bg-rose-950"); }, 2000);
  }
}
// ===================================================================

// 10. Vòng lặp chính (Heartbeat)
function heartbeat() {
  updateChartData();
  updateResources();
  generateRandomLogs();
  triggerAlarm();
  monitorFoxAnime(); 
}

// Khởi chạy khi tải trang
window.onload = () => {
  initChart();
  initCableMap(); 
  loadHosts();
  addTerminalLog("Booting FoxST Network System...");
  addTerminalLog("Establishing connection to nodes...");
  
  setInterval(heartbeat, 3000); 
};

// Tính năng bật Popup Chi Tiết
function showDetails(name, ip, status) {
  document.getElementById("detail-modal").classList.remove("hidden");
  document.getElementById("detail-modal").classList.add("flex");
  
  // Điền dữ liệu vào bảng
  document.getElementById("modal-hostname").textContent = name;
  document.getElementById("modal-ip").textContent = ip;
  
  const statusEl = document.getElementById("modal-status");
  if(status === "0") {
    statusEl.textContent = "ONLINE";
    statusEl.className = "text-emerald-400 font-black mt-1";
  } else {
    statusEl.textContent = "OFFLINE";
    statusEl.className = "text-rose-500 font-black mt-1 animate-pulse";
  }

  // Tạo số ping ngẫu nhiên cho thật
  const randomPing = Math.floor(Math.random() * 50) + 10;
  document.getElementById("modal-ping").textContent = randomPing + " ms";
  document.getElementById("modal-log").textContent = `[LIVE] Phản hồi mới nhất nhận lúc ${new Date().toLocaleTimeString()} - Ping: ${randomPing}ms`;
}

// Hàm đóng Popup
function closeModal() {
  document.getElementById("detail-modal").classList.add("hidden");
  document.getElementById("detail-modal").classList.remove("flex");
}

// ================= TÍNH NĂNG BẢN ĐỒ CÁP QUANG =================
let submarineMap;

function initCableMap() {
  // Khởi tạo bản đồ, focus vào khu vực Biển Đông
  submarineMap = L.map('cableMap', {
    zoomControl: false,
    attributionControl: false
  }).setView([13.0583, 113.2772], 5); 

  // Add giao diện vệ tinh bóng tối (Dark Matter)
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 10
  }).addTo(submarineMap);

  // Tọa độ các trạm cáp quang
  const vungTau = [10.3459, 107.0795];
  const daNang = [16.0544, 108.2022];
  const hongKong = [22.3193, 114.1694];
  const singapore = [1.3521, 103.8198];

  // Vẽ Tuyến APG (Màu xanh ngọc - Hoạt động)
  const apgLine = L.polyline([daNang, [17.5, 110.0], hongKong], {
    color: '#10b981', weight: 4, opacity: 0.8
  }).addTo(submarineMap);
  apgLine.bindPopup('<b style="color:#10b981">Tuyến APG</b><br>Trạng thái: Hoạt động tốt');

  // Vẽ Tuyến AAE-1 (Màu xanh dương - Hoạt động)
  const aae1Line = L.polyline([vungTau, [9.0, 112.0], [15.0, 115.0], hongKong], {
    color: '#0ea5e9', weight: 3, opacity: 0.8
  }).addTo(submarineMap);
  aae1Line.bindPopup('<b style="color:#0ea5e9">Tuyến AAE-1</b><br>Trạng thái: Đang gánh tải');

  // Vẽ Tuyến AAG (Màu Đỏ Nét Đứt - Bị đứt cáp)
  const aagLine = L.polyline([vungTau, [7.5, 108.5], singapore], {
    color: '#f43f5e', weight: 4, opacity: 0.9, dashArray: '8, 8'
  }).addTo(submarineMap);
  aagLine.bindPopup('<b style="color:#f43f5e">Tuyến AAG</b><br>Lỗi: Đứt cáp nhánh S1I');
  
  // Thêm chấm sáng tại các trạm
  const stationStyle = { radius: 5, fillColor: "#fff", color: "#06b6d4", weight: 2, fillOpacity: 1 };
  L.circleMarker(vungTau, stationStyle).addTo(submarineMap).bindTooltip("Trạm Vũng Tàu");
  L.circleMarker(daNang, stationStyle).addTo(submarineMap).bindTooltip("Trạm Đà Nẵng");
  L.circleMarker(hongKong, stationStyle).addTo(submarineMap).bindTooltip("Trạm Hong Kong");
  L.circleMarker(singapore, stationStyle).addTo(submarineMap).bindTooltip("Trạm Singapore");
}