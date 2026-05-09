// ============================================================
//  CPU Scheduling Simulator — Pure Client-Side (No Backend)
//  All algorithms run in the browser. No server required.
// ============================================================

let processes = [];
let lastSimulationData = null;

// ── Predefined Scenarios ─────────────────────────────────────
const scenarios = {
    A: {
        quantum: 4,
        processes: [
            { id: "P1", arrivalTime: 0, burstTime: 6 },
            { id: "P2", arrivalTime: 1, burstTime: 8 },
            { id: "P3", arrivalTime: 2, burstTime: 2 },
            { id: "P4", arrivalTime: 3, burstTime: 4 }
        ]
    },
    B: {
        quantum: 4,
        processes: [
            { id: "P1", arrivalTime: 0, burstTime: 12 },
            { id: "P2", arrivalTime: 1, burstTime: 2 },
            { id: "P3", arrivalTime: 2, burstTime: 1 },
            { id: "P4", arrivalTime: 3, burstTime: 2 }
        ]
    },
    C: {
        quantum: 3,
        processes: [
            { id: "P1", arrivalTime: 0, burstTime: 6 },
            { id: "P2", arrivalTime: 0, burstTime: 6 },
            { id: "P3", arrivalTime: 0, burstTime: 6 }
        ]
    },
    D: {
        quantum: 4,
        processes: [
            { id: "P1", arrivalTime: 0, burstTime: 20 },
            { id: "P2", arrivalTime: 2, burstTime: 2 },
            { id: "P3", arrivalTime: 4, burstTime: 2 }
        ]
    }
};

// ── Scenario dropdown ────────────────────────────────────────
document.getElementById('scenario-select').addEventListener('change', (event) => {
    loadScenario(event.target.value);
});

function loadScenario(type) {
    if (type === 'E') {
        alert("Scenario E (Validation Case triggered). Simulating invalid input checking...");
        document.getElementById('quantum').value = -1;
        processes = [{ id: "P1", arrivalTime: -5, burstTime: 0 }];
        updateProcessTable();
        return;
    }

    const selected = scenarios[type];
    document.getElementById('quantum').value = selected.quantum;
    processes = [...selected.processes];
    updateProcessTable();
    alert(`Scenario ${type} loaded successfully! Click "Start Simulation & Compare" to see results.`);
}

// ── Add process manually ─────────────────────────────────────
document.getElementById('add-btn').addEventListener('click', () => {
    const pidInput     = document.getElementById('pid');
    const arrivalInput = document.getElementById('arrival');
    const burstInput   = document.getElementById('burst');

    const pid     = pidInput.value.trim();
    const arrival = parseInt(arrivalInput.value);
    const burst   = parseInt(burstInput.value);

    if (!pid)                              { alert("Please enter a valid Process ID."); return; }
    if (processes.find(p => p.id === pid)) { alert("Process ID already exists.");      return; }
    if (isNaN(arrival) || arrival < 0)     { alert("Arrival time cannot be negative."); return; }
    if (isNaN(burst)   || burst <= 0)      { alert("Burst time must be greater than 0."); return; }

    processes.push({ id: pid, arrivalTime: arrival, burstTime: burst });
    updateProcessTable();

    pidInput.value    = '';
    arrivalInput.value = '';
    burstInput.value  = '';
});

function updateProcessTable() {
    const tbody = document.querySelector('#process-table tbody');
    tbody.innerHTML = '';
    processes.forEach((p, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${p.id}</strong></td>
            <td>${p.arrivalTime}</td>
            <td>${p.burstTime}</td>
            <td><button class="btn delete-btn" onclick="deleteProcess(${index})">Delete</button></td>
        `;
        tbody.appendChild(row);
    });
}

window.deleteProcess = function(index) {
    processes.splice(index, 1);
    updateProcessTable();
};

// ── Simulate button ──────────────────────────────────────────
document.getElementById('simulate-btn').addEventListener('click', () => {
    const quantum = parseInt(document.getElementById('quantum').value);

    if (processes.length === 0) { alert("Please add at least one process."); return; }
    if (isNaN(quantum) || quantum <= 0) { alert("Invalid Time Quantum. It must be a positive integer."); return; }

    const invalidProc = processes.find(p => p.arrivalTime < 0 || p.burstTime <= 0);
    if (invalidProc) {
        alert("Invalid process data found. Arrival time must be >= 0 and Burst time must be > 0.");
        return;
    }

    // Run all algorithms locally — no server needed
    const rrResult   = runRoundRobin(processes, quantum);
    const sjfResult  = runNonPreemptiveSJF(processes);
    const srtfResult = runPreemptiveSRTF(processes);

    const data = {
        roundRobin: {
            processes:         rrResult.processes,
            gantt:             rrResult.gantt,
            readyQueueHistory: rrResult.readyQueueHistory,
            averages:          computeAverages(rrResult.processes)
        },
        sjf: {
            processes: sjfResult.processes,
            gantt:     sjfResult.gantt,
            averages:  computeAverages(sjfResult.processes)
        },
        srtf: {
            processes: srtfResult.processes,
            gantt:     srtfResult.gantt,
            averages:  computeAverages(srtfResult.processes)
        }
    };

    lastSimulationData = data;
    renderResults(data);
});

// ── Play Gantt button ────────────────────────────────────────
document.getElementById('play-gantt-btn').addEventListener('click', () => {
    if (!lastSimulationData) {
        alert("Please run 'Start Simulation & Compare' first.");
        return;
    }
    renderGanttAnimated('rr-gantt',   lastSimulationData.roundRobin.gantt);
    renderGanttAnimated('sjf-gantt',  lastSimulationData.sjf.gantt);
    renderGanttAnimated('srtf-gantt', lastSimulationData.srtf.gantt);
});

// ── Render results ───────────────────────────────────────────
function renderResults(data) {
    document.getElementById('results-area').style.display = 'block';

    document.getElementById('rr-gantt').innerHTML   = '<span style="color:#64748b;">Click the start button above to see simulation...</span>';
    document.getElementById('sjf-gantt').innerHTML  = '<span style="color:#64748b;">Click the start button above to see simulation...</span>';
    document.getElementById('srtf-gantt').innerHTML = '<span style="color:#64748b;">Click the start button above to see simulation...</span>';

    const rqView = document.getElementById('ready-queue-view');
    rqView.innerHTML = data.roundRobin.readyQueueHistory
        .map(step => `At time <strong>${step.time}</strong>: Ready Queue = [${step.queue}]`)
        .join('<br>');

    fillTable('rr-results-table', data.roundRobin.processes);
    document.getElementById('rr-averages').innerHTML =
        `Avg WT: ${data.roundRobin.averages.avgWT} | Avg TAT: ${data.roundRobin.averages.avgTAT} | Avg RT: ${data.roundRobin.averages.avgRT}`;

    fillTable('sjf-results-table', data.sjf.processes);
    document.getElementById('sjf-averages').innerHTML =
        `Avg WT: ${data.sjf.averages.avgWT} | Avg TAT: ${data.sjf.averages.avgTAT} | Avg RT: ${data.sjf.averages.avgRT}`;

    fillTable('srtf-results-table', data.srtf.processes);
    document.getElementById('srtf-averages').innerHTML =
        `Avg WT: ${data.srtf.averages.avgWT} | Avg TAT: ${data.srtf.averages.avgTAT} | Avg RT: ${data.srtf.averages.avgRT}`;

    document.getElementById('comp-wt').innerHTML  = `RR: ${data.roundRobin.averages.avgWT} <br> SJF: ${data.sjf.averages.avgWT} <br> SRTF: ${data.srtf.averages.avgWT}`;
    document.getElementById('comp-tat').innerHTML = `RR: ${data.roundRobin.averages.avgTAT} <br> SJF: ${data.sjf.averages.avgTAT} <br> SRTF: ${data.srtf.averages.avgTAT}`;
    document.getElementById('comp-rt').innerHTML  = `RR: ${data.roundRobin.averages.avgRT} <br> SJF: ${data.sjf.averages.avgRT} <br> SRTF: ${data.srtf.averages.avgRT}`;

    let algos = [
        { name: "Round Robin",                           wt: parseFloat(data.roundRobin.averages.avgWT) },
        { name: "Shortest Job First (SJF)",              wt: parseFloat(data.sjf.averages.avgWT) },
        { name: "Shortest Remaining Time First (SRTF)",  wt: parseFloat(data.srtf.averages.avgWT) }
    ];
    algos.sort((a, b) => a.wt - b.wt);
    const betterAlgo = algos[0].name;

    document.getElementById('conclusion-text').innerHTML = `
        • <strong>Performance &amp; Efficiency:</strong> In this workload, <strong>${betterAlgo}</strong> achieved the best performance in terms of reducing the average waiting time.<br>
        • <strong>Task Distribution:</strong> <strong>Round Robin</strong> provides a balanced execution using time-slicing. <strong>SJF</strong> favors shorter jobs but is non-preemptive. <strong>SRTF</strong> is highly responsive to short jobs as it preempts longer tasks, usually resulting in the lowest waiting and turnaround times.
    `;
}

function fillTable(tableId, pData) {
    const tbody = document.querySelector(`#${tableId} tbody`);
    tbody.innerHTML = '';
    pData.forEach(p => {
        tbody.innerHTML += `<tr><td><strong>${p.id}</strong></td><td>${p.wt}</td><td>${p.tat}</td><td>${p.rt}</td></tr>`;
    });
}

function renderGanttAnimated(containerId, ganttData) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    if (!ganttData || ganttData.length === 0) return;

    const totalTime = ganttData[ganttData.length - 1].end;
    let index = 0;

    function drawNextBlock() {
        if (index >= ganttData.length) return;
        const block      = ganttData[index];
        const duration   = block.end - block.start;
        const widthPercent = (duration / totalTime) * 100;

        const blockDiv = document.createElement('div');
        blockDiv.className = `gantt-block ${block.id === 'IDLE' ? 'idle' : ''}`;
        blockDiv.style.width = `${widthPercent}%`;
        blockDiv.innerHTML = `${block.id}`;

        if (index === 0) {
            const startLabel = document.createElement('span');
            startLabel.className = 'time-label start-time';
            startLabel.innerText = block.start;
            blockDiv.appendChild(startLabel);
        }

        const endLabel = document.createElement('span');
        endLabel.className = 'time-label end-time';
        endLabel.innerText = block.end;
        blockDiv.appendChild(endLabel);

        container.appendChild(blockDiv);
        index++;
        setTimeout(drawNextBlock, 1300);
    }
    drawNextBlock();
}

// ============================================================
//  ALGORITHMS  (previously in server-side algorithms.js)
// ============================================================

// ── Round Robin ──────────────────────────────────────────────
function runRoundRobin(processes, quantum) {
    let p = processes.map(x => ({
        ...x,
        remainingTime:  x.burstTime,
        startTime:      -1,
        completionTime: 0,
        firstExecution: true
    }));

    let time = 0, queue = [], completed = 0, n = p.length;
    let gantt = [], arrived = new Set(), readyQueueHistory = [];

    function checkArrivals() {
        p.forEach(proc => {
            if (proc.arrivalTime <= time && !arrived.has(proc.id) && proc.remainingTime > 0) {
                queue.push(proc);
                arrived.add(proc.id);
            }
        });
    }

    checkArrivals();

    while (completed < n) {
        readyQueueHistory.push({
            time:  time,
            queue: queue.map(pr => pr.id).join(', ') || "Empty"
        });

        if (queue.length === 0) {
            let unarrived = p.filter(proc => !arrived.has(proc.id));
            if (unarrived.length > 0) {
                let nextArrival = Math.min(...unarrived.map(proc => proc.arrivalTime));
                gantt.push({ id: "IDLE", start: time, end: nextArrival });
                time = nextArrival;
                checkArrivals();
            } else { break; }
            continue;
        }

        let current = queue.shift();
        if (current.firstExecution) { current.startTime = time; current.firstExecution = false; }

        let slice = Math.min(current.remainingTime, quantum);
        gantt.push({ id: current.id, start: time, end: time + slice });
        time += slice;
        current.remainingTime -= slice;

        checkArrivals();

        if (current.remainingTime > 0) {
            queue.push(current);
        } else {
            current.completionTime = time;
            completed++;
        }
    }

    p.forEach(proc => {
        proc.tat = proc.completionTime - proc.arrivalTime;
        proc.wt  = proc.tat - proc.burstTime;
        proc.rt  = proc.startTime - proc.arrivalTime;
    });

    return { processes: p, gantt, readyQueueHistory };
}

// ── Non-Preemptive SJF ───────────────────────────────────────
function runNonPreemptiveSJF(processes) {
    let p = processes.map(x => ({
        ...x,
        remainingTime:  x.burstTime,
        startTime:      -1,
        completionTime: 0
    }));

    let time = 0, completed = 0, gantt = [], n = p.length;
    let finished = new Set();

    while (completed < n) {
        let available = p.filter(proc => proc.arrivalTime <= time && !finished.has(proc.id));

        if (available.length === 0) {
            let unarrived = p.filter(proc => !finished.has(proc.id));
            if (unarrived.length > 0) {
                let nextArrival = Math.min(...unarrived.map(proc => proc.arrivalTime));
                gantt.push({ id: "IDLE", start: time, end: nextArrival });
                time = nextArrival;
            } else { break; }
            continue;
        }

        available.sort((a, b) => {
            if (a.burstTime !== b.burstTime) return a.burstTime - b.burstTime;
            return a.arrivalTime - b.arrivalTime;
        });

        let current = available[0];
        current.startTime = time;
        gantt.push({ id: current.id, start: time, end: time + current.burstTime });
        time += current.burstTime;
        current.completionTime = time;
        finished.add(current.id);
        completed++;
    }

    p.forEach(proc => {
        proc.tat = proc.completionTime - proc.arrivalTime;
        proc.wt  = proc.tat - proc.burstTime;
        proc.rt  = proc.startTime - proc.arrivalTime;
    });

    return { processes: p, gantt };
}

// ── Preemptive SRTF ──────────────────────────────────────────
function runPreemptiveSRTF(processes) {
    let p = processes.map(x => ({
        ...x,
        remainingTime:  x.burstTime,
        startTime:      -1,
        completionTime: 0,
        firstExecution: true
    }));

    let time = 0, completed = 0, n = p.length, gantt = [];

    while (completed < n) {
        let available = p.filter(proc => proc.arrivalTime <= time && proc.remainingTime > 0);

        if (available.length === 0) {
            let unarrived = p.filter(proc => proc.remainingTime > 0);
            if (unarrived.length > 0) {
                let nextArrival = Math.min(...unarrived.map(proc => proc.arrivalTime));
                gantt.push({ id: "IDLE", start: time, end: nextArrival });
                time = nextArrival;
            } else { break; }
            continue;
        }

        available.sort((a, b) => {
            if (a.remainingTime !== b.remainingTime) return a.remainingTime - b.remainingTime;
            return a.arrivalTime - b.arrivalTime;
        });

        let current = available[0];
        if (current.firstExecution) { current.startTime = time; current.firstExecution = false; }

        let unarrived   = p.filter(proc => proc.arrivalTime > time && proc.remainingTime > 0);
        let nextArrival = unarrived.length > 0 ? Math.min(...unarrived.map(proc => proc.arrivalTime)) : Infinity;
        let runTime     = Math.min(current.remainingTime, nextArrival - time);

        if (gantt.length > 0 && gantt[gantt.length - 1].id === current.id) {
            gantt[gantt.length - 1].end += runTime;
        } else {
            gantt.push({ id: current.id, start: time, end: time + runTime });
        }

        time += runTime;
        current.remainingTime -= runTime;

        if (current.remainingTime === 0) {
            current.completionTime = time;
            completed++;
        }
    }

    p.forEach(proc => {
        proc.tat = proc.completionTime - proc.arrivalTime;
        proc.wt  = proc.tat - proc.burstTime;
        proc.rt  = proc.startTime - proc.arrivalTime;
    });

    return { processes: p, gantt };
}

// ── Compute averages ─────────────────────────────────────────
function computeAverages(processes) {
    const n      = processes.length;
    const avgWT  = (processes.reduce((s, p) => s + p.wt,  0) / n).toFixed(2);
    const avgTAT = (processes.reduce((s, p) => s + p.tat, 0) / n).toFixed(2);
    const avgRT  = (processes.reduce((s, p) => s + p.rt,  0) / n).toFixed(2);
    return { avgWT, avgTAT, avgRT };
}