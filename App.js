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
    const now = new Date();
    timeDisplay.textContent = now.toLocaleString();
}

function initializeDateControls() {
    const monthSelect = document.getElementById('monthSelect');
    const yearSelect = document.getElementById('yearSelect');
    
    // Set current month
    const currentDate = new Date();
    monthSelect.value = currentDate.getMonth() + 1;
    
    // Populate years
    const currentYear = currentDate.getFullYear();
    for (let year = currentYear - 5; year <= currentYear + 5; year++) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        if (year === currentYear) option.selected = true;
        yearSelect.appendChild(option);
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
        attendance: {},
        dateAdded: new Date().toISOString()
    };

    if (validateStudentData(studentData)) {
        students.push(studentData);
        saveData();
        updateStudentList();
        clearForm();
        showNotification('Student added successfully!', 'success');
    }
}

function validateStudentData(data) {
    if (!data.name || !data.age || !data.gender || !data.grade) {
        showNotification('Please fill all required fields!', 'error');
        return false;
    }
    
    if (students.some(student => student.name === data.name)) {
        showNotification('Student already exists!', 'error');
        return false;
    }
    
    return true;
}

function generateStudentId() {
    return 'STD' + Date.now().toString().slice(-6);
}

// Attendance Management Functions
function markAttendance(studentId, status) {
    const student = students.find(s => s.id === studentId);
    if (student) {
        const today = new Date().toISOString().split('T')[0];
        student.attendance[today] = {
            status: status,
            timestamp: new Date().toISOString()
        };
        saveData();
        updateStudentList();
    }
}

function updateStudentList() {
    const tbody = document.querySelector('#studentList tbody');
    const today = new Date().toISOString().split('T')[0];
    
    tbody.innerHTML = students.map(student => `
        <tr>
            <td>${student.name}</td>
            <td>${student.age}</td>
            <td>${student.dateAdded ? new Date(student.dateAdded).toLocaleDateString() : '-'}</td>
            <td>${student.attendance[today]?.status ? 'Present' : '---'}</td>
            <td>${student.attendance[today]?.timestamp ? new Date(student.attendance[today].timestamp).toLocaleTimeString() : '-'}</td>
            <td>
                <button onclick="markAttendance('${student.id}', true)" class="btn-success">Present</button>
                <button onclick="markAttendance('${student.id}', false)" class="btn-danger">Absent</button>
                <button onclick="viewStudentHistory('${student.id}')" class="btn-info">History</button>
            </td>
        </tr>
    `).join('');
}

// Attendance History and Charts
function showAttendanceHistory() {
    const modal = document.getElementById('historyModal');
    modal.style.display = 'block';
    
    const ctx = document.getElementById('attendanceChart').getContext('2d');
    if (window.attendanceChart) {
        window.attendanceChart.destroy();
    }

    const data = processAttendanceData();
    createAttendanceChart(ctx, data);
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

function createAttendanceChart(ctx, data) {
    window.attendanceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.dates,
            datasets: [
                {
                    label: 'Present',
                    data: data.presentCount,
                    borderColor: '#2ecc71',
                    backgroundColor: 'rgba(46, 204, 113, 0.2)',
                    tension: 0.4
                },
                {
                    label: 'Absent',
                    data: data.absentCount,
                    borderColor: '#e74c3c',
                    backgroundColor: 'rgba(231, 76, 60, 0.2)',
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Monthly Attendance Overview',
                    font: { size: 16 }
                },
                legend: { position: 'bottom' }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: { 
                        display: true, 
                        text: 'Number of Students' 
                    }
                },
                x: {
                    title: { 
                        display: true, 
                        text: 'Date' 
                    }
                }
            }
        }
    });
}

// Data Persistence Functions
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

// Utility Functions
function clearForm() {
    ['name', 'age', 'gender', 'grade'].forEach(id => {
        document.getElementById(id).value = '';
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