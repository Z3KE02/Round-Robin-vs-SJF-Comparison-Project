// Round Robin خوارزميه
function runRoundRobin(processes, quantum) {
    let p = processes.map(x => ({
        ...x,
        remainingTime: x.burstTime,
        startTime: -1,
        completionTime: 0,
        firstExecution: true
    }));
    
    let time = 0;
    let queue = [];
    let completed = 0;
    let n = p.length;
    let gantt = [];
    let arrived = new Set();
    let readyQueueHistory = [];

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
            time: time,
            queue: queue.map(pr => pr.id).join(', ') || "Empty"
        });

        if (queue.length === 0) {
            let unarrived = p.filter(proc => !arrived.has(proc.id));
            if (unarrived.length > 0) {
                let nextArrival = Math.min(...unarrived.map(proc => proc.arrivalTime));
                gantt.push({ id: "IDLE", start: time, end: nextArrival });
                time = nextArrival;
                checkArrivals();
            } else {
                break;
            }
            continue;
        }

        let current = queue.shift();

        if (current.firstExecution) {
            current.startTime = time;
            current.firstExecution = false;
        }

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
        proc.wt = proc.tat - proc.burstTime;
        proc.rt = proc.startTime - proc.arrivalTime;
    });

    return { processes: p, gantt, readyQueueHistory };
}

// Shortest Job First (Non-Preemptive) خوارزميه
function runNonPreemptiveSJF(processes) {
    let p = processes.map(x => ({
        ...x,
        remainingTime: x.burstTime,
        startTime: -1,
        completionTime: 0
    }));

    let time = 0;
    let completed = 0;
    let gantt = [];
    let n = p.length;
    let finished = new Set();

    while (completed < n) {
        let available = p.filter(proc => proc.arrivalTime <= time && !finished.has(proc.id));
        
        if (available.length === 0) {
            let unarrived = p.filter(proc => !finished.has(proc.id));
            if (unarrived.length > 0) {
                let nextArrival = Math.min(...unarrived.map(proc => proc.arrivalTime));
                gantt.push({ id: "IDLE", start: time, end: nextArrival });
                time = nextArrival;
            } else {
                break;
            }
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
        proc.wt = proc.tat - proc.burstTime;
        proc.rt = proc.startTime - proc.arrivalTime;
    });

    return { processes: p, gantt };
}

// Shortest Remaining Time First (Preemptive SJF) خوارزميه
function runPreemptiveSRTF(processes) {
    let p = processes.map(x => ({
        ...x,
        remainingTime: x.burstTime,
        startTime: -1,
        completionTime: 0,
        firstExecution: true
    }));

    let time = 0;
    let completed = 0;
    let n = p.length;
    let gantt = [];

    while (completed < n) {
        let available = p.filter(proc => proc.arrivalTime <= time && proc.remainingTime > 0);
        
        if (available.length === 0) {
            let unarrived = p.filter(proc => proc.remainingTime > 0);
            if (unarrived.length > 0) {
                let nextArrival = Math.min(...unarrived.map(proc => proc.arrivalTime));
                gantt.push({ id: "IDLE", start: time, end: nextArrival });
                time = nextArrival;
            } else {
                break;
            }
            continue;
        }

        available.sort((a, b) => {
            if (a.remainingTime !== b.remainingTime) return a.remainingTime - b.remainingTime;
            return a.arrivalTime - b.arrivalTime;
        });

        let current = available[0];

        if (current.firstExecution) {
            current.startTime = time;
            current.firstExecution = false;
        }

        let unarrived = p.filter(proc => proc.arrivalTime > time && proc.remainingTime > 0);
        let nextArrival = unarrived.length > 0 ? Math.min(...unarrived.map(proc => proc.arrivalTime)) : Infinity;

        let runTime = Math.min(current.remainingTime, nextArrival - time);

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
        proc.wt = proc.tat - proc.burstTime;
        proc.rt = proc.startTime - proc.arrivalTime;
    });

    return { processes: p, gantt };
}

module.exports = { runRoundRobin, runNonPreemptiveSJF, runPreemptiveSRTF };