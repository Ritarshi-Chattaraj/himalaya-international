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
const useCameraButton = document.getElementById('useCameraButton');
const captureImageButton = document.getElementById('captureImageButton');
const cameraFeed = document.getElementById('cameraFeed');
const ctx = imageCanvas.getContext('2d');

let isDrawing = false;
let lastX = 0;
let lastY = 0;
let selectedTool = "rectangle"; // Default tool
let snapshot;

useCameraButton.addEventListener('click', () => {
    imageInput.style.display = 'none';
    cameraFeed.style.display = 'block';
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then((stream) => {
            cameraFeed.srcObject = stream;
            captureImageButton.style.display = 'inline-block';
        })
        .catch((error) => {
            console.error('Error accessing camera:', error);
        });
});

captureImageButton.addEventListener('click', () => {
    cameraFeed.style.display = 'none';
    captureImageButton.style.display = 'none';
    drawB.style.display = 'inline-block';

    imageCanvas.width = cameraFeed.videoWidth;
    imageCanvas.height = cameraFeed.videoHeight;
    ctx.drawImage(cameraFeed, 0, 0, imageCanvas.width, imageCanvas.height);

    const stream = cameraFeed.srcObject;
    const tracks = stream.getTracks();
    tracks.forEach(track => track.stop());
    cameraFeed.srcObject = null;

    imageCanvas.style.display = 'block';
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
}

imageCanvas.addEventListener("mousedown", startDraw);
imageCanvas.addEventListener("mousemove", draw);
imageCanvas.addEventListener("mouseup", () => isDrawing = false);

imageCanvas.addEventListener("touchstart", startDraw);
imageCanvas.addEventListener("touchmove", draw);
imageCanvas.addEventListener("touchend", () => isDrawing = false);

imageCanvas.addEventListener("pointerdown", startDraw);
imageCanvas.addEventListener("pointermove", draw);
imageCanvas.addEventListener("pointerup", () => isDrawing = false); 

const saveImage = () => {
  push(Imagedb,imageCanvas);
}


