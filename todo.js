const taskInput = document.getElementById("taskInput");
const taskStartTime = document.getElementById("taskStartTime");
const taskCategory = document.getElementById("taskCategory");
const taskPriority = document.getElementById("taskPriority");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const taskDate = document.getElementById("taskDate");
const progressFill = document.getElementById("progressFill");

// Default = today
const today = new Date().toISOString().split("T")[0];
taskDate.value = today;

taskDate.addEventListener("change", loadTasks);

// Ask permission for notifications
if ("Notification" in window && Notification.permission !== "granted") {
  Notification.requestPermission();
}

// Add task
addBtn.addEventListener("click", () => {
  const text = taskInput.value.trim();
  const startTime = taskStartTime.value;
  const date = taskDate.value;
  const category = taskCategory.value;
  const priority = taskPriority.value;

  if (text === "" || !date) return;

  const tasks = getTasks(date);
  tasks.push({ text, startTime, category, priority, completed: false });
  tasks.sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""));
  saveTasks(date, tasks);

  taskInput.value = "";
  taskStartTime.value = "";
  loadTasks();
});

// Load tasks
function loadTasks() {
  const date = taskDate.value;
  taskList.innerHTML = "";

  const tasks = getTasks(date);
  let completedCount = 0;

  tasks.forEach((task, index) => {
    if (task.completed) completedCount++;

    const li = document.createElement("li");
    li.classList.add(`priority-${task.priority}`);

    const details = document.createElement("div");
    details.className = "task-details";
    details.innerHTML = `
      <span class="task-time">${task.startTime || "--:--"} • ${task.text}</span>
      <span class="task-category">${task.category} | Priority: ${task.priority}</span>
    `;
    if (task.completed) li.classList.add("completed");

    li.addEventListener("click", () => {
      task.completed = !task.completed;
      saveTasks(date, tasks);
      loadTasks();
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "X";
    deleteBtn.className = "delete-btn";
    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      tasks.splice(index, 1);
      saveTasks(date, tasks);
      loadTasks();
    });

    li.appendChild(details);
    li.appendChild(deleteBtn);
    taskList.appendChild(li);

    // Schedule notification
    scheduleNotification(task, date);
  });

  // Update progress bar
  const percent = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;
  progressFill.style.width = percent + "%";
  progressFill.textContent = percent + "%";

}

// Helpers
function getTasks(date) {
  return JSON.parse(localStorage.getItem(date)) || [];
}

function saveTasks(date, tasks) {
  localStorage.setItem(date, JSON.stringify(tasks));
}

// Notification Scheduler
function scheduleNotification(task, date) {
  if (!task.startTime) return;

  const [hours, minutes] = task.startTime.split(":").map(Number);
  const taskTime = new Date(date);
  taskTime.setHours(hours, minutes, 0, 0);

  const now = new Date();
  const delay = taskTime - now;

  if (delay > 0) {
    setTimeout(() => {
      if (Notification.permission === "granted" && !task.completed) {
        new Notification("⏰ Task Reminder", {
          body: `${task.startTime} - ${task.text} [${task.category}]`,
          icon: "https://cdn-icons-png.flaticon.com/512/565/565547.png"
        });
      }
    }, delay);
  }
}

// Load today’s tasks
loadTasks();
