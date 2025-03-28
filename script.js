const imageUpload = document.getElementById('imageUpload');
const templateSelect = document.getElementById('templateSelect');
const topTextInput = document.getElementById('topText');
const bottomTextInput = document.getElementById('bottomText');
const downloadBtn = document.getElementById('downloadBtn');

// Canvas
const canvas = document.getElementById('memeCanvas');
const ctx = canvas.getContext('2d');

let img = new Image();
img.crossOrigin = "Anonymous";

canvas.width = 500;
canvas.height = 500;

// Function: Loads templates from 'imgflip' and populates the list
async function loadTemplates() {
    try {
        const response = await fetch('https://api.imgflip.com/get_memes');
        const data = await response.json();

        if (data.success) {
            const templates = data.data.memes;
            templates.forEach(template => {
                const option = document.createElement('option');
                option.value = template.url;
                option.textContent = template.name;

                templateSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error fetching templates:', error);

        const option = document.createElement('option');
        option.textContent = 'Templates unavailable, upload your own!';
        
        templateSelect.appendChild(option);
    }
}

// Function: Draws the meme in the canvas
function drawMeme() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (img.src) {
        const aspectRatio = img.width / img.height;
        canvas.height = canvas.width / aspectRatio;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }

    const fontSize = canvas.width / 10;
    ctx.font = `${fontSize}px Impact`;
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = fontSize / 15;
    ctx.textAlign = 'center';

    const topText = topTextInput.value.toUpperCase();
    ctx.fillText(topText, canvas.width / 2, fontSize + 10);
    ctx.strokeText(topText, canvas.width / 2, fontSize + 10);

    const bottomText = bottomTextInput.value.toUpperCase();
    ctx.fillText(bottomText, canvas.width / 2, canvas.height - 20);
    ctx.strokeText(bottomText, canvas.width / 2, canvas.height - 20);

    downloadBtn.disabled = !img.src && !topText && !bottomText;
}

templateSelect.addEventListener('change', (e) => {
    const templateUrl = e.target.value;

    if (templateUrl) {
        img.src = templateUrl;
        img.onload = drawMeme;
        img.onerror = () => {
            console.error('Failed to load template image');
            img.src = '';
            drawMeme();
        };
    }
});

imageUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            img.src = event.target.result;
            img.onload = drawMeme;
        };
        reader.readAsDataURL(file);

        templateSelect.value = "";
    }
});

topTextInput.addEventListener('input', drawMeme);
bottomTextInput.addEventListener('input', drawMeme);

downloadBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'meme.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
});

loadTemplates().then(drawMeme);
