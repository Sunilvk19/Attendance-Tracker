// Student data structure and storage
const STORAGE_KEY = 'attendanceData';
let students = [];

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    initializeDateControls();
    updateClock();
    setInterval(updateClock, 1000);
});

// Clock and Date Functions
function updateClock() {
    const timeDisplay = document.getElementById('currentTime');
    if (timeDisplay) {
        const now = new Date();
        timeDisplay.textContent = now.toLocaleString();
    }
}

function initializeDateControls() {
    const monthSelect = document.getElementById('monthSelect');
    const yearSelect = document.getElementById('yearSelect');
    
    if (!monthSelect || !yearSelect) return;

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    monthSelect.value = currentMonth.toString();

    if (yearSelect.children.length === 0) {
        for (let year = currentYear - 5; year <= currentYear + 5; year++) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            if (year === currentYear) option.selected = true;
            yearSelect.appendChild(option);
        }
    }
}

// Student Management Functions
function addStudent() {
    const studentData = {
        id: generateStudentId(),
        name: document.getElementById('name').value.trim(),
        age: document.getElementById('age').value,
        gender: document.getElementById('gender').value,
        grade: document.getElementById('grade').value,
        phone: document.getElementById('phone').value.trim(),
        email: document.getElementById('email').value.trim(),
        attendance: {},
        dateAdded: new Date().toISOString()
    };

    if (validateStudentData(studentData)) {
        students.push(studentData);
        saveData();
        updateStudentList();
        clearForm();
        alert('Student added successfully!');
    }
}

function validateStudentData(data) {
    if (!data.name || !data.age || !data.gender || !data.grade) {
        alert('Please fill all required fields!');
        return false;
    }
    
    if (students.some(student => student.name === data.name)) {
        alert('Student already exists!');
        return false;
    }
    
    return true;
}

// Add this function to your file
function showConfirmModal(studentData, onConfirm) {
    const modal = document.createElement('div');
    modal.className = 'confirm-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Confirm Student Details</h3>
            <div class="student-details">
                <p><strong>Name:</strong> ${studentData.name}</p>
                <p><strong>Age:</strong> ${studentData.age}</p>
                <p><strong>Gender:</strong> ${studentData.gender}</p>
                <p><strong>Grade:</strong> ${studentData.grade}</p>
            </div>
            <div class="modal-buttons">
                <button class="btn-success" id="confirmAdd">Confirm</button>
                <button class="btn-danger" id="cancelAdd">Cancel</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('confirmAdd').onclick = () => {
        onConfirm();
        modal.remove();
    };
    document.getElementById('cancelAdd').onclick = () => {
        alert('Student addition cancelled.');
        modal.remove();
    };
}

function generateStudentId() {
    return 'STD' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
}

function updateStudentList() {
    const tbody = document.querySelector('#studentList tbody');
    if (!tbody) return;

    const today = new Date().toISOString().split('T')[0];
    const currentDate = new Date().toLocaleDateString();
    
    tbody.innerHTML = students.map(student => {
        const isPresent = student.attendance[today]?.status;
        const attendanceStatus = isPresent === undefined ? '---' : (isPresent ? 'Present' : 'Absent');
        const statusColor = isPresent ? 'color: #2ecc71; font-weight: bold;' : 'color: #e74c3c; font-weight: bold;';
        
        return `
        <tr>
            <td>${student.name}</td>
            <td>${student.age}</td>
            <td>${student.dateAdded ? new Date(student.dateAdded).toLocaleDateString() : '-'}</td>
            <td style="${statusColor}">${attendanceStatus}</td>
            <td>${student.attendance[today]?.timestamp ? new Date(student.attendance[today].timestamp).toLocaleTimeString() : '-'}</td>
            <td>${currentDate}</td>
            <td>
                <button onclick="markAttendance('${student.id}', true)" class="btn-success">Present</button>
                <button onclick="markAttendance('${student.id}', false)" class="btn-danger">Absent</button>
            </td>
        </tr>
    `}).join('');
}

function markAttendance(studentId, isPresent) {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    const today = new Date().toISOString().split('T')[0];
    student.attendance[today] = {
        status: isPresent,
        timestamp: new Date().toISOString()
    };

    saveData();
    updateStudentList();
    showNotification(`${student.name} marked as ${isPresent ? 'Present' : 'Absent'}`, '---');
}

function viewAttendance() {
    const modal = document.getElementById('attendanceModal');
    const tableBody = document.querySelector('#monthlyAttendanceTable tbody');
    const month = parseInt(document.getElementById('monthSelect').value);
    const year = parseInt(document.getElementById('yearSelect').value);

    if (!modal || !tableBody) return;

    tableBody.innerHTML = ''; // Clear previous
    let hasData = false;

    students.forEach(student => {
        let totalDays = 0;
        let presentDays = 0;

        Object.entries(student.attendance).forEach(([date, record]) => {
            const [y, m, d] = date.split('-').map(Number);
            if (y === year && m === month) {
                totalDays++;
                if (record.status) presentDays++;
            }
        });

        if (totalDays > 0) {
            const percentage = ((presentDays / totalDays) * 100).toFixed(2);
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${student.name}</td>
                <td>${year}-${String(month).padStart(2, '0')}</td>
                <td>${percentage}%</td>
            `;
            tableBody.appendChild(row);
            hasData = true;
        }
    });

    if (!hasData) {
        tableBody.innerHTML = `<tr><td colspan="3">No attendance data available for this month.</td></tr>`;
    }
    modal.style.display = 'block';
}

function closeAttendanceModal() {
    document.getElementById('attendanceModal').style.display = 'none';
}

function processAttendanceData() {
    const monthSelect = document.getElementById('monthSelect');
    const yearSelect = document.getElementById('yearSelect');
    const selectedMonth = parseInt(monthSelect.value);
    const selectedYear = parseInt(yearSelect.value);
    
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    const dates = Array.from({length: daysInMonth}, (_, i) => i + 1);
    const presentCount = new Array(daysInMonth).fill(0);
    const absentCount = new Array(daysInMonth).fill(0);

    students.forEach(student => {
        Object.entries(student.attendance).forEach(([date, record]) => {
            const [year, month, day] = date.split('-').map(Number);
            if (year === selectedYear && month === selectedMonth) {
                if (record.status) {
                    presentCount[day - 1]++;
                } else {
                    absentCount[day - 1]++;
                }
            }
        });
    });

    return { dates, presentCount, absentCount };
}

// Data Persistence
function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
}

function loadData() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        students = JSON.parse(saved);
        updateStudentList();
    }
}

// Utilities
function clearForm() {
    ['id','name', 'age', 'gender', 'grade','phone','email'].forEach(id => {
        const input = document.getElementById(id);
        if (input) input.value = '';
    });
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// Event Listeners
document.querySelector('.close')?.addEventListener('click', () => {
    document.getElementById('historyModal').style.display = 'none';
});

function changeMonth() {
    showAttendanceHistory();
}

// Optional: ESC to close modals
window.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
    }
});
