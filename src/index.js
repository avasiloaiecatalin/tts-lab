require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const { tts } = require('./utils/tts')
const mainRoutes = require('./routes/mainRoutes')

const app = express()
app.use(bodyParser.json())
app.use(mainRoutes)

app.get('/', (req, res) => {
    res.send('salutari') 
})

app.listen(process.env.API_PORT, async () => {
    console.log(`Listening on port ${process.env.API_PORT}.`)

})
