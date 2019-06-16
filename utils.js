const btoa = require('btoa')

const convertBufferToImgSrc = imageBuffer => {
  const str = String.fromCharCode(...new Uint8Array(imageBuffer.data))
  const base64String = btoa(String.fromCharCode(...new Uint8Array(imageBuffer.data)));
  return `data:image/png;base64,${base64String}`;
};

module.exports = {
  convertBufferToImgSrc
}
