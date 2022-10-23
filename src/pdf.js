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
async function initPdfTesseractWorker(setProgress, setIsWorkerInitialising) {
  pdfWorker = Tesseract.createWorker({
    logger: (msg) => {
      console.log(msg);
      if (msg.status === "recognizing text") {
        setIsWorkerInitialising(false);
        setProgress(parseInt(parseFloat(msg.progress) * 100));
      }
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

  return new Promise((resolve) => resolve(combinedText));
}

export async function showPDF(pdf_url, setProgress, setIsWorkerInitialising) {
  try {
    _PDF_DOC = await pdfjsLib.getDocument({ url: pdf_url }).promise;
  } catch (error) {
    return new Promise((_, reject) => reject(error.message));
  }

  noOfPages = _PDF_DOC.numPages;
  let extractedText;

  while (currentPage <= noOfPages) {
    await initPdfTesseractWorker(setProgress, setIsWorkerInitialising);

    _PAGE = await showPage(currentPage);
    let b64str = await scalePDFPage();
    let loadedImg = await loadImage(b64str);
    extractedText = await extractPdfText(loadedImg);

    await pdfWorker.terminate();

    currentPage++;
  } // end-while loop

  return new Promise((resolve) => resolve(extractedText));
}
