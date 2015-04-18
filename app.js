// Application setup
var orm = require('orm');
var jsdom = require("jsdom");
var util = require('util');
var fs = require('fs');
var Promise = require('promise');
var jquery = fs.readFileSync('./jquery.js', 'utf-8')
var Definitions = require('./models.js');
var CONFIG = require('./hidden_config.js');


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
App.Init();
var str_to_date = function(str) {
	var dtparts = str.split('-');
	var dt = new Date(dtparts[2], dtparts[1] - 1, dtparts[0]);
	return dt;
};
var doThisThing = function(result) {
	if (result.length === 0)
}



var DuplicationCheck = function(objs) {
	
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
var Func1 = function(o) {
	return myfind({ticker_id: o.ticker_id, prev_date: o.prev_date}).then(doThisThing);
}
var Func2 = function(myfind) {
	return Promise.all(objs.map(Func1()).done(function(objs2) {
		/*objs2.forEach(function(o) {
			//console.log(typeof o.length);
		});*/
		//console.log(objs2);
		db.close();
	});
}
