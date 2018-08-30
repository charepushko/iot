const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const exphbs = require('express-handlebars')
const pg = require('pg')
const rp = require('request-promise')


const port = 8083
const app = express()
//const conString = process.env.DATABASE_URL || "postgres://localhost/iot"

var jsonParser = bodyParser.json({ type: 'application/json' })

const config = {
    user: 'iot',
    host: 'localhost',
    database: 'iot',
    password: 's77root'
}

var pool = new pg.Pool(config)

const strij = 'be39b077b5f2d84323117b8db24d59aed069b619fcf9550afe81684cd09fa93a'



// ~~~~~~~~~~~ BASICS ~~~~~~~~~~~~
//________________________________






app.engine('.hbs', exphbs({
    defaultLayout: 'main',
    extname: '.hbs',
    layoutsDir: path.join(__dirname, 'views/layouts')
}))

app.set('view engine', '.hbs')
app.set('views', path.join(__dirname, 'views'))



app.listen(port, (err) => {
    if (err) {
        return console.log('s0mething went wr0ng', err)
    }
    console.log(`server is listening on ${port}`)
})









app.get('/', (request, response) => {
    console.log('someone came!')

    rp({
        method: 'GET',
        uri: 'api.strij.cloud/api/devices/?access-token=be39b077b5f2d84323117b8db24d59aed069b619fcf9550afe81684cd09fa93a',
//        qs: {
//            access-token: strij
//        }
        json: true
    })

    .then((data) => {
        console.log(JSON.stringify(data))
    })

    .catch(function (err) {
        console.log('not connected to strij', err)
    })


    response.render('index', {
    })
})









// ~~~~~~~~~  PROVIDERS  ~~~~~~~~~
//________________________________






app.get('/ertele', (request, response) => {
    console.log('someone visited ertele!')
    var selection = {}

    pool.connect(function (err, client, done) {
        if (err) {
            console.log('connecting err')
            return next(err)
        }

        client.query('SELECT timestamp, device_id, payload_hex, date, time, provider FROM records WHERE provider=($1);', ["ErTelecom"], function (err, result) {
            if (err) {
                console.log('reading err')
                return next(err)
            }
            console.log(result.rows)
            var selection = result.rows


      response.render('data', {
          provider: 'ErTelecom',
          data: selection
      })

        })

    })





})


app.get('/strij', (request, response) => {
    console.log('someone visited strij!')

    response.render('data', {
        provider: 'Strij'
    })
})











// ~~~~~~~~~~~  POST  ~~~~~~~~~~~~
//________________________________




app.post('/', jsonParser, function (request, response, next) {
    console.log()
    console.log(' someone send new data!')
    message = request.body.DevEUI_uplink


/*        var dt = message.Time

        var dt_date = dt.slice(0, 10)
        var dt_time = dt.slice(11, 28)
        console.log()
        console.log(dt_date)
        console.log(dt_time)
*/


    pool.connect(function (err, client, done) {
        if (err) {
            console.log('connecting err')
            return next(err)
        }

        console.log('connected to db')


        client.query('INSERT INTO records (device_id, timestamp, payload_hex, provider) VALUES ($1, $2, $3, $4) ON CONFLICT (device_id, timestamp, payload_hex) DO NOTHING;', [message.DevEUI, message.Time, message.payload_hex, 'ErTelecom'], function (err, result) {
            done()
            if (err) {
                console.log('writing err')
                return next(err)
            }

        })

        client.query('SELECT timestamp, device_id, payload_hex, provider FROM records;', [], function (err, result) {
            if (err) {
                console.log('reading err')
                return next(err)
            }
            console.log(result.rows)
//            selection = result.rows
        })

    })

    response.render('home', {
        name: 'Ann'
    })


})







//____________________________________




//    throw new Error('ooops')
//const server = http.createServer(requestHandler)




//app.get('/', (request, response) => {
///    response.send('Hello IoT Server!')
//})





/*
app.use((err, request, response, next)  => {
    console.log(err)
    response.status(500).send(`S0mething went wr0ng`)

})
*/



/* const rqst = require('request-promise')
const options = {
    method : 'GET',
    uri : 'api.strij.cloud/api/devices/',
    qs : {
        access-token: be39b077b5f2d84323117b8db24d59aed069b619fcf9550afe81684cd09fa93a,
        per-page: 1000,
        page: 1
    },
    json : true
}

rqst(options)
    .then(function (response) {
    })
    .catch(function (err) {
        console.log('bad at the strij part')
    })

*/
