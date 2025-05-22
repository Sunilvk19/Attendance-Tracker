let students = [];

function addStudent() {
    const nameInput = document.getElementById('name');
    const name = nameInput.value.trim();
    
    if (name) {
        if (!students.some(student => student.name === name)) {
            students.push({
                name: name,
                attendance: false,
                date: new Date().toLocaleDateString()
            });
            updateStudentList();
            nameInput.value = '';
        } else {
            alert('Student already exists!');
        }
    } else {
        alert('Please enter a name!');
    }
}

function markAttendance() {
    updateStudentList();
}

function viewAttendance() {
    const attendanceStatus = document.getElementById('attendanceStatus');
    if (students.length === 0) {
        attendanceStatus.innerHTML = '<p>No students registered yet.</p>';
        return;
    }
    
    const present = students.filter(student => student.attendance).length;
    attendanceStatus.innerHTML = `
        <h3>Today's Summary (${new Date().toLocaleDateString()})</h3>
        <p>Total Students: ${students.length}</p>
        <p>Present: ${present}</p>
        <p>Absent: ${students.length - present}</p>
    `;
}

function toggleAttendance(index) {
    students[index].attendance = !students[index].attendance;
    students[index].date = new Date().toLocaleDateString();
    updateStudentList();
}

function removeStudent(index) {
    students.splice(index, 1);
    updateStudentList();
}

function updateStudentList() {
    const studentList = document.getElementById('studentList');
    studentList.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Attendance Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${students.map((student, index) => `
                    <tr>
                        <td>${student.name}</td>
                        <td>${student.attendance ? 'Present' : 'Absent'}</td>
                        <td>
                            <button onclick="toggleAttendance(${index})">
                                ${student.attendance ? 'Mark Absent' : 'Mark Present'}
                            </button>
                            <button onclick="removeStudent(${index})">Remove</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}
let attendanceChart;

function showAttendanceHistory() {
    const modal = document.getElementById('historyModal');
    modal.style.display = 'block';
    
    const ctx = document.getElementById('attendanceChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (attendanceChart) {
        attendanceChart.destroy();
    }

    // Process attendance data
    const attendanceData = processAttendanceData();

    // Create new chart
    attendanceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: attendanceData.dates,
            datasets: [
                {
                    label: 'Present',
                    data: attendanceData.presentCount,
                    borderColor: '#2ecc71',
                    backgroundColor: 'rgba(46, 204, 113, 0.2)',
                    tension: 0.4
                },
                {
                    label: 'Absent',
                    data: attendanceData.absentCount,
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
                    font: {
                        size: 16
                    }
                },
                legend: {
                    position: 'bottom'
                }
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

function processAttendanceData() {
    // Get selected month and year
    const monthSelect = document.getElementById('monthSelect');
    const yearSelect = document.getElementById('yearSelect');
    const selectedMonth = parseInt(monthSelect.value);
    const selectedYear = parseInt(yearSelect.value);

    // Process data for the selected month
    const dates = [];
    const presentCount = [];
    const absentCount = [];

    // Get days in selected month
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
        const date = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        dates.push(day);

        // Count present and absent for each day
        let present = 0;
        let absent = 0;

        students.forEach(student => {
            if (student.attendance[date]) {
                if (student.attendance[date].status) {
                    present++;
                } else {
                    absent++;
                }
            }
        });

        presentCount.push(present);
        absentCount.push(absent);
    }

    return { dates, presentCount, absentCount };
}

// Add event listener for modal close button
document.querySelector('.close').addEventListener('click', function() {
    document.getElementById('historyModal').style.display = 'none';
});

// Call showAttendanceHistory when viewing attendance
function viewAttendance() {
    showAttendanceHistory();
}