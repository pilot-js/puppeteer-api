const express = require('express')
const puppeteer = require('puppeteer')
const utils = require('./puppeteer-utils')
const path = require('path')

const app = express()

app.use(express.json())

app.post('/create-image', async (req, res, next) => {
  try {
    const { userId, challengeId, html, css, width, height } = req.body
    const dir = './server/tmp/'
    await utils.createFiles(html, css, userId, dir)
    const data = await utils.createImage(userId, challengeId, dir, width, height)
    res.send(JSON.stringify(data))
  } catch(e) {
    next(e)
  }
})

app.post('/seed-image', async (req, res, next) => {
  try {
    const { userId, challengeId, html, css, width, height } = req.body
    const dir = './server/tmp/'
    await utils.createFiles(html, css, userId, dir)
    const data = await utils.createImage(userId, challengeId, dir, 600, 337)
    res.send(JSON.stringify(data))
  } catch(e) {
    next(e)
  }
})

app.get('/puppy', async (req, res, next) => {
  try {
    console.log('puppy route')
    await utils.puppy()
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


