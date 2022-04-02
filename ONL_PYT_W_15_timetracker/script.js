const apikey = '1213bf4b-a936-4b6d-b3c4-722d3f44fa49';
const apihost = 'https://todo-api.coderslab.pl';


function timeConverter(time) {
    return Math.floor(time / 60) + 'h ' + (time % 60) + 'm'
}

function apiListTasks() {
    return fetch(
        apihost + '/api/tasks',
        {
            headers: { Authorization: apikey }
        }
    ).then(
        function(resp) {
            if(!resp.ok) {
                alert('Wystąpił błąd! Otwórz devtools i zakładkę Sieć/Network, i poszukaj przyczyny');
            }
            return resp.json();
        })
}

function renderTask(taskId, taskTitle, taskDescription, taskStatus) {
    const section = document.createElement("section");
    section.className = "card mt-5 shadow-sm";
    document.querySelector('main').appendChild(section)

    const headerDiv = document.createElement("div");
    headerDiv.className = "card-header d-flex justify-content-between align-items-center";
    section.appendChild(headerDiv);

    const headerLeftDiv = document.createElement('div');
    headerDiv.appendChild(headerLeftDiv);

    const h5 = document.createElement('h5');
    h5.innerText = taskTitle;
    headerLeftDiv.appendChild(h5);

    const h6 = document.createElement('h6');
    h6.className = "card-subtitle text-muted";
    h6.innerText = taskDescription;
    headerLeftDiv.appendChild(h6);

    const headerRightDiv = document.createElement('div');
    headerDiv.appendChild(headerRightDiv);

    if(taskStatus === 'open') {
        const finishButton = document.createElement('button');
        finishButton.className = "btn btn-dark btn-sm js-task-open-only";
        finishButton.innerText = "Finish";
        headerRightDiv.appendChild(finishButton);

        finishButton.addEventListener('click', (event) => {
            event.preventDefault();
            apiUpdateTask(taskId, taskTitle, taskDescription, taskStatus).then(
                function (response) {
                    const closedTaskRef = section.querySelectorAll('.js-task-open-only');
                    closedTaskRef.forEach(
                        function (element) {
                            element.remove()
                    }
                    )
                }
        )
        });
    }

    const deleteButton = document.createElement('button');
    deleteButton.className = "btn btn-outline-danger btn-sm ml-2";
    deleteButton.innerText = "Delete";
    headerRightDiv.appendChild(deleteButton);

    deleteButton.addEventListener('click', (event) => {
        event.preventDefault();
        apiDeleteTask(taskId).then(
            section.remove()
        )
    });

    const taskList = document.createElement('ul');
    taskList.className = "list-group list-group-flush";
    section.appendChild(taskList);

    apiListOperationsForTask(taskId).then(
        function (response) {
            response.data.forEach(
                function (operation) {
                    renderOperation(taskList, taskStatus, operation.id, operation.description, operation.timeSpent);
                }
            );
        }
    )

    const cardBodyDiv = document.createElement('div');
    cardBodyDiv.className = "card-body";
    section.appendChild(cardBodyDiv);

    const opForm = document.createElement('form');
    cardBodyDiv.appendChild(opForm);

    const inputGroupDiv =document.createElement('div');
    inputGroupDiv.className = "input-group";
    opForm.appendChild(inputGroupDiv);

    const taskInput = document.createElement('input');
    taskInput.type = "text";
    taskInput.placeholder = "Operation description";
    taskInput.className = "form-control";
    taskInput.minLength = 5;
    inputGroupDiv.appendChild(taskInput);

    const inputAppendDiv = document.createElement('div');
    inputAppendDiv.className = "input-group-append";
    inputGroupDiv.appendChild(inputAppendDiv);

    const addButton = document.createElement('button');
    addButton.className = "btn btn-info";
    addButton.innerText = "Add";
    inputAppendDiv.appendChild(addButton);
    
    opForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const description = taskInput.value
        apiCreateOperationForTask(taskId, description).then(
            function (response) {
                console.log(response)
                renderOperation(taskList, response.data.task.status, response.data.id, response.data.description, response.data.timeSpent);
            }
        )
    });

}

function apiListOperationsForTask(taskId) {
    return fetch(
        apihost + `/api/tasks/${taskId}/operations`,
        {
            headers: { Authorization: apikey }
        }
    ).then (
        function (resp) {
            if (!resp.ok) {
                alert('Wystąpił błąd! Otwórz devtools i zakładkę Sieć/Network, i poszukaj przyczyny');
            }
            return resp.json();
        }
    );
}

function renderOperation(operationsList, status, operationId, operationDescription, timeSpent) {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center';

    operationsList.appendChild(li);

    const descriptionDiv = document.createElement('div');
    descriptionDiv.innerText = operationDescription;
    li.appendChild(descriptionDiv);

    const time = document.createElement('span');
    time.className = 'badge badge-success badge-pill ml-2';
    time.innerText = timeConverter(timeSpent);
    descriptionDiv.appendChild(time);

    if (status === 'open') {
        const buttonDiv = document.createElement('div');
        li.appendChild(buttonDiv);

        const addQuarterButton = document.createElement('button');
        addQuarterButton.className = 'btn btn-outline-success btn-sm mr-2 js-task-open-only';
        addQuarterButton.innerText = '+15m';
        buttonDiv.appendChild(addQuarterButton);
        
        addQuarterButton.addEventListener('click', (event) => {
            event.preventDefault();
            timeSpent = timeSpent + 15;
            apiUpdateOperation(operationId, operationDescription, timeSpent).then(
                function (response) {time.innerText = timeConverter(response.data.timeSpent)}
            )
        });

        const addHourButton = document.createElement('button');
        addHourButton.className = 'btn btn-outline-success btn-sm mr-2 js-task-open-only';
        addHourButton.innerText = '+1h';
        buttonDiv.appendChild(addHourButton);

        addHourButton.addEventListener('click', (event) => {
            event.preventDefault();
            timeSpent = timeSpent + 60;
            apiUpdateOperation(operationId, operationDescription, timeSpent).then(
                function (response) {time.innerText = timeConverter(response.data.timeSpent)}
            )
        });

        const delButton = document.createElement('button');
        delButton.className = 'btn btn-outline-danger btn-sm js-task-open-only';
        delButton.innerText = 'Delete';
        buttonDiv.appendChild(delButton);

        delButton.addEventListener('click', (event) => {
            event.preventDefault();
            apiDeleteOperation(operationId).then(
                li.remove()
            )
        });
    }
}

function apiCreateTask(title, description) {
    return fetch(
        apihost + '/api/tasks',
        {
            headers: { Authorization: apikey, 'Content-Type': 'application/json' },
            body: JSON.stringify({title: title, description:description, status: 'open'}),
            method: 'POST'
        }
    ).then(
        function (resp) {
            if(!resp.ok) {
                alert('Wystąpił błąd! Otwórz devtools i zakładkę Sieć/Network, i poszukaj przyczyny')
            }
            return resp.json();
        }
    )
}

function apiDeleteTask(taskId) {
    return fetch(
        apihost +`/api/tasks/${taskId}`,
        {
            headers: { Authorization: apikey },
            method: 'DELETE'
        }
    ).then(
        function (resp) {
            if(!resp.ok) {
                alert('Wystąpił błąd! Otwórz devtools i zakładkę Sieć/Network, i poszukaj przyczyny')
            }
            return resp.json();
        }
    )
}

function apiCreateOperationForTask(taskId, description) {
    return fetch(
        apihost + `/api/tasks/${taskId}/operations`,
        {
            headers: { Authorization: apikey, 'Content-Type': 'application/json' },
            body: JSON.stringify({description: description, timeSpent: 0}),
            method: 'POST'
        }
    ).then(
        function (resp) {
            if(!resp.ok) {
                alert('Wystąpił błąd! Otwórz devtools i zakładkę Sieć/Network, i poszukaj przyczyny')
            }
            return resp.json();
        }
    )
}

function apiUpdateOperation(operationId, description, timeSpent) {
    return fetch(
        apihost + `/api/operations/${operationId}`,
        {
            headers: { Authorization: apikey, 'Content-Type': 'application/json' },
            body: JSON.stringify({description: description, timeSpent: timeSpent}),
            method: 'PUT'
        }
    ).then(
        function (resp) {
            if(!resp.ok) {
                alert('Wystąpił błąd! Otwórz devtools i zakładkę Sieć/Network, i poszukaj przyczyny')
            }
            return resp.json();
        }
    )
}

function apiDeleteOperation(operationId) {
    return fetch(
        apihost +`/api/operations/${operationId}`,
        {
            headers: { Authorization: apikey },
            method: 'DELETE'
        }
    ).then(
        function (resp) {
            if(!resp.ok) {
                alert('Wystąpił błąd! Otwórz devtools i zakładkę Sieć/Network, i poszukaj przyczyny')
            }
            return resp.json();
        }
    )
}

function apiUpdateTask(taskId, title, description, status) {
    return fetch(
        apihost + `/api/tasks/${taskId}`,
        {
            headers: { Authorization: apikey, 'Content-Type': 'application/json' },
            body: JSON.stringify({title: title, description: description, status: 'closed'}),
            method: 'PUT'
        }
    ).then(
        function (resp) {
            if(!resp.ok) {
                alert('Wystąpił błąd! Otwórz devtools i zakładkę Sieć/Network, i poszukaj przyczyny')
            }
            return resp.json();
        }
    )
}

document.addEventListener('DOMContentLoaded', function() {
    return apiListTasks().then (
        function (response) {
            response.data.forEach(
                function (task) {
                    renderTask(task.id, task.title, task.description, task.status);
                })
            }
    ).then (
        function () {
            const addNewTaskRef = document.querySelector(".js-task-adding-form");
            addNewTaskRef.addEventListener('submit', (event) => {
                event.preventDefault();
                const titleDiv = addNewTaskRef.firstElementChild;
                let title = titleDiv.firstElementChild.value
                const descriptionDiv = addNewTaskRef.getElementsByTagName('div')[1]
                let description = descriptionDiv.firstElementChild.value
                apiCreateTask(title, description).then (
                    function (response) {
                        renderTask(response.data.id, response.data.title, response.data.description, response.data.status);
                            }
                        )
                    }
                );
            });
        }
    )








