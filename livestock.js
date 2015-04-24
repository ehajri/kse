// Application setup
var request     = require('request');
var cheerio     = require('cheerio');
var CONFIG      = require('./hidden_config.js');
var Definitions = require('./models.js');
var orm         = require('orm');
var Promise     = require('promise');

function str_to_date(str) {
    var dtparts = str.split('-');
    var dt = new Date(dtparts[2], dtparts[1] - 1, dtparts[0]);
    str = null; dtparts = null;
    return dt;
}
function getSystemTimestamp() {
    return new Date().toTimeString().split(' ')[0];
}
function Fire() {
	console.log(getSystemTimestamp(), 'Reading stocks..');
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
                    v.push(replaceAll(',', '', $(td).text().trim()));
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
function Filter(objs1, objs2) {
    return objs2.filter(function(a) {
	    for (var i = 0, l = objs1.length; i < l; i++) {
	        if (equals(a, objs1[i])) {
                return false;
            }
	    }
	    return true;
    });
}
function AnalyzeObject(obj) {
    if (typeof obj !== 'object') return;
    console.log('\tProperty\t\ttype\t\t\tvalue');
    for (var p in obj) {
        if (obj.hasOwnProperty(p)) {
            console.log('\t' + p + '\t\t' + typeof obj[p] + '\t\t\t' + obj[p]);
        }
    }
}
function getTickerObjFromArrayById(array, id) {
    for (var i = 0, l = array.length; i < l; i++) {
        if (array[i].ticker_id === id) {
            return array[i];
        }
    }
    return null;
}
function DuplicationCheck(array) {
	console.log(getSystemTimestamp(), 'Checking for duplication (' + array.length, 'records)');
	var objs = array.map(function(a) { return constructObject(a); });
	var objs = Filter(App.Latest, objs);
	
    console.log(getSystemTimestamp(), array.length - objs.length, 'found.', objs.length, 'to store.');
	SaveStock(objs);
}

function SaveStock(records) {
	console.log(getSystemTimestamp(), 'Writing', records.length, 'records');
	if (records.constructor !== Array  || records.length == 0) {
	    console.log(getSystemTimestamp(), 'arg is not an array or is empty');
	    records = null;
	    StartCycle();
    } else {
        var db  = orm.connect(CONFIG.CONNECTION_STRING);
        db.on('connect', function(error) {
        	if (error) {
        		throw error;
        	}
        	console.log(getSystemTimestamp(), '[DB]', 'opened');
        	
        	var Ticker = new Definitions.Tickers(db, CONFIG.DB_TABLE_1);
	
        	Ticker.create(records, function (error, items) {
        		if (error) {
        		    Process();
        			throw error;
        		}

                records = null;
            	UpdateLatest(db);
            });
        });
    }
}

function getConnection() {
	return new Promise(
			function (resolve, reject) {
				orm.connect(CONFIG.CONNECTION_STRING, function (error, db) {
					if (error) {
						reject(error);
					} else {
					    console.log(getSystemTimestamp(), '[DB]', 'opened');
						resolve(db);
					}
				});
			})
}

function constructObject(array) {
    array = array.map(function(a, b) {
        if (b === 11) { return a; }
        return Number(a);
    });
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
function Print(t) {
    console.log('ticker_id', t.ticker_id, 'last', t.last, 'change', t.change, 'open', t.open,
                'high', t.high, 'low', t.low, 'vol', t.vol, 'trade', t.trade, 'value', t.value,
                'prev', t.prev, 'ref', t.ref, 'prev_date', t.prev_date, 'bid', t.bid, 'ask', t.ask);
}

var App = {
    Latest: []
}
function StartCycle() {
    setTimeout(function() {
        Fire();
    }, 5000);
}

function UpdateLatest(db) {
    var sql  = 'SELECT `ticker_id`, `last`, `change`, `open`, `high`, `low`, `vol`, `trade`, `value`, `prev`, `ref`,';
        sql += '`prev_date`, `bid`, `ask` FROM RQuotes INNER JOIN';
        sql += '(SELECT `ticker_id`, MAX(`timestamp`) AS `timestamp` FROM RQuotes GROUP BY `ticker_id`)';
        sql += 'AS T1 USING(`ticker_id`, `timestamp`) order by ticker_id asc';

    db.driver.execQuery(sql, function(error, data) {
        App.Latest = data;
        db.close();
        console.log(getSystemTimestamp(),'[DB]', 'closed');
        StartCycle();
    });
    
}

function Init() {
    console.log(getSystemTimestamp(),'Starting..');

    getConnection().then(function(db) {
        UpdateLatest(db);
    }).catch(function(error) {
        console.log(getSystemTimestamp(),'DB', error.code);
    });
}
var replaceAll = function(find, replace, str) { return str.replace(new RegExp(find, 'g'), replace); }

function equals(o1, o2) {
    if (o1.ticker_id === o2.ticker_id && o1.last === o2.last && o1.change === o2.change && o1.open === o2.open &&
        o1.high === o2.high && o1.low === o2.low && o1.vol === o2.vol && o1.trade === o2.trade &&
        o1.value === o2.value && o1.prev === o2.prev && o1.ref === o2.ref && +o1.prev_date === +o2.prev_date &&
        o1.bid === o2.bid && o1.ask === o2.ask) {
       return true;
    }
    return false;
}
Init();