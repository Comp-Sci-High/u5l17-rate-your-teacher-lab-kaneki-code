const create = document.querySelector("form");

create.addEventListener("submit", async (e) => {
    e.preventDefault();
    const teacherData = new FormData(create);
    const reqBody = Object.fromEntries(teacherData); // fixed "fromEntries"

    const response = await fetch("/add/teacher", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(reqBody) // fixed "JSON"
    });

    const data = await response.json();
    console.log(data);

    window.location.href = "/"; // redirect to the teachers page
});
