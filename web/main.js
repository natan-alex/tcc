// import { initOpenCV } from './opencv-js.js';
// import { initOpenCV } from './opencv-wasm.js';
// import { initOpenCV } from './opencv-js.min.js';
import { initOpenCV } from './opencv-wasm.min.js';

const cv = await initOpenCV();

const sourceImageElement = document.getElementById('source-image');
const templateImageElement = document.getElementById('template-image');

const sourceFileElement = document.getElementById('source-image-file');
const templateFileElement = document.getElementById('template-image-file');

const matchResultElement = document.getElementById('match-result');
const matchTemplateTriggerElement = document.getElementById('match-template-trigger');
const matchResultPlaceholderElement = document.getElementById('match-result-placeholder');

const timeElapsedElement = document.getElementById('time-elapsed');

const matchResultRectangleProperties = {
  thickness: 2,
  lineType: cv.LINE_8,
  numberOfFractionalBitsInCoordinates: 0,
  color: new cv.Scalar(255, 255, 255, 255), // format: RGBA
};

let sourceImage = null;
let templateImage = null;

function scrollIntoViewOnFocus(element) {
  element.addEventListener('focus', () => {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
}

scrollIntoViewOnFocus(sourceFileElement);
scrollIntoViewOnFocus(templateFileElement);
scrollIntoViewOnFocus(matchTemplateTriggerElement);
scrollIntoViewOnFocus(matchResultElement);

matchResultElement.style.display = 'none';
timeElapsedElement.style.display = 'none';
matchResultPlaceholderElement.style.display = 'block';

sourceFileElement.addEventListener('change', () => {
  if (!sourceFileElement?.files) return;
  if (sourceFileElement.files.length === 0) return;
  const file = sourceFileElement.files[0];
  sourceImageElement.src = URL.createObjectURL(file);
});

templateFileElement.addEventListener('change', () => {
  if (!templateFileElement?.files) return;
  if (templateFileElement.files.length === 0) return;
  const file = templateFileElement.files[0];
  templateImageElement.src = URL.createObjectURL(file);
});

sourceFileElement.addEventListener('change', () => {
  matchResultElement.style.display = 'none';
  timeElapsedElement.style.display = 'none';
  matchResultPlaceholderElement.style.display = 'block';
});

templateFileElement.addEventListener('change', () => {
  matchResultElement.style.display = 'none';
  timeElapsedElement.style.display = 'none';
  matchResultPlaceholderElement.style.display = 'block';
});

sourceImageElement.addEventListener('load', () => {
  sourceImage = cv.imread(sourceImageElement);

  matchResultElement.width = sourceImageElement.width;
  matchResultElement.height = sourceImageElement.height;
});

templateImageElement.addEventListener('load', () => {
  templateImage = cv.imread(templateImageElement);
});

matchTemplateTriggerElement.addEventListener('click', () => {
  if (!!sourceImage && !!templateImage) {
    matchResultElement.style.display = 'block';
    timeElapsedElement.style.display = 'none';
    matchResultPlaceholderElement.style.display = 'none';

    const matchResult = matchTemplate();

    showMatchResult(matchResult.locations);
    showTimeSpentToMatchTemplate(matchResult.timeElapsed);

    matchTemplateTriggerElement.blur();
    matchResultElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
  } else {
    matchResultElement.style.display = 'none';
    matchResultPlaceholderElement.style.display = 'block';
  }
});

function matchTemplate() {
  try {
    const mask = new cv.Mat();
    const matchResult = new cv.Mat();

    const start = performance.now();

    cv.matchTemplate(sourceImage, templateImage, matchResult, cv.TM_CCOEFF_NORMED, mask);

    const end = performance.now();

    const timeElapsed = end - start;

    const locations = cv.minMaxLoc(matchResult, mask);

    mask.delete();
    matchResult.delete();

    return { locations, timeElapsed };
  } catch (error) {
    console.error(error);
    return {};
  }
}

function showMatchResult(locations) {
  try {
    const rectangleTopLeftCorner = locations.maxLoc;
    const rectangleBottomRightCorner = new cv.Point(
      rectangleTopLeftCorner.x + templateImage.cols,
      rectangleTopLeftCorner.y + templateImage.rows
    );

    cv.rectangle(
      sourceImage,
      rectangleTopLeftCorner,
      rectangleBottomRightCorner,
      matchResultRectangleProperties.color,
      matchResultRectangleProperties.thickness,
      matchResultRectangleProperties.lineType,
      matchResultRectangleProperties.numberOfFractionalBitsInCoordinates
    );

    cv.imshow(matchResultElement, sourceImage);
  } catch (error) {
    console.error(error);
  }
}

function showTimeSpentToMatchTemplate(timeElapsed) {
  if (typeof timeElapsed === 'number') {
    timeElapsedElement.innerText = `Time elapsed to match template: ${timeElapsed}ms`;
    timeElapsedElement.style.display = 'block';
  }
}
