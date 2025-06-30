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
    const showMoreAllTasksBtn = document.getElementById('show-more-tasks');
    const showMoreApproachingTasksBtn = document.getElementById('show-more-approaching-tasks');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const confirmDeleteBtn = document.getElementById('confirm-delete');
    const cancelDeleteBtn = document.getElementById('cancel-delete');
    const themeToggleBtn = document.getElementById('theme-toggle');
    const recurrenceInput = document.getElementById('recurrence-input');
    const recurrenceEndInput = document.getElementById('recurrence-end-input');
    const endDateLabel = document.getElementById('end-date-label');

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

    function addTask() {
        const text = todoInput.value.trim();
        const dueDateStr = dueDateInput.value;
        let dueDate = '';
        if (dueDateStr) {
            const [yyyy, mm, dd] = dueDateStr.split('-');
            dueDate = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
        }
        let categories = categoryInput.value.split(',').map(s => s.trim()).filter(Boolean);
        const priority = priorityInput ? priorityInput.value : '';
        const recurrence = recurrenceInput ? recurrenceInput.value : 'none';
        let recurrenceEndDate = '';
        if (recurrenceEndInput && recurrenceEndInput.value) {
            const [yyyy, mm, dd] = recurrenceEndInput.value.split('-');
            recurrenceEndDate = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
        }
        if (text && dueDate) {
            if (recurrence !== 'none' && recurrenceEndDate) {
                let current = new Date(dueDate);
                while (current <= recurrenceEndDate) {
                    tasks.push({
                        id: Date.now() + Math.random(),
                        text,
                        completed: false,
                        dueDate: new Date(current).toISOString(),
                        categories,
                        priority,
                        recurrence,
                        recurrenceEnd: recurrenceEndInput.value
                    });
                    if (recurrence === 'daily') current.setDate(current.getDate() + 1);
                    if (recurrence === 'weekly') current.setDate(current.getDate() + 7);
                    if (recurrence === 'monthly') current.setMonth(current.getMonth() + 1);
                }
            } else {
                tasks.push({
                    id: Date.now(),
                    text,
                    completed: false,
                    dueDate: dueDate.toISOString(),
                    categories,
                    priority,
                    recurrence: 'none',
                    recurrenceEnd: ''
                });
            }
            saveTasks();
            renderTasks();
            todoInput.value = '';
            dueDateInput.value = '';
            categoryInput.value = '';
            priorityInput.value = '';
            recurrenceInput.value = 'none';
            recurrenceEndInput.value = '';
            recurrenceEndInput.style.display = 'none';
        } else {
            todoInput.classList.add('input-error');
        }
    }

    // Show/hide end date input and label based on recurrence selection, with null checks
    recurrenceInput.addEventListener('change', function() {
        if (recurrenceInput.value === 'none') {
            if (recurrenceEndInput) {
                recurrenceEndInput.style.display = 'none';
                recurrenceEndInput.value = '';
            }
            if (endDateLabel) {
                endDateLabel.style.display = 'none';
            }
        } else {
            if (recurrenceEndInput) {
                recurrenceEndInput.style.display = '';
            }
            if (endDateLabel) {
                endDateLabel.style.display = '';
            }
        }
    });

    // Ensure correct initial state on page load, with null checks
    if (recurrenceInput.value === 'none') {
        if (recurrenceEndInput) {
            recurrenceEndInput.style.display = 'none';
            recurrenceEndInput.value = '';
        }
        if (endDateLabel) {
            endDateLabel.style.display = 'none';
        }
    } else {
        if (recurrenceEndInput) {
            recurrenceEndInput.style.display = '';
        }
        if (endDateLabel) {
            endDateLabel.style.display = '';
        }
    }
});
