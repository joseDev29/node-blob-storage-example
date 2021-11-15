const path = require("path");
const fs = require("fs/promises");

const express = require("express");

const { server, azureStorage } = require("./config/environment");
const { filesMiddleware } = require("./middleware/multer");
const { blobservice } = require("./services/azureStorage");

const app = express();

app.set("port", server.port);

app.use(express.static(path.join(__dirname, "../public")));
app.use(express.json());
app.use(filesMiddleware);

app.post("/upload-file", async (req, res) => {
  try {
    const { file } = req;

    const onUploadFile = (err, result) => {
      if (err) throw new Error(err.message);

      fs.unlink(file.path);

      return res.status(200).redirect(`/download-file?filename=${result.name}`);
    };

    return blobservice.createBlockBlobFromLocalFile(
      azureStorage.containerName,
      file.filename,
      file.path,
      onUploadFile
    );
  } catch (error) {
    return res.status(500).json({
      ok: true,
      message: "Error al cargar el archivo: " + error.message,
    });
  }
});

app.get("/download-file", async (req, res) => {
  try {
    const filename = req.query["filename"];

    const onSendFile = (err) => {
      if (err) throw new Error(err.message);
      fs.unlink(path.resolve(__dirname, `../temp/${filename}`));
    };

    const onGetFile = (err) => {
      if (err) throw new Error(err.message);

      return res
        .status(200)
        .sendFile(path.resolve(__dirname, `../temp/${filename}`), onSendFile);
    };

    return blobservice.getBlobToLocalFile(
      azureStorage.containerName,
      filename,
      path.resolve(__dirname, `../temp/${filename}`),
      onGetFile
    );
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
});

module.exports = {
  app,
};
