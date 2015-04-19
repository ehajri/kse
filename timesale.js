var orm = require('orm');
var jsdom = require('jsdom');
var qOrm = require('q-orm');
var fs = require('fs');
var util = require('util');
var Definitions = require('./models.js');
var Promise = require('promise');
var CONFIG = require('./hidden_config.js');
var myenv = Promise.denodeify(jsdom.env);
var jquery = fs.readFileSync('./jquery.js', 'utf-8')

var findtickers = function() {
	return qOrm.qConnect(CONFIG.CONNECTION_STRING)
	.then(function(db) {
		var Ticker = new Definitions.Ticker(db, CONFIG.DB_TABLE_3);
		var r = Ticker.qAll().then(function(a) { db.close(); return a; });
		//console.log('FOUND', r.length, 'tickers');
		return r;
	}).fail(function(error) { console.log('fail 1', error); throw error; })
}

var checkTimeAndSale = function(r) {
	console.log('CHECKING .. ');
	//r = r.slice(-5);
	return Promise.all(r.map(checkTimeAndSale2));
}
var checkTimeAndSale2 = function(obj, callback) {
	console.log('FOR', obj.ticker_id);
	return Promise.all([obj.ticker_id, myenv(
		util.format(CONFIG.URL_2, obj.ticker_id),
		[],
		{src: jquery}
	).then(ReadParticularTimeSale)])//.done(ParticularTimeAndSaleFetched);
}
var ParticularTimeAndSaleFetched = function (result) {
	if (result[1].length == 0) return;
	var a = result[1];
	a.forEach(function(e) {
		e.ticker_id = result[0];
	});
	console.log(result[0], 'has', a.length);
	return a;
}
var ReadParticularTimeSale = function(window) {
	var $ = window.$;
	var table = $(CONFIG.TABLE_ID_2);
	var objs = [];
	$('tr', table).each(function(a, tr) {
		if (a == 0) return;
		var v = [];
		$('td', tr).each(function (b, td) {
			if (b == 0) return;
			
			var td = $(td), txt = '';
			txt = replaceAll(',', '', $(td).text().trim());
			v.push(txt);
		});
		if (v[0] === '' || v[1] === '' || v[2] === '') return;
		var obj = {
			ticker_id: 	0,
			price:		v[0],
			quantity:	v[1],
			datetime:	v[2]
		};
		obj['datetime'] = str_to_date2(obj['datetime']);
		objs.push(obj);
	});
	console.log('FOUND', objs.length);
	return objs;
}
var InsertTimeAndSaleIntoDB = function (objs) {
	var db  = orm.connect(CONFIG.CONNECTION_STRING);
	db.on('connect', function(error) {
		if (error) {
			throw error;
		}
		var Ticker = new Definitions.TimeSale(db, CONFIG.DB_TABLE_2);

		Ticker.create(objs, function (error, items) {
			if (error) {
				throw error;
			}
			console.log('INSERTED', objs.length);
			db.close();
		});
	});
}
var p = Promise.resolve(findtickers());

p.then(function(r) {
	checkTimeAndSale(r).done(function(result) {
		var objs = []
		result.forEach(function(a) {
			a[1].forEach(function(b) {
				b.ticker_id = a[0];
				objs.push(b);
			});
		});
		console.log('PREPARING TO INSERT', objs.length);
		InsertTimeAndSaleIntoDB(objs);
	});
});
var str_to_date2 = function(str) {
	var tmparts = str.split(':');
	var dt = new Date(new Date().setHours(tmparts[0], tmparts[1], tmparts[2]));
	return dt;
};
var replaceAll = function(find, replace, str) { return str.replace(new RegExp(find, 'g'), replace); }
