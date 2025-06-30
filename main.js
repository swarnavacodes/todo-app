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

    // ... (rest of your JS code from <script> block)

    // For brevity, only the structure is shown here. The actual code will be copied in full.

    // Example:
    // addButton.addEventListener('click', addTask);
    // ...

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
});
