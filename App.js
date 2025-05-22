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