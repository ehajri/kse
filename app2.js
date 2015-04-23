// Application setup
var orm = require('orm');
var jsdom = require("jsdom");
var util = require('util');
var fs = require('fs');
var Promise = require('promise');
var jquery = fs.readFileSync('./jquery.js', 'utf-8')
var Definitions = require('./models.js');
var CONFIG = require('./hidden_config.js');
var myorm = Promise.denodeify(require('orm').connect);
var clone = require('clone');

// Application
var App = {
	Init: function() {
		setInterval(
			function() {
				App.ReadStock();
			}
		, 20000);
	},
	SaveStock: function(records) {
		console.log('Writing', records.length, 'at', new Date().toTimeString());
		if (!util.isArray(records) || records.length == 0) { return; }
		var db  = orm.connect(CONFIG.CONNECTION_STRING);
		db.on('connect', function(error) {
			if (error) {
				throw error;
			}
			var Ticker = new Definitions.Tickers(db, CONFIG.DB_TABLE_1);

			Ticker.create(records, function (error, items) {
				if (error) {
					throw error;
				}
				db.close();
			});
		});
	},
	ReadStock: function() {
		console.log('Reading at', new Date().toTimeString());
		jsdom.env({
			url: CONFIG.URL_1,
			src: [jquery],
			encoding: 'utf8',
			done: function (errors, window) {
				if (errors) { throw errors; };
				var $ = window.$;
				var table = $(CONFIG.TABLE_ID_1);
				var objs = [];
				$('tr', table).each(function(a, tr) {
					if (a == 0) return;
					var v = [];
					$('td', tr).each(function (b, td) {
						var td = $(td), txt = '';
						if (b == 0) {
							var a = $('a', td).attr('href');
							txt = a.split('=')[1];
						} else {
							txt = replaceAll(',', '', $(td).text().trim());
						}
						v.push(txt);
					});
					var obj = {
						ticker_id: v[0],		last: v[1],		change: v[2],
						open: v[3],				high: v[4],		low: v[5],
						vol: v[6],				trade: v[7],	value: v[8],
						prev: v[9],				ref: v[10],		prev_date: v[11],
						bid: v[12],				ask: v[13]
					};
					obj['prev_date'] = str_to_date(obj['prev_date']);
					objs.push(obj);
				});
				DuplicationCheck(objs);
				//self.SaveStock(objs);
			},
		});
	}
}
App.Init();
var str_to_date = function(str) {
	var dtparts = str.split('-');
	var dt = new Date(dtparts[2], dtparts[1] - 1, dtparts[0]);
	return dt;
};

var DuplicationCheck = function(objs) {
	console.log('Checking for duplication (', objs.length, ' records)');
	Check(objs);
}

// thanks to ljharb:#node.js@freenode
/*function getConnection() {
	return new Promise(
			function (resolve, reject) {
				orm.connect(CONFIG.CONNECTION_STRING, function (error, db) {
					if (error) { reject(error); }
					else { resolve(db); } }
				);
			})
}
function checkExisting(objs) {
	return getConnection()
		   .then(function (db) {
				return new Promise(
					   	function (resolve, reject) {
							db.omodel.find(…),
							function (error, result) {
								if (error) {
									reject(error);
								} else {
									resolve(result);
								}
							}
						}
				);
			});
}
checkExisting(objs).then(function (result) {
	
}).catch(function (error) {
	
});*/

function getConnection() {
	return new Promise(
			function (resolve, reject) {
				orm.connect(CONFIG.CONNECTION_STRING, function (error, db) {
					if (error) {
						reject(error);
					} else {
						resolve(db);
					}
				});
			})
}

function Check(objs) {
	getConnection().then(function (db) {
		function checkExisting(obj) {
			var _resolve, _reject;
			function cb1(error, result) {
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
				var Ticker = new Definitions.Tickers(db, CONFIG.DB_TABLE_1);
				var o = clone(obj); delete o['id']
				Ticker.find(o, cb1);
			}
			return new Promise(cb2);
		}
		Promise.all(objs.map(checkExisting)).done(function (result) {
			db.close();
			result = result.filter(function(n) { return n !== null; });
			if (result.length > 0) {
				App.SaveStock(result);
			} else {
			    console.log('No new records to write.');
			}
		});
	});
}

var replaceAll = function(find, replace, str) {
    return str.replace(new RegExp(find, 'g'), replace);
}