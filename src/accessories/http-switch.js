var {Service, Characteristic} = require('../homebridge.js')
var Accessory = require('../accessory.js');

module.exports = class extends Accessory {

    constructor(options) {

		super(options);
		
		var state = false;
		var service = new Service.Switch(this.name, this.UUID);
		var characteristic = service.getCharacteristic(Characteristic.On);

		var setter = (value) => {
			var Request = require('yow/request');
			var isObject = require('yow/isObject');

			if (!isObject(this.config.request))
				return Promise.resolve();

			if (!value)
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
		
				this.log('Sending');
				request.request(method, options).then(() => {
					this.log('SENT!');
				})
				.catch((error) => {
					this.log(error);
				})
				.then(() => {
					console.log('Turning off again in 500ms...');
					setTimeout(() => {
						characteristic.updateValue(state = false);
					}, 500);
				})
				.then(() => {
					resolve();
				})
				.catch((error) => {
					reject(error);
				})
	
			});
				
		};

		var getter = () => {
			return state;
		};


        characteristic.on('get', (callback) => {
            callback(null, getter());
        });

        characteristic.on('set', (value, callback) => {

			setter(value).then(() => {
				this.log('Value set', value);
			})
			.catch(() => {
				this.log(error);
			})
			.then(() => {
				callback();

			})
        });

        this.addService(service);

    }

}

