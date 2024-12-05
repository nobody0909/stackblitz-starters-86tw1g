console.log('Hello!');
// Select elements
const fileInput = document.getElementById('fileInput');
const fileDisplay = document.getElementById('fileDisplay');
const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
const toggleDrawModeBtn = document.getElementById('toggleDrawMode');
const clearCanvasBtn = document.getElementById('clearCanvas');
const saveCanvasBtn = document.getElementById('saveCanvas');

let isDrawing = true; // Toggle between drawing and typing modes
let drawing = false; // Track drawing state
let typingBuffer = ''; // Buffer for generated text during typing mode
let lastMousePosition = { x: 0, y: 0 }; // Track last mouse position

// Function: File Upload and Display
fileInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const content = e.target.result;
      fileDisplay.innerHTML = content
        .split('\n')
        .map((line) => `<p>${line}</p>`)
        .join('');
    };
    reader.readAsText(file);
  }
});

// Function: Text-to-Speech and Dictionary Lookup
fileDisplay.addEventListener('mouseup', () => {
  const selection = window.getSelection();
  const selectedText = selection.toString().trim();

  if (selectedText) {
    // Highlight selected text
    const range = selection.getRangeAt(0);
    const span = document.createElement('span');
    span.className = 'highlighted';
    span.textContent = selectedText;
    range.deleteContents();
    range.insertNode(span);

    // Text-to-Speech
    const utterance = new SpeechSynthesisUtterance(selectedText);
    speechSynthesis.speak(utterance);

    // Dictionary Lookup for Single Words
    if (selectedText.split(' ').length === 1) {
      fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${selectedText}`)
        .then((response) => response.json())
        .then((data) => {
          if (data[0] && data[0].meanings) {
            const meaning = data[0].meanings[0].definitions[0]?.definition || 'No definition found';
            alert(`Definition of "${selectedText}": ${meaning}`);
          }
        })
        .catch(() => alert('Error fetching word definition.'));
    }
  }
});

// Function: Drawing on Canvas
canvas.addEventListener('mousedown', (event) => {
  if (isDrawing) {
    drawing = true;
    ctx.beginPath();
    ctx.moveTo(event.offsetX, event.offsetY);
  }
});

canvas.addEventListener('mousemove', (event) => {
  if (isDrawing && drawing) {
    ctx.lineTo(event.offsetX, event.offsetY);
    ctx.stroke();
  } else if (!isDrawing) {
    // Simulated Typing with Mouse Movement
    const dx = event.offsetX - lastMousePosition.x;
    const dy = event.offsetY - lastMousePosition.y;

    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      const char = dx > 0 ? 'a' : 'b'; // Simulated characters
      typingBuffer += char;
      ctx.font = '16px Arial';
      ctx.fillText(char, event.offsetX, event.offsetY);
    }
  }
  lastMousePosition = { x: event.offsetX, y: event.offsetY };
});

canvas.addEventListener('mouseup', () => {
  drawing = false;
});

// Function: Toggle Between Drawing and Typing Modes
toggleDrawModeBtn.addEventListener('click', () => {
  isDrawing = !isDrawing;
  toggleDrawModeBtn.textContent = isDrawing ? 'Enable Typing Mode' : 'Enable Drawing Mode';
});

// Function: Clear Canvas
clearCanvasBtn.addEventListener('click', () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

// Function: Save Canvas Content
saveCanvasBtn.addEventListener('click', () => {
  const dataURL = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = dataURL;
  link.download = 'canvas_notes.png';
  link.click();
});
