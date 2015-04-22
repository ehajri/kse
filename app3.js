// Application setup
var heapdump = require('heapdump');

var request = require('request');
var cheerio = require('cheerio');
var CONFIG = require('./hidden_config.js');
var Definitions = require('./models.js');
var orm = require('orm');
var Promise = require('promise');

function str_to_date(str) {
    var dtparts = str.split('-');
    var dt = new Date(dtparts[2], dtparts[1] - 1, dtparts[0]);
    str = null; dtparts = null;
    return dt;
}

function doreq() {
	console.log('Reading at', new Date().toTimeString());
    request(CONFIG.URL_1, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            var $ = cheerio.load(body);
            var table = $(CONFIG.TABLE_ID_1);
            var objs = [];
            table.find('tr+tr').each(function(a, tr) {
                var v = [];

                // push the id
                var h = $(tr).find('td').eq(0).find('a').attr('href').split('=')[1];
                v.push(h);
                
                // push rest of data
                $(tr).find('td+td').each(function(index, td) {
                    v.push($(td).text().trim());
                });

                v[11] = str_to_date(v[11]);
                objs.push(v);
            });
            $ = null;
            DuplicationCheck(objs)
            objs = null;
        }
        body = null;
        response = null;
    });
}

function SaveStock(records) {
	console.log('Writing', records.length, 'at', new Date().toTimeString());
	if (records.constructor !== Array  || records.length == 0) {
	    console.log('[SaveStock]', 'arg is not an array or is empty')
	    records = null;
	    Process();
    } else {
        var db  = orm.connect(CONFIG.CONNECTION_STRING);
        db.on('connect', function(error) {
        	if (error) {
        		throw error;
        	}
        	var Ticker = new Definitions.Tickers(db, CONFIG.DB_TABLE_1);
	
        	console.log('[SaveStock]', records.length);

        	/*Ticker.create(records, function (error, items) {
        		if (error) {
        		    Process();
        			throw error;
        		}

        db.close();			
        Process();
        	});*/
            db.close();
            records = null;
            console.log('[DB]', 'closed');
        	Process();
        });
    }
}

function DuplicationCheck(objs) {
	console.log('Checking for duplication (', objs.length, ' records)');
	Check(objs);
	//DELETE objs = null;
}
function getConnection() {
	return new Promise(
			function (resolve, reject) {
				orm.connect(CONFIG.CONNECTION_STRING, function (error, db) {
					if (error) {
						reject(error);
					} else {
					    console.log('[DB]', 'opened');
						resolve(db);
					}
				});
			})
}
function constructObject(array) {
    
    var obj = {
		ticker_id:  array[0],
		last: 		array[1],
		change: 	array[2],
		open: 		array[3],
		high: 		array[4],
		low: 		array[5],
		vol: 		array[6],
		trade: 		array[7],
		value: 		array[8],
		prev: 		array[9],
		ref: 		array[10],
		prev_date:  array[11],
		bid: 		array[12],
		ask: 		array[13]
    };
    array = null;
    return obj;
}
function Check(objs) {
	getConnection().then(function (db) {
		function checkExisting(array) {
			var _resolve, _reject, _obj;

            function cb1(error, result, obj) {
            	if (error) {
            		_reject(error);
            	} else {
            		var res = null;
            		if (result.length == 0) {
            			res = obj;
            		}
            		_resolve(res);
            	}
            }
            
			function cb2(resolve, reject) {
				_resolve = resolve; _reject = reject;
				var Ticker = getTicker(db);
				var o = constructObject(array);
				Ticker.find(o, function(error, result) { cb1(error, result, o); });
			}
			return new Promise(cb2);
		}
		console.log('[CheckThen]', objs.length);
		Promise.all(objs.map(checkExisting)).done(function (result) {
		    objs = null;
            tickermodel = null;
			db.close();
			db = null;
		    console.log('[DB]', 'closed');
			result = result.filter(function(n) { return n !== null; });
			if (result.length > 0) {
				SaveStock(result);
			} else {
			    Process();
			}
		});
	});
}
var tickermodel;
function getTicker(db) {
    if (!tickermodel) {
        tickermodel = new Definitions.Tickers(db, CONFIG.DB_TABLE_1);
    }
    return tickermodel;
}
function Process() {
    setTimeout(function() {
        doreq();
    }, 10000);
}
doreq();