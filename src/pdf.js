import * as pdfjsLib from "pdfjs-dist";
import Tesseract from "tesseract.js";

pdfjsLib.GlobalWorkerOptions.workerSrc = "js/pdf/pdf.worker.min.js";

var _PDF_DOC,
  _PAGE,
  _ZOOM_FACTOR = 1,
  currentPage = 1,
  noOfPages,
  _CANVAS = document.createElement("canvas");

var pdfWorker;
async function initPdfTesseractWorker() {
  pdfWorker = Tesseract.createWorker({
    logger: (msg) => {
      console.log(msg);
      /* if(msg.status=='recognizing text') {
            ocrPageProgress['style']['width']=`${parseInt(parseFloat(msg.progress)*100)}%`;
            ocrPageProgressStatus.innerHTML=`<p class='mb-1 mt-1'>⏳ <strong>${parseInt(parseFloat(msg.progress)*100)}%</strong></p>`;
        } */
    },
  });

  Tesseract.setLogging(true);
  await pdfWorker.load();
  await pdfWorker.loadLanguage("tur");
  await pdfWorker.initialize("tur");

  return new Promise((resolve) => resolve("worker initialised."));
}

async function showPage(pageNo) {
  currentPage = pageNo;
  try {
    _PAGE = await _PDF_DOC.getPage(pageNo);
  } catch (error) {
    console.log(error.message);
  }
  return new Promise((resolve) => resolve(_PAGE));
}

export function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    let fileredr = new FileReader();
    fileredr.onload = () => resolve(fileredr.result);
    fileredr.onerror = () => reject(fileredr);
    fileredr.readAsDataURL(file);
  });
}

const pixelRatio = window.devicePixelRatio * 2;
async function scalePDFPage() {
  let viewport = _PAGE.getViewport({ scale: _ZOOM_FACTOR });
  let pdfOriginalWidth = viewport.width;
  let viewpointHeight = viewport.height;

  _CANVAS.width = pdfOriginalWidth * pixelRatio;
  _CANVAS.height = viewpointHeight * pixelRatio;

  _CANVAS["style"]["width"] = `${pdfOriginalWidth}px`;
  _CANVAS["style"]["height"] = `${viewpointHeight}px`;

  _CANVAS.getContext("2d").scale(pixelRatio, pixelRatio);

  var renderContext = {
    canvasContext: _CANVAS.getContext("2d"),
    viewport: viewport,
  };
  try {
    await _PAGE.render(renderContext).promise;
  } catch (error) {
    alert(error.message);
  }
  return new Promise((resolve) => resolve(_CANVAS.toDataURL()));
}

const loadImage = (url) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", (err) => reject(err));
    img.src = url;
  });

async function extractPdfText(loadedImg) {
  const result = await pdfWorker.recognize(loadedImg);

  let data = result.data;

  let words = data.words;
  let combinedText = "";
  for (let w of words) {
    let str = w.text;
    let newStr =
      str.length > 1 && str.charAt(str.length - 1) == "-"
        ? str.substr(0, str.length - 1)
        : str + " ";
    combinedText += newStr;
  }
  /* ocrPageProgress['style']['width']='100%';
            ocrPageProgress.classList.remove('progress-bar-animated');
            ocrPageProgressStatus.innerHTML=`<p class='mb-1 mt-1'>⌛ <strong>Done.</strong></p>`; */

  return new Promise((resolve) => resolve(combinedText));
}

export async function showPDF(pdf_url) {
  try {
    _PDF_DOC = await pdfjsLib.getDocument({ url: pdf_url }).promise;
  } catch (error) {
    console.log(error.message);
  }

  noOfPages = _PDF_DOC.numPages;
  let extractedText;
  // totalPages.innerHTML = noOfPages;

  while (currentPage <= noOfPages) {
    await initPdfTesseractWorker();

    // pageLoadingSignal['style']['visibility']='visible';
    // currentPageNo.innerHTML=currentPage;

    _PAGE = await showPage(currentPage);
    let b64str = await scalePDFPage();
    // pagePreview['style']['background-image']='url("'+b64str+'")';

    let loadedImg = await loadImage(b64str);
    extractedText = await extractPdfText(loadedImg);
    // processedPages.insertAdjacentHTML('beforeend', "<p class='mb-1 mt-1'>🗹 <a href='"+b64str+"' download='"+currentPage+".png'>Page "+currentPage+"</a>— ⌛ <strong>Done.</strong></p>");

    await pdfWorker.terminate();

    currentPage++;
  } // end-while loop

  // pageLoadingSignal['style']['visibility'] = 'hidden';
  return new Promise((resolve) => resolve(extractedText));
}
