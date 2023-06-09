const express = require("express");
const dotenv = require("dotenv");
const keywordroutes = require("./routes/keyword.routes")
const app = express();
const connectDB = require("./config/db")

dotenv.config();
app.use(express.json());
// app.use(bodyParser.urlencoded({ limit: "900mb", extended: true }));
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "*");
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
    res.header("Access-Control-Request-Headers", "GET, PUT, POST, DELETE");
    next();
});


app.use("/api/keyword", keywordroutes)

const PORT = process.env.PORT || 5000

app.listen(PORT, async () => {

    await connectDB();
    console.log(`App listening on port: ${PORT}`)
})
