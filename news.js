var request     = require('request');
var cheerio     = require('cheerio');
var orm = require('orm');
var util = require('util');
var Definitions = require('./models.js');
var CONFIG = require('./hidden_config.js');


function getSystemTimestamp() {
    return new Date().toTimeString().split(' ')[0];
}

function Fire() {
	console.log(getSystemTimestamp(), 'Reading stocks..');
    request(CONFIG.URL_4, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            var $ = cheerio.load(body);
            var table = $(CONFIG.TABLE_ID_4);
    		var objs = [];
    		table.find('tr+tr').each(function(a, tr) {
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
    });
}

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

Fire();