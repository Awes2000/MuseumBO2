// Voeg een canvas toe aan je HTML-body
const canvas = document.createElement("canvas");
document.body.appendChild(canvas);

// Stel de afmetingen van het canvas in
canvas.width = 800; // Breedte van het canvas
canvas.height = 600; // Hoogte van het canvas

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
const MIN_DISTANCE = 15; // Aanpassen aan je behoeften
const MAX_DISTANCE = 250; // Aanpassen aan je behoeften
const MIN_SIZE = 30; // Aanpassen aan je behoeften
const MAX_SIZE = 200; // Aanpassen aan je behoeften

// Functie om een waarde van het ene bereik naar het andere te schalen
function map(value, inMin, inMax, outMin, outMax) {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}
function drawSolarSystem(distance) {
  ctx.globalCompositeOperation = "destination-over";
  ctx.clearRect(0, 0, canvas.width, canvas.height); // clear canvas

  // Aanpassen: Kleiner bij grotere afstand, groter bij kleinere afstand
  let scaledSize = map(
    distance,
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

  window.requestAnimationFrame(() => drawSolarSystem(distance));
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
  str += data;
  let start = str.lastIndexOf("<");
  let end = str.lastIndexOf(">");

  if (start !== -1 && end !== -1 && start < end) {
    const distanceStr = str.substring(start + 1, end);
    str = str.substring(end + 1); // Reset the buffer

    const distance = parseInt(distanceStr, 10);
    if (!isNaN(distance)) {
      // Roep de tekenfunctie aan met de nieuwe afstandswaarde
      drawSolarSystem(distance);
    }
  }
}
