// Voeg een canvas toe aan je HTML-body
const canvas = document.createElement("canvas");
document.body.appendChild(canvas);

// Stel de afmetingen van het canvas in
canvas.width = 2560; // Breedte van het canvas
canvas.height = 1440; // Hoogte van het canvas
canvas.style.backgroundColor = "black"; // Zet de achtergrondkleur op zwart

// Haal de 2D-context op
const ctx = canvas.getContext("2d");

// Laad afbeeldingen
const sun = new Image();
const moon = new Image();
const earth = new Image();
sun.src = "sun.jpg";
moon.src = "moon.jpg";
earth.src = "earth.jpg";

// Definieer de minimale en maximale afstand en grootte
const MIN_DISTANCE = 15;
const MAX_DISTANCE = 280;
const MIN_SIZE = 150;
const MAX_SIZE = 500;

let currentDistance = MIN_DISTANCE;
let targetDistance = MIN_DISTANCE;
const LERP_SPEED = 0.02; // Aanpassen voor snellere of langzamere overgang

// Functie om een waarde van het ene bereik naar het andere te schalen
function map(value, inMin, inMax, outMin, outMax) {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

function lerp(start, end, t) {
  return start * (1 - t) + end * t;
}

function drawSolarSystem() {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // clear canvas

  // Update de huidige afstand met lineaire interpolatie
  currentDistance = lerp(currentDistance, targetDistance, LERP_SPEED);

  // Aanpassen: Kleiner bij grotere afstand, groter bij kleinere afstand
  let scaledSize = map(
    currentDistance,
    MIN_DISTANCE,
    MAX_DISTANCE,
    MAX_SIZE,
    MIN_SIZE
  );

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  ctx.save();
  ctx.translate(centerX, centerY);

  // Aarde
  const time = new Date();
  ctx.rotate(
    ((2 * Math.PI) / 30) * time.getSeconds() +
      ((2 * Math.PI) / 30000) * time.getMilliseconds()
  );
  // Aanpassen: Verklein de afstand van de aarde tot de zon
  ctx.translate(scaledSize, 3, 0);
  ctx.drawImage(
    earth,
    -scaledSize / 4,
    -scaledSize / 4,
    scaledSize / 2,
    scaledSize / 2
  );

  // Maan
  ctx.save();
  ctx.rotate(
    ((2 * Math.PI) / 12) * time.getSeconds() +
      ((2 * Math.PI) / 12000) * time.getMilliseconds()
  );
  // Aanpassen: Verklein de afstand van de maan tot de aarde
  ctx.translate(scaledSize / 3, 0);
  ctx.drawImage(
    moon,
    -scaledSize / 6,
    -scaledSize / 6,
    scaledSize / 2,
    scaledSize / 2
  );

  ctx.restore();

  ctx.restore();

  // Zon

  ctx.drawImage(
    sun,
    centerX - scaledSize / 2,
    centerY - scaledSize / 2,
    scaledSize,
    scaledSize
  );

  window.requestAnimationFrame(drawSolarSystem);
}

// Seriële communicatie met Arduino
let port,
  writer,
  reader,
  str = "",
  isSetup = false;

document.addEventListener("click", async () => {
  if (!isSetup) {
    isSetup = true;
    await RequestSerialID();
  }
});

async function RequestSerialID() {
  port = await navigator.serial.requestPort();
  await port.open({ baudRate: 115200 });

  writer = port.writable.getWriter();
  ReadUntilClosed();
}

async function ReadUntilClosed() {
  while (port.readable) {
    reader = port.readable.getReader();
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          // Reader is done
          break;
        }
        // Verwerk de ontvangen gegevens
        processData(new TextDecoder().decode(value));
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      reader.releaseLock();
    }
  }
}

function processData(data) {
  console.log("Data ontvangen:", data); // Debugging: print ontvangen data
  str += data;
  let start = str.lastIndexOf("<");
  let end = str.lastIndexOf(">");

  if (start !== -1 && end !== -1 && start < end) {
    const distanceStr = str.substring(start + 1, end);
    str = str.substring(end + 1); // Reset the buffer

    const distance = parseInt(distanceStr, 10);
    if (!isNaN(distance)) {
      console.log("Afstand ontvangen:", distance); // Debugging

      const clampedDistance = Math.min(distance, MAX_DISTANCE);
      targetDistance = clampedDistance;
    }
  }
}

let loadedImages = 0;
const totalImages = 3; // Totaal aantal afbeeldingen

sun.onload = () => {
  loadedImages++;
  if (loadedImages === totalImages) {
    drawSolarSystem(); // Start de animatie nadat alle afbeeldingen zijn geladen
  }
};
moon.onload = () => {
  loadedImages++;
  if (loadedImages === totalImages) {
    drawSolarSystem();
  }
};
earth.onload = () => {
  loadedImages++;
  if (loadedImages === totalImages) {
    drawSolarSystem();
  }
};
