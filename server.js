const express = require('express')
const puppeteer = require('puppeteer')

const app = express()

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
const egg = 'yum'

app.listen(port, () => console.log('listening on port 3001...'))


