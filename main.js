console.log('server launching...')

const express = require('express')
const app = express()

app.get('/', (request, response) => {
    response.send('my-appstore')
})

app.listen(8888, () => {
    console.log('server listening on port 8888')
})
