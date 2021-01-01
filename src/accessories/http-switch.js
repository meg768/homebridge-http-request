var {Service, Characteristic} = require('../homebridge.js')
var Accessory = require('../accessory.js');

module.exports = class extends Accessory {

    constructor(options) {

		super(options);
		
		var state = false;
		var service = new Service.Switch(this.name, this.UUID);
		var characteristic = service.getCharacteristic(Characteristic.On);

		var turnOnOff = (value) => {
			var Request  = require('yow/request');
			var isObject = require('yow/isObject');
			var isString = require('yow/isString');
			var mode     = value ? 'turnOn' : 'turnOff';
			var config   = value ? this.config.turnOn : this.config.turnOff;
			var bounce   = this.config.bounce;
			
			if (!isObject(config))
				return Promise.resolve();
				
			var {method = 'get', url, query, body} = config;

			if (!isString(url))
				return Promise.error(new Error(`An url must be defined in ${mode}.`));

			return new Promise((resolve, reject) => {
	
				var request = new Request(url);
				var options = {};
		
				if (isObject(body))
					options.body = body;
		
				if (isObject(query))
					options.query = query;

				this.debug(`Connecting to '${url}' using method '${method}'...`);
				this.debug(`Payload ${JSON.stringify(options)}`);
	
				request.request(method, options).then(() => {
					if (bounce) {
						setTimeout(() => {
							characteristic.updateValue(state = !state);
						}, 1000);	
					}
					resolve();
				})
				.catch((error) => {
					this.log(error);
					reject(error);
				})
	
			});

		};


		var setter = (value) => {
			return turnOnOff(value);
			var Request = require('yow/request');
			var isObject = require('yow/isObject');

			if (!isObject(this.config.request))
				return Promise.resolve();

			if (!value)
				return Promise.resolve();

			return new Promise((resolve, reject) => {
				var {method = 'get', url, query, body} = this.config.request;
	
				var request = new Request(url);
				var options = {};
		
				if (isObject(body))
					options.body = body;
		
				if (isObject(query))
					options.query = query;

				this.debug(`Connecting to '${url}' using method '${method}'...`);
				this.debug(`Payload ${JSON.stringify(options)}`);
	
				request.request(method, options).then(() => {
					setTimeout(() => {
						characteristic.updateValue(state = false);
					}, 1000);
					resolve();
				})
				.catch((error) => {
					this.log(error);
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

