// Application setup
var orm = require('orm');
var jsdom = require("jsdom");
var fs = require('fs');
var jquery = fs.readFileSync('./jquery.js', 'utf-8')
var Definitions = require('./models.js');
var Passwords = require('./password.js');

// Application
var App = {
	Init: function() {
		setTimeout(
			function(t) {
				t.ReadStock();
			}(this),
			1000
		);
	},
	DuplicationCheck: function(objs) {
		//objs.forEach(o)
	},
	SaveStock: function(records) {
		var db  = orm.connect(Passwords.CONNECTION_STRING);
		db.on('connect', function(error) {
			if (error) {
				throw error;
			}
			var Ticker = new Definitions.Ticker(db);

			Ticker.create(records, function (error, items) {
				if (error) {
					throw error;
				}
				db.close();
			});
		});
	},
	ReadStock: function() {
		var self = this;
		jsdom.env({
			url: Passwords.URL1,
			src: [jquery],
			encoding: 'utf8',
			done: function (errors, window) {
				if (errors) { throw errors; };
				var $ = window.$;
				var table = $('****');
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
				//self.DuplicationCheck(objs);
				self.SaveStock(objs);
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
