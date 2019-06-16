const btoa = require('btoa')
const fs = require('fs')
const PNG = require('pngjs').PNG
const pixelmatch = require('pixelmatch')

const convertBufferToImgSrc = imageBuffer => {
  const base64String = btoa(String.fromCharCode(...new Uint8Array(imageBuffer.data)));
  return `data:image/png;base64,${base64String}`;
};

// need html and css for userchallenge and challenge
function compareImages(userchallengePath, challengePath, dir, width, height, userId) {
  // use promise so that can return percentMatch
  return new Promise((resolve, reject) => {
    try {
      let percentMatch = 0;
      let filesRead = 0;

      // eslint-disable-next-line no-inner-declarations
      function doneReading() {
        if (++filesRead < 2) {
          return;
        }
        const diff = new PNG({ width: img1.width, height: img1.height });

        // calc # of pixels different
        const numDiffPixels = pixelmatch(img1.data, img2.data, diff.data, img1.width, img1.height, {
          threshold: 0.1,
        });
        diff
          .pack()
          .pipe(fs.createWriteStream(`${dir}diffImage.diff.png`))
          .on('finish', () => {
            percentMatch = Math.round(100 * (1 - numDiffPixels / (img1.width * img1.height)));
            resolve(percentMatch);
          });
      }
      // convert images to correct format to compare pixels
      const img1 = fs
        .createReadStream(challengePath)
        .pipe(new PNG())
        .on('parsed', doneReading);

      const img2 = fs
        .createReadStream(userchallengePath)
        .pipe(new PNG())
        .on('parsed', doneReading);
    } catch (error) {
      reject(error);
    }
  });
}

const mkdir = (dir) => {
  return new Promise((res, rej) => {
    fs.mkdir(dir, { recursive: true }, err => {
      if (err) {
        rej(err)
      } else {
        console.log('create dir: ', dir)
        res()
      }
    })
  })
}

const writeFile = (path, text) => {
  return new Promise((res, rej) => {
    fs.writeFile(path, text, err => {
      if (err) {
        rej(err)
      } else {
        console.log('file saved')
        res()
      }
    })
  })
}

const readFile = (path) => {
  return new Promise((res, rej) => {
    fs.readFile(path, (err, data) => {
      if (err) {
        rej(err)
      } else {
        console.log('file read')
        res(data)
      }
    })
  })
}

const parseHTML = (html, userId) => {
  return `<html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="ie=edge">
      <title>Document</title>
      <link rel="stylesheet" href="${userId}.css">
  </head>
  <body>
      ${html}
  </body>
  </html>`
}
module.exports = {
  convertBufferToImgSrc,
  compareImages,
  mkdir,
  readFile,
  parseHTML,
  writeFile
}

