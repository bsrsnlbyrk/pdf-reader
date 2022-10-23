import { useState } from "react";
import { DropzoneArea } from "react-mui-dropzone";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";

import CircularProgress from "@mui/material/CircularProgress";
import Backdrop from "@mui/material/Backdrop";
import * as pdfjsLib from "pdfjs-dist";
import { useTheme } from "@mui/material/styles";

import CustomizedLinearProgress from "./components/CustomizedLinearProgress";
import { showPDF } from "./pdf";
import "./App.css";
import { useMediaQuery } from "@mui/material";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "//cdn.jsdelivr.net/npm/pdfjs-dist@2.16.105/build/pdf.worker.js";

function App() {
  const [loadedPDF, setLoadedPDF] = useState("");
  const [progress, setProgress] = useState(0);
  const [isWorkerInitialising, setIsWorkerInitialising] = useState(false);
  const [open, setOpen] = useState(false);
  const fileReader = new FileReader();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  fileReader.onload = () => {
    setIsWorkerInitialising(true);
    showPDF(fileReader.result, setProgress, setIsWorkerInitialising)
      .then((text) => setLoadedPDF(text))
      .catch(() => handleOpen());
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
    width: isMobile ? 220 : 400,
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4,
    outline: "unset",
  };

  return (
    <div className="App">
      <DropzoneArea filesLimit={1} onChange={loadPDF} />
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isWorkerInitialising}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      {progress ? (
        <Box sx={{ width: "100%", marginTop: "2rem" }}>
          <CustomizedLinearProgress variant="determinate" value={progress} />
        </Box>
      ) : null}
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
        multiline
        rows={4}
        style={{ width: "100%", marginTop: "2rem" }}
        value={loadedPDF}
      />
    </div>
  );
}

export default App;
