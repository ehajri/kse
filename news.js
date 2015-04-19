 var orm = require('orm');
var jsdom = require('jsdom');
var fs = require('fs');
var util = require('util');
var Definitions = require('./models.js');
var Promise = require('promise');
var CONFIG = require('./hidden_config.js');
var jquery = fs.readFileSync('./jquery.js', 'utf-8')

jsdom.env(
	CONFIG.URL_4,
	[],
	{src: jquery},
	function(errors, window) {
		if (errors) { throw errors; }
		console.log('Reading at', new Date().toTimeString());
		var $ = window.$;
		var table = $(CONFIG.TABLE_ID_4);
		var objs = [];
		$('tr', table).each(function(a, tr) {
			if (a == 0) return;
			var v = [];
			$('td', tr).each(function (b, td) {
				var td = $(td), txt = '';
				if (b == 0) {
					v.push($('a', td).attr('href'));
				}
				txt = $(td).text().trim();
				v.push(txt);
			});
			var obj = {
				url		 	: v[0],
				headline	: v[1],
				date		: v[2]
			};
			obj['date'] = str_to_date2(obj['date']);
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
		var News = new Definitions.News(db, CONFIG.DB_TABLE_5);

		News.create(records, function (error, items) {
			if (error) {
				throw error;
			}
			db.close();
		});
	});
}
var str_to_date2 = function(str) {
	var tmparts = str.split(':');
	var dt = new Date(new Date().setHours(tmparts[0], tmparts[1], tmparts[2]));
	return dt;
};
