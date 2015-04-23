// Application setup
//var heapdump = require('heapdump');
var Func = require('./functions');
Array.prototype.indexOf2 = Func.indexOf2;

var mocks       = require('./mocks');

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

function Fire() {
	//console.log('Reading at', new Date().toTimeString());
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

function DuplicationCheck(objs) {
	//console.log('Checking for duplication (', objs.length, ' records)');
	var objs2 = objs.map(function(a) { return constructObject(a); });
	var obj3 = objs2.filter(function(a) {
	    for (var i = 0, l = App.Latest.length; i < l; i++) {
	        if (App.Latest[i].ticker_id === a.ticker_id &&
	            App.Latest[i].last      === a.last &&
	            App.Latest[i].change    === a.change &&
	            App.Latest[i].open      === a.open &&
	            App.Latest[i].high      === a.high &&
	            App.Latest[i].low       === a.low &&
	            App.Latest[i].vol       === a.vol &&
	            App.Latest[i].trade     === a.trade &&
	            App.Latest[i].value     === a.value &&
	            App.Latest[i].prev      === a.prev &&
	            App.Latest[i].ref       === a.ref &&
	            App.Latest[i].prev_date === a.prev_date &&
	            App.Latest[i].bid       === a.bid &&
	            App.Latest[i].ask       === a.ask)
            {
                return false;
            }
	    }
	    return true;
    });
    
    for (var i = 0, l = App.Latest.length; i < l; i++) {
        for (var j = 0, k = objs2.length; j < k; j++) {
            if (objs2[j].ticker_id == App.Latest[i].ticker_id) {
                //console.log('in App.Latest:');
                console.log(App.Latest[i]);//Print(App.Latest[i]);
                //console.log('in Objs:');
                console.log(objs2[j]);//Print(objs2[j]);
                //console.log("****************************");
                break;
            }
        }
    }

	//console.log(objs.length, objs2.length, obj3.length, App.Latest.length);
	SaveStock(obj3);
}

function SaveStock(records) {
	//console.log('Writing', records.length, 'at', new Date().toTimeString());
	if (records.constructor !== Array  || records.length == 0) {
	    //console.log('[SaveStock]', 'arg is not an array or is empty');
	    records = null;
	    StartCycle();
    } else {
        var db  = orm.connect(CONFIG.CONNECTION_STRING);
        db.on('connect', function(error) {
        	if (error) {
        		throw error;
        	}
        	//console.log('[DB]', 'opened');
        	
        	var Ticker = new Definitions.Tickers(db, CONFIG.DB_TABLE_1);
	
        	//console.log('[SaveStock]', records.length);

        	/*Ticker.create(records, function (error, items) {
        		if (error) {
        		    Process();
        			throw error;
        		}

                db.close();
                Process();
        	});*/
            records = null;
        	UpdateLatest(db);
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
					    //console.log('[DB]', 'opened');
						resolve(db);
					}
				});
			})
}

function constructObject(array) {
    var array2 = array.map(function(a) { if (a === '') { return 0; } return a; });
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
    //Print(obj);
    array = array2;
    obj = {
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
    
    //Print(obj);
    array = null;
    return obj;
}
function Print(t) {
    console.log('ticker_id', t.ticker_id, 'last', t.last, 'change', t.change, 'open', t.open,
                'high', t.high, 'low', t.low, 'vol', t.vol, 'trade', t.trade, 'value', t.value,
                'prev', t.prev, 'ref', t.ref, 'prev_date', t.prev_date, 'bid', t.bid, 'ask', t.ask);
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
		//console.log('[CheckThen]', objs.length);
		Promise.all(objs.map(checkExisting)).done(function (result) {
		    objs = null;
			db.close();
			db = null;
		    //console.log('[DB]', 'closed');
			result = result.filter(function(n) { return n !== null; });
			if (result.length > 0) {
				SaveStock(result);
			} else {
			    StartCycle();
			}
		});
	});
}

var App = {
    Latest: []
}
function StartCycle() {
    /*App.Latest.forEach(function(a) {
       console.log(a); 
    });*/
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
        //console.log('[DB]', 'closed');
        StartCycle();
    });
    
}

function Init() {
    //console.log('Starting..');

    /*getConnection().then(function(db) {
        UpdateLatest(db);
    }).catch(function(error) {
        //console.log('DB', error.code);
    });*/
    
    console.log("Hello");
    var m1 = mocks.Mock1();
    var m2 = mocks.Mock2();
    
    console.log(equals(m1[1], m1[1]));
    console.log(equals(m1[1], m2[1]));
}
var replaceAll = function(find, replace, str) { return str.replace(new RegExp(find, 'g'), replace); }

var equals = function(o1, o2) {
    if (o1.ticker_id === o2.ticker_id && o1.last === o2.last && o1.change === o2.change && o1.open === o2.open &&
        o1.high === o2.high && o1.low === o2.low && o1.vol === o2.vol && o1.trade === o2.trade &&
        o1.value === o2.value && o1.prev === o2.prev && o1.ref === o2.ref && o1.prev_date === o2.prev_date &&
        o1.bid === o2.bid && o1.ask === o2.ask) {
       return true;
    }
    return false;
}
Init();