const express = require('express');
const path = require('path');
const app = express();
const http =  require("http");
app.use('/', express.static(path.join(__dirname,'../dist'),{maxAge:'24h'}));
app.use(function(request, response) {
    try {
        response.sendFile(path.resolve('../dist/index.html'));
    }catch (e) {
        console.log(e);
    }
});
http.createServer(app).listen(3000, '0.0.0.0', function () {
    var host = this.address().address;
    var port = this.address().port;
    console.log('Service listening http at http://%s:%s', host, port);
});


