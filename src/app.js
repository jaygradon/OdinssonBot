const config = require('./odinsson_config.json');
const OdinssonBot = require('./OdinssonBot.js');
const ConsoleLogger = require('./loggers/ConsoleLogger.js');
const JavascriptLoader = require('./loaders/JavascriptLoader.js');
const path = require('path');

/*********** CREATE LOGGERS **********/

const loggers = []
loggers.push(new ConsoleLogger());

/*********** LOAD COMMANDS ***********/

const loader = new JavascriptLoader(loggers);
const commands = loader.load(path.join(__dirname, 'commands'))

/************* START BOT *************/

const odinsson = new OdinssonBot(config, commands, loggers);
odinsson.load(commands);
odinsson.listen();

/*************** RELAX ***************/
