const express = require('express')
const app = express()
var open = require("open");
app.use(express.static('./coverage/lcov-report'))
open("http://localhost:3000");
app.listen(3000, () => console.log('Example app listening on port 3000!'))