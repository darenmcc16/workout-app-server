require("dotenv").config()
const bodyParser = require("body-parser")
const express = require("express")
const morgan = require("morgan")
const cors = require("cors")
const helmet = require("helmet")

//API middlewares 

//equivalent of fetch in node
const unirest = require("unirest");


//helping unirest to make secure or unsecure connection
const https = require("https");
const http = require("http");
//events is helping node to store the data
const events = require("events");

const { NODE_ENV, apiKey } = require("./config");
const errorHandler = require('./middleware/error-handler')
const pancakeRouter = require('./pancake/pancake-router')
const authRouter = require("./auth/auth-router");
const usersRouter = require("./users/users-router");
const workoutRouter = require('./workout-list/workout-router')

const app = express()

const morganOption = (NODE_ENV === 'production') ?
    'tiny' :
    'common';

app.use(morgan(morganOption, {
    skip: () => NODE_ENV === 'test',
}))
app.use(cors())
app.use(helmet())

app.use(express.static('public'))

app.use(bodyParser.json());

/////////////////////////////////////////////////////////////////////////////////////////
//external API calls
/////////////////////////////////////////////////////////////////////////////////////////


let getApiYoutube = function (term) {
    
    let emitter = new events.EventEmitter();
	let youtubeApiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${term}&key=AIzaSyDpDwx_xK2tomJ1kPgFhl8tR1YVtfcWiJ0`
    unirest
        .get(youtubeApiUrl)
        .header({
            "Content-type": "application/json",
            "Accept": "application/json",
            //"Authorization": `Bearer AR1A4o2vY-XwhkC7bAGVtkl-aubuxn7QfV7q3uoCS1dZPi_qh2gxtf-p2h7RgZDXvpEgQX0g8477c_ioTknew-oCZspyOWmlr381KWfxTLot3DXIldjr8La7cg83YHYx`,
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization',
            'Access-Control-Allow-Methods': 'GET'
        })
        .end(function (result) {
            //console.log("result",result)
            if (result.status === 200) {
				//console.log("result.data", result.data);
				emitter.emit("end", result.body);
			}
			else {
				emitter.emit("error", result.status);
			}
        });
    return emitter;
};

/////////////////////////////////////////////////////////////////////////////////////////
// local API endpoints
/////////////////////////////////////////////////////////////////////////////////////////

app.get("/api/video-api-data/:term", function (req, res) {

    //external api function call and response
    let searchReq = getApiYoutube(req.params.term);

    //get the data from the first api call
    searchReq.on("end", function (youtubeApiResults) {
        console.log("youtubeApiResults", youtubeApiResults);
       
        res.json(youtubeApiResults);
    });

    //error handling
    searchReq.on("error", function (code) {
        res.sendStatus(code);
    });
});

//Load user login router
app.use("/api/auth", authRouter);
//Load user registration router
app.use("/api/gym-hero-users", usersRouter);
app.use('/api/workout-plan', workoutRouter);
app.use('/api/pancakes', pancakeRouter)
app.use(errorHandler)

module.exports = app
