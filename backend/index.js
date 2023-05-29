const connectToMongo = require('./db');
const express = require('express');
var cors = require('cors');

connectToMongo();
const app = express();
const port = 5000;

// this is used so json requests and responses can be handled with this
app.use(express.json());
// cors are used so we can make direct api calls from browser
app.use(cors());

app.use("/api/auth", require("./routes/auth"));
app.use("/api/notes", require("./routes/notes"));

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
});