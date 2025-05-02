let data = [];
let history = [];

function analyze() {
  const input = document.getElementById("fileInput");
  const file = input.files[0];
  if (!file) {
    alert("Vui lòng chọn file .csv!");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    const lines = e.target.result.trim().split("\\n");
    for (let line of lines) {
      const nums = line.split(',').map(Number);
      const sum = nums.reduce((a, b) => a + b, 0);
      data.push(sum);
      history.push({ sum, type: sum >= 11 ? "Tài" : "Xỉu", source: "File" });
    }
    updateResults();
    drawChart();
    updateHistory();
  };
  reader.readAsText(file);
}

function addManualEntry() {
  const input = document.getElementById("manualInput").value.trim();
  const nums = input.split(",").map(n => parseInt(n));
  if (nums.length !== 3 || nums.some(n => isNaN(n) || n < 1 || n > 6)) {
    alert("Vui lòng nhập đúng định dạng 3 số từ 1 đến 6, cách nhau bởi dấu phẩy.");
    return;
  }
  const sum = nums.reduce((a, b) => a + b, 0);
  data.push(sum);
  history.push({ sum, type: sum >= 11 ? "Tài" : "Xỉu", source: "Thủ công" });
  updateResults();
  drawChart();
  updateHistory();
}

function updateResults() {
  const tai = data.filter(sum => sum >= 11).length;
  const xiu = data.length - tai;
  const prediction = predictNext();
  const streak = getStreakInfo();

  document.getElementById("results").innerHTML = `
    <p><strong>Tổng lượt:</strong> ${data.length}</p>
    <p><span class="text-danger">Tài:</span> ${tai} (${(tai/data.length*100).toFixed(1)}%)</p>
    <p><span class="text-success">Xỉu:</span> ${xiu} (${(xiu/data.length*100).toFixed(1)}%)</p>
    <p><strong>Chuỗi dài nhất:</strong> ${streak.longest.type} (${streak.longest.length} lần)</p>
    <p><strong>Số lần đổi cầu:</strong> ${streak.switches}</p>
    <p><strong>Dự đoán tiếp theo:</strong> <span class="fw-bold">${prediction}</span></p>
  `;
}

function getStreakInfo() {
  if (data.length === 0) return { longest: { type: "-", length: 0 }, switches: 0 };
  let current = data[0] >= 11 ? "Tài" : "Xỉu";
  let max = 1, temp = 1, switches = 0;
  for (let i = 1; i < data.length; i++) {
    let next = data[i] >= 11 ? "Tài" : "Xỉu";
    if (next === current) {
      temp++;
      if (temp > max) max = temp;
    } else {
      switches++;
      temp = 1;
      current = next;
    }
  }
  return { longest: { type: current, length: max }, switches };
}

function predictNext() {
  if (data.length < 3) return "Không đủ dữ liệu";
  const lastThree = data.slice(-3);
  const results = lastThree.map(sum => sum >= 11 ? "Tài" : "Xỉu");
  const last = results[2];
  return results.every(r => r === last)
    ? (last === "Tài" ? "Xỉu" : "Tài")
    : last;
}

function updateHistory() {
  const tbody = document.getElementById("historyTable");
  tbody.innerHTML = "";
  history.forEach((item, i) => {
    const row = `<tr>
      <td>${i + 1}</td>
      <td>${item.sum}</td>
      <td class="${item.type === 'Tài' ? 'text-danger' : 'text-success'}">${item.type}</td>
      <td>${item.source}</td>
    </tr>`;
    tbody.innerHTML += row;
  });
}

function drawChart() {
  const ctx = document.getElementById("chart").getContext("2d");
  new Chart(ctx, {
    type: "line",
    data: {
      labels: data.map((_, i) => i + 1),
      datasets: [{
        label: "Tổng điểm mỗi lần",
        data: data,
        borderColor: "#007bff",
        backgroundColor: "#007bff33",
        tension: 0.2
      }]
    }
  });
}
