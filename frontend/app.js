const API_URL = 'http://localhost:3000/api/clubs';

const clubForm = document.getElementById('clubForm');
const clubId = document.getElementById('clubId');
const tableBody = document.getElementById('clubsTableBody');
const clubCount = document.getElementById('clubCount');
const formTitle = document.getElementById('formTitle');
const saveButton = document.getElementById('saveButton');
const cancelButton = document.getElementById('cancelButton');
const formMessage = document.getElementById('formMessage');

let clubs = [];

async function loadClubs() {
    tableBody.innerHTML = '<tr><td colspan="7">Loading clubs...</td></tr>';

    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error('Could not retrieve clubs.');
        }

        clubs = await response.json();

        displayClubs();
    } catch (error) {
        tableBody.innerHTML =
            '<tr><td colspan="7">Unable to load clubs. Check that the API server is running.</td></tr>';

        clubCount.textContent = '0';
        console.error(error);
    }
}

function displayClubs() {
    clubCount.textContent = clubs.length;

    tableBody.replaceChildren();

    if (clubs.length === 0) {
        const row = document.createElement('tr');
        const cell = document.createElement('td');

        cell.colSpan = 7;
        cell.textContent = 'No clubs have been registered yet.';

        row.appendChild(cell);
        tableBody.appendChild(row);

        return;
    }

    clubs.forEach((club) => {
        const row = document.createElement('tr');

        [
            club.id,
            club.name,
            club.category || '',
            club.president || '',
            club.meeting_day || '',
            club.contact_email || ''
        ].forEach((value) => {
            const cell = document.createElement('td');
            cell.textContent = value;
            row.appendChild(cell);
        });

        const actions = document.createElement('td');

        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.className = 'edit-button';

        editButton.addEventListener('click', () => {
            editClub(club.id);
        });

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.className = 'delete-button';

        deleteButton.addEventListener('click', () => {
            deleteClub(club.id, club.name);
        });

        actions.append(editButton, deleteButton);
        row.appendChild(actions);

        tableBody.appendChild(row);
    });
}

clubForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const id = clubId.value;

    const club = {
        name: document.getElementById('name').value.trim(),
        description: document.getElementById('description').value.trim(),
        category: document.getElementById('category').value.trim(),
        president: document.getElementById('president').value.trim(),
        meeting_day: document.getElementById('meeting_day').value,
        contact_email: document.getElementById('contact_email').value.trim()
    };

    if (!club.name) {
        showMessage('Please enter the club name.', true);
        return;
    }

    try {
        const response = await fetch(
            id ? `${API_URL}/${id}` : API_URL,
            {
                method: id ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(club)
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'The operation failed.');
        }

        showMessage(
            id ? 'Club updated successfully!' : 'Club registered successfully!'
        );

        resetForm();

        await loadClubs();
    } catch (error) {
        showMessage(error.message, true);
    }
});

function editClub(id) {
    const club = clubs.find((item) => item.id === id);

    if (!club) {
        showMessage('Club not found.', true);
        return;
    }

    clubId.value = club.id;
    document.getElementById('name').value = club.name;
    document.getElementById('description').value = club.description || '';
    document.getElementById('category').value = club.category || '';
    document.getElementById('president').value = club.president || '';
    document.getElementById('meeting_day').value = club.meeting_day || '';
    document.getElementById('contact_email').value = club.contact_email || '';

    formTitle.textContent = 'Edit Club';
    saveButton.textContent = 'Save Changes';
    cancelButton.hidden = false;

    document.querySelector('.form-card').scrollIntoView({
        behavior: 'smooth'
    });
}

async function deleteClub(id, name) {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Could not delete club.');
        }

        showMessage('Club deleted successfully!');

        if (clubId.value === String(id)) {
            resetForm();
        }

        await loadClubs();
    } catch (error) {
        showMessage(error.message, true);
    }
}

function resetForm() {
    clubForm.reset();
    clubId.value = '';

    formTitle.textContent = 'Register a New Club';
    saveButton.textContent = '+ Register Club';
    cancelButton.hidden = true;
}

function showMessage(message, isError = false) {
    formMessage.textContent = message;
    formMessage.style.color = isError ? '#b91c1c' : '#15803d';
}

cancelButton.addEventListener('click', resetForm);

document.getElementById('refreshButton').addEventListener('click', loadClubs);

loadClubs();