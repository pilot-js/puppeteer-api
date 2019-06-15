const express = require('express')
const puppeteer = require('puppeteer')

const app = express()

app.get('*', async (req, res, next) => {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await browser.close()
  res.send('hello')
});

const port = process.env.PORT || 3001
const egg = 'yum'

app.listen(port, () => console.log('listening on port 3001...'))


