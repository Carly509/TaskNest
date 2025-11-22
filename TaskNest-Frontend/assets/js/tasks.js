document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("#taskForm");
    const taskList = document.querySelector("#taskList");

    let tasks = [];

    function renderTasks() {
        taskList.innerHTML = "";
        tasks.forEach((task, index) => {
            const li = document.createElement("li");
            li.textContent = `${task.title} – ${task.date} [${task.category}]`;
            taskList.appendChild(li);
        });
    }

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const newTask = {
            title: document.querySelector("#taskTitle").value,
            date: document.querySelector("#taskDate").value,
            category: document.querySelector("#taskCategory").value
        };

        tasks.push(newTask);
        renderTasks();
        form.reset();
    });
});
