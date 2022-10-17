import { useState, useEffect } from "react";
import { DropzoneArea } from "react-mui-dropzone";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import * as pdfjsLib from "pdfjs-dist";

import { showPDF } from "./pdf";
import "./App.css";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "//cdn.jsdelivr.net/npm/pdfjs-dist@2.16.105/build/pdf.worker.js";

function App() {
  const [loadedPDF, setLoadedPDF] = useState("");
  const [open, setOpen] = useState(false);
  const fileReader = new FileReader();

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  fileReader.onload = () => {
    showPDF(fileReader.result).then((text) => setLoadedPDF(text));
  };

  const loadPDF = (e) => {
    const file = e[0];
    if (file) fileReader.readAsDataURL(file);
  };

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
      <TextField
        id="inputText"
        variant="outlined"
        style={{ width: "100%", marginTop: "2rem" }}
        value={loadedPDF}
      />
    </div>
  );
}

export default App;
