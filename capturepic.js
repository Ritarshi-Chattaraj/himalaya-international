import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js"
import { getDatabase, ref, push } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js"

const appSettings = {
    databaseURL: "https://playground-75133-default-rtdb.asia-southeast1.firebasedatabase.app/"
}

const app = initializeApp(appSettings)
const database = getDatabase(app)
const Imagedb = ref(database,"Image")

const imageInput = document.getElementById('imageInput');
const drawB = document.getElementById('drawButton');
const imageCanvas = document.getElementById('imageCanvas');
const imageDescription = document.getElementById('imageDescription');
const downloadLink = document.getElementById('downloadLink');
const cameraButton = document.getElementById('cameraButton');
const captureImageButton = document.getElementById('captureImageButton');
const cameraFeed = document.getElementById('cameraFeed');
const ctx = imageCanvas.getContext('2d');
const uploadImageInput = document.getElementById('upload-image');
const saveButton = document.getElementById('save-button');

let isDrawing = false;
let lastX = 0;
let lastY = 0;
let selectedTool = "rectangle"; // Default tool
let snapshot;
let firstTime=1;

/*First Time when the page loads*/
if(firstTime){
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then((stream) => {
            cameraFeed.srcObject = stream;
            cameraFeed.controls = false;
        })
        .catch((error) => {
            console.error('Error accessing camera:', error);
        });

    firstTime=0;    

    /* Making buttons invisible */
    captureImageButton.style.display = 'none';
    drawB.style.display = 'none';
    saveButton.style.display = 'none';
    cameraFeed.controls = false;
}

/* When Camera button is clicked */
cameraButton.addEventListener('click', () => {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then((stream) => {
            cameraFeed.srcObject = stream;
        })
        .catch((error) => {
            console.error('Error accessing camera:', error);
        });

        /* Making buttons invisible */
        captureImageButton.style.display = 'block';
        uploadImageInput.style.display = 'none';
        cameraButton.style.display = 'none';
        cameraFeed.controls = false;
});

/* When Capture Button is clicked */
captureImageButton.addEventListener('click', () => {
    
    /* Copyimng image from video feed to canvas */
    imageCanvas.width = cameraFeed.videoWidth;
    imageCanvas.height = cameraFeed.videoHeight;
    ctx.drawImage(cameraFeed, 0, 0, imageCanvas.width, imageCanvas.height);

    /* Stopping video feed */
    const stream = cameraFeed.srcObject;
    const tracks = stream.getTracks();
    tracks.forEach(track => track.stop());
    cameraFeed.srcObject = null;

    /* Making buttons invisible */
    imageCanvas.style.display = 'block';
    cameraFeed.style.display = 'none';
    captureImageButton.style.display = 'none';
    drawB.style.display = 'block';
});

window.addEventListener("load", () => {
    imageCanvas.width = imageCanvas.offsetWidth;
    imageCanvas.height = imageCanvas.offsetHeight;
});

const startDraw = (e) => {
    isDrawing = true;
    [lastX, lastY] = [e.offsetX, e.offsetY];
    snapshot = ctx.getImageData(0,0,imageCanvas.width,imageCanvas.height)
}

const draw = (e) => {
    if (!isDrawing) return;
    ctx.putImageData(snapshot,0,0);
    ctx.strokeStyle = "green"; // Setting stroke color
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.lineWidth = 5;

    // Redraw the image to prevent it from disappearing
    ctx.drawImage(cameraFeed, 0, 0, imageCanvas.width, imageCanvas.height);

    if (selectedTool === "line") {
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
        [lastX, lastY] = [e.offsetX, e.offsetY];
    } else if (selectedTool === "rectangle") {
        
        ctx.drawImage(cameraFeed, 0, 0, imageCanvas.width, imageCanvas.height);
        ctx.strokeRect(e.offsetX , e.offsetY , lastX-e.offsetX, lastY-e.offsetY);
        
    }
};

imageCanvas.addEventListener("pointerdown", startDraw);
imageCanvas.addEventListener("pointermove", draw);
imageCanvas.addEventListener("pointerup", () => isDrawing = false); 

/* When save button clicked */
saveButton.addEventListener('click', () => {
    // Convert the canvas image to a data URL
    const imageDataURL = imageCanvas.toDataURL();
    
    // Push the data URL to the Firebase Realtime Database
    push(Imagedb, {
        imageUrl: imageDataURL,
        description: imageDescription.value // You can also save description if needed
    }).then(() => {
        // Clear canvas and description after saving
        ctx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
        imageDescription.value = '';
        alert("Image Saved");
    }).catch((error) => {
        alert('Error saving image:', error);
    });
});

/* When upload button is pressed */
uploadImageInput.addEventListener('change', (e) => {
    const file = e.target.files[0]; // Get the selected file
    if (!file) return; // If no file is selected, do nothing

    const reader = new FileReader();
    
    reader.onload = (event) => {
        const imageDataURL = event.target.result; // Get the data URL of the uploaded image
        
        // Set the data URL as the source of the canvas image
        const image = new Image();
        image.onload = () => {
            imageCanvas.width = image.width;
            imageCanvas.height = image.height;
            ctx.drawImage(image, 0, 0, imageCanvas.width, imageCanvas.height);
        };
        image.src = imageDataURL;
    };
    
    reader.readAsDataURL(file); // Read the file as a data URL


    /* Stopping video feed */
    const stream = cameraFeed.srcObject;
    const tracks = stream.getTracks();
    tracks.forEach(track => track.stop());
    cameraFeed.srcObject = null;

     /* Making buttons invisible */
    cameraButton.style.display = 'none';
    cameraFeed.style.display = 'none';
    imageCanvas.style.display='block';
    uploadImageInput.style.display = 'none';
    saveButton.style.display = 'block';
});

