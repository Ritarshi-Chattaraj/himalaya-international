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

const imageDescription = document.getElementById('imageDescription');
const downloadLink = document.getElementById('downloadLink');
const cameraButton = document.getElementById('cameraButton');
const captureImageButton = document.getElementById('captureImageButton');
const cameraFeed = document.getElementById('cameraFeed');
const drawRectangle = document.getElementById('drawRectangle');
const drawText = document.getElementById('drawText');
const deleteButton = document.getElementById('deleteButton');
const uploadImageInput = document.getElementById('upload-image');
const saveButton = document.getElementById('save-button');
const imageCanvas = document.getElementById('imageCanvas');
const ctx = imageCanvas.getContext('2d');

const canvas = new fabric.Canvas('imageCanvas', {
    width: imageCanvas.offsetWidth,
    height: imageCanvas.offsetHeight,
    isDrawingMode: false // Assuming you want drawing mode disabled initially
});




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
    drawRectangle.style.display = 'none';
    drawText.style.display = 'none';
    deleteButton.style.display = 'none';
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
    const canvasWidth = imageCanvas.offsetWidth;
    const canvasHeight = imageCanvas.offsetHeight;
    console.log('Canvas width:', canvasWidth);
    console.log('Canvas height:', canvasHeight);
    canvas.setDimensions({ width: canvasWidth, height: canvasHeight });
});

window.addEventListener('resize', () => {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    imageCanvas.width = screenWidth;
    imageCanvas.height = screenHeight;
});


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
        
        // Create a new image element
        const image = new Image();
        
        // When the image is loaded
        image.onload = () => {            
            // Set the dimensions of the canvas to match the image
            canvas.setDimensions({ width: image.width, height: image.height });

            // Set the uploaded image as the background of the canvas
            canvas.setBackgroundImage(imageDataURL, canvas.renderAll.bind(canvas));
            
            // Configure the drawing brush
            canvas.freeDrawingBrush.width = 10;
            canvas.freeDrawingBrush.color = 'white';
            
            // Disable drawing mode
            canvas.isDrawingMode = false;

            // Hide unnecessary buttons
            cameraButton.style.display = 'none';
            cameraFeed.style.display = 'none';
            imageCanvas.style.display = 'block';
            uploadImageInput.style.display = 'none';
            saveButton.style.display = 'none';
            drawB.style.display = 'block';
            drawRectangle.style.display = 'block';
            drawText.style.display = 'block';
            deleteButton.style.display = 'block';

        };
        
        // Set the image source to the data URL
        image.src = imageDataURL;
    };
    
    // Read the file as a data URL
    reader.readAsDataURL(file);

    // Stop video feed if active
    const stream = cameraFeed.srcObject;
    if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
        cameraFeed.srcObject = null;
    }
});

const draw = () => {
    canvas.isDrawingMode = !canvas.isDrawingMode;
    
};

const drawR = () => {
    canvas.isDrawingMode = !canvas.isDrawingMode;
    const rectangle = new fabric.Rect({
        left: 40,
        top: 40,
        width: 60,
        height: 60,
        fill: 'transparent',
        stroke: 'white',
        strokeWidth: 7,
    });
    canvas.add(rectangle);
    canvas.isDrawingMode= false;
};

const drawT = () => {
    canvas.isDrawingMode = !canvas.isDrawingMode;
    const text = new fabric.IText('Text', {
        left: 40,
        top: 40,
        objecttype: 'text',
        fontFamily: 'arial black',
        fill: 'white',
    });

    canvas.add(text);
    canvas.isDrawingMode= false;
};

const drawDelete = () => {
    canvas.isDrawingMode = !canvas.isDrawingMode;
    canvas.remove(canvas.getActiveObject());
};

const delete1 = () => {
    deleteButton.prop('disabled','');
}

const delete2 = () => {
    deleteButton.prop('disabled','disabled');
}

drawB.addEventListener('click', draw);
drawRectangle.addEventListener('click', drawR);
drawText.addEventListener('click', drawT);
deleteButton.addEventListener('click', drawDelete);
deleteButton.addEventListener('selection:created',delete1);
deleteButton.addEventListener('selection:cleared',delete2);
