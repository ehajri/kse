var jsdom = require("jsdom");
var fs = require('fs');
var jquery = fs.readFileSync('./jquery.js', 'utf-8')
var mysql  = require('mysql');

var DB = function(options) {
	this.host = options.host;
	this.user = options.user;
	this.password = options.password;
	var conn;

	return {
		Open: function() {
			conn = mysql.createConnection(options);
		},
		Connection: function() {
			return conn;
		}
	};
}
var Table = function(tablename, fields) {
	var _name = tablename
	var _fields = fields;
	return {
		GetName: function() { return _name; },
		GetFields: function() { return _fields; }
	}
}
var Repository = function(db) {
	var _db = db;
	var _changes = {toAdd: {tables: [], records: []}};
	return {
		Add: function(table, obj) {
			if (_changes.toAdd.tables.indexOf(table.GetName()) === -1) {
				_changes.toAdd.tables.push(table.GetName());
			}
			_changes.toAdd.records.push([table, obj]);
		},
		Save: function() {
			_db.Open();
			var _conn = _db.Connection();
			_conn.beginTransaction(function(error) {
				if (error) { throw error; }
				var _stop = false;
				var _error;
				_changes.toAdd.tables.forEach(function (table) {
					console.log('table', table);
					var objs = [];
					_changes.toAdd.records.forEach(function(record) {
						if (record[0].GetName() == table) {
							console.log('Adding record');
							objs.push(record[1]);
							console.log(objs);
						}
					});
					/*_conn.query('INSERT INTO ?? SET ?', [table, [objs]], function(error, result) {
						if (error) {
							_stop = true;
						}
					});*/
					var _q = _conn.query('INSERT INTO ?? (ticker_id, `last`, `change`, `open`, high, low, vol, trade, `value`, `prev`, ref, pref_date, bid, ask) VALUES ?', [table, objs], function(error, result) {
						if (error) {
							_stop = true;
						}
						_conn
					});
					console.log("query:", _q.sql);
				});
				
				/*_changes.toAdd.forEach(function(entry) {
					if (_stop) {
						_conn.rollback(function() { throw _error; });
					}
					var _tname = entry[0].GetName();
					var _obj = entry[1];
					_conn.query('INSERT INTO ?? SET ?', [_tname, _obj], function(error, result) {
						if (error) {
							_stop = true;
						}
					});
				});*/
				_conn.commit(function(error) {
					if (error) { _conn.rollback(function() { throw error; }); }
					console.log('Changes are saved.');
					_conn.end();
				});				
			});
		}
	}
}
var repo = new Repository(new DB({host: '****', user: '****', password: '****', database: 'stock'}));
repo.Add(new Table('****', []), {ticker_id: 1, last: 1, change: 1, open: 1, high: 1, low: 1, vol: 1, trade: 1, value: 1, prev: 1, ref: 1, pref_date: '04/24/2015', bid: 1, ask: 1});
repo.Add(new Table('****', []), {ticker_id: 2, last: 2, change: 2, open: 2, high: 2, low: 2, vol: 2, trade: 2, value: 2, prev: 2, ref: 2, pref_date: '04/24/2015', bid: 2, ask: 2});
repo.Save();

console.log("Finish");

/*jsdom.env({
	url: "****",
	src: [jquery],
	encoding: 'utf8',
	done: function (errors, window) {
		var $ = window.$;
		var output = $('****').text(); // $('#_eEe').text()
		console.log(output);
		writeFile('./output2.txt', output)
	}
	encoding: 'binary',
	done: function (error, response, body) {
	    body = new Buffer(body, 'binary');
	    conv = new iconv.Iconv('windows-1252', 'utf8');
	    body = conv.convert(body).toString();
	}
});*/

/*var writeFile = function (fname, text) {
	fs.writeFile(fname, text, function(error) {
		if (error) {
			return console.log(error);
		} 

		console.log('the file was written successfully.');
	})	
}*/
