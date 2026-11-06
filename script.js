const bakeries = [
  {
    name: "L’Appartement 4F",
    x: 34.5,
    y: 48.5,
    image: "bread/1.lappartment.PNG",
    rating: 9.9
  },
  {
    name: "Justin’s Salt Bread",
    x: 43.1,
    y: 62.6,
    image: "bread/2.justin's.PNG",
    rating: 9.7
  },
  {
    name: "Thea",
    x: 47.4,
    y: 96.5,
    image: "bread/3.thea.PNG",
    rating: 9.6
  },
  {
    name: "Hani’s Bakery + Cafe",
    x: 40,
    y: 55.4,
    image: "bread/4.hani.PNG",
    rating: 9.5
  },
  {
    name: "Radio Bakery",
    x: 64,
    y: 61.8,
    image: "bread/5.radio.PNG",
    rating: 9.4
  },
  {
    name: "Bánh by Lauren",
    x: 39.5,
    y: 77.2,
    image: "bread/6.banh.PNG",
    rating: 9.3
  },
  {
    name: "Mary O’s Irish Soda Bread",
    x: 46.9,
    y: 59.8,
    image: "bread/7.mary.PNG",
    rating: 9.2
  },
  {
    name: "I’m donut? Times Square",
    x: 42.6,
    y: 30.6,
    image: "bread/8.donut.PNG",
    rating: 9.0
  },
  {
    name: "From Lucie",
    x: 45.9,
    y: 53.3,
    image: "bread/9.lucie.PNG",
    rating: 8.8
  },
  {
    name: "La Cabra",
    x: 42.6,
    y: 52.1,
    image: "bread/10.lacabra.PNG",
    rating: 8.4
  }
];

const map = document.querySelector("#map");
const dialog = document.querySelector("#bakery-dialog");
const closeButton = document.querySelector("#close-dialog");
const bakeryName = document.querySelector("#bakery-name");

const eatingStage = document.querySelector("#eating-stage");
const breadButton = document.querySelector("#bread-button");
const canvas = document.querySelector("#bread-canvas");
const placeholder = document.querySelector("#bread-placeholder");
const hint = document.querySelector("#hint");

const ratingStage = document.querySelector("#rating-stage");
const ratingValue = document.querySelector("#rating-value");

const context = canvas.getContext("2d");

let currentBakery = null;
let currentSpot = null;
let bites = 0;
let imageReady = false;
let loadNumber = 0;

/* HAND-DRAWN MAP PINS */

function createPin(index) {
  const textureId = `pin-texture-${index}`;

  return `
    <svg
      class="pin-art"
      viewBox="0 0 76 88"
      aria-hidden="true"
      focusable="false"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter
          id="${textureId}"
          x="-10%"
          y="-10%"
          width="120%"
          height="120%"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency=".18"
            numOctaves="2"
            seed="${index + 3}"
            result="grain"
          />

          <feDisplacementMap
            in="SourceGraphic"
            in2="grain"
            scale="1.3"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>

      <g filter="url(#${textureId})">
        <path
          d="
            M38 87
            C32 77 10 54 9 34
            C8 16 20 5 37 5
            C55 3 68 16 67 34
            C67 52 46 76 38 87 Z
          "
          fill="currentColor"
          stroke="#5e5539"
          stroke-width="2"
          stroke-linejoin="round"
        />

        <path
          d="
            M35 79
            C26 66 13 49 13 33
            C12 18 23 9 37 9
            M43 8
            C58 11 64 22 63 35
            C62 48 48 68 41 77
          "
          fill="none"
          stroke="#5e5539"
          stroke-opacity=".45"
          stroke-width="1.5"
          stroke-linecap="round"
        />

        <path
          d="
            M18 25 L24 15
            M16 35 L29 13
            M18 44 L23 36
            M22 53 L28 43
            M27 62 L33 51
            M33 70 L39 59
            M45 63 L54 48
            M52 48 L60 33
            M53 23 L57 17
          "
          fill="none"
          stroke="#fff2ca"
          stroke-opacity=".35"
          stroke-width="2.2"
          stroke-linecap="round"
        />

        <path
          d="
            M49 31
            C50 39 44 44 37 44
            C29 44 25 39 25 32
            C24 25 30 20 37 20
            C44 19 49 24 49 31 Z
          "
          fill="#fff1cf"
          stroke="#5e5539"
          stroke-width="1.8"
        />
      </g>
    </svg>
  `;
}

bakeries.forEach((bakery, index) => {
  const spot = document.createElement("button");

  spot.type = "button";
  spot.className = "spot";
  spot.style.left = `${bakery.x}%`;
  spot.style.top = `${bakery.y}%`;

  spot.title = bakery.name;
  spot.setAttribute("aria-label", bakery.name);
  spot.setAttribute("aria-haspopup", "dialog");
  spot.innerHTML = createPin(index);

  spot.addEventListener("click", () => {
    openBakery(bakery, spot);
  });

  map.appendChild(spot);
});

/* OPEN A BAKERY */

function openBakery(bakery, spot) {
  currentBakery = bakery;
  currentSpot = spot;

  bites = 0;
  imageReady = false;

  const thisLoad = ++loadNumber;

  bakeryName.textContent = bakery.name;
  eatingStage.hidden = false;
  ratingStage.hidden = true;

  canvas.hidden = true;
  placeholder.hidden = false;
  placeholder.textContent = "Loading your bread…";

  breadButton.disabled = true;
  breadButton.setAttribute(
    "aria-label",
    `Take a bite of the ${bakery.name} pastry`
  );

  hint.textContent = "";

  if (!dialog.open) {
    dialog.showModal();
  }

  const image = new Image();

  image.onload = () => {
    if (thisLoad !== loadNumber || !dialog.open) return;

    drawBread(image);

    imageReady = true;
    canvas.hidden = false;
    placeholder.hidden = true;
    breadButton.disabled = false;

    hint.textContent = "Click the bread to take a bite!";
    fitCanvas();
  };

  image.onerror = () => {
    if (thisLoad !== loadNumber || !dialog.open) return;

    placeholder.textContent = "The bread image couldn’t load.";
    hint.textContent = "Check its filename in script.js.";
  };

  image.src = bakery.image;
}

/* DRAW BREAD AND CROP TRANSPARENT MARGINS */

function drawBread(image) {
  const source = document.createElement("canvas");

  const scale = Math.min(
    1,
    1200 / Math.max(image.naturalWidth, image.naturalHeight)
  );

  source.width = Math.max(
    1,
    Math.round(image.naturalWidth * scale)
  );

  source.height = Math.max(
    1,
    Math.round(image.naturalHeight * scale)
  );

  const sourceContext = source.getContext("2d", {
    willReadFrequently: true
  });

  sourceContext.drawImage(
    image,
    0,
    0,
    source.width,
    source.height
  );

  let left = 0;
  let top = 0;
  let right = source.width - 1;
  let bottom = source.height - 1;

  try {
    const pixels = sourceContext.getImageData(
      0,
      0,
      source.width,
      source.height
    ).data;

    let minX = source.width;
    let minY = source.height;
    let maxX = -1;
    let maxY = -1;

    for (let y = 0; y < source.height; y++) {
      for (let x = 0; x < source.width; x++) {
        const alpha = pixels[(y * source.width + x) * 4 + 3];

        if (alpha > 30) {
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }
      }
    }

    if (maxX >= minX && maxY >= minY) {
      left = minX;
      top = minY;
      right = maxX;
      bottom = maxY;
    }
  } catch {
    // If the browser blocks pixel reading for local files,
    // display the full image.
  }

  canvas.width = right - left + 1;
  canvas.height = bottom - top + 1;

  context.globalCompositeOperation = "source-over";
  context.clearRect(0, 0, canvas.width, canvas.height);

  context.drawImage(
    source,
    left,
    top,
    canvas.width,
    canvas.height,
    0,
    0,
    canvas.width,
    canvas.height
  );
}

/* FIT BREAD WITHOUT OVERLAPPING THE TEXT */

function fitCanvas() {
  if (!imageReady || eatingStage.hidden || !dialog.open) return;

  const scale = Math.min(
    breadButton.clientWidth / canvas.width,
    breadButton.clientHeight / canvas.height
  );

  if (!Number.isFinite(scale) || scale <= 0) return;

  canvas.style.width = `${canvas.width * scale}px`;
  canvas.style.height = `${canvas.height * scale}px`;
}

const breadResizeObserver = new ResizeObserver(fitCanvas);
breadResizeObserver.observe(breadButton);

document.fonts.ready.then(fitCanvas);

/* SCALLOPED BITE MARKS */

function takeBite(boundary) {
  const width = canvas.width;
  const height = canvas.height;

  const teeth = 7;
  const toothHeight = height / teeth;
  const depth = Math.min(width * 0.1, toothHeight * 0.7);
  const edge = width * boundary;

  context.save();
  context.globalCompositeOperation = "destination-out";
  context.fillStyle = "#000";

  context.beginPath();
  context.moveTo(width, 0);
  context.lineTo(edge, 0);

  for (let tooth = 0; tooth < teeth; tooth++) {
    const startY = tooth * toothHeight;

    context.quadraticCurveTo(
      edge - depth,
      startY + toothHeight / 2,
      edge,
      startY + toothHeight
    );
  }

  context.lineTo(width, height);
  context.closePath();
  context.fill();
  context.restore();
}

/* THREE CLICKS TO EAT */

breadButton.addEventListener("click", () => {
  if (!imageReady || bites >= 3) return;

  bites += 1;

  if (bites === 1) {
    takeBite(0.66);
    hint.textContent = "Two more bites…";
    breadButton.setAttribute("aria-label", "Take a second bite");
  } else if (bites === 2) {
    takeBite(0.33);
    hint.textContent = "One last bite!";
    breadButton.setAttribute("aria-label", "Take the last bite");
  } else {
    context.clearRect(0, 0, canvas.width, canvas.height);
    revealRating();
  }
});

/* REVEAL BELI RATING */

function revealRating() {
  eatingStage.hidden = true;
  ratingStage.hidden = false;

  ratingValue.textContent =
    `${currentBakery.rating.toFixed(1)} / 10`;

  currentSpot.classList.add("eaten");
  closeButton.focus();
}

/* CLOSE POPUP */

closeButton.addEventListener("click", () => {
  dialog.close();
});

dialog.addEventListener("click", (event) => {
  const bounds = dialog.getBoundingClientRect();

  const clickedOutside =
    event.clientX < bounds.left ||
    event.clientX > bounds.right ||
    event.clientY < bounds.top ||
    event.clientY > bounds.bottom;

  if (event.target === dialog && clickedOutside) {
    dialog.close();
  }
});

dialog.addEventListener("close", () => {
  loadNumber += 1;
  imageReady = false;

  if (currentSpot) {
    currentSpot.focus();
  }
});