function createButton(classname, btnName) {
    let btn = document.createElement('button');
    btn.setAttribute('type', 'submit');
    btn.textContent = btnName;
    btn.classList.add(classname);
    return btn;
}

function createNote(doc, index) {
    let newRow = document.createElement('div');
    let srno = document.createElement('div');
    let title = document.createElement('div');
    let description = document.createElement('div');
    let actions = document.createElement('div');
    srno.classList.add('grid-item');
    title.classList.add('grid-item');
    description.classList.add('grid-item');
    actions.classList.add('grid-item');

    srno.append(`${index}`);
    title.append(`${doc.title}`);
    description.append(`${doc.description}`);
    actions.append(createButton('deletebtn', 'Delete'));
    actions.append(createButton('editBtn', 'Edit'));

    newRow.classList.add('columnNames');
    newRow.append(srno, title, description, actions);
    document.getElementsByClassName('outputNote')[0].appendChild(newRow);
}

function displayNotes(data) {
    let numberNotesToDisplay = document.getElementById('dropbar').textContent;
    if (numberNotesToDisplay === 'ALL') {
        numberNotesToDisplay = data.length;
    }

    for (let i = 0; i < Math.min(numberNotesToDisplay, data.length); i++) {
        createNote(data[i], i + 1);
        console.log(data[i]);
    }
}

async function loadData() {
    const response = await fetch("http://localhost:500/API/data");
    let data = await response.json();

    displayNotes(data);
}

function sendData(data) {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `http://localhost:500/form?title=${data.title}&description=${data.description}`);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded; charset=UTF-8');
    xhr.send();
}

function collectData(event) {
    if (event.target.getAttribute('data-key') === 'addNoteBtn') {
        let getTitle = document.getElementById('nName').value;
        let getDescription = document.getElementById('nDescription').value;
        getTitle = getTitle.trim();
        getTitle = getTitle[0].toUpperCase() + getTitle.slice(1);
        getDescription = getDescription.trim();
        getDescription = getDescription[0].toUpperCase() + getDescription.slice(1);
        
        const data = { title: getTitle, description: getDescription };
        sendData(data);
    }
}

function deleteAPIData(deleteTitle, deleteDescription) {
    const xhr = new XMLHttpRequest();
    xhr.open("DELETE", `http://localhost:500/API/data/${deleteTitle}/${deleteDescription}`);
    xhr.setRequestHeader('Content-type', 'application/json; charset=UTF-8');
    xhr.send();
}

async function deleteNote(event) {
    if (event.target.getAttribute('class') === 'deletebtn') {
        const deleteTitle = event.target.parentElement.parentElement.firstElementChild.nextElementSibling.textContent;
        const deleteDescription = event.target.parentElement.previousElementSibling.textContent;
        event.target.parentElement.parentElement.remove();
        deleteAPIData(deleteTitle, deleteDescription);
        
        let numNotes = document.getElementsByClassName('outputNote')[0].childElementCount;
        for (let i = 0; i < numNotes; i++) {
            document.getElementsByClassName('outputNote')[0].children[i].firstElementChild.textContent = i + 1;
        }

        console.log('I am here');
    }
}

function emptyInputBox(event) {
    if (event.target.getAttribute('data-key') === 'clearBtn') {
        document.getElementById('nName').value = "";
        document.getElementById('nDescription').value = "";
    }
}

function showModal(event) {
    if (event.target.textContent === 'Edit' && event.target.tagName === 'BUTTON') {
        let oldTitle = event.target.parentElement.previousElementSibling.previousElementSibling.textContent;
        let oldDescription = event.target.parentElement.previousElementSibling.textContent;
        let srno = event.target.parentElement.parentElement.firstElementChild.textContent;

        document.getElementById('newTitle').value = oldTitle;
        document.getElementById('newDescription').value = oldDescription;
        document.getElementById('noteNumber').textContent = srno;
        document.getElementById('modalBox').style.display = "flex";
        document.getElementsByClassName('container')[0].style.filter = 'blur(2px)';
    }
}

async function updateAPIdata(event) {
    if (event.target.textContent === 'Update Note' && event.target.tagName == 'BUTTON') {
        let srno = document.getElementById('noteNumber').textContent;
        let newTitle = document.getElementById('newTitle').value;
        let newDescription = document.getElementById('newDescription').value;

        document.getElementById('modalBox').style.display = "none";
        document.getElementsByClassName('container')[0].style.filter = 'blur(0px)';

        const response = await fetch(`http://localhost:500/API/data/${srno}?title=${newTitle}&description=${newDescription}`, { method: 'PUT' });
        const data = await response.json();
        console.log(data);
    }
}

function closeModal(event) {
    if (event.target.textContent === 'Close') {
        document.getElementById('modalBox').style.display = 'none';
        document.getElementsByClassName('container')[0].style.filter = 'blur(0px)';
    }
}

function dropboxAction(event) {
    if (event.target.parentElement.getAttribute('id') === 'selectionBox') {
        if (document.getElementById('droplist').style.display === 'none') {
            document.getElementById('droplist').style.display = 'block';
        }
        else {
            document.getElementById('droplist').style.display = 'none';
        }
    }
}

async function selectNumberOfNotes(event) {
    if (event.target.getAttribute('class') === 'drop-item') {
        const response = await fetch("http://localhost:500/API/data");
        let data = await response.json();

        document.getElementById('dropbar').textContent = event.target.textContent;
        document.getElementById('droplist').style.display = 'none';
        let numberNotesDisplaying = document.getElementsByClassName('outputNote')[0].childElementCount;
        let numberOfNotesToDisplay = event.target.textContent;

        if (numberOfNotesToDisplay === 'ALL') {
            numberOfNotesToDisplay = data.length;
        }

        for (let i = 0; i < numberNotesDisplaying; i++) {
            document.getElementsByClassName('outputNote')[0].lastElementChild.remove();
        }

        for (let i = 0; i < Math.min(numberOfNotesToDisplay, data.length); i++) {
            createNote(data[i], i + 1);
            console.log(data[i]);
        }
    }
}

async function sortNotes(event) {
    if (event.target.getAttribute('class') === 'sortBtn') {
        const column = event.target.parentElement.previousElementSibling.textContent;
        let sortorder = event.target.getAttribute('key');
        console.log(sortorder)
        
        const responce = await fetch(`http://localhost:500/sort/${column}/${sortorder}`, { method: 'GET' });
        const data = await responce.json();
        
        let numberNotesDisplaying = document.getElementsByClassName('outputNote')[0].childElementCount;
        for (let i = 0; i < numberNotesDisplaying; i++) {
            document.getElementsByClassName('outputNote')[0].lastElementChild.remove();
        }

        displayNotes(data);
    }
}

function searchNote(event) {
    console.log("I am typing")
    if (event.target.getAttribute('id') === 'searchBox') {
        setTimeout(async () => {
            const responce = await fetch(`http://localhost:500/API/data`, { method: 'GET' });
            const data = await responce.json();

            const numberNotesDisplaying = document.getElementsByClassName('outputNote')[0].childElementCount;
            for (let i = 0; i < numberNotesDisplaying; i++) {
                document.getElementsByClassName('outputNote')[0].lastElementChild.remove();
            }

            const searchData = document.getElementById('searchBox').value;
            data.forEach((element, index) => {
                let currTitle = element.title.toLowerCase();
                let currDescription = element.description.toLowerCase();

                const isSubstringInTitle = currTitle.includes(searchData.toLowerCase());
                const isSubstringInDescription = currDescription.includes(searchData.toLowerCase());

                if (isSubstringInTitle || isSubstringInDescription) {
                    createNote(element, index + 1);
                    console.log(element);
                }

                index++;
            });
        }, 300);
    }
}

async function loadRemainNotes(event) {
    if (event.target.getAttribute('class') === 'prevNotes' || event.target.getAttribute('class') === 'nextNotes') {
        const responce = await fetch('http://localhost:500/API/data', { method: 'GET' });
        const data = await responce.json();

        const topNote = document.getElementsByClassName('outputNote')[0].firstElementChild.firstElementChild.textContent;
        const bottomNote = document.getElementsByClassName('outputNote')[0].lastElementChild.firstElementChild.textContent;

        if (event.target.getAttribute('class') === 'prevNotes') {
            if (topNote == 1) {
                return ;
            }
        }

        if (event.target.getAttribute('class') === 'nextNotes') {
            if (bottomNote == data.length) {
                return ;
            }
        }

        const numberNotesDisplaying = parseInt(document.getElementsByClassName('outputNote')[0].childElementCount);
        const numberOfNotesToDisplay = parseInt(document.getElementById('dropbar').textContent);
        
        let end = parseInt(topNote);
        let start = Math.max(1, end - numberOfNotesToDisplay);
        if (event.target.getAttribute('class') === 'nextNotes') {
            start = parseInt(bottomNote) + 1;
            end = Math.min(data.length + 1, start + numberOfNotesToDisplay);
        }

        for (let i = 0; i < numberNotesDisplaying; i++) {
            document.getElementsByClassName('outputNote')[0].lastElementChild.remove();
        }

        for (let i = start; i < end; i++) {
            createNote(data[i - 1], i);
        }
    }
}

window.addEventListener('load', loadData);
document.addEventListener('click', collectData);
document.addEventListener('click', deleteNote);
document.addEventListener('click', emptyInputBox);
document.addEventListener('click', showModal);
document.addEventListener('click', updateAPIdata);
document.addEventListener('click', closeModal);
document.addEventListener('click', dropboxAction);
document.addEventListener('click', selectNumberOfNotes);
document.addEventListener('click', sortNotes);
document.addEventListener('keyup', searchNote);
document.addEventListener('click', loadRemainNotes);