function computeAverages(processes) {
    let totalWT = 0, totalTAT = 0, totalRT = 0;
    let n = processes.length;

    processes.forEach(p => {
        totalWT += p.wt;
        totalTAT += p.tat;
        totalRT += p.rt;
    });

    return {
        avgWT: (totalWT / n).toFixed(2),
        avgTAT: (totalTAT / n).toFixed(2),
        avgRT: (totalRT / n).toFixed(2)
    };
}

module.exports = { computeAverages };