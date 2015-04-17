module.exports = {
	'Ticker': function Ticker(_db) {
		return _db.define('****', {
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
			timestamp: 	{type: 'integer'}
		});
	}
};
