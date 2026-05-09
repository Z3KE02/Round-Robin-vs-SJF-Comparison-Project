const express = require('express');
const cors = require('cors');
const { runRoundRobin, runNonPreemptiveSJF, runPreemptiveSRTF } = require('./scheduler/algorithms');
const { computeAverages } = require('./metrics/calculations');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('src/gui'));

app.post('/api/simulate', (req, res) => {
    const { processes, quantum } = req.body;

    if (!processes || processes.length === 0) {
        return res.status(400).json({ error: "Please add at least one process." });
    }
    if (!quantum || quantum <= 0) {
        return res.status(400).json({ error: "Time Quantum must be greater than 0." });
    }

    const rrResult = runRoundRobin(processes, quantum);
    const rrAverages = computeAverages(rrResult.processes);

    const sjfResult = runNonPreemptiveSJF(processes);
    const sjfAverages = computeAverages(sjfResult.processes);

    const srtfResult = runPreemptiveSRTF(processes);
    const srtfAverages = computeAverages(srtfResult.processes);

    res.json({
        roundRobin: {
            processes: rrResult.processes,
            gantt: rrResult.gantt,
            readyQueueHistory: rrResult.readyQueueHistory,
            averages: rrAverages
        },
        sjf: {
            processes: sjfResult.processes,
            gantt: sjfResult.gantt,
            averages: sjfAverages
        },
        srtf: {
            processes: srtfResult.processes,
            gantt: srtfResult.gantt,
            averages: srtfAverages
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server is running successfully on http://localhost:${PORT}`);
});