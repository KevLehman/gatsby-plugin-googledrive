const fs = require('fs')
const path = require('path')
const mkdirp = require("mkdirp")

const GoogleApi = require('./api');
let api;

const mimeTypes = {
  'application/vnd.google-apps.folder': 'FOLDER',
  'application/vnd.google-apps.presentation': '.pptx',
  'application/pdf': '.pdf',
  'text/html': '.html',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
  'application/x-vnd.oasis.opendocument.spreadsheet': '.xlsx',
  'text/csv': '.csv',
  'image/jpeg': '.jpg',
  'image/svg+xml': '.svg',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
  'application/vnd.oasis.opendocument.presentation': '.pptx',
};

exports.onPreBootstrap = ({ graphql, actions }, { keyInfo, destination, exportMime, folderId  }) => {
  return new Promise(async(resolve) => {
    console.log('Bootstrapping API')
    api = new GoogleApi(keyInfo.email, keyInfo.private_key);

    // get token
    api.setAuth();
    console.log('Token set succesfully');

    // create content directory
    mkdirp(destination)

    // get files
    const files = await api.getFolderFiles(folderId)
    console.log(`Succesfully obtained content from parent folder. Items: ${files.length}`);

    // download files
    console.log('Starting downloading files')
    await download(files, destination, exportMime)

    console.log('Finished downloading files')
    resolve(true)
  })
}

const download = async (files = [], destination = '', exportMime = 'application/pdf', parentFolder = '') => {
  return files.reduce(async(prev, file) => {
    await prev;
    if (mimeTypes[file.mimeType] === 'FOLDER') {
      // create folder with file.name
      console.log(`Creating folder for /${file.name}`)
      mkdirp(path.join(destination, parentFolder, file.name))

      // get folder files
      console.log(`Downloading contents for /${file.name}`);
      const subFiles = await api.getFolderFiles(file.id)

      // download folder files
      if (subFiles.length) {
        return download(subFiles, destination, exportMime, `${parentFolder}/${file.name}`);
      }
    } else {
      // get file
      const filePath = path.join(destination, parentFolder, `${file.name}${mimeTypes[exportMime]}`)
      let fileBuffer;

      if (file.mimeType.includes('vnd.google-apps')) {
        // aka. its a google doc!
        fileBuffer = await api.exportDoc(file.id, exportMime)
      } else {
        // get original file, if possible
        fileBuffer = await api.getFile(file.id)
      }

      // save file to folder
      fs.writeFileSync(filePath, fileBuffer)
      console.log(`Succesfully saved file to ${filePath}`)

      return Promise.resolve();
    }
  }, Promise.resolve([]))
}