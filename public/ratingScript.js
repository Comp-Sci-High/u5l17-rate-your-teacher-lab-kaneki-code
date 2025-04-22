const create = document.querySelector("form");

create.addEventListener("submit", async (e) => {
    e.preventDefault();
    const ratingData = new FormData(create);
    const reqBody = Object.fromEntries(ratingData); // Corrected line

    const response = await fetch("/add/rating", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(reqBody) // Corrected line
    });

    const data = await response.json();
    console.log(data);

    window.location.href = "/ratings"; // Redirect to the ratings page
});
