// Get references to DOM elements
const taskInput = document.getElementById('newTaskInput');
const addButton = document.getElementById('addTaskButton');
const taskContainer = document.getElementById('taskListContainer');
const viewButtons = document.querySelectorAll('.view-btn');
const clearCompletedButton = document.getElementById('clearCompletedBtn');

// Counter elements
const totalCounter = document.getElementById('totalTasks');
const pendingCounter = document.getElementById('pendingTasks');
const completedCounter = document.getElementById('completedTasks');

// State management
let allTasks = [];
let currentView = 'all';

// Initialize app when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadTasksFromStorage();
    displayTasks();
    updateAllCounters();
});

// Event listeners
addButton.addEventListener('click', handleAddTask);

taskInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        handleAddTask();
    }
});

viewButtons.forEach(button => {
    button.addEventListener('click', function() {
        // Update selected button
        viewButtons.forEach(btn => btn.classList.remove('selected'));
        this.classList.add('selected');
        
        // Update current view
        currentView = this.getAttribute('data-view');
        displayTasks();
    });
});

clearCompletedButton.addEventListener('click', function() {
    const confirmDelete = confirm('Remove all completed tasks?');
    if (confirmDelete) {
        allTasks = allTasks.filter(task => !task.isDone);
        saveTasksToStorage();
        displayTasks();
        updateAllCounters();
    }
});

// Function to add a new task
function handleAddTask() {
    const taskText = taskInput.value.trim();
    
    // Validate input
    if (taskText === '') {
        alert('Please enter a task!');
        return;
    }

    // Create new task object
    const newTask = {
        id: generateUniqueId(),
        text: taskText,
        isDone: false,
        createdAt: new Date().toLocaleString(),
        timestamp: Date.now()
    };

    // Add to tasks array
    allTasks.push(newTask);
    
    // Save and refresh
    saveTasksToStorage();
    displayTasks();
    updateAllCounters();
    
    // Clear input field
    taskInput.value = '';
    taskInput.focus();
}

// Display tasks based on current view
function displayTasks() {
    taskContainer.innerHTML = '';
    
    // Filter tasks based on view
    let tasksToShow = allTasks;
    
    if (currentView === 'pending') {
        tasksToShow = allTasks.filter(task => !task.isDone);
    } else if (currentView === 'done') {
        tasksToShow = allTasks.filter(task => task.isDone);
    }
    
    // Show empty state if no tasks
    if (tasksToShow.length === 0) {
        showEmptyState();
        return;
    }
    
    // Create and append task elements
    tasksToShow.forEach(task => {
        const taskElement = createTaskElement(task);
        taskContainer.appendChild(taskElement);
    });
}

// Create HTML element for a task
function createTaskElement(task) {
    const taskDiv = document.createElement('div');
    taskDiv.className = `task-item ${task.isDone ? 'completed' : ''}`;
    taskDiv.setAttribute('data-id', task.id);
    
    // Create checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-checkbox';
    checkbox.checked = task.isDone;
    checkbox.addEventListener('change', () => toggleTaskStatus(task.id));
    
    // Create task text
    const textSpan = document.createElement('span');
    textSpan.className = 'task-text';
    textSpan.textContent = task.text;
    
    // Create timestamp
    const timeSpan = document.createElement('span');
    timeSpan.className = 'task-time';
    timeSpan.textContent = formatTime(task.timestamp);
    
    // Create delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn-delete';
    deleteBtn.textContent = 'Remove';
    deleteBtn.addEventListener('click', () => removeTask(task.id));
    
    // Append all elements
    taskDiv.appendChild(checkbox);
    taskDiv.appendChild(textSpan);
    taskDiv.appendChild(timeSpan);
    taskDiv.appendChild(deleteBtn);
    
    return taskDiv;
}

// Toggle task completion status
function toggleTaskStatus(taskId) {
    const task = allTasks.find(t => t.id === taskId);
    if (task) {
        task.isDone = !task.isDone;
        saveTasksToStorage();
        displayTasks();
        updateAllCounters();
    }
}

// Remove a task
function removeTask(taskId) {
    allTasks = allTasks.filter(task => task.id !== taskId);
    saveTasksToStorage();
    displayTasks();
    updateAllCounters();
}

// Update all counter displays
function updateAllCounters() {
    const total = allTasks.length;
    const completed = allTasks.filter(task => task.isDone).length;
    const pending = total - completed;
    
    totalCounter.textContent = total;
    pendingCounter.textContent = pending;
    completedCounter.textContent = completed;
}

// Show empty state message
function showEmptyState() {
    let message = '';
    
    if (currentView === 'all') {
        message = 'No tasks yet. Add one to get started!';
    } else if (currentView === 'pending') {
        message = 'No pending tasks. Great job!';
    } else {
        message = 'No completed tasks yet.';
    }
    
    taskContainer.innerHTML = `
        <div class="empty-message">
            <span>📝</span>
            <p>${message}</p>
        </div>
    `;
}

// Save tasks to localStorage
function saveTasksToStorage() {
    localStorage.setItem('myTasks', JSON.stringify(allTasks));
}

// Load tasks from localStorage
function loadTasksFromStorage() {
    const stored = localStorage.getItem('myTasks');
    if (stored) {
        allTasks = JSON.parse(stored);
    }
}

// Generate unique ID for tasks
function generateUniqueId() {
    return Date.now() + Math.random().toString(36).substr(2, 9);
}

// Format timestamp to readable format
function formatTime(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
}