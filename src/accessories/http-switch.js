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
		
				request.request(method, options).then(() => {
					return this.pause(2000);
				})
				.catch((error) => {
					this.log(error);
				})
				.then(() => {
					characteristic.updateValue(state = false);
					/*
					setTimeout(() => {
						characteristic.updateValue(state = false);
					}, 1000);
					*/
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
			return Promise.resolve(state);
		};
		
		this.addService(service);
		this.addCharacteristic(service, Characteristic.On, setter, getter);
    }

}

