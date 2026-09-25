// login
const loginForm =
    document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const email =
                document.getElementById("email").value;

            const password =
                document.getElementById("password").value;

            const message =
                document.getElementById(
                    "loginMessage"
                );

            try {

                const response =
                    await fetch("/login", {

                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({
                            email: email,
                            password: password
                        })
                    });

                const data =
                    await response.json();

                if (response.ok) {

                    message.textContent =
                        data.message;

                    // Save JWT token
                    localStorage.setItem(
                        "token",
                        data.token
                    );

                    // Go to dashboard
                    window.location.href =
                        "/dashboard";

                } else {

                    message.textContent =
                        data.message ||
                        data.error ||
                        "Login failed.";

                }

            } catch (error) {

                console.error(
                    "Login Error:",
                    error
                );

                message.textContent =
                    "Login failed. Please try again.";
            }
        }
    );
}

// register

const registerForm =
    document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const username =
                document.getElementById("username").value.trim();

            const email =
                document.getElementById("email").value.trim();

            const password =
                document.getElementById("password").value;

            const message =
                document.getElementById("registerMessage");

            try {

                const response =
                    await fetch("/register", {

                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({
                            username: username,
                            email: email,
                            password: password
                        })
                    });

                const data =
                    await response.json();

                if (response.ok) {

                    message.textContent =
                        data.message;

                    registerForm.reset();

                } else {

                    message.textContent =
                        data.error ||
                        data.message ||
                        "Registration failed.";
                }

            } catch (error) {

                console.error(
                    "Register Error:",
                    error
                );

                if (message) {

                    message.textContent =
                        "Registration failed. Please try again.";
                }
            }
        }
    );
}


// ==================== DASHBOARD STATS ====================

const totalEmployees =
    document.getElementById(
        "totalEmployees"
    );

if (totalEmployees) {

    async function loadDashboardStats() {

        try {

            const response =
                await fetch(
                    "/dashboard/stats",
                    {
                        method: "GET",

                        headers: {
                            "Authorization":
                                "Bearer " +
                                localStorage.getItem("token")
                        }
                    }
                );

            if (!response.ok) {

                throw new Error(
                    "Dashboard API returned " +
                    response.status
                );
            }

            const data =
                await response.json();

            const totalEmployeesElement =
                document.getElementById(
                    "totalEmployees"
                );

            const presentTodayElement =
                document.getElementById(
                    "presentToday"
                );

            const absentTodayElement =
                document.getElementById(
                    "absentToday"
                );

            const attendanceRateElement =
                document.getElementById(
                    "attendanceRate"
                );


            if (totalEmployeesElement) {

                totalEmployeesElement.textContent =
                    data.total_employees;
            }


            if (presentTodayElement) {

                presentTodayElement.textContent =
                    data.present_today;
            }


            if (absentTodayElement) {

                absentTodayElement.textContent =
                    data.absent_today;
            }


            if (attendanceRateElement) {

                attendanceRateElement.textContent =
                    Number(
                        data.attendance_rate || 0
                    ).toFixed(1) +
                    "%";
            }

        } catch (error) {

            console.error(
                "Dashboard Stats Error:",
                error
            );
        }
    }

    loadDashboardStats();
}

// ==================== ADD EMPLOYEE ====================

const employeeForm =
    document.getElementById(
        "employeeForm"
    );

if (employeeForm) {

    employeeForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const employee_code =
                document.getElementById(
                    "employee_code"
                ).value.trim();

            const name =
                document.getElementById(
                    "name"
                ).value.trim();

            const email =
                document.getElementById(
                    "email"
                ).value.trim();

            const token =
                localStorage.getItem(
                    "token"
                );

            try {

                const response =
                    await fetch(
                        "/employees",
                        {

                            method: "POST",

                            headers: {

                                "Content-Type":
                                    "application/json",

                                "Authorization":
                                    "Bearer " +
                                    token
                            },

                            body: JSON.stringify({

                                employee_code:
                                    employee_code,

                                name:
                                    name,

                                email:
                                    email
                            })
                        }
                    );

                const data =
                    await response.json();

                const message =
                    document.getElementById(
                        "employeeMessage"
                    );


                if (response.ok) {

                    if (message) {

                        message.textContent =
                            data.message;
                    }


                    // Save newly created employee ID
                    window.employeeId =
                        data.employee_id;


                    employeeForm.reset();


                    const faceCaptureSection =
                        document.getElementById(
                            "faceCaptureSection"
                        );


                    if (faceCaptureSection) {

                        faceCaptureSection.style.display =
                            "block";
                    }

                } else {

                    if (message) {

                        message.textContent =
                            data.message ||
                            data.error ||
                            "Unable to add employee.";
                    }
                }

            } catch (error) {

                console.error(
                    "Employee Error:",
                    error
                );

                const message =
                    document.getElementById(
                        "employeeMessage"
                    );

                if (message) {

                    message.textContent =
                        "Unable to add employee.";
                }
            }
        }
    );
}

// ==================== ATTENDANCE TABLE ====================

const attendanceTable =
    document.getElementById(
        "attendanceTable"
    );

const searchAttendance =
    document.getElementById(
        "searchAttendance"
    );

const dateFilter =
    document.getElementById(
        "dateFilter"
    );

let attendanceData = [];


if (attendanceTable) {

    // ====================
    // LOAD ATTENDANCE
    // ====================

    async function loadAttendance() {

        try {

            const token =
                localStorage.getItem("token");

            // Token check
            if (!token) {

                attendanceTable.innerHTML = `
                    <tr>
                        <td colspan="6">
                            Please login first.
                        </td>
                    </tr>
                `;

                return;
            }


            const response =
                await fetch(
                    "/attendance",
                    {
                        method: "GET",

                        headers: {
                            "Authorization":
                                "Bearer " +
                                token
                        }
                    }
                );


            if (!response.ok) {

                throw new Error(
                    "Attendance API returned " +
                    response.status
                );
            }


            const data =
                await response.json();


            // Make sure response is an array
            if (!Array.isArray(data)) {

                throw new Error(
                    "Invalid attendance data"
                );
            }


            attendanceData = data;

            displayAttendance();

        } catch (error) {

            console.error(
                "Attendance Error:",
                error
            );


            attendanceTable.innerHTML = `
                <tr>
                    <td colspan="6">
                        Unable to load attendance records.
                    </td>
                </tr>
            `;
        }
    }


    // ====================
    // DISPLAY ATTENDANCE
    // ====================

    function displayAttendance() {

        const searchText =
            searchAttendance
                ? searchAttendance.value
                    .toLowerCase()
                    .trim()
                : "";


        const selectedDate =
            dateFilter
                ? dateFilter.value
                : "";


        const filteredData =
            attendanceData.filter(
                record => {

                    const employeeName =
                        String(
                            record.name || ""
                        ).toLowerCase();


                    const employeeCode =
                        String(
                            record.employee_code || ""
                        ).toLowerCase();


                    const matchesSearch =
                        employeeName.includes(
                            searchText
                        ) ||
                        employeeCode.includes(
                            searchText
                        );


                    const matchesDate =
                        selectedDate === "" ||
                        String(
                            record.date || ""
                        ) === selectedDate;


                    return (
                        matchesSearch &&
                        matchesDate
                    );
                }
            );


        attendanceTable.innerHTML =
            "";


        if (filteredData.length === 0) {

            attendanceTable.innerHTML = `
                <tr>
                    <td colspan="6">
                        No attendance records found
                    </td>
                </tr>
            `;

            return;
        }


        filteredData.forEach(
            record => {

                const row = `
                    <tr>

                        <td>
                            ${record.id ?? ""}
                        </td>

                        <td>
                            ${record.employee_code ?? ""}
                        </td>

                        <td>
                            ${record.name ?? ""}
                        </td>

                        <td>
                            ${record.date ?? ""}
                        </td>

                        <td>
                            ${record.check_in ?? ""}
                        </td>

                        <td>
                            ${record.status ?? ""}
                        </td>

                    </tr>
                `;


                attendanceTable.innerHTML +=
                    row;
            }
        );
    }


    // ====================
    // SEARCH
    // ====================

    if (searchAttendance) {

        searchAttendance.addEventListener(
            "input",
            function () {

                displayAttendance();
            }
        );
    }


    // ====================
    // DATE FILTER
    // ====================

    if (dateFilter) {

        dateFilter.addEventListener(
            "change",
            function () {

                displayAttendance();
            }
        );
    }


    // ====================
    // INITIAL LOAD
    // ====================

    loadAttendance();
}


// ==================== ANALYTICS ====================

const analyticsTable =
    document.getElementById(
        "analyticsTable"
    );

let attendanceChartInstance = null;


if (analyticsTable) {

    async function loadAnalytics() {

        try {

            const token =
                localStorage.getItem(
                    "token"
                );


            // Token check
            if (!token) {

                analyticsTable.innerHTML = `
                    <tr>
                        <td colspan="5">
                            Please login first.
                        </td>
                    </tr>
                `;

                return;
            }


            const response =
                await fetch(
                    "/attendance/analytics",
                    {
                        method: "GET",

                        headers: {
                            "Authorization":
                                "Bearer " +
                                token
                        }
                    }
                );


            if (!response.ok) {

                throw new Error(
                    "Analytics API returned " +
                    response.status
                );
            }


            const data =
                await response.json();


            analyticsTable.innerHTML =
                "";


            if (
                !Array.isArray(data) ||
                data.length === 0
            ) {

                analyticsTable.innerHTML = `
                    <tr>
                        <td colspan="5">
                            No attendance data found
                        </td>
                    </tr>
                `;


                const averageAttendanceElement =
                    document.getElementById(
                        "averageAttendance"
                    );


                if (averageAttendanceElement) {

                    averageAttendanceElement.textContent =
                        "0%";
                }


                // Clear old chart if no data
                if (
                    attendanceChartInstance
                ) {

                    attendanceChartInstance.destroy();

                    attendanceChartInstance =
                        null;
                }


                return;
            }


            let totalPercentage =
                0;


            const employeeNames =
                [];

            const attendancePercentages =
                [];


            data.forEach(
                record => {

                    const percentage =
                        Number(
                            record.attendance_percentage ||
                            0
                        );


                    totalPercentage +=
                        percentage;


                    employeeNames.push(
                        record.name || ""
                    );


                    attendancePercentages.push(
                        percentage
                    );


                    const row = `
                        <tr>

                            <td>
                                ${record.employee_code ?? ""}
                            </td>

                            <td>
                                ${record.name ?? ""}
                            </td>

                            <td>
                                ${record.total_days ?? 0}
                            </td>

                            <td>
                                ${record.present_days ?? 0}
                            </td>

                            <td>
                                ${percentage}%
                            </td>

                        </tr>
                    `;


                    analyticsTable.innerHTML +=
                        row;
                }
            );


            const averageAttendance =
                totalPercentage /
                data.length;


            const averageAttendanceElement =
                document.getElementById(
                    "averageAttendance"
                );


            if (averageAttendanceElement) {

                averageAttendanceElement.textContent =
                    averageAttendance.toFixed(2) +
                    "%";
            }


            // ====================
            // CREATE ANALYTICS CHART
            // ====================

            const chart =
                document.getElementById(
                    "attendanceChart"
                );


            if (
                chart &&
                typeof Chart !== "undefined"
            ) {

                // Destroy previous chart
                if (
                    attendanceChartInstance
                ) {

                    attendanceChartInstance.destroy();

                    attendanceChartInstance =
                        null;
                }


                attendanceChartInstance =
                    new Chart(
                        chart,
                        {

                            type: "bar",

                            data: {

                                labels:
                                    employeeNames,

                                datasets: [

                                    {

                                        label:
                                            "Attendance Percentage",

                                        data:
                                            attendancePercentages,

                                        borderWidth:
                                            1
                                    }
                                ]
                            },


                            options: {

                                responsive:
                                    true,

                                maintainAspectRatio:
                                    false,

                                scales: {

                                    y: {

                                        beginAtZero:
                                            true,

                                        max:
                                            100,

                                        title: {

                                            display:
                                                true,

                                            text:
                                                "Attendance %"
                                        }
                                    }
                                }
                            }
                        }
                    );
            }

        } catch (error) {

            console.error(
                "Analytics Error:",
                error
            );


            analyticsTable.innerHTML = `
                <tr>
                    <td colspan="5">
                        Unable to load analytics.
                    </td>
                </tr>
            `;
        }
    }


    loadAnalytics();
}

// ==================== MONTHLY ANALYTICS ====================

let monthlyAttendanceChart =
    null;


const monthlyAnalyticsTable =
    document.getElementById(
        "monthlyAnalyticsTable"
    );


if (monthlyAnalyticsTable) {

    async function loadMonthlyAnalytics() {

        try {

            const token =
                localStorage.getItem(
                    "token"
                );


            // ====================
            // TOKEN CHECK
            // ====================

            if (!token) {

                monthlyAnalyticsTable.innerHTML = `
                    <tr>
                        <td colspan="6">
                            Please login first.
                        </td>
                    </tr>
                `;

                return;
            }


            const response =
                await fetch(
                    "/attendance/monthly",
                    {
                        method: "GET",

                        headers: {
                            "Authorization":
                                "Bearer " +
                                token
                        }
                    }
                );


            if (!response.ok) {

                throw new Error(
                    "Monthly Analytics API returned " +
                    response.status
                );
            }


            const data =
                await response.json();


            if (!Array.isArray(data)) {

                throw new Error(
                    "Invalid monthly analytics data"
                );
            }


            const monthFilter =
                document.getElementById(
                    "monthFilter"
                );


            // ====================
            // DISPLAY MONTHLY DATA
            // ====================

            function displayMonthlyData(
                selectedMonth
            ) {

                monthlyAnalyticsTable.innerHTML =
                    "";


                const filteredData =
                    data.filter(
                        record => {

                            return (
                                selectedMonth === "" ||
                                String(
                                    record.month || ""
                                ) === selectedMonth
                            );
                        }
                    );


                // ====================
                // DESTROY OLD CHART
                // ====================

                if (
                    monthlyAttendanceChart
                ) {

                    monthlyAttendanceChart.destroy();

                    monthlyAttendanceChart =
                        null;
                }


                // ====================
                // NO DATA
                // ====================

                if (
                    filteredData.length === 0
                ) {

                    monthlyAnalyticsTable.innerHTML = `
                        <tr>
                            <td colspan="6">
                                No monthly attendance data found
                            </td>
                        </tr>
                    `;

                    return;
                }


                // ====================
                // DISPLAY TABLE
                // ====================

                filteredData.forEach(
                    record => {

                        const percentage =
                            Number(
                                record.attendance_percentage ||
                                0
                            );


                        const row = `
                            <tr>

                                <td>
                                    ${record.employee_code ?? ""}
                                </td>

                                <td>
                                    ${record.name ?? ""}
                                </td>

                                <td>
                                    ${record.month ?? ""}
                                </td>

                                <td>
                                    ${record.total_days ?? 0}
                                </td>

                                <td>
                                    ${record.present_days ?? 0}
                                </td>

                                <td>
                                    ${percentage}%
                                </td>

                            </tr>
                        `;


                        monthlyAnalyticsTable
                            .innerHTML +=
                            row;
                    }
                );


                // ====================
                // MONTHLY CHART
                // ====================

                const monthlyChartCanvas =
                    document.getElementById(
                        "monthlyAttendanceChart"
                    );


                if (
                    !monthlyChartCanvas ||
                    typeof Chart === "undefined"
                ) {

                    return;
                }


                let chartLabels =
                    [];

                let chartValues =
                    [];


                // ====================
                // SELECTED MONTH
                // ====================

                if (
                    selectedMonth !== ""
                ) {

                    filteredData.forEach(
                        record => {

                            chartLabels.push(
                                record.name || ""
                            );


                            chartValues.push(
                                Number(
                                    record.attendance_percentage ||
                                    0
                                )
                            );
                        }
                    );

                }


                // ====================
                // ALL MONTHS
                // ====================

                else {

                    const monthlyData =
                        {};


                    filteredData.forEach(
                        record => {

                            const month =
                                String(
                                    record.month || ""
                                );


                            if (
                                !monthlyData[
                                    month
                                ]
                            ) {

                                monthlyData[
                                    month
                                ] = [];
                            }


                            monthlyData[
                                month
                            ].push(
                                Number(
                                    record.attendance_percentage ||
                                    0
                                )
                            );
                        }
                    );


                    Object.keys(
                        monthlyData
                    ).forEach(
                        month => {

                            const values =
                                monthlyData[
                                    month
                                ];


                            const total =
                                values.reduce(
                                    (
                                        sum,
                                        value
                                    ) =>
                                        sum +
                                        value,
                                    0
                                );


                            const average =
                                values.length > 0
                                    ? total /
                                      values.length
                                    : 0;


                            chartLabels.push(
                                month
                            );


                            chartValues.push(
                                Number(
                                    average.toFixed(
                                        2
                                    )
                                )
                            );
                        }
                    );
                }


                // ====================
                // CREATE MONTHLY CHART
                // ====================

                monthlyAttendanceChart =
                    new Chart(
                        monthlyChartCanvas,
                        {

                            type: "bar",

                            data: {

                                labels:
                                    chartLabels,

                                datasets: [

                                    {

                                        label:
                                            "Attendance Percentage",

                                        data:
                                            chartValues,

                                        borderWidth:
                                            1
                                    }
                                ]
                            },


                            options: {

                                responsive:
                                    true,

                                maintainAspectRatio:
                                    false,

                                scales: {

                                    y: {

                                        beginAtZero:
                                            true,

                                        max:
                                            100,

                                        title: {

                                            display:
                                                true,

                                            text:
                                                "Attendance %"
                                        }
                                    },


                                    x: {

                                        title: {

                                            display:
                                                true,

                                            text:
                                                selectedMonth
                                                    ? "Employee"
                                                    : "Month"
                                        }
                                    }
                                }
                            }
                        }
                    );
            }


            // ====================
            // SHOW ALL MONTHS
            // ====================

            displayMonthlyData("");


            // ====================
            // MONTH FILTER
            // ====================

            if (monthFilter) {

                monthFilter.addEventListener(
                    "change",
                    function () {

                        displayMonthlyData(
                            this.value
                        );
                    }
                );
            }

        } catch (error) {

            console.error(
                "Monthly Analytics Error:",
                error
            );


            monthlyAnalyticsTable.innerHTML = `
                <tr>
                    <td colspan="6">
                        Unable to load monthly analytics.
                    </td>
                </tr>
            `;
        }
    }


    loadMonthlyAnalytics();
}

// ==================== FACE CAPTURE ====================

const faceCaptureSection =
    document.getElementById(
        "faceCaptureSection"
    );

const captureFaceButton =
    document.getElementById(
        "captureFaceButton"
    );

const camera =
    document.getElementById(
        "camera"
    );

const faceMessage =
    document.getElementById(
        "faceMessage"
    );


// IMPORTANT:
// employeeId is stored globally so
// Add Employee section and Face Capture
// section can use the same ID.

if (
    typeof window.employeeId === "undefined"
) {

    window.employeeId = null;
}


if (
    faceCaptureSection &&
    captureFaceButton &&
    camera
) {

    captureFaceButton.addEventListener(
        "click",
        async function () {

            // ====================
            // CHECK TOKEN
            // ====================

            const token =
                localStorage.getItem(
                    "token"
                );


            if (!token) {

                if (faceMessage) {

                    faceMessage.innerText =
                        "Please login first ❌";
                }

                return;
            }


            // ====================
            // CHECK EMPLOYEE ID
            // ====================

            if (!window.employeeId) {

                if (faceMessage) {

                    faceMessage.innerText =
                        "Employee ID not found ❌";
                }

                return;
            }


            // ====================
            // START CAMERA
            // ====================

            try {

                if (!camera.srcObject) {

                    const stream =
                        await navigator
                            .mediaDevices
                            .getUserMedia({
                                video: true
                            });


                    camera.srcObject =
                        stream;


                    await camera.play();
                }

            } catch (error) {

                console.error(
                    "Camera Error:",
                    error
                );


                if (faceMessage) {

                    faceMessage.innerText =
                        "Camera access denied or unavailable.";
                }


                return;
            }


            // ====================
            // CAPTURE FACE
            // ====================

            try {

                const canvas =
                    document.getElementById(
                        "faceCanvas"
                    );


                if (!canvas) {

                    if (faceMessage) {

                        faceMessage.innerText =
                            "Face canvas not found.";
                    }

                    return;
                }


                const context =
                    canvas.getContext(
                        "2d"
                    );


                if (!context) {

                    if (faceMessage) {

                        faceMessage.innerText =
                            "Could not access face canvas.";
                    }

                    return;
                }


                if (
                    camera.videoWidth === 0 ||
                    camera.videoHeight === 0
                ) {

                    if (faceMessage) {

                        faceMessage.innerText =
                            "Camera is still starting. Please try again.";
                    }

                    return;
                }


                canvas.width =
                    camera.videoWidth;


                canvas.height =
                    camera.videoHeight;


                context.drawImage(
                    camera,
                    0,
                    0,
                    canvas.width,
                    canvas.height
                );


                if (faceMessage) {

                    faceMessage.innerText =
                        "Face image captured successfully ✅";
                }


                // ====================
                // IMAGE TO BLOB
                // ====================

                const imageBlob =
                    await new Promise(
                        resolve => {

                            canvas.toBlob(
                                resolve,
                                "image/jpeg"
                            );
                        }
                    );


                if (!imageBlob) {

                    if (faceMessage) {

                        faceMessage.innerText =
                            "Could not create face image ❌";
                    }

                    return;
                }


                // ====================
                // SEND IMAGE TO FLASK
                // ====================

                const formData =
                    new FormData();


                formData.append(
                    "face",
                    imageBlob,
                    "face.jpg"
                );


                const response =
                    await fetch(
                        `/employees/${window.employeeId}/face`,
                        {

                            method: "POST",

                            headers: {

                                "Authorization":
                                    "Bearer " +
                                    token
                            },

                            body: formData
                        }
                    );


                const data =
                    await response.json();


                if (response.ok) {

                    if (faceMessage) {

                        faceMessage.innerText =
                            "Face uploaded successfully ✅";
                    }


                    // ====================
                    // STOP CAMERA
                    // ====================

                    if (
                        camera.srcObject
                    ) {

                        const tracks =
                            camera.srcObject
                                .getTracks();


                        tracks.forEach(
                            track => {

                                track.stop();
                            }
                        );


                        camera.srcObject =
                            null;
                    }


                    console.log(
                        "Face Upload Response:",
                        data
                    );

                } else {

                    if (faceMessage) {

                        faceMessage.innerText =
                            data.message ||
                            data.error ||
                            "Face upload failed ❌";
                    }
                }


            } catch (error) {

                console.error(
                    "Face Upload Error:",
                    error
                );


                if (faceMessage) {

                    faceMessage.innerText =
                        "Face upload error ❌";
                }
            }
        }
    );
}

// =========================
// FACE ATTENDANCE CAMERA
// =========================

const attendanceCamera =
    document.getElementById(
        "attendanceCamera"
    );

const startAttendanceCamera =
    document.getElementById(
        "startAttendanceCamera"
    );

const markAttendanceButton =
    document.getElementById(
        "markAttendanceButton"
    );

const stopAttendanceCameraButton =
    document.getElementById(
        "stopAttendanceCamera"
    );

const attendanceMessage =
    document.getElementById(
        "attendanceMessage"
    );

let attendanceStream =
    null;


// =========================
// STOP ATTENDANCE CAMERA
// =========================

function stopAttendanceCamera() {

    if (attendanceStream) {

        attendanceStream
            .getTracks()
            .forEach(
                track => track.stop()
            );

        attendanceStream = null;
    }


    if (attendanceCamera) {

        attendanceCamera.srcObject =
            null;
    }


    if (attendanceMessage) {

        attendanceMessage.textContent =
            "Camera stopped";
    }
}


// =========================
// STOP BUTTON
// =========================

if (stopAttendanceCameraButton) {

    stopAttendanceCameraButton.addEventListener(
        "click",
        stopAttendanceCamera
    );
}

// =========================
// AUTOMATIC RECOGNITION
// =========================

let automaticAttendanceInterval =
    null;

let recognitionInProgress =
    false;


    // =========================
// START ATTENDANCE CAMERA
// =========================

if (startAttendanceCamera) {

    startAttendanceCamera.addEventListener(
        "click",
        async function () {

            try {

                // ====================
                // CHECK LOGIN TOKEN
                // ====================

                const token =
                    localStorage.getItem(
                        "token"
                    );


                if (!token) {

                    if (attendanceMessage) {

                        attendanceMessage.textContent =
                            "Please login first.";
                    }

                    return;
                }


                // ====================
                // CHECK CAMERA
                // ====================

                if (!attendanceCamera) {

                    if (attendanceMessage) {

                        attendanceMessage.textContent =
                            "Attendance camera not found.";
                    }

                    return;
                }


                // ====================
                // START CAMERA ONLY ONCE
                // ====================

                if (!attendanceStream) {

                    attendanceStream =
                        await navigator
                            .mediaDevices
                            .getUserMedia({
                                video: true
                            });


                    attendanceCamera.srcObject =
                        attendanceStream;


                    await attendanceCamera.play();
                }


                if (attendanceMessage) {

                    attendanceMessage.textContent =
                        "Camera started. Automatic recognition active...";
                }


                // ====================
                // START AUTOMATIC RECOGNITION
                // ====================

                if (
                    !automaticAttendanceInterval
                ) {

                    automaticAttendanceInterval =
                        setInterval(
                            recognizeAttendanceFace,
                            3000
                        );
                }

            } catch (error) {

                console.error(
                    "Camera Error:",
                    error
                );


                if (attendanceMessage) {

                    attendanceMessage.textContent =
                        "Camera permission denied or camera not available.";
                }
            }
        }
    );
}


// =========================
// MANUAL MARK ATTENDANCE
// =========================

if (markAttendanceButton) {

    markAttendanceButton.addEventListener(
        "click",
        function () {

            // ====================
            // CHECK CAMERA
            // ====================

            if (
                !attendanceCamera ||
                !attendanceCamera.srcObject
            ) {

                if (attendanceMessage) {

                    attendanceMessage.textContent =
                        "Please start the camera first.";
                }

                return;
            }


            // ====================
            // CHECK TOKEN
            // ====================

            const token =
                localStorage.getItem(
                    "token"
                );


            if (!token) {

                if (attendanceMessage) {

                    attendanceMessage.textContent =
                        "Please login first.";
                }

                return;
            }


            // ====================
            // CHECK VIDEO SIZE
            // ====================

            if (
                !attendanceCamera.videoWidth ||
                !attendanceCamera.videoHeight
            ) {

                if (attendanceMessage) {

                    attendanceMessage.textContent =
                        "Camera is still starting. Please try again.";
                }

                return;
            }


            // ====================
            // CREATE CANVAS
            // ====================

            const canvas =
                document.createElement(
                    "canvas"
                );


            canvas.width =
                attendanceCamera.videoWidth;


            canvas.height =
                attendanceCamera.videoHeight;


            const context =
                canvas.getContext(
                    "2d"
                );


            if (!context) {

                if (attendanceMessage) {

                    attendanceMessage.textContent =
                        "Could not capture camera image.";
                }

                return;
            }


            context.drawImage(
                attendanceCamera,
                0,
                0,
                canvas.width,
                canvas.height
            );


            // ====================
            // CONVERT IMAGE TO BLOB
            // ====================

            canvas.toBlob(
                async function (blob) {

                    if (!blob) {

                        if (attendanceMessage) {

                            attendanceMessage.textContent =
                                "Could not capture image.";
                        }

                        return;
                    }


                    // ====================
                    // CREATE FORM DATA
                    // ====================

                    const formData =
                        new FormData();


                    formData.append(
                        "face",
                        blob,
                        "attendance.jpg"
                    );


                    if (attendanceMessage) {

                        attendanceMessage.textContent =
                            "Recognizing face...";
                    }


                    try {

                        // ====================
                        // SEND TO FLASK
                        // ====================

                        const response =
                            await fetch(
                                "/face-recognition",
                                {

                                    method: "POST",

                                    headers: {

                                        "Authorization":
                                            "Bearer " +
                                            token
                                    },

                                    body: formData
                                }
                            );


                        const data =
                            await response.json();


                        // ====================
                        // SUCCESS
                        // ====================

                        if (response.ok) {

                            if (attendanceMessage) {

                                attendanceMessage.textContent =
                                    data.name +
                                    " - " +
                                    data.attendance;
                            }


                            console.log(
                                "Manual Recognition:",
                                data
                            );

                        } else {

                            if (attendanceMessage) {

                                attendanceMessage.textContent =
                                    data.message ||
                                    data.error ||
                                    "Face recognition failed.";
                            }
                        }


                    } catch (error) {

                        console.error(
                            "Manual Recognition Error:",
                            error
                        );


                        if (attendanceMessage) {

                            attendanceMessage.textContent =
                                "Face recognition failed.";
                        }
                    }

                },
                "image/jpeg"
            );
        }
    );
}

// =========================
// AUTOMATIC FACE RECOGNITION
// =========================

async function recognizeAttendanceFace() {

    // ====================
    // CAMERA CHECK
    // ====================

    if (
        !attendanceCamera ||
        !attendanceCamera.videoWidth ||
        !attendanceCamera.videoHeight
    ) {

        return;
    }


    // ====================
    // TOKEN CHECK
    // ====================

    const token =
        localStorage.getItem(
            "token"
        );


    if (!token) {

        if (attendanceMessage) {

            attendanceMessage.textContent =
                "Please login first.";
        }

        return;
    }


    // ====================
    // PREVIOUS REQUEST CHECK
    // ====================

    if (recognitionInProgress) {

        return;
    }


    recognitionInProgress =
        true;


    try {

        // ====================
        // CREATE CANVAS
        // ====================

        const canvas =
            document.createElement(
                "canvas"
            );


        canvas.width =
            attendanceCamera.videoWidth;


        canvas.height =
            attendanceCamera.videoHeight;


        const context =
            canvas.getContext(
                "2d"
            );


        if (!context) {

            return;
        }


        context.drawImage(
            attendanceCamera,
            0,
            0,
            canvas.width,
            canvas.height
        );


        // ====================
        // IMAGE TO BLOB
        // ====================

        const blob =
            await new Promise(
                resolve => {

                    canvas.toBlob(
                        resolve,
                        "image/jpeg"
                    );
                }
            );


        if (!blob) {

            return;
        }


        // ====================
        // SEND IMAGE TO FLASK
        // ====================

        const formData =
            new FormData();


        formData.append(
            "face",
            blob,
            "attendance.jpg"
        );


        if (attendanceMessage) {

            attendanceMessage.textContent =
                "Recognizing face...";
        }


        const response =
            await fetch(
                "/face-recognition",
                {

                    method: "POST",

                    headers: {

                        "Authorization":
                            "Bearer " +
                            token
                    },

                    body: formData
                }
            );


        const data =
            await response.json();


        // ====================
        // FACE RECOGNIZED
        // ====================

        if (response.ok) {

            if (attendanceMessage) {

                attendanceMessage.textContent =
                    data.name +
                    " - " +
                    data.attendance;
            }


            console.log(
                "Recognized:",
                data.name
            );


            console.log(
                "Similarity:",
                data.similarity
            );


            // ====================
            // STOP AUTOMATIC CHECKING
            // ====================

            if (
                automaticAttendanceInterval
            ) {

                clearInterval(
                    automaticAttendanceInterval
                );


                automaticAttendanceInterval =
                    null;
            }


        } else {

            // ====================
            // TOKEN EXPIRED
            // ====================

            if (
                response.status === 401
            ) {

                if (attendanceMessage) {

                    attendanceMessage.textContent =
                        data.message ||
                        "Authentication failed. Please login again.";
                }

            } else {

                if (attendanceMessage) {

                    attendanceMessage.textContent =
                        data.message ||
                        data.error ||
                        "Recognition failed.";
                }
            }
        }


    } catch (error) {

        console.error(
            "Recognition Error:",
            error
        );


        if (attendanceMessage) {

            attendanceMessage.textContent =
                "Face recognition failed.";
        }

    } finally {

        recognitionInProgress =
            false;
    }
}

// =========================
// AUTOMATIC FACE RECOGNITION
// =========================

async function recognizeAttendanceFace() {

    // ====================
    // CAMERA CHECK
    // ====================

    if (
        !attendanceCamera ||
        !attendanceCamera.videoWidth ||
        !attendanceCamera.videoHeight
    ) {

        return;
    }


    // ====================
    // TOKEN CHECK
    // ====================

    const token =
        localStorage.getItem(
            "token"
        );


    if (!token) {

        if (attendanceMessage) {

            attendanceMessage.textContent =
                "Please login first.";
        }

        return;
    }


    // ====================
    // PREVIOUS REQUEST CHECK
    // ====================

    if (recognitionInProgress) {

        return;
    }


    recognitionInProgress =
        true;


    try {

        // ====================
        // CREATE CANVAS
        // ====================

        const canvas =
            document.createElement(
                "canvas"
            );


        canvas.width =
            attendanceCamera.videoWidth;


        canvas.height =
            attendanceCamera.videoHeight;


        const context =
            canvas.getContext(
                "2d"
            );


        if (!context) {

            return;
        }


        context.drawImage(
            attendanceCamera,
            0,
            0,
            canvas.width,
            canvas.height
        );


        // ====================
        // IMAGE TO BLOB
        // ====================

        const blob =
            await new Promise(
                resolve => {

                    canvas.toBlob(
                        resolve,
                        "image/jpeg"
                    );
                }
            );


        if (!blob) {

            return;
        }


        // ====================
        // SEND IMAGE TO FLASK
        // ====================

        const formData =
            new FormData();


        formData.append(
            "face",
            blob,
            "attendance.jpg"
        );


        if (attendanceMessage) {

            attendanceMessage.textContent =
                "Recognizing face...";
        }


        const response =
            await fetch(
                "/face-recognition",
                {

                    method: "POST",

                    headers: {

                        "Authorization":
                            "Bearer " +
                            token
                    },

                    body: formData
                }
            );


        const data =
            await response.json();


        // ====================
        // FACE RECOGNIZED
        // ====================

        if (response.ok) {

            if (attendanceMessage) {

                attendanceMessage.textContent =
                    data.name +
                    " - " +
                    data.attendance;
            }


            console.log(
                "Recognized:",
                data.name
            );


            console.log(
                "Similarity:",
                data.similarity
            );


            // ====================
            // STOP AUTOMATIC CHECKING
            // ====================

            if (
                automaticAttendanceInterval
            ) {

                clearInterval(
                    automaticAttendanceInterval
                );


                automaticAttendanceInterval =
                    null;
            }


        } else {

            // ====================
            // TOKEN EXPIRED
            // ====================

            if (
                response.status === 401
            ) {

                if (attendanceMessage) {

                    attendanceMessage.textContent =
                        data.message ||
                        "Authentication failed. Please login again.";
                }

            } else {

                if (attendanceMessage) {

                    attendanceMessage.textContent =
                        data.message ||
                        data.error ||
                        "Recognition failed.";
                }
            }
        }


    } catch (error) {

        console.error(
            "Recognition Error:",
            error
        );


        if (attendanceMessage) {

            attendanceMessage.textContent =
                "Face recognition failed.";
        }

    } finally {

        recognitionInProgress =
            false;
    }
}
