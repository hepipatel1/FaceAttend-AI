// // ==================== LOGIN ====================

// const loginForm = document.getElementById("loginForm");

// if (loginForm) {

//     loginForm.addEventListener("submit", async function (event) {

//         event.preventDefault();

//         const email = document.getElementById("email").value;
//         const password = document.getElementById("password").value;

//         const response = await fetch("/login", {
//             method: "POST",

//             headers: {
//                 "Content-Type": "application/json"
//             },

//             body: JSON.stringify({
//                 email: email,
//                 password: password
//             })
//         });

//         const data = await response.json();

//         const message = document.getElementById("loginMessage");

//         if (response.ok) {
//             message.textContent = data.message;
//             localStorage.setItem("token", data.token);
//             window.location.href = "/dashboard";

//         } else {

//             message.textContent = data.message;
//         }
//     });
// }


// // ==================== DASHBOARD STATS ====================

// const totalEmployees = document.getElementById("totalEmployees");

// if (totalEmployees) {

//     async function loadDashboardStats() {

//         const response = await fetch("/dashboard/stats");

//         const data = await response.json();

//         document.getElementById("totalEmployees").textContent =
//             data.total_employees;

//         document.getElementById("presentToday").textContent =
//             data.present_today;

//         document.getElementById("absentToday").textContent =
//             data.absent_today;

//         document.getElementById("attendanceRate").textContent =
//             data.attendance_rate.toFixed(1) + "%";
//     }

//     loadDashboardStats();
// }


// // ==================== ADD EMPLOYEE ====================

// const employeeForm = document.getElementById("employeeForm");

// if (employeeForm) {

//     employeeForm.addEventListener("submit", async function (event) {

//         event.preventDefault();

//         const employee_code =
//             document.getElementById("employee_code").value;

//         const name =
//             document.getElementById("name").value;

//         const email =
//             document.getElementById("email").value;

//         const token = localStorage.getItem("token");

//         const response = await fetch("/employees", {

//             method: "POST",

//             headers: {
//                 "Content-Type": "application/json",
//                 "Authorization": "Bearer " + token
//             },

//             body: JSON.stringify({
//                 employee_code: employee_code,
//                 name: name,
//                 email: email
//             })
//         });

//         const data = await response.json();

//         const message =
//             document.getElementById("employeeMessage");

//         if (response.ok) {
//             message.textContent = data.message;
//             employeeId = data.employee_id;
//             employeeForm.reset();

//             const faceCaptureSection =
//             document.getElementById("faceCaptureSection");

//             if (faceCaptureSection) {
//                 faceCaptureSection.style.display = "block";
//             }

//         } else {

//             message.textContent = data.message;
//         }
//     });

// }


// // ==================== ATTENDANCE TABLE ====================

// const attendanceTable = document.getElementById("attendanceTable");
// const searchAttendance = document.getElementById("searchAttendance");
// const dateFilter = document.getElementById("dateFilter");

// let attendanceData = [];


// if (attendanceTable) {

//     // Load attendance data
//     async function loadAttendance() {

//         const response = await fetch("/attendance");

//         attendanceData = await response.json();

//         displayAttendance();
//     }


//     // Display filtered attendance
//     function displayAttendance() {

//         const searchText =
//             searchAttendance.value.toLowerCase().trim();

//         const selectedDate =
//             dateFilter.value;


//         // Apply both filters
//         const filteredData = attendanceData.filter(record => {

//             const matchesSearch =
//                 record.name.toLowerCase().includes(searchText) ||
//                 record.employee_code.toLowerCase().includes(searchText);

//             const matchesDate =
//                 selectedDate === "" ||
//                 record.date === selectedDate;

//             return matchesSearch && matchesDate;
//         });


//         // Clear table
//         attendanceTable.innerHTML = "";


//         // Show message if no data
//         if (filteredData.length === 0) {

//             attendanceTable.innerHTML = `
//                 <tr>
//                     <td colspan="6">
//                         No attendance records found
//                     </td>
//                 </tr>
//             `;

//             return;
//         }


//         // Display records
//         filteredData.forEach(record => {

//             const row = `
//                 <tr>
//                     <td>${record.id}</td>
//                     <td>${record.employee_code}</td>
//                     <td>${record.name}</td>
//                     <td>${record.date}</td>
//                     <td>${record.check_in}</td>
//                     <td>${record.status}</td>
//                 </tr>
//             `;

//             attendanceTable.innerHTML += row;
//         });
//     }


//     // Search
//     searchAttendance.addEventListener("input", function () {

//         displayAttendance();

//     });


//     // Date filter
//     dateFilter.addEventListener("change", function () {

//         displayAttendance();

//     });


//     // Initial load
//     loadAttendance();
// }


// // ==================== ANALYTICS ====================

// const analyticsTable = document.getElementById("analyticsTable");

// if (analyticsTable) {

//     async function loadAnalytics() {

//         const response = await fetch("/attendance/analytics");

//         const data = await response.json();

//         analyticsTable.innerHTML = "";

//         if (data.length === 0) {

//             analyticsTable.innerHTML = `
//                 <tr>
//                     <td colspan="5">
//                         No attendance data found
//                     </td>
//                 </tr>
//             `;

//             return;
//         }


//         let totalPercentage = 0;

//         const employeeNames = [];
//         const attendancePercentages = [];


//         data.forEach(record => {

//             totalPercentage += record.attendance_percentage;

//             employeeNames.push(record.name);

//             attendancePercentages.push(
//                 record.attendance_percentage
//             );


//             const row = `
//                 <tr>
//                     <td>${record.employee_code}</td>
//                     <td>${record.name}</td>
//                     <td>${record.total_days}</td>
//                     <td>${record.present_days}</td>
//                     <td>${record.attendance_percentage}%</td>
//                 </tr>
//             `;

//             analyticsTable.innerHTML += row;
//         });


//         const averageAttendance =
//             totalPercentage / data.length;


//         document.getElementById("averageAttendance").textContent =
//             averageAttendance.toFixed(2) + "%";


//         // ====================
//         // CREATE CHART
//         // ====================

//         const chart = document.getElementById("attendanceChart");

//         new Chart(chart, {

//             type: "bar",

//             data: {

//                 labels: employeeNames,

//                 datasets: [{

//                     label: "Attendance Percentage",

//                     data: attendancePercentages

//                 }]
//             },

//             options: {

//                 responsive: true,

//                 scales: {

//                     y: {

//                         beginAtZero: true,

//                         max: 100,

//                         title: {

//                             display: true,

//                             text: "Attendance %"
//                         }
//                     }
//                 }
//             }
//         });
//     }


//     loadAnalytics();
// }

// // ==================== MONTHLY ANALYTICS ====================

// const monthlyAnalyticsTable =
//     document.getElementById("monthlyAnalyticsTable");

// if (monthlyAnalyticsTable) {

//     async function loadMonthlyAnalytics() {

//         const response =
//             await fetch("/attendance/monthly");

//         const data =
//             await response.json();

//         const monthFilter =
//             document.getElementById("monthFilter");


//         function displayMonthlyData(selectedMonth) {

//             monthlyAnalyticsTable.innerHTML = "";


//             const filteredData =
//                 data.filter(record => {

//                     return selectedMonth === "" ||
//                            record.month === selectedMonth;
//                 });


//             if (filteredData.length === 0) {

//                 monthlyAnalyticsTable.innerHTML = `
//                     <tr>
//                         <td colspan="6">
//                             No monthly attendance data found
//                         </td>
//                     </tr>
//                 `;

//                 return;
//             }


//             filteredData.forEach(record => {

//                 const row = `
//                     <tr>
//                         <td>${record.employee_code}</td>
//                         <td>${record.name}</td>
//                         <td>${record.month}</td>
//                         <td>${record.total_days}</td>
//                         <td>${record.present_days}</td>
//                         <td>${record.attendance_percentage}%</td>
//                     </tr>
//                 `;

//                 monthlyAnalyticsTable.innerHTML += row;
//             });
//         }


//         // Initially show all months
//         displayMonthlyData("");


//         // Month filter
//         if (monthFilter) {

//             monthFilter.addEventListener(
//                 "change",
//                 function () {

//                     const selectedMonth = this.value;

//                     displayMonthlyData(selectedMonth);
//                 }
//             );
//         }
//     }


//     loadMonthlyAnalytics();
// }

// // ==================== FACE CAPTURE ====================

// const faceCaptureSection =
//     document.getElementById("faceCaptureSection");

// const captureFaceButton =
//     document.getElementById("captureFaceButton");

// const camera =
//     document.getElementById("camera");

// const faceMessage =
//     document.getElementById("faceMessage");

// let employeeId = null;


// if (faceCaptureSection && captureFaceButton && camera) {

//     captureFaceButton.addEventListener(
//         "click",
//         async function () {

//             // ====================
//             // START CAMERA
//             // ====================

//             try {

//                 if (!camera.srcObject) {

//                     const stream =
//                         await navigator.mediaDevices.getUserMedia({
//                             video: true
//                         });

//                     camera.srcObject = stream;

//                     await camera.play();
//                 }

//             } catch (error) {

//                 console.error("Camera Error:", error);

//                 faceMessage.innerText =
//                     "Camera access denied or unavailable.";

//                 return;
//             }


//             // ====================
//             // CAPTURE FACE
//             // ====================

//             try {

//                 const canvas =
//                     document.getElementById("faceCanvas");

//                 const context =
//                     canvas.getContext("2d");


//                 if (camera.videoWidth === 0 ||
//                     camera.videoHeight === 0) {

//                     faceMessage.innerText =
//                         "Camera is still starting. Please try again.";

//                     return;
//                 }


//                 canvas.width = camera.videoWidth;
//                 canvas.height = camera.videoHeight;


//                 context.drawImage(
//                     camera,
//                     0,
//                     0,
//                     canvas.width,
//                     canvas.height
//                 );


//                 faceMessage.innerText =
//                     "Face image captured successfully ✅";


//                 // ====================
//                 // CONVERT IMAGE TO BLOB
//                 // ====================

//                 const imageBlob =
//                     await new Promise(resolve => {

//                         canvas.toBlob(
//                             resolve,
//                             "image/jpeg"
//                         );

//                     });


//                 if (!imageBlob) {

//                     faceMessage.innerText =
//                         "Could not create face image ❌";

//                     return;
//                 }


//                 // ====================
//                 // SEND IMAGE TO FLASK
//                 // ====================

//                 const formData =
//                     new FormData();

//                 formData.append(
//                     "face",
//                     imageBlob,
//                     "face.jpg"
//                 );


//                 const token =
//                     localStorage.getItem("token");


//                 if (!employeeId) {

//                     faceMessage.innerText =
//                         "Employee ID not found ❌";

//                     return;
//                 }


//                 const response =
//                     await fetch(
//                         `/employees/${employeeId}/face`,
//                         {
//                             method: "POST",

//                             headers: {
//                                 "Authorization":
//                                     `Bearer ${token}`
//                             },

//                             body: formData
//                         }
//                     );


//                 const data =
//                     await response.json();


//                 if (response.ok) {
//                     faceMessage.innerText =
//                     "Face uploaded successfully ✅";
//                     if (camera.srcObject) {

//                     const tracks =
//                         camera.srcObject.getTracks();

//                     tracks.forEach(track => track.stop());

//                     camera.srcObject = null;
//                     }
//                     console.log(
//                         "Face Upload Response:",
//                         data
//                     );

//                 } else {

//                     faceMessage.innerText =
//                         data.message ||
//                         "Face upload failed ❌";
//                 }


//             } catch (error) {

//                 console.error(
//                     "Face Upload Error:",
//                     error
//                 );

//                 faceMessage.innerText =
//                     "Face upload error ❌";
//             }

//         }
//     );

// }


// // =========================
// // FACE ATTENDANCE CAMERA
// // =========================

// const attendanceCamera = document.getElementById("attendanceCamera");
// const startAttendanceCamera = document.getElementById("startAttendanceCamera");
// const markAttendanceButton = document.getElementById("markAttendanceButton");
// const attendanceMessage = document.getElementById("attendanceMessage");

// let attendanceStream = null;


// // START CAMERA
// if (startAttendanceCamera) {

//     startAttendanceCamera.addEventListener("click", async function () {

//         try {

//             attendanceStream = await navigator.mediaDevices.getUserMedia({
//                 video: true
//             });

//             attendanceCamera.srcObject = attendanceStream;

//             attendanceMessage.textContent =
//                 "Camera started. Please show your face.";

//         } catch (error) {

//             console.error(error);

//             attendanceMessage.textContent =
//                 "Camera permission denied or camera not available.";
//         }

//     });

// }


// // MARK ATTENDANCE
// if (markAttendanceButton) {

//     markAttendanceButton.addEventListener("click", function () {

//         if (!attendanceCamera.srcObject) {

//             attendanceMessage.textContent =
//                 "Please start the camera first.";

//             return;
//         }


//         // Create canvas
//         const canvas = document.createElement("canvas");

//         canvas.width = attendanceCamera.videoWidth;
//         canvas.height = attendanceCamera.videoHeight;


//         // Draw current camera frame
//         const context = canvas.getContext("2d");

//         context.drawImage(
//             attendanceCamera,
//             0,
//             0,
//             canvas.width,
//             canvas.height
//         );


//         // Convert image to file
//         canvas.toBlob(async function (blob) {

//             const formData = new FormData();

//             formData.append(
//                 "face",
//                 blob,
//                 "attendance.jpg"
//             );


//             attendanceMessage.textContent =
//                 "Recognizing face...";


//             try {

//                 const response = await fetch(
//                     "/face-recognition",
//                     {
//                         method: "POST",
//                         body: formData
//                     }
//                 );


//                 const data = await response.json();


//                 if (response.ok) {

//                     attendanceMessage.textContent =
//                         data.name +
//                         " - " +
//                         data.attendance;

//                 } else {

//                     attendanceMessage.textContent =
//                         data.message;
//                 }


//             } catch (error) {

//                 console.error(error);

//                 attendanceMessage.textContent =
//                     "Face recognition failed.";
//             }

//         }, "image/jpeg");

//     });

// }

// // =========================
// // AUTOMATIC FACE ATTENDANCE
// // =========================

// let automaticAttendanceInterval = null;

// if (startAttendanceCamera) {

//     startAttendanceCamera.addEventListener("click", async function () {

//         try {

//             if (!attendanceStream) {

//                 attendanceStream =
//                     await navigator.mediaDevices.getUserMedia({
//                         video: true
//                     });

//                 attendanceCamera.srcObject =
//                     attendanceStream;

//                 await attendanceCamera.play();
//             }

//             attendanceMessage.textContent =
//                 "Camera started. Automatic recognition active...";

//             // Start automatic recognition
//             if (!automaticAttendanceInterval) {

//                 automaticAttendanceInterval =
//                     setInterval(
//                         recognizeAttendanceFace,
//                         3000
//                     );
//             }

//         } catch (error) {

//             console.error("Camera Error:", error);

//             attendanceMessage.textContent =
//                 "Camera permission denied or camera not available.";
//         }

//     });

// }


// // =========================
// // RECOGNIZE FACE
// // =========================

// async function recognizeAttendanceFace() {

//     if (!attendanceCamera.videoWidth ||
//         !attendanceCamera.videoHeight) {

//         return;
//     }

//     const canvas =
//         document.createElement("canvas");

//     canvas.width =
//         attendanceCamera.videoWidth;

//     canvas.height =
//         attendanceCamera.videoHeight;

//     const context =
//         canvas.getContext("2d");

//     context.drawImage(
//         attendanceCamera,
//         0,
//         0,
//         canvas.width,
//         canvas.height
//     );

//     canvas.toBlob(async function (blob) {

//         if (!blob) {
//             return;
//         }

//         const formData =
//             new FormData();

//         formData.append(
//             "face",
//             blob,
//             "attendance.jpg"
//         );

//         try {

//             const response =
//                 await fetch(
//                     "/face-recognition",
//                     {
//                         method: "POST",
//                         body: formData
//                     }
//                 );

//             const data =
//                 await response.json();


//             if (response.ok) {

//                 attendanceMessage.textContent =
//                     data.name +
//                     " - " +
//                     data.attendance;

//                 console.log(
//                     "Recognized:",
//                     data.name,
//                     "Similarity:",
//                     data.similarity
//                 );

//             } else {

//                 attendanceMessage.textContent =
//                     "Face not recognized";
//             }

//         } catch (error) {

//             console.error(
//                 "Recognition Error:",
//                 error
//             );

//         }

//     }, "image/jpeg");

// }



// ==================== LOGIN ====================

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
                            "Content-Type": "application/json",
                        },

                        body: JSON.stringify({
                            email: email,
                            password: password
                        })
                    });

                const data =
                    await response.json();

                // const message =
                //     document.getElementById(
                //         "loginMessage"
                //     );

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
                        data.error ||
                        data.message ||
                        "Login failed.";

                }

            } catch (error) {

                console.error(
                    "Login Error:",
                    error
                );

                document.getElementById(
                    "loginMessage"
                ).textContent =
                    "Login failed. Please try again.";
            }
        }
    );
}
// ==================== REGISTER ====================

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
                            "Content-Type": "application/json",
                            "Authorization": "Bearer " + localStorage.getItem("token")
                            
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
                            "Authorization": "Bearer " + localStorage.getItem("token")
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

                    message.textContent =
                        data.message ||
                        "Unable to add employee.";
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

    // // ====================
    // // LOAD ATTENDANCE
    // // ====================

    // async function loadAttendance() {

    //     try {

    //         const response =
    //             await fetch(
    //                 "/attendance",
    //                 {
    //                     headers: {
    //                         "Authorization": "Bearer " + localStorage.getItem("token")
    //                     }
    //                 }
    //             );

    //         if (!response.ok) {

    //             throw new Error(
    //                 "Attendance API returned " +
    //                 response.status
    //             );
    //         }

    //         attendanceData =
    //             await response.json();

    //         displayAttendance();

    //     } catch (error) {

    //         console.error(
    //             "Attendance Error:",
    //             error
    //         );

    //         attendanceTable.innerHTML = `
    //             <tr>
    //                 <td colspan="6">
    //                     Unable to load attendance records.
    //                 </td>
    //             </tr>
    //         `;
    //     }
    // }



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


// // ==================== ANALYTICS ====================

// const analyticsTable =
//     document.getElementById(
//         "analyticsTable"
//     );

// let attendanceChartInstance = null;


// if (analyticsTable) {

//     async function loadAnalytics() {

//         try {

//             const response =
//                 await fetch(
//                     "/attendance/analytics"
//                 );

//             if (!response.ok) {

//                 throw new Error(
//                     "Analytics API returned " +
//                     response.status
//                 );
//             }

//             const data =
//                 await response.json();


//             analyticsTable.innerHTML =
//                 "";


//             if (
//                 !Array.isArray(data) ||
//                 data.length === 0
//             ) {

//                 analyticsTable.innerHTML = `
//                     <tr>
//                         <td colspan="5">
//                             No attendance data found
//                         </td>
//                     </tr>
//                 `;

//                 const averageAttendanceElement =
//                     document.getElementById(
//                         "averageAttendance"
//                     );

//                 if (averageAttendanceElement) {

//                     averageAttendanceElement.textContent =
//                         "0%";
//                 }

//                 return;
//             }


//             let totalPercentage =
//                 0;


//             const employeeNames =
//                 [];

//             const attendancePercentages =
//                 [];


//             data.forEach(
//                 record => {

//                     const percentage =
//                         Number(
//                             record.attendance_percentage ||
//                             0
//                         );


//                     totalPercentage +=
//                         percentage;


//                     employeeNames.push(
//                         record.name
//                     );


//                     attendancePercentages.push(
//                         percentage
//                     );


//                     const row = `
//                         <tr>

//                             <td>
//                                 ${record.employee_code ?? ""}
//                             </td>

//                             <td>
//                                 ${record.name}
//                             </td>

//                             <td>
//                                 ${record.total_days}
//                             </td>

//                             <td>
//                                 ${record.present_days}
//                             </td>

//                             <td>
//                                 ${percentage}%
//                             </td>

//                         </tr>
//                     `;


//                     analyticsTable.innerHTML +=
//                         row;
//                 }
//             );


//             const averageAttendance =
//                 totalPercentage /
//                 data.length;


//             const averageAttendanceElement =
//                 document.getElementById(
//                     "averageAttendance"
//                 );


//             if (averageAttendanceElement) {

//                 averageAttendanceElement.textContent =
//                     averageAttendance.toFixed(2) +
//                     "%";
//             }




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
        }
    }


    loadAnalytics();
}


// // ==================== MONTHLY ANALYTICS ====================

// let monthlyAttendanceChart =
//     null;


// const monthlyAnalyticsTable =
//     document.getElementById(
//         "monthlyAnalyticsTable"
//     );


// if (monthlyAnalyticsTable) {

//     async function loadMonthlyAnalytics() {

//         try {

//             const response =
//                 await fetch(
//                     "/attendance/monthly"
//                 );


//             if (!response.ok) {

//                 throw new Error(
//                     "Monthly Analytics API returned " +
//                     response.status
//                 );
//             }


//             const data =
//                 await response.json();


//             const monthFilter =
//                 document.getElementById(
//                     "monthFilter"
//                 );


//             // ====================
//             // DISPLAY MONTHLY DATA
//             // ====================

//             function displayMonthlyData(
//                 selectedMonth
//             ) {

//                 monthlyAnalyticsTable.innerHTML =
//                     "";


//                 const filteredData =
//                     data.filter(
//                         record => {

//                             return (
//                                 selectedMonth === "" ||
//                                 record.month ===
//                                     selectedMonth
//                             );
//                         }
//                     );


//                 // ====================
//                 // DESTROY OLD CHART
//                 // ====================

//                 if (
//                     monthlyAttendanceChart
//                 ) {

//                     monthlyAttendanceChart.destroy();

//                     monthlyAttendanceChart =
//                         null;
//                 }


//                 // ====================
//                 // NO DATA
//                 // ====================

//                 if (
//                     filteredData.length === 0
//                 ) {

//                     monthlyAnalyticsTable.innerHTML = `
//                         <tr>
//                             <td colspan="6">
//                                 No monthly attendance data found
//                             </td>
//                         </tr>
//                     `;

//                     return;
//                 }


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
                                record.name
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

                            if (
                                !monthlyData[
                                    record.month
                                ]
                            ) {

                                monthlyData[
                                    record.month
                                ] = [];
                            }


                            monthlyData[
                                record.month
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
                                total /
                                values.length;


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

                if(faceMessage) {
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


                if (!window.employeeId) {

                    if (faceMessage) {
                        faceMessage.innerText =
                            "Employee ID not found ❌";
                    }

                    return;
                }


                const response =
                    await fetch(
                        `/employees/${employeeId}/face`,
                        {

                            method: "POST",

                            headers: {

                                "Authorization":
                                    `Bearer ${token}`
                            },

                            body: formData
                        }
                    );


                const data =
                    await response.json();


                if (response.ok) {

                    faceMessage.innerText =
                        "Face uploaded successfully ✅";


                    if (
                        camera.srcObject
                    ) {

                        const tracks =
                            camera.srcObject
                                .getTracks();


                        tracks.forEach(
                            track =>
                                track.stop()
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
            }catch (error) {
                console.error(
                    "Face Capture Error:",
                    error
                );
                if (faceMessage) {

                    faceMessage.innerText =
                        "Face capture failed ❌";
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

// // =========================
// // STOP ATTENDANCE CAMERA
// // =========================


// function stopAttendanceCamera() {

//     if (attendanceStream) {

//         attendanceStream
//             .getTracks()
//             .forEach(track => track.stop());

//         attendanceStream = null;
//     }

//     attendanceCamera.srcObject = null;

//     attendanceMessage.textContent = "Camera stopped";
// }

// if (stopAttendanceCameraButton) {
//     stopAttendanceCameraButton.addEventListener(
//         "click",
//         stopAttendanceCamera
//     );
// }


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


    if (automaticAttendanceInterval) {

        clearInterval(
            automaticAttendanceInterval
        );

        automaticAttendanceInterval =
            null;
    }


    recognitionInProgress =
        false;


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


// // =========================
// // START ATTENDANCE CAMERA
// // =========================

// if (startAttendanceCamera) {

//     startAttendanceCamera.addEventListener(
//         "click",
//         async function () {

//             try {

//                 // ====================
//                 // START CAMERA ONLY ONCE
//                 // ====================

//                 if (!attendanceStream) {

//                     attendanceStream =
//                         await navigator
//                             .mediaDevices
//                             .getUserMedia({
//                                 video: true
//                             });


//                     if (attendanceCamera) {

//                         attendanceCamera.srcObject =
//                             attendanceStream;


//                         await attendanceCamera.play();
//                     }
//                 }


//                 if (attendanceMessage) {

//                     attendanceMessage.textContent =
//                         "Camera started. Automatic recognition active...";
//                 }


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
                // CHECK CAMERA ELEMENT
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


// // =========================
// // MANUAL MARK ATTENDANCE
// // =========================

// if (markAttendanceButton) {

//     markAttendanceButton.addEventListener(
//         "click",
//         function () {

//             if (
//                 !attendanceCamera ||
//                 !attendanceCamera.srcObject
//             ) {

//                 if (attendanceMessage) {

//                     attendanceMessage.textContent =
//                         "Please start the camera first.";
//                 }

//                 return;
//             }


//             const canvas =
//                 document.createElement(
//                     "canvas"
//                 );


//             canvas.width =
//                 attendanceCamera.videoWidth;


//             canvas.height =
//                 attendanceCamera.videoHeight;


//             const context =
//                 canvas.getContext(
//                     "2d"
//                 );


//             context.drawImage(
//                 attendanceCamera,
//                 0,
//                 0,
//                 canvas.width,
//                 canvas.height
//             );


//             canvas.toBlob(
//                 async function (blob) {

//                     if (!blob) {

//                         attendanceMessage.textContent =
//                             "Could not capture image.";

//                         return;
//                     }


//                     const formData =
//                         new FormData();


//                     formData.append(
//                         "face",
//                         blob,
//                         "attendance.jpg"
//                     );


//                     attendanceMessage.textContent =
//                         "Recognizing face...";


//                     try {

//                         const response =
//                             await fetch(
//                                 "/face-recognition",
//                                 {

//                                     method: "POST",

//                                     headers: {
//                                         "Authorization": "Bearer " + localStorage.getItem("token")
//                                     },

//                                     body: formData
//                                 }
//                             );


//                         const data =
//                             await response.json();


//                         if (response.ok) {

//                             attendanceMessage.textContent =
//                                 data.name +
//                                 " - " +
//                                 data.attendance;

//                         } else {

//                             attendanceMessage.textContent =
//                                 data.message ||
//                                 "Face recognition failed.";
//                         }


//                     } catch (error) {

//                         console.error(
//                             "Manual Recognition Error:",
//                             error
//                         );


//                         attendanceMessage.textContent =
//                             "Face recognition failed.";
//                     }

//                 },
//                 "image/jpeg"
//             );
//         }
//     );
// }


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
            // CHECK VIDEO
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
            // IMAGE TO BLOB
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
                    // FORM DATA
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

// // =========================
// // AUTOMATIC FACE RECOGNITION
// // =========================

// async function recognizeAttendanceFace() {

//     // ====================
//     // CAMERA CHECK
//     // ====================

//     if (
//         !attendanceCamera ||
//         !attendanceCamera.videoWidth ||
//         !attendanceCamera.videoHeight
//     ) {

//         return;
//     }


//     // ====================
//     // TOKEN CHECK
//     // ====================

//     const token =
//         localStorage.getItem(
//             "token"
//         );


//     if (!token) {

//         if (attendanceMessage) {

//             attendanceMessage.textContent =
//                 "Please login first.";
//         }

//         return;
//     }



//     // ====================
//     // PREVIOUS REQUEST CHECK
//     // ====================

//     if (recognitionInProgress) {

//         return;
//     }


//     recognitionInProgress =
//         true;


//     try {

//         // ====================
//         // CREATE CANVAS
//         // ====================

//         const canvas =
//             document.createElement(
//                 "canvas"
//             );


//         canvas.width =
//             attendanceCamera.videoWidth;


//         canvas.height =
//             attendanceCamera.videoHeight;


//         const context =
//             canvas.getContext(
//                 "2d"
//             );

//         if (!context) {

//             return;
//         }


//         context.drawImage(
//             attendanceCamera,
//             0,
//             0,
//             canvas.width,
//             canvas.height
//         );


//         // ====================
//         // IMAGE TO BLOB
//         // ====================

//         const blob =
//             await new Promise(
//                 resolve => {

//                     canvas.toBlob(
//                         resolve,
//                         "image/jpeg"
//                     );
//                 }
//             );


//         if (!blob) {

//             return;
//         }


//         // ====================
//         // SEND TO FLASK
//         // ====================

//         const formData =
//             new FormData();


//         formData.append(
//             "face",
//             blob,
//             "attendance.jpg"
//         );


//         if (attendanceMessage) {

//             attendanceMessage.textContent =
//                 "Recognizing face...";
//         }


//         // const response =
//         //     await fetch(
//         //         "/face-recognition",
//         //         {

//         //             method: "POST",

//         //             body: formData
//         //         }
//         //     );
// const token =
//     localStorage.getItem("token");

// if (!token) {

//     if (attendanceMessage) {

//         attendanceMessage.textContent =
//             "Please login first.";
//     }

//     return;
// }


// const response =
//     await fetch(
//         "/face-recognition",
//         {

//             method: "POST",

//             headers: {

//                 "Authorization":
//                     "Bearer " + token
//             },

//             body: formData
//         }
//     );


//         const data =
//             await response.json();


//         // ====================
//         // FACE RECOGNIZED
//         // ====================

//         if (response.ok) {

//             if (attendanceMessage) {

//                 attendanceMessage.textContent =
//                     data.name +
//                     " - " +
//                     data.attendance;
//             }


//             console.log(
//                 "Recognized:",
//                 data.name
//             );


//             console.log(
//                 "Similarity:",
//                 data.similarity
//             );


//             // ====================
//             // STOP AUTOMATIC CHECKING
//             // ====================

//             if (
//                 automaticAttendanceInterval
//             ) {

//                 clearInterval(
//                     automaticAttendanceInterval
//                 );


//                 automaticAttendanceInterval =
//                     null;
//             }


//         } else {

//             // ====================
//             // UNKNOWN FACE
//             // ====================

//             if (
//                 response.status === 401
//             ) {

//                 if (attendanceMessage) {

//                     attendanceMessage.textContent =
//                         "Face not recognized. Please look at camera.";
//                 }

//             } else {

//                 if (attendanceMessage) {

//                     attendanceMessage.textContent =
//                         data.message ||
//                         "Recognition failed.";
//                 }
//             }
//         }


//     } catch (error) {

//         console.error(
//             "Recognition Error:",
//             error
//         );

//     } finally {

//         recognitionInProgress =
//             false;
//     }
// }


// // =========================
// // RECENT ATTENDANCE
// // =========================

// const recentAttendance =
//     document.getElementById(
//         "recentAttendance"
//     );


// if (recentAttendance) {

//     async function loadRecentAttendance() {

//         try {

//             console.log(
//                 "Loading recent attendance..."
//             );


//             const response =
//                 await fetch(
//                     "/attendance",
//                     {
//                         headers: {
//                 "Authorization": "Bearer " + localStorage.getItem("token")
//                         }
//                     }
//                 );


//             console.log(
//                 "Attendance response status:",
//                 response.status
//             );


//             if (!response.ok) {

//                 throw new Error(
//                     "Attendance API returned " +
//                     response.status
//                 );
//             }


//             const data =
//                 await response.json();


//             console.log(
//                 "Attendance data:",
//                 data
//             );


//             // ====================
//             // CLEAR LOADING
//             // ====================

//             recentAttendance.innerHTML =
//                 "";


//             // ====================
//             // NO RECORDS
//             // ====================

//             if (
//                 !Array.isArray(data) ||
//                 data.length === 0
//             ) {

//                 recentAttendance.innerHTML = `
//                     <div class="empty-attendance">

//                         <span>📋</span>

//                         <h3>
//                             No attendance records yet
//                         </h3>

//                         <p>
//                             Attendance records will appear here
//                             once employees check in.
//                         </p>

//                     </div>
//                 `;

//                 return;
//             }


//             // ====================
//             // GET LATEST 5 RECORDS
//             // ====================

//             const recentData =
//                 data.slice(0, 5);


//             // ====================
//             // DISPLAY RECORDS
//             // ====================

//             recentData.forEach(
//                 record => {

//                     const row =
//                         document.createElement(
//                             "div"
//                         );


//                     row.className =
//                         "attendance-row";


//                     row.innerHTML = `

//                         <span>
//                             ${record.name}
//                         </span>

//                         <span>
//                             ${record.date}
//                         </span>

//                         <span>
//                             ${record.check_in}
//                         </span>

//                         <span>
//                             ${record.status}
//                         </span>

//                     `;


//                     recentAttendance.appendChild(
//                         row
//                     );
//                 }
//             );


//         } catch (error) {

//             console.error(
//                 "Recent Attendance Error:",
//                 error
//             );


//             recentAttendance.innerHTML = `
//                 <div class="empty-attendance">

//                     <span>⚠️</span>

//                     <h3>
//                         Unable to load attendance
//                     </h3>

//                     <p>
//                         Please try again later.
//                     </p>

//                 </div>
//             `;
//         }
//     }


//     // ====================
//     // LOAD RECENT ATTENDANCE
//     // ====================

//     loadRecentAttendance();
// }


// // ==================== LOGOUT ====================

// const logoutButton = document.getElementById("logoutButton");

// if (logoutButton) {
//     logoutButton.addEventListener("click", async function () {

//         const token = localStorage.getItem("token");

//         try {
//             const response =
//                 await fetch("/attendance",
//             {
//                 headers: {"Authorization": "Bearer " + token}
//             });

//             // await fetch("/logout", {
//             //     method: "POST",
//             //     headers: {
//             //         "Authorization": "Bearer " + token
//             //     }
//             // });
//         } catch (error) {
//             console.error("Logout Error:", error);
//         }

//         // Remove JWT token from browser
//         localStorage.removeItem("token");

//         // Go back to login page
//         window.location.href = "/login";
//     });
// }




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
        // SEND TO FLASK
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


        // ====================
        // FACE RECOGNITION API
        // ====================

        const response =
            await fetch(
                "/face-recognition",
                {

                    method: "POST",

                    headers: {

                        "Authorization":
                            "Bearer " + token
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
            // RECOGNITION FAILED
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
// RECENT ATTENDANCE
// =========================

const recentAttendance =
    document.getElementById(
        "recentAttendance"
    );


if (recentAttendance) {

    async function loadRecentAttendance() {

        try {

            console.log(
                "Loading recent attendance..."
            );


            // ====================
            // TOKEN
            // ====================

            const token =
                localStorage.getItem(
                    "token"
                );


            if (!token) {

                recentAttendance.innerHTML = `
                    <div class="empty-attendance">

                        <span>🔐</span>

                        <h3>
                            Please login first
                        </h3>

                        <p>
                            Login to view attendance records.
                        </p>

                    </div>
                `;

                return;
            }


            // ====================
            // GET ATTENDANCE
            // ====================

            const response =
                await fetch(
                    "/attendance",
                    {
                        method: "GET",

                        headers: {
                            "Authorization":
                                "Bearer " + token
                        }
                    }
                );


            console.log(
                "Attendance response status:",
                response.status
            );


            if (!response.ok) {

                throw new Error(
                    "Attendance API returned " +
                    response.status
                );
            }


            const data =
                await response.json();


            console.log(
                "Attendance data:",
                data
            );


            // ====================
            // CLEAR LOADING
            // ====================

            recentAttendance.innerHTML =
                "";


            // ====================
            // NO RECORDS
            // ====================

            if (
                !Array.isArray(data) ||
                data.length === 0
            ) {

                recentAttendance.innerHTML = `
                    <div class="empty-attendance">

                        <span>📋</span>

                        <h3>
                            No attendance records yet
                        </h3>

                        <p>
                            Attendance records will appear here
                            once employees check in.
                        </p>

                    </div>
                `;

                return;
            }


            // ====================
            // GET LATEST 5 RECORDS
            // ====================

            const recentData =
                data.slice(0, 5);


            // ====================
            // DISPLAY RECORDS
            // ====================

            recentData.forEach(
                record => {

                    const row =
                        document.createElement(
                            "div"
                        );


                    row.className =
                        "attendance-row";


                    row.innerHTML = `

                        <span>
                            ${record.name ?? ""}
                        </span>

                        <span>
                            ${record.date ?? ""}
                        </span>

                        <span>
                            ${record.check_in ?? ""}
                        </span>

                        <span>
                            ${record.status ?? ""}
                        </span>

                    `;


                    recentAttendance.appendChild(
                        row
                    );
                }
            );


        } catch (error) {

            console.error(
                "Recent Attendance Error:",
                error
            );


            recentAttendance.innerHTML = `
                <div class="empty-attendance">

                    <span>⚠️</span>

                    <h3>
                        Unable to load attendance
                    </h3>

                    <p>
                        Please try again later.
                    </p>

                </div>
            `;
        }
    }


    // ====================
    // LOAD RECENT ATTENDANCE
    // ====================

    loadRecentAttendance();
}
// ====================
// LOGOUT
// ====================

const logoutButton =
    document.getElementById(
        "logoutButton"
    );

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async function () {

            const token =
                localStorage.getItem(
                    "token"
                );

            try {

                await fetch(
                    "/logout",
                    {
                        method: "POST",

                        headers: {
                            "Authorization":
                                "Bearer " +
                                token
                        }
                    }
                );

            } catch (error) {

                console.error(
                    "Logout Error:",
                    error
                );
            }

            // Remove JWT from browser
            localStorage.removeItem(
                "token"
            );

            // Go to login page
            window.location.href =
                "/login";
        }
    );
}