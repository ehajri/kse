 var orm = require('orm');
var jsdom = require('jsdom');
var fs = require('fs');
var util = require('util');
var Definitions = require('./models.js');
var Promise = require('promise');
var CONFIG = require('./hidden_config.js');
var jquery = fs.readFileSync('./jquery.js', 'utf-8')

jsdom.env(
	CONFIG.URL_3,
	[],
	{src: jquery},
	function(errors, window) {
		if (errors) { throw errors; }
		console.log('Reading at', new Date().toTimeString());
		var $ = window.$;
		var table = $(CONFIG.TABLE_ID_3);
		var objs = [];
		$('tr', table).each(function(a, tr) {
			if (a == 0) return;
			var v = [];
			$('td', tr).each(function (b, td) {
				var td = $(td), txt = '';
				if (b == 0) {
					var a = $('a', td).attr('href');
					txt = a.split('=')[1].split('&')[0];
				} else {
					txt = replaceAll(',', '', $(td).text().trim());
				}
				v.push(txt);
			});
			var obj = {
				ticker_id 	: v[0],
				price		: v[1],
				bid			: v[2],
				bid_qty		: v[3],
				ask			: v[4],
				ask_qty		: v[5]
			};
			objs.push(obj);
		});
		SaveIntoDB(objs);
	}
);
function SaveIntoDB(records) {
	console.log('Writing', records.length, 'at', new Date().toTimeString());
	if (!util.isArray(records) || records.length == 0) { return; }
	var db  = orm.connect(CONFIG.CONNECTION_STRING);
	db.on('connect', function(error) {
		if (error) {
			throw error;
		}
		var OBook = new Definitions.OBook(db, CONFIG.DB_TABLE_4);

		OBook.create(records, function (error, items) {
			if (error) {
				throw error;
			}
			db.close();
		});
	});
}
var replaceAll = function(find, replace, str) { return str.replace(new RegExp(find, 'g'), replace); }
