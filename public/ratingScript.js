// Add an event listener to the form that upon submits creates a new rating
// When the rating is created redirect to the ratings page
const create = document.querySelector("form")

create.addEventListener("submit", async(e)=>{
    e.preventDefault()
    const teacherData = new FormData(create)
    const reqBody = object.formEntries(teacherData)
    const response = await fetch ("/add/rating",{
        method: "POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:json.stringify(reqBody)
    })
    const data = await response.json()
    console.log(data)
   


})
