const express = require('express')
const puppeteer = require('puppeteer')
const utils = require('./puppeteer-utils')
const path = require('path')
const fs = require('fs')

const app = express()

app.use(express.json())

// helper functions 
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

const puppy = async () => {
  const args = ['-–no-sandbox', '-–disable-setuid-sandbox']
  console.log('set args')
  const browser = await puppeteer.launch({ args })
  console.log('launched browser.')
  const page = await browser.newPage()
  console.log('created new page')
  await browser.close()
  console.log('closed browser')
  return 'hello'
}

const createFiles = async (html, css, userId, dir) => {
  await mkdir(dir)
  await writeFile(`${dir}${userId}.html`, parseHTML(html, userId))
  await writeFile(`${dir}${userId}.css`, css)
}

const createImage = async (userId, challengeId, dir, width, height) => {
  try {
    // const image = await Image.findOne({ where: { challengeId } });
    const args = ['-–no-sandbox', '-–disable-setuid-sandbox']
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    const retPath = `file://${path.join(process.cwd(), `${dir}${userId}.html`)}`
    await page.goto(retPath)
    await page.setViewport({ width, height })
    await page.screenshot({ path: `${dir}${userId}.png` })
    await browser.close()
    return readFile(`${dir}${userId}.png`)
  } catch (err) {
    console.log('error from createImage: ', err)
  }
}

const seedImage = async (fileName, dir) => {
  try {
    const args = ['-–no-sandbox', '-–disable-setuid-sandbox']
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    const retPath = `file://${path.join(process.cwd(), `${dir}${fileName}.html`)}`
    await page.goto(retPath)
    await page.setViewport({ width: 600, height: 337 })
    await page.screenshot({ path: `${dir}${fileName}.png` })
    await browser.close()
    return retPath
  } catch (err) {
    console.log('error from seedImage: ', err)
  }
}

const createFilesAndImage = async (html, css, dir, userId, challengeId, width, height) => {
  await createFiles(html, css, userId, dir)
  console.log('made files')
  const data = await createImage(userId,  challengeId, dir, width, height)
  return data
}

// /******  PREVIEW ******/

const createImagePreview = async (userId, dir, imageWidth, imageHeight) => {
  try {
    // const image = await Image.findOne({ where: { challengeId } });
    const args = ['-–no-sandbox', '-–disable-setuid-sandbox']
    const browser = await puppeteer.launch({ args })
    const page = await browser.newPage()
    const retPath = `file://${path.join(process.cwd(), `${dir}${userId}.html`)}`
    await page.goto(retPath)
    await page.setViewport({ width: imageWidth, height: imageHeight })
    await page.screenshot({ path: `${dir}${userId}.png` })
    await browser.close()
    return retPath
  } catch (err) {
    console.log('error from createImage: ', err)
  }
}

// routes
app.post('/create-image', async (req, res, next) => {
  try {
    const { userId, challengeId, html, css, width, height } = req.body
    const dir = './server/tmp/'
    await createFiles(html, css, userId, dir)
    const data = await createImage(userId, challengeId, dir, width, height)
    res.send(JSON.stringify(data))
  } catch(e) {
    next(e)
  }
})

app.post('/seed-image', async (req, res, next) => {
  try {
    const { userId, challengeId, html, css, width, height } = req.body
    const dir = './server/tmp/'
    await createFiles(html, css, userId, dir)
    const data = await createImage(userId, challengeId, dir, 600, 337)
    res.send(JSON.stringify(data))
  } catch(e) {
    next(e)
  }
})

app.get('/puppy', async (req, res, next) => {
  try {
    console.log('puppy route')
    await puppy()
    console.log('ran successfully')
    res.sendStatus(204)
  } catch (e) {
    next(e)
//  res.status = 500
//  res.send(JSON.stringify(e))
  }
})

app.get('*', async (req, res, next) => {
  try {
    const args = ['--no-sandbox', '--disable-setuid-sandbox']
    const browser = await puppeteer.launch({ args })
    const page = await browser.newPage()
    await browser.close()
    res.send('hello')
  } catch (e) {
    res.send('did not start puppeteer')
  }
});

const port = process.env.PORT || 3001

app.listen(port, () => console.log('listening on port 3001...'))


