
var Switch = require('./switch.js');

module.exports = class extends Switch {

    constructor(options) {

        super(options);
    }

    turnOn() {
		var Request = require('yow/request');
		var isObject = require('yow/isObject');
		
		if (!isObject(this.config.request))
			return Promise.resolve();

		return new Promise((resolve, reject) => {
			var {method = 'get', url, query, body} = this.config.request;

			this.debug('Connecting to', url, 'using method', method, '...');
			var request = new Request(url);
			var options = {};
	
			if (isObject(body))
				options.body = body;
	
			if (isObject(query))
				options.query = query;
	
			request.request(method, options).then(() => {
				console.log('request send pausing 1000 ms');
				return this.pause(1000);
			})
			.then(() => {
				console.log('Turning off again...');
				return this.updateSwitchState(false);
			})
			.then(() => {
				resolve();
			})
			.catch((error) => {
				reject(error);
			})

		});
    }

    turnOff() {
        return Promise.resolve();
    }

}

