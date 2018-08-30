const express = require('express')
const port = 2280
const app = express()

app.get('/', (request, response) => {
//    response.send('Hello')
    console.log('read and received')
    throw new Error('ooops')
})


app.use((err, request, response, next) => {
    console.log('wr0000ng', err)
    response.status(500).send('Something said no.')
})


app.listen(port, (err) => {
    if (err) {
        return console.log('s0mething went wr0ng', err)
    }

    console.log(`server listening on port ${port}`)
})

