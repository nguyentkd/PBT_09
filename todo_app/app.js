const todoForm = document.querySelector("#todoForm");
const todoInput = document.querySelector("#todoInput");
const todoList = document.querySelector("#todoList");
const todoCount = document.querySelector("#todoCount");
const clearCompletedBtn = document.querySelector("#clearCompleted");
const filterButtons = document.querySelectorAll(".filter");

const STORAGE_KEY = "pbt09-todos";

let todos = loadTodos();
let activeFilter = "all";
let editingId = null;

function loadTodos() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function saveTodos() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function createTodoItem(todo) {
    const li = document.createElement("li");
    li.className = `todo-item${todo.completed ? " completed" : ""}`;
    li.dataset.id = String(todo.id);

    const marker = document.createElement("button");
    marker.type = "button";
    marker.className = "todo-marker";
    marker.setAttribute("aria-label", "Toggle todo");
    marker.setAttribute("aria-pressed", String(!!todo.completed));

    const content = document.createElement("div");
    content.className = "todo-content";

    if (editingId === todo.id) {
        const editInput = document.createElement("input");
        editInput.className = "edit-input";
        editInput.value = todo.text;
        editInput.setAttribute("aria-label", "Edit todo");
        content.appendChild(editInput);

        requestAnimationFrame(() => {
            editInput.focus();
            editInput.setSelectionRange(editInput.value.length, editInput.value.length);
        });
    } else {
        const text = document.createElement("span");
        text.className = "todo-text";
        text.textContent = todo.text;
        content.appendChild(text);
    }

    const actions = document.createElement("div");
    actions.className = "todo-actions";

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "action-btn delete-btn";
    deleteBtn.textContent = "❌";
    deleteBtn.setAttribute("aria-label", "Delete todo");
    deleteBtn.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); deleteBtn.click(); } });

    actions.appendChild(deleteBtn);

    li.appendChild(marker);
    li.appendChild(content);
    li.appendChild(actions);

    return li;
}

function getVisibleTodos() {
    if (activeFilter === "active") {
        return todos.filter(todo => !todo.completed);
    }

    if (activeFilter === "completed") {
        return todos.filter(todo => todo.completed);
    }

    return todos;
}

function render() {
    todoList.textContent = "";

    const visibleTodos = getVisibleTodos();
    const fragment = document.createDocumentFragment();

    visibleTodos.forEach(todo => {
        fragment.appendChild(createTodoItem(todo));
    });

    todoList.appendChild(fragment);

    const pendingCount = todos.filter(todo => !todo.completed).length;
    todoCount.textContent = `${pendingCount} item${pendingCount === 1 ? "" : "s"} left`;
    saveTodos();
}

function createTodo(text) {
    todos.unshift({
        id: Date.now(),
        text,
        completed: false,
    });
    editingId = null;
    render();
}

function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    if (editingId === id) {
        editingId = null;
    }
    render();
}

function toggleTodo(id) {
    todos = todos.map(todo => {
        if (todo.id !== id) return todo;
        return { ...todo, completed: !todo.completed };
    });
    render();
}

function startEditing(id) {
    editingId = id;
    render();
}

function finishEditing(input) {
    const id = Number(input.closest(".todo-item")?.dataset.id);
    const value = input.value.trim();

    if (!value) {
        deleteTodo(id);
        return;
    }

    todos = todos.map(todo => {
        if (todo.id !== id) return todo;
        return { ...todo, text: value };
    });

    editingId = null;
    render();
}

todoForm.addEventListener("submit", event => {
    event.preventDefault();

    const value = todoInput.value.trim();
    if (!value) return;

    createTodo(value);
    todoInput.value = "";
    todoInput.focus();
});

clearCompletedBtn.addEventListener("click", () => {
    todos = todos.filter(todo => !todo.completed);
    if (todos.every(todo => todo.id !== editingId)) {
        editingId = null;
    }
    render();
});

filterButtons.forEach(button => {
    button.addEventListener("click", () => {
        activeFilter = button.dataset.filter;
        filterButtons.forEach(item => item.classList.toggle("active", item === button));
        render();
    });
});

todoList.addEventListener("click", event => {
    const todoItem = event.target.closest(".todo-item");
    if (!todoItem) return;

    const id = Number(todoItem.dataset.id);

    if (event.target.closest(".delete-btn")) {
        deleteTodo(id);
        return;
    }

    if (event.target.closest(".todo-marker")) {
        toggleTodo(id);
        return;
    }

    if (event.target.closest(".todo-text")) {
        toggleTodo(id);
    }
});

todoList.addEventListener("dblclick", event => {
    const text = event.target.closest(".todo-text");
    if (!text) return;

    const todoItem = text.closest(".todo-item");
    if (!todoItem) return;

    startEditing(Number(todoItem.dataset.id));
});

todoList.addEventListener("keydown", event => {
    const input = event.target.closest(".edit-input");
    if (!input) return;

    if (event.key === "Enter") {
        event.preventDefault();
        finishEditing(input);
    }

    if (event.key === "Escape") {
        editingId = null;
        render();
    }
});

todoList.addEventListener("focusout", event => {
    const input = event.target.closest(".edit-input");
    if (!input) return;

    if (document.activeElement === input) return;
    finishEditing(input);
});

render();