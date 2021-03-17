const OdinssonBot = require('./OdinssonBot.js');

const MasterLogger = require('./loggers/MasterLogger.js');
const ConsoleLogger = require('./loggers/ConsoleLogger.js');
const FileLogger = require('./loggers/FileLogger.js');

const JavascriptLoader = require('./loaders/JavascriptLoader.js');

const JsonDatabase = require('./databases/JsonDatabase.js');

const config = require('./odinsson_config.json');
const path = require('path');

/*********** CREATE LOGGERS **********/

const loggers = []
loggers.push(new ConsoleLogger());
loggers.push(new FileLogger(`${path.join(__dirname, config.logging.file_location)}/log.txt`));

const masterLogger = new MasterLogger(loggers);

/*********** LOAD COMMANDS ***********/

const loader = new JavascriptLoader(masterLogger);
const commands = loader.load(path.join(__dirname, 'commands'))

/********** READY DATABASES **********/

const database = new JsonDatabase(path.join(__dirname, config.databases.json_location), 'database.json', {}, masterLogger);

/************* START BOT *************/

const odinsson = new OdinssonBot(config, commands, masterLogger, database);
odinsson.prepare();
odinsson.load(commands);
odinsson.listen();

/*************** RELAX ***************/
