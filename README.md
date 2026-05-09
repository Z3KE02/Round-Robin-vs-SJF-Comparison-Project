# CPU Scheduling Simulator (Round Robin vs Shortest Job First)

An interactive, animated simulation tool developed to compare CPU Scheduling algorithms: **Round Robin (RR)** and **Non-Preemptive Shortest Job First (SJF)**.

* **Programming Language:** JavaScript/Node.js
* **GUI Technology:** HTML/CSS (Web-based GUI)

---

## 👥 Team Members
* **عبدالعزيز هشام عبدالعزيز محمد** - 20211122
* **محمد صابر نوح** - 20240835
* **عمرو أكرم عبدالعزيز عبدالخالق** - 20240664
* **عبدالرحمن جمال محمد خليفه** - 20240531
* **احمد على عبدالرحيم** - 20240060
* **عادل ياسر محمد منصور** - 20240505
* **سامي احمد محمد سامي** - 20240412

---

## 🚀 Features
- **Dynamic Gantt Chart:** Animated block-by-block drawing to simulate real-time CPU scheduling.
- **Ready Queue Visibility:** Step-by-step history trace of the Round Robin Ready Queue.
- **Predefined Scenarios:** 5 Test scenarios according to formal course requirements.
- **Detailed Evaluation Metrics:** Calculations for Arrival Time, Burst Time, Waiting Time (WT), Turnaround Time (TAT), and Response Time (RT).
- **Comparison Summary:** Auto-evaluation of the most efficient algorithm for the workload.

---

## 🧪 Required Test Scenarios Included

### Scenario A: Basic Mixed Workload
- **Workload:** Normal CPU tasks with mixed arrivals and burst times.
- **Goal:** Establishes baseline comparisons for WT and TAT.

### Scenario B: Short-Job Heavy Workload
- **Workload:** Multiple extremely short tasks mixed with long ones.
- **Goal:** Highlights SJF's efficiency in handling shorter jobs first.

### Scenario C: Fairness Case Workload
- **Workload:** Equal arrival times and burst times.
- **Goal:** Demonstrates how Round Robin allocates the CPU equally using quantum slicing.

### Scenario D: Long-Job Sensitivity Workload
- **Workload:** A single long job competing with short ones.
- **Goal:** Evaluates context switching penalty and Waiting Time.

### Scenario E: Input Validation Test
- **Goal:** Tests system checks for invalid inputs (e.g., negative arrivals, 0 burst times).

---

## 🛠️ Installation & Execution

### Prerequisites
Ensure you have **Node.js** installed on your system.

### Steps
1. Navigate to the root directory `OS_SIMULATOR`.
2. Install the necessary server packages by running: `npm install`
3. Start the application by running: `npm start`
4. Open your browser and navigate to `http://localhost:3000` (or the port specified in your terminal).
