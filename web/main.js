// import { initOpenCV } from './opencv-js.js';
// import { initOpenCV } from './opencv-wasm.js';
import { initOpenCV } from './opencv-js.min.js';
// import { initOpenCV } from './opencv-wasm.min.js';

const cv = await initOpenCV();

const iterations = 20;

const elements = {
  containers: {
    sourceImages: document.getElementById('source-images-container'),
    templateImages: document.getElementById('template-images-container'),
    matchResults: document.getElementById('match-results-container'),
  },
  images: {
    sourceImageBeingShown: document.getElementById('source-image-being-shown'),
    templateImageBeingShown: document.getElementById('template-image-being-shown'),
  },
  sideLists: {
    sourceImages: document.getElementById('source-images-side-list'),
    templateImages: document.getElementById('template-images-side-list'),
  },
  inputs: {
    sourceFilesSelector: document.getElementById('source-files-selector'),
    templateFilesSelector: document.getElementById('template-files-selector'),
  },
  buttons: {
    matchTemplates: document.getElementById('match-templates'),
  },
  placeholders: {
    matchResults: document.getElementById('match-results-placeholder'),
  },
  tables: {
    summary: {
      table: document.getElementById('summary'),
      body: document.getElementById('summary-body')
    },
    times: {
      table: document.getElementById('times'),
      header: document.getElementById('times-header'),
      body: document.getElementById('times-body')
    }
  }
};

const mats = {
  sources: null,
  templates: null,
};

const matchIndicatorProperties = {
  thickness: 2,
  lineType: cv.LINE_8,
  numberOfFractionalBitsInCoordinates: 0,
  color: new cv.Scalar(255, 255, 255, 255), // format: RGBA
};

function handleFilesChanged() {
  elements.tables.times.table.style.display = 'none';
  elements.tables.summary.table.style.display = 'none';
  elements.containers.matchResults.style.display = 'none';
  elements.placeholders.matchResults.style.display = 'block';

  const hiddenDivs = document.querySelectorAll('.hidden-images-container');

  for (const div of hiddenDivs) {
    div.remove();
  }
}

function createImagesFromFiles(files) {
  const images = [];

  if (!files?.length) return images;

  for (const file of files) {
    const image = document.createElement('img');
    image.src = URL.createObjectURL(file);
    images.push(image);
  }

  return images;
}

function appendImagesToBodyInAHiddenDiv(images) {
  const div = document.createElement('div');
  div.classList.add('hidden-images-container');
  div.append(...images);
  document.body.appendChild(div);
}

function setUpLoadingClassOnImages(images) {
  for (const image of images) {
    if (image.complete) {
      continue;
    }

    image.classList.add('loading');

    image.addEventListener('load', () => {
      image.classList.remove('loading');
    });
  }
}

function fillMatsArray(array, images) {
  array.splice(0);

  for (let i = 0; i < images.length; ++i) {
    const image = images[i];

    if (image.complete) {
      array[i] = cv.imread(image);
      continue;
    }

    image.addEventListener('load', () => {
      array[i] = cv.imread(image);
    });
  }
}

function updateTargetOnImageClick(images, target) {
  for (const image of images) {
    image.addEventListener('click', () => {
      if (!image.complete) return;
      target.src = image.src;
    });
  }
}

elements.inputs.sourceFilesSelector.addEventListener('change', () => {
  const files = elements.inputs.sourceFilesSelector.files;
  elements.images.sourceImageBeingShown.src = URL.createObjectURL(files[0]);

  const realImages = createImagesFromFiles(files);
  appendImagesToBodyInAHiddenDiv(realImages);
  fillMatsArray(mats.sources = [], realImages);

  if (files.length > 1) {
    const sideListImages = createImagesFromFiles(files);
    setUpLoadingClassOnImages(sideListImages);
    updateTargetOnImageClick(sideListImages, elements.images.sourceImageBeingShown);
    elements.sideLists.sourceImages.style.display = 'flex';
    elements.sideLists.sourceImages.replaceChildren(...sideListImages);
  } else {
    elements.sideLists.sourceImages.style.display = 'none';
  }

  elements.containers.sourceImages.style.display = 'flex';
});

elements.inputs.sourceFilesSelector.addEventListener('change', () => {
  handleFilesChanged();
});

elements.inputs.templateFilesSelector.addEventListener('change', () => {
  const files = elements.inputs.templateFilesSelector.files;
  elements.images.templateImageBeingShown.src = URL.createObjectURL(files[0]);

  const realImages = createImagesFromFiles(files);
  appendImagesToBodyInAHiddenDiv(realImages);
  fillMatsArray(mats.templates = [], realImages);

  if (files.length > 1) {
    const sideListImages = createImagesFromFiles(files);
    setUpLoadingClassOnImages(sideListImages);
    updateTargetOnImageClick(sideListImages, elements.images.templateImageBeingShown);
    elements.sideLists.templateImages.style.display = 'flex';
    elements.sideLists.templateImages.replaceChildren(...sideListImages);
  } else {
    elements.sideLists.templateImages.style.display = 'none';
  }

  elements.containers.templateImages.style.display = 'flex';
});

elements.inputs.templateFilesSelector.addEventListener('change', () => {
  handleFilesChanged();
});

elements.buttons.matchTemplates.addEventListener('click', () => {
  if (!mats.sources?.length) return;
  if (!mats.templates?.length) return;

  const results = matchTemplates();
  fillMatchResultsWith(results);
  generateSummaryBasedOn(results);
  generateTimesBasedOn(results);

  elements.buttons.matchTemplates.blur();
  elements.placeholders.matchResults.style.display = 'none';
  elements.containers.matchResults.style.display = 'flex';
  elements.containers.matchResults.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

function matchTemplates() {
  try {
    const filesAndInfos = new Map();

    for (let i = 0; i < mats.sources.length * iterations; ++i) {
      const index = i % mats.sources.length;

      const mask = new cv.Mat();
      const result = new cv.Mat();

      const start = performance.now();

      cv.matchTemplate(
        mats.sources[index],
        mats.templates[index],
        result,
        cv.TM_CCOEFF_NORMED,
        mask,
      );

      const end = performance.now();

      const timeElapsed = +(end - start).toFixed(2);

      const locations = cv.minMaxLoc(result, mask);

      if (!filesAndInfos.has(index)) {
        filesAndInfos.set(index, {});
      }

      const infos = filesAndInfos.get(index);

      if (!infos.locations) {
        infos.locations = locations;
      }

      if (!infos.times) {
        infos.times = [];
      }

      infos.times.push(timeElapsed);

      mask.delete();
      result.delete();
    }

    for (const infos of filesAndInfos.values()) {
      infos.averageTime = infos.times.reduce((sum, time) => sum + time, 0);
      infos.averageTime = +(infos.averageTime / iterations).toFixed(2);
    }

    return [...filesAndInfos.values()];
  } catch (error) {
    console.error(error);
    return null;
  }
}

function fillMatchResultsWith(results) {
  if (!results) return;

  try {
    const divs = [];

    for (let i = 0; i < mats.sources?.length; ++i) {
      const sourceImageMat = mats.sources[i];
      const templateImageMat = mats.templates[i];

      const { locations, averageTime } = results[i];

      drawRectangleInImage(sourceImageMat, templateImageMat, locations);

      divs.push(createImageAndTimeContainer(sourceImageMat, averageTime));
    }

    elements.containers.matchResults.replaceChildren(...divs);
  } catch (error) {
    console.error(error);
  }
}

function drawRectangleInImage(sourceImageMat, templateImageMat, locations) {
  const topLeftCorner = locations.maxLoc;

  const bottomRightCorner = new cv.Point(
    topLeftCorner.x + templateImageMat.cols,
    topLeftCorner.y + templateImageMat.rows,
  );

  cv.rectangle(
    sourceImageMat,
    topLeftCorner,
    bottomRightCorner,
    matchIndicatorProperties.color,
    matchIndicatorProperties.thickness,
    matchIndicatorProperties.lineType,
    matchIndicatorProperties.numberOfFractionalBitsInCoordinates,
  );
}

function createImageAndTimeContainer(imageMat, averageTime) {
  const canvas = document.createElement('canvas');

  canvas.width = imageMat.cols;
  canvas.height = imageMat.rows;

  cv.imshow(canvas, imageMat);

  const p = document.createElement('p');

  p.classList.add('time-elapsed');
  p.innerText = `Time elapsed to match template (average): ${averageTime}ms`;

  const div = document.createElement('div');
  div.classList.add('image-and-time-container');

  div.append(canvas, p);

  return div;
}

function generateSummaryBasedOn(results) {
  if (!results) return;

  const rows = [];

  for (let i = 0; i < results.length; ++i) {
    const row = document.createElement('tr');
    const sourceImage = document.createElement('td');
    const sourceWidth = document.createElement('td');
    const sourceHeight = document.createElement('td');
    const templateImage = document.createElement('td');
    const templateWidth = document.createElement('td');
    const templateHeight = document.createElement('td');
    const time = document.createElement('td');

    sourceImage.textContent = elements.inputs.sourceFilesSelector.files[i].name;
    sourceWidth.textContent = mats.sources[i].cols;
    sourceHeight.textContent = mats.sources[i].rows;
    templateImage.textContent = elements.inputs.templateFilesSelector.files[i].name;
    templateWidth.textContent = mats.templates[i].cols;
    templateHeight.textContent = mats.templates[i].rows;
    time.textContent = results[i].averageTime;

    row.append(sourceImage, sourceWidth, sourceHeight);
    row.append(templateImage, templateWidth, templateHeight);
    row.append(time);

    rows.push(row);
  }

  elements.tables.summary.body.replaceChildren(...rows);
  elements.tables.summary.table.style.display = 'table';
}

function generateTimesBasedOn(results) {
  if (!results) return;

  const headerRow = document.createElement('tr');

  const sourceTh = document.createElement('th');
  sourceTh.textContent = 'Source image';
  headerRow.appendChild(sourceTh);

  for (let i = 1; i <= iterations; ++i) {
    const th = document.createElement('th');
    th.textContent = i;
    headerRow.appendChild(th);
  }

  elements.tables.times.header.replaceChildren(headerRow);

  const bodyRows = [];

  for (let i = 0; i < results.length; ++i) {
    const bodyRow = document.createElement('tr');
    const sourceTd = document.createElement('td');
    sourceTd.textContent = elements.inputs.sourceFilesSelector.files[i].name;
    bodyRow.appendChild(sourceTd);

    for (const time of results[i].times) {
      const td = document.createElement('td');
      td.textContent = time;
      bodyRow.appendChild(td);
    }

    bodyRows.push(bodyRow);
  }

  elements.tables.times.body.replaceChildren(...bodyRows);
  elements.tables.times.table.style.display = 'table';
}
