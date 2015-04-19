module.exports = {
	'Tickers': function (_db, tablename) {
		return _db.define(tablename, {
	  		id:         {type: 'serial', key: true}, // the auto-incrementing primary key
			ticker_id:  {type: 'integer' },
			last: 		{type: 'number'},
			change: 	{type: 'number'},
			open: 		{type: 'number'},
			high: 		{type: 'number'},
			low: 		{type: 'number'},
			vol: 		{type: 'integer'},
			trade: 		{type: 'integer'},
			value: 		{type: 'number'},
			prev: 		{type: 'number'},
			ref: 		{type: 'number'},
			prev_date:  {type: 'date'},
			bid: 		{type: 'number'},
			ask: 		{type: 'number'},
			timestamp: 	{type: 'date', time: true}
		});
	},
	'TimeSale': function (_db, tablename) {
		return _db.define(tablename, {
			id:			{type: 'serial', key: true}, // the auto-incrementing primary key
			ticker_id:	{type: 'integer'},
			price:		{type: 'number'},
			quantity:	{type: 'integer'},
			datetime:	{type: 'date', time: true},
			timestamp: 	{type: 'date', time: true}
		});
	},
	'Ticker': function (_db, tablename) {
		return _db.qDefine(tablename, {
			id:			{type: 'serial', key: true}, // the auto-incrementing primary key
			ticker_id:	{type: 'integer'}
		});
	},
	'OBook': function (_db, tablename) {
		return _db.define(tablename, {
			id:			{type: 'serial', key: true}, // the auto-incrementing primary key
			ticker_id:	{type: 'integer'},
			price:		{type: 'number'},
			bid:		{type: 'integer'},
			bid_qty:	{type: 'integer'},
			ask:		{type: 'integer'},
			ask_qty:	{type: 'integer'},
			timestamp: 	{type: 'date', time: true}
		});
	},
	'News': function (_db, tablename) {
		return _db.define(tablename, {
			id:			{type: 'serial', key: true}, // the auto-incrementing primary key
			headline: 	{type: 'text'},
			url: 		{type: 'text'},
			date: 		{type: 'date', time: true},
			timestamp: 	{type: 'date', time: true}
		});
	}
};
