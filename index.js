import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js"
import { getDatabase, ref, push } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js"

const appSettings = {
    databaseURL: "https://playground-75133-default-rtdb.asia-southeast1.firebasedatabase.app/"
}

const app = initializeApp(appSettings)
const database = getDatabase(app)
const reportNamesInDB = ref(database,"Reports")

const inputFieldElClientName = document.getElementById("input-field-client-name")
const inputFieldElProductName = document.getElementById("input-field-product-name")
const inputFieldElLocation = document.getElementById("input-field-location")
const addButtonEl = document.getElementById("add-button")

addButtonEl.addEventListener("click", function() {
    let inputValueClientName = inputFieldElClientName.value
    let inputValueProductName = inputFieldElProductName.value
    let inputValueLocation = inputFieldElLocation.value
    let reportName = inputValueClientName+" REPORT OF "+inputValueProductName+" "+inputValueLocation
    push(reportNamesInDB,reportName)
    console.log(`${reportName} added to database`)
    window.location.assign("capturepic.html")
})