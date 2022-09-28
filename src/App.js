import { useState, useEffect } from "react";
import { DropzoneArea } from "react-mui-dropzone";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import * as pdfjsLib from "pdfjs-dist";

import "./App.css";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "//cdn.jsdelivr.net/npm/pdfjs-dist@2.16.105/build/pdf.worker.js";

function App() {
  const [loadedPDF, setLoadedPDF] = useState(null);
  const [open, setOpen] = useState(false);
  const fileReader = new FileReader();

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const readPDF = (file) => {
    const loadingTask = pdfjsLib.getDocument(file);
    loadingTask.promise.then(
      async (pdf) => {
        const page = await pdf.getPage(1);
        const textContent = await page.getTextContent();
        setLoadedPDF(textContent.items.map((item) => item.str).join(" "));
      },
      (error) => {
        console.log(error);
        handleOpen();
      }
    );
  };

  fileReader.onload = () => {
    const typedarray = new Uint8Array(fileReader.result);
    readPDF(typedarray);
  };

  const loadPDF = async (file) => {
    if (file[0]) fileReader.readAsArrayBuffer(file[0]);
  };

  useEffect(() => {
    console.log(loadedPDF);
  }, [loadedPDF]);

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
  };

  return (
    <div className="App">
      <DropzoneArea filesLimit={1} onChange={loadPDF} />
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Hata Oluştu
          </Typography>
        </Box>
      </Modal>
    </div>
  );
}

export default App;
