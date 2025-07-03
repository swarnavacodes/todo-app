document.addEventListener('DOMContentLoaded', () => {
    const todoInput = document.getElementById('todo-input');
    const dueDateInput = document.getElementById('due-date-input');
    const addButton = document.getElementById('add-button');
    const todoList = document.getElementById('todo-list');
    const filterButtons = document.querySelectorAll('.filters button');
    const clearCompleted = document.getElementById('clear-completed');
    const categoryInput = document.getElementById('category-input');
    const priorityInput = document.getElementById('priority-input');
    const categoryFilter = document.getElementById('category-filter');
    const priorityFilter = document.getElementById('priority-filter');
    const searchInput = document.getElementById('search-input');
    const clearSearchBtn = document.getElementById('clear-search');
    const showMoreAllTasksBtn = document.getElementById('show-more-all-tasks');
    const showMoreApproachingTasksBtn = document.getElementById('show-more-approaching-tasks');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const confirmModal = document.getElementById('custom-confirm');
    const confirmDeleteBtn = document.getElementById('confirm-delete');
    const cancelDeleteBtn = document.getElementById('cancel-delete');
    const themeToggleBtn = document.getElementById('theme-toggle');
    const recurrenceInput = document.getElementById('recurrence-input');
    const recurrenceEndInput = document.getElementById('recurrence-end-input');
    const recurrenceEndDateContainer = document.getElementById('recurrence-end-date-container');
    const weekdaySelector = document.getElementById('weekday-selector');
    const monthYearEl = document.getElementById('month-year');
    const calendarDaysEl = document.getElementById('calendar-days');
    const tasksForDayContainer = document.getElementById('tasks-for-day-container');
    const tasksForDayTitle = document.getElementById('tasks-for-day-title');
    const tasksForDayList = document.getElementById('tasks-for-day-list');
    const showMoreTasksBtn = document.getElementById('show-more-tasks');
    const tasksDoneCount = document.getElementById('tasks-done-count');
    const tasksPendingCount = document.getElementById('tasks-pending-count');
    const tasksApproachingCount = document.getElementById('tasks-approaching-count');
    const calendarClock = document.getElementById('calendar-clock');

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let currentFilter = 'all';
    let taskToDelete = null;
    let selectedDate = new Date();
    let searchQuery = '';
    let filterCategory = '';
    let priorityFilterValue = '';
    let allTasksExpanded = false;
    let approachingTasksExpanded = false;
    let currentDate = new Date();

    // Theme toggle logic
    const applyTheme = () => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
            themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            document.body.classList.remove('dark-theme');
            themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
        }
    };

    // Ensure localStorage always has a value
    if (!localStorage.getItem('theme')) {
        localStorage.setItem('theme', 'light');
    }

    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = localStorage.getItem('theme');
        if (currentTheme === 'dark') {
            localStorage.setItem('theme', 'light');
        } else {
            localStorage.setItem('theme', 'dark');
        }
        applyTheme();
    });

    applyTheme(); // Apply theme on initial load

    const saveTasks = () => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderCalendar();
        showTasksForDay(selectedDate);
        renderApproachingTasks();
        updateTaskSummary();
    };

    const renderTasks = () => {
        todoList.innerHTML = '';
        let filteredTasks = tasks.filter(task => {
            if (currentFilter === 'active') return !task.completed;
            if (currentFilter === 'completed') return task.completed;
            return true;
        });

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            filteredTasks = filteredTasks.filter(task =>
                task.text.toLowerCase().includes(q) ||
                (task.categories && task.categories.some(cat => cat.toLowerCase().includes(q)))
            );
        }

        if (filterCategory) {
            filteredTasks = filteredTasks.filter(task =>
                task.categories && task.categories.includes(filterCategory)
            );
        }

        if (priorityFilterValue) {
            filteredTasks = filteredTasks.filter(task => (task.priority || '') === priorityFilterValue);
        }

        filteredTasks = filteredTasks.sort((a, b) => a.completed - b.completed || new Date(a.dueDate) - new Date(b.dueDate));

        const tasksToRender = allTasksExpanded ? filteredTasks : filteredTasks.slice(0, 3);

        if (tasksToRender.length === 0) {
            todoList.innerHTML = '<li>No tasks found.</li>';
            showMoreAllTasksBtn.style.display = 'none';
            return;
        }

        tasksToRender.forEach(task => {
            const li = document.createElement('li');
            li.dataset.taskId = task.id;

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const dueDate = new Date(task.dueDate);
            dueDate.setHours(0, 0, 0, 0);

            let taskClass = task.completed ? 'completed' : '';
            if (!task.completed && dueDate < today) {
                taskClass += ' overdue';
            }
            if (task.editing) {
                taskClass += ' editing-task';
            }
            li.className = taskClass;

            li.innerHTML = `
                <div class="task-details">
                    <div class="task-text-wrapper">
                        <div class="task-text">${task.text}</div>
                        <input class="task-edit-input" type="text" value="${task.text.replace(/"/g, '&quot;')}">
                    </div>
                    <div class="task-meta-row">
                        <div class="tag-badges">${(task.categories || []).map(cat => `<span class="tag-badge ${cat.toLowerCase()}">${cat}</span>`).join('')}</div>
                        ${task.priority ? `<span class="priority-badge ${task.priority.toLowerCase()}">${task.priority}</span>` : ''}
                    </div>
                    ${task.dueDate ? `<div class="due-date">Due: ${new Date(task.dueDate).toLocaleDateString()}</div>` : ''}
                </div>
                <div class="task-actions">
                    <button class="edit-btn" title="Edit"><i class="fa fa-pen"></i></button>
                    <button class="save-btn" title="Save"><i class="fa fa-check"></i></button>
                    <button class="cancel-btn" title="Cancel"><i class="fa fa-undo"></i></button>
                    <button class="complete-btn"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0z"/><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg></button>
                    <button class="delete-btn"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0z"/><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/></svg></button>
                </div>
            `;

            const editInput = li.querySelector('.task-edit-input');
            const saveEdit = () => {
                const newValue = editInput.value.trim();
                if (newValue) {
                    task.text = newValue;
                    delete task.editing;
                    saveTasks();
                    renderTasks();
                }
            };

            li.querySelector('.edit-btn').addEventListener('click', () => {
                task.editing = true;
                renderTasks();
            });

            li.querySelector('.cancel-btn').addEventListener('click', () => {
                delete task.editing;
                renderTasks();
            });

            li.querySelector('.save-btn').addEventListener('click', saveEdit);
            editInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') saveEdit();
                if (e.key === 'Escape') {
                    delete task.editing;
                    renderTasks();
                }
            });

            li.querySelector('.complete-btn').addEventListener('click', () => {
                task.completed = !task.completed;
                saveTasks();
                renderTasks();
            });

            li.querySelector('.delete-btn').addEventListener('click', () => {
                taskToDelete = task.id;
                confirmModal.classList.add('visible');
            });

            todoList.appendChild(li);

            if (task.editing) {
                editInput.focus();
                editInput.select();
            }
        });

        if (filteredTasks.length > 3) {
            showMoreAllTasksBtn.style.display = 'block';
            showMoreAllTasksBtn.textContent = allTasksExpanded ? 'Show Less' : `Show ${filteredTasks.length - 3} More`;
        } else {
            showMoreAllTasksBtn.style.display = 'none';
        }
    };

    const addTask = () => {
        const text = todoInput.value.trim();
        let startDate = dueDateFlatpickr.selectedDates[0];
        let categories = categoryInput.value.split(',').map(s => s.trim()).filter(Boolean);
        const priority = priorityInput ? priorityInput.value : '';
        const recurrence = recurrenceInput ? recurrenceInput.value : 'none';
        let endDate = recurrenceEndFlatpickr.selectedDates[0];

        if (text && startDate) {
            todoInput.classList.remove('input-error');

            if (recurrence === 'daily' && endDate) {
                let currentDate = new Date(startDate);
                while (currentDate <= endDate) {
                    tasks.push({ 
                        id: Date.now() + Math.random(), 
                        text, 
                        completed: false, 
                        dueDate: new Date(currentDate).toISOString(), 
                        categories, 
                        priority, 
                        recurrence, 
                        recurrenceEndDate: endDate.toISOString() 
                    });
                    currentDate.setDate(currentDate.getDate() + 1);
                }
            } else if (recurrence === 'weekly' && endDate) {
                const selectedDays = Array.from(document.querySelectorAll('#weekday-selector input[type=checkbox]:checked')).map(cb => parseInt(cb.value));
                if (selectedDays.length > 0) {
                    let currentDate = new Date(startDate);
                    while (currentDate <= endDate) {
                        if (selectedDays.includes(currentDate.getDay())) {
                            tasks.push({ 
                                id: Date.now() + Math.random(), 
                                text, 
                                completed: false, 
                                dueDate: new Date(currentDate).toISOString(), 
                                categories, 
                                priority, 
                                recurrence, 
                                recurrenceEndDate: endDate.toISOString() 
                            });
                        }
                        currentDate.setDate(currentDate.getDate() + 1);
                    }
                } else {
                    alert("Please select at least one day for weekly recurrence.");
                }
            } else if (recurrence === 'monthly' && endDate) {
                let currentDate = new Date(startDate);
                while (currentDate <= endDate) {
                    tasks.push({ 
                        id: Date.now() + Math.random(), 
                        text, 
                        completed: false, 
                        dueDate: new Date(currentDate).toISOString(), 
                        categories, 
                        priority, 
                        recurrence, 
                        recurrenceEndDate: endDate.toISOString() 
                    });
                    currentDate.setMonth(currentDate.getMonth() + 1);
                }
            } else {
                tasks.push({ 
                    id: Date.now(), 
                    text, 
                    completed: false, 
                    dueDate: startDate.toISOString(), 
                    categories, 
                    priority, 
                    recurrence: 'none' 
                });
            }

            saveTasks();
            renderTasks();
            todoInput.value = '';
            categoryInput.value = '';
            if (priorityInput) priorityInput.value = '';
            if (recurrenceInput) recurrenceInput.value = 'none';
            recurrenceEndFlatpickr.clear();
            dueDateFlatpickr.clear();
            setDefaultDate();
            showTasksForDay(startDate);
            recurrenceEndDateContainer.style.display = 'none';
        } else {
            if (!text) todoInput.classList.add('input-error');
            if (!startDate) dueDateInput.classList.add('input-error');
        }
    };

    const renderCalendar = () => {
        calendarDaysEl.innerHTML = '';
        const month = currentDate.getMonth();
        const year = currentDate.getFullYear();
        monthYearEl.textContent = `${currentDate.toLocaleString('default', { month: 'long' })} ${year}`;

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dayNames.forEach(name => {
            const dayNameEl = document.createElement('div');
            dayNameEl.className = 'calendar-day day-name';
            dayNameEl.textContent = name;
            calendarDaysEl.appendChild(dayNameEl);
        });

        for (let i = 0; i < firstDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day';
            calendarDaysEl.appendChild(emptyDay);
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const dayEl = document.createElement('div');
            dayEl.className = 'calendar-day';
            const dayNumber = document.createElement('span');
            dayNumber.className = 'day-number';
            dayNumber.textContent = i;
            const date = new Date(year, month, i);

            const tasksForThisDay = tasks.filter(task => {
                const taskDate = new Date(task.dueDate);
                return taskDate.getFullYear() === year && taskDate.getMonth() === month && taskDate.getDate() === i;
            });

            if (tasksForThisDay.length > 0) {
                dayNumber.classList.add('has-task');
                if (tasksForThisDay.every(t => t.completed)) {
                    dayNumber.classList.add('all-complete');
                }
            }

            if (i === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear()) {
                dayNumber.classList.add('today');
            }
            if (selectedDate && i === selectedDate.getDate() && month === selectedDate.getMonth() && year === selectedDate.getFullYear()) {
                dayNumber.classList.add('selected');
            }

            dayNumber.addEventListener('click', () => {
                selectedDate = date;
                document.querySelectorAll('.day-number.selected').forEach(el => el.classList.remove('selected'));
                dayNumber.classList.add('selected');
                showTasksForDay(date);
            });

            dayEl.appendChild(dayNumber);
            calendarDaysEl.appendChild(dayEl);
        }
    };

    const showTasksForDay = (date) => {
        tasksForDayList.innerHTML = '';
        const month = date.getMonth();
        const year = date.getFullYear();
        const day = date.getDate();
        tasksForDayTitle.textContent = `Tasks for ${date.toLocaleDateString()}`;

        const tasksForDay = tasks.filter(task => {
            const taskDate = new Date(task.dueDate);
            return taskDate.getFullYear() === year && taskDate.getMonth() === month && taskDate.getDate() === day;
        });

        if (tasksForDay.length > 0) {
            tasksForDay.forEach(task => {
                const li = document.createElement('li');
                li.innerHTML = `<span class="status-dot ${task.completed ? 'completed' : 'active'}"></span><span class="task-text">${task.text}</span>`;
                tasksForDayList.appendChild(li);
            });
            tasksForDayContainer.style.display = 'block';
        } else {
            tasksForDayContainer.style.display = 'none';
        }
    };

    const renderApproachingTasks = () => {
        approachingTasksList.innerHTML = '';
        const now = new Date();
        const upcomingDate = new Date();
        upcomingDate.setDate(now.getDate() + 7);

        const approachingTasks = tasks.filter(task => {
            const dueDate = new Date(task.dueDate);
            return !task.completed && dueDate >= now && dueDate <= upcomingDate;
        }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

        const tasksToRender = approachingTasksExpanded ? approachingTasks : approachingTasks.slice(0, 3);

        if (tasksToRender.length === 0) {
            approachingTasksList.innerHTML = '<li>No tasks with approaching deadlines.</li>';
            showMoreApproachingTasksBtn.style.display = 'none';
            return;
        }

        tasksToRender.forEach(task => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span class="task-text">${task.text}</span>
                <span class="due-date">Due: ${new Date(task.dueDate).toLocaleDateString()}</span>
            `;
            approachingTasksList.appendChild(li);
        });

        if (approachingTasks.length > 3) {
            showMoreApproachingTasksBtn.style.display = 'block';
            showMoreApproachingTasksBtn.textContent = approachingTasksExpanded ? 'Show Less' : `Show ${approachingTasks.length - 3} More`;
        } else {
            showMoreApproachingTasksBtn.style.display = 'none';
        }
    };

    const updateTaskSummary = () => {
        const doneTasks = tasks.filter(task => task.completed).length;
        const pendingTasks = tasks.filter(task => !task.completed).length;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const approachingTasks = tasks.filter(task => {
            if (task.completed || !task.dueDate) return false;
            const dueDate = new Date(task.dueDate);
            dueDate.setHours(0, 0, 0, 0);
            const diffTime = dueDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays >= 0 && diffDays <= 3;
        }).length;

        tasksDoneCount.textContent = doneTasks;
        tasksPendingCount.textContent = pendingTasks;
        tasksApproachingCount.textContent = approachingTasks;
    };

    const setDefaultDate = () => {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        dueDateInput.value = `${yyyy}-${mm}-${dd}`;
    };

    // Flatpickr initializations
    const dueDateFlatpickr = flatpickr(dueDateInput, {
        altInput: true,
        altFormat: "F j, Y",
        dateFormat: "Y-m-d",
        onChange: function(selectedDates, dateStr, instance) {
            if (selectedDates.length > 0) {
                dueDateInput.classList.remove('input-error');
            }
        }
    });

    const recurrenceEndFlatpickr = flatpickr(recurrenceEndInput, {
        altInput: true,
        altFormat: "F j, Y",
        dateFormat: "Y-m-d",
    });

    // Event Listeners
    addButton.addEventListener('click', addTask);
    todoInput.addEventListener('keypress', (e) => e.key === 'Enter' && addTask());
    todoInput.addEventListener('input', () => todoInput.classList.remove('input-error'));
    categoryInput.addEventListener('keypress', (e) => e.key === 'Enter' && addTask());

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentFilter = button.id.replace('filter-', '');
            renderTasks();
        });
    });

    clearCompleted.addEventListener('click', () => {
        tasks = tasks.filter(task => !task.completed);
        saveTasks();
        renderTasks();
    });

    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    confirmDeleteBtn.addEventListener('click', () => {
        if (taskToDelete !== null) {
            tasks = tasks.filter(t => t.id != taskToDelete);
            saveTasks();
            renderTasks();
            taskToDelete = null;
        }
        confirmModal.classList.remove('visible');
    });

    cancelDeleteBtn.addEventListener('click', () => {
        taskToDelete = null;
        confirmModal.classList.remove('visible');
    });

    searchInput.addEventListener('input', () => {
        searchQuery = searchInput.value;
        renderTasks();
    });
    clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        searchQuery = '';
        renderTasks();
    });
    categoryFilter.addEventListener('change', () => {
        filterCategory = categoryFilter.value;
        renderTasks();
    });
    priorityFilter.addEventListener('change', () => {
        priorityFilterValue = priorityFilter.value;
        renderTasks();
    });

    showMoreAllTasksBtn.addEventListener('click', () => {
        allTasksExpanded = !allTasksExpanded;
        renderTasks();
    });

    showMoreApproachingTasksBtn.addEventListener('click', () => {
        approachingTasksExpanded = !approachingTasksExpanded;
        renderApproachingTasks();
    });

    recurrenceInput.addEventListener('change', function() {
        const isWeekly = this.value === 'weekly';
        weekdaySelector.style.display = isWeekly ? 'flex' : 'none';
        const isRecurrent = !['none', ''].includes(this.value);
        recurrenceEndDateContainer.style.display = isRecurrent ? 'flex' : 'none';
    });

    // Calendar clock logic
    function updateCalendarClock() {
        const now = new Date();
        const dateOptions = { weekday: 'short', month: 'short', day: 'numeric' };
        const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
        
        const dateString = now.toLocaleDateString('en-US', dateOptions);
        const timeString = now.toLocaleTimeString('en-US', timeOptions);

        if (calendarClock) {
            calendarClock.innerHTML = `${dateString}<br>${timeString}`;
        }
    }
    setInterval(updateCalendarClock, 1000);
    updateCalendarClock();

    // Initial setup
    setDefaultDate();
    renderTasks();
    renderCalendar();
    showTasksForDay(new Date());
    renderApproachingTasks();
    updateTaskSummary();
});