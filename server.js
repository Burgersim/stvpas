const express = require('express');
//var path = require('path');
const serveStatic = require('serve-static');
const pasSync = require("./src/functions/pasSync.js");
const DelayedResponse = require("http-delayed-response");
const app = express();
app.use(serveStatic(__dirname + "/dist"));
const port = process.env.PORT || 5000;


app.get('/api/premieringAssetSync', async (req, res) => {
    let delayed = new DelayedResponse(req, res);
    delayed.start();
    let promise = dataCall();
    // will eventually end when the promise is fulfilled
    delayed.end(promise);
    console.log("fetchCrepoData Function called")
    let elapsed = 'nothing happened';
    async function dataCall(){
        await pasSync.pasSync().then((res) => {
            elapsed = res;
        })
            .then(() => {
                res.end(elapsed);
                //res.elapsedTime = '3000 ms';
            })
            .catch((err) => {
                console.error("Error: " + err.message)
                elapsed = "Error: " + err.message
                res.end(elapsed)
            });
    }
});

/*
// SIMPLE 404 NET
app.get('*', (req, res) => {
    res.status(404).send('404 NOT FOUND');
});

app.post('*', (req, res) => {
    res.status(404).send('404 NOT FOUND');
});

app.put('*', (req, res) => {
    res.status(404).send('404 NOT FOUND');
});

app.delete('*', (req, res) => {
    res.status(404).send('404 NOT FOUND');
});
 */



app.listen(port);
console.log('server started '+ port);