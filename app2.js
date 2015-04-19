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

// Application
var App = {
	Init: function() {
		var self = this;
		setTimeout(
			function() {
				self.ReadStock();
			},
			1000
		);
	},
	SaveStock: function(records) {
		console.log('Writing', records.length, 'at', new Date().toTimeString());
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
		var self = this;
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
							txt = $(td).text().trim();
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
};
//App.Init();
var str_to_date = function(str) {
	var dtparts = str.split('-');
	var dt = new Date(dtparts[2], dtparts[1] - 1, dtparts[0]);
	return dt;
};
var doThisThing = function(result) {
	if (result.length === 0) {
		
	}
}


var alternate = 0;
var DuplicationCheck = function(objs) {
	objs = objs.slice(-5);
	CheckAll(objs).done(function(results) {
		console.log('CheckAll is *done*');
		console.log(results);
	}, function(error) {
		console.log('CheckAll returned an error');
		console.log(error);
	});
}
var CheckAll = function(objs) {
	console.log('CheckAll is called');
	return Promise.all(objs.map(CheckEach));
}

var CheckEach = function(obj, callback) {
	console.log('CheckEach is called for', obj.ticker_id);
	orm.connect(CONFIG.CONNECTION_STRING, function(error, db) {
		if(error) { throw error; }
		
		var Ticker = new Definitions.Tickers(db, CONFIG.DB_TABLE_1);
		
		var a = Ticker.find({ticker_id: obj.ticker_id, prev_date: obj.prev_date});
		console.log(obj.ticker_id, 'has', a.length);
		db.close();
		return Promise.resolve(a);
		
	});
}
var myormthenfunc = function (arg1, arg2, arg3, arg4) {
	console.log('MyOrmThenFunc is called with', arg1, arg2, arg3, arg4);
}
var otherfunc = function(objs) {
	var p = Promise.re
	// crap. need rework and make better Promises.
	console.log('checking', objs.length, 'objects');
	var self = this;
	var db  = orm.connect(CONFIG.CONNECTION_STRING);
	var newobjs = [];
	db.on('connect', function(error) {
		if (error) {
			throw error;
		}
		var Ticker = new Definitions.Tickers(db, CONFIG.DB_TABLE_1);
		var myfind = Promise.denodeify(Ticker.find);
		Promise.resolve(Func2(myfind)).then(function(x) { console.log('resolved'); });
		
	});
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
					if (error) { reject(error); }
					else { resolve(db); } }
				);
			})
}
function checkExisting(obj) {
	return getConnection()
		   .then(function (db) {
				return new Promise(
					   	function (resolve, reject) {
							new Definitions.Tickers(db, CONFIG.DB_TABLE_1).find({ticker_id: obj.ticker_id, prev_date: obj.prev_date}),
							function (error, result) {
								if (error) {
									reject(error);
								} else {
									db.close();
									resolve(result);
								}
							}
						}
				);
			});
}

checkExisting({ticker_id: 108, prev_date: new Date(2015, 3, 16)}).then(function (result) {
	console.log('hello');
}).catch(function (error) {
	console.log('catched');
});