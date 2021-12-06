const path = require('path')
const fs = require('fs/promises')

const express = require('express')

const { server, azureStorage } = require('./config/environment')
const { filesMiddleware } = require('./middleware/multer')
const { blobservice } = require('./services/azureStorage')

const app = express()

app.set('port', server.port)

app.use(express.static(path.join(__dirname, '../public')))
app.use(express.json())
app.use(filesMiddleware)

app.post('/upload-file', async (req, res) => {
  try {
    const { file } = req

    const uploadFile = () =>
      new Promise((resolve, reject) => {
        blobservice.createBlockBlobFromLocalFile(
          azureStorage.containerName,
          file.filename,
          file.path,
          (err, result) => {
            if (err) return reject(err)

            return resolve(result)
          },
        )
      })

    const uploadResult = await uploadFile()

    fs.unlink(file.path)

    return res
      .status(200)
      .redirect(`/download-file?filename=${uploadResult.name}`)
  } catch (error) {
    return res.status(500).json({
      ok: true,
      message: 'Error al cargar el archivo: ' + error.message,
    })
  }
})

app.get('/download-file', async (req, res) => {
  try {
    const filename = req.query['filename']
    const filePath = path.resolve(__dirname, `../temp/${filename}`)

    const getFile = () =>
      new Promise((resolve, reject) => {
        blobservice.getBlobToLocalFile(
          azureStorage.containerName,
          filename,
          filePath,
          (err) => {
            if (err) return reject(err)
            return resolve(true)
          },
        )
      })

    await getFile()

    const onSendFile = (err) => {
      if (err) throw new Error(err.message)
      fs.unlink(filePath)
    }

    return res.status(200).sendFile(filePath, onSendFile)
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: error.message,
    })
  }
})

module.exports = {
  app,
}
