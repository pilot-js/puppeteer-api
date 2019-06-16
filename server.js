const express = require('express')
const puppeteer = require('puppeteer')
const path = require('path')

const { convertBufferToImgSrc, compareImages, mkdir, parseHTML, readFile, writeFile } = require('./utils')

const app = express()

app.use(express.json())

// helper functions 

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
    const { html, css, userId, challengeId, width, height } = req.body
    const dir = path.join(__dirname, './tmp/')
    const fileName = `${userId}-${challengeId}`
    await mkdir(dir)
    await writeFile(`${dir}${fileName}.html`, parseHTML(html, userId))
    await writeFile(`${dir}${fileName}.css`, css)
    const args = ['--no-sandbox', '--disable-setuid-sandbox']
    const browser = await puppeteer.launch({ args })
    const page = await browser.newPage()
    await page.goto(`file://${dir}${fileName}.html`)
    await page.setViewport({ width, height })
    await page.screenshot({ path: `${dir}${fileName}.png` })
    await browser.close()
    const data = await readFile(`${dir}${fileName}.png`)
    const obj = JSON.parse(JSON.stringify(data))
    const src = convertBufferToImgSrc(obj)
    console.log(src)
    res.send(src)
  } catch (err) {
    next(err)
  }
})

const DEFAULT_WIDTH = 600
const DEFAULT_HEIGHT = 337

app.post('/seed-image', async (req, res, next) => {
  try {
    const { html, css, userId, challengeId } = req.body
    const dir = path.join(__dirname, './tmp/')
    await mkdir(dir)
    await writeFile(`${dir}${userId}.html`, parseHTML(html, userId))
    await writeFile(`${dir}${userId}.css`, css)
    const args = ['--no-sandbox', '--disable-setuid-sandbox']
    const browser = await puppeteer.launch({ args })
    const page = await browser.newPage()
    await page.goto(`file://${dir}${userId}.html`)
    await page.setViewport({ width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT })
    await browser.close()
    const data = await readFile(`${dir}${userId}.png`)
    const obj = JSON.parse(JSON.stringify(data))
    const src = convertBufferToImgSrc(obj)
    res.send(src)
  } catch (err) {
    next(err)
  }
})

app.post('/compare-images', async (req, res, next) => {
  try {
    const { userchallenge, challenge, width, height, userId } = req.body
    const dir = path.join(__dirname, './tmp/')
    await mkdir(dir)
    // create userchallenge image
    const userchallengeFileName = `${userId}-${userchallenge.id}`
    await writeFile(`${dir}${userchallengeFileName}.html`, parseHTML(userchallenge.html, userId))
    await writeFile(`${dir}${userchallengeFileName}.css`, userchallenge.css)
    const args = ['--no-sandbox', '--disable-setuid-sandbox']
    const browser = await puppeteer.launch({ args })
    const userchallengePage = await browser.newPage()
    await userchallengePage.goto(`file://${dir}${userchallengeFileName}.html`)
    await userchallengePage.setViewport({ width, height })
    await userchallengePage.screenshot({ path: `${dir}${userchallengeFileName}.png` })
    // create challenge image
    const challengeFileName = `${userId}-${challenge.id}`
    await writeFile(`${dir}${challengeFileName}.html`, parseHTML(challenge.solutions[0].html, userId))
    await writeFile(`${dir}${challengeFileName}.css`, challenge.solutions[0].css)
    const challengePage = await browser.newPage()
    await challengePage.goto(`file://${dir}${challengeFileName}.html`)
    await challengePage.setViewport({ width, height })
    await challengePage.screenshot({ path: `${dir}${challengeFileName}.png` })
    await browser.close()
    // compare images
    const percentMatch = await compareImages(
      `${dir}${userchallengeFileName}.png`,
      `${dir}${challengeFileName}.png`,
      dir,
      width,
      height,
      userId);
    const diffImageData = await readFile(`${dir}diffImage.diff.png`);
    const data = JSON.parse(JSON.stringify(diffImageData))
    const diffImage = convertBufferToImgSrc(data)
    res.send({ percentMatch, src: diffImage })
  } catch (e) {
    next(e)
  }

})

app.get('/puppy', async (req, res, next) => {
  try {
    const args = ['--no-sandbox', '--disable-setuid-sandbox']
    const browser = await puppeteer.launch({ args })
    const page = await browser.newPage()
    await browser.close()
    res.send('puppy')
  } catch (e) {
    next(e)
  }
})

app.get('/', async (req, res, next) => {
  try {
    const args = ['--no-sandbox', '--disable-setuid-sandbox']
    const browser = await puppeteer.launch({ args })
    const page = await browser.newPage()
    await browser.close()
    res.send('hello')
  } catch (e) {
    res.send('did not start puppeteer')
  }
})

const port = process.env.PORT || 3001

app.listen(port, () => console.log('listening on port 3001...'))
