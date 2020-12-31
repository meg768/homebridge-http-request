var {Service, Characteristic} = require('../homebridge.js')
var Accessory = require('../accessory.js');

module.exports = class extends Accessory {

    constructor(options) {

		super(options);
		
		var state = false;
		
		var setter = (value) => {
			var Request = require('yow/request');
			var isObject = require('yow/isObject');

			if (!isObject(this.config.request))
				return Promise.resolve();

			var characteristic = this.getService(Service.Switch).getCharacteristic(this.Characteristic.On);

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
				.catch((error) => {
					this.log(error);
				})
				.then(() => {
					console.log('Turning off again...');
					characteristic.updateValue(state = false);
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

        this.addService(new Service.Switch(this.name, this.UUID));
        this.enableCharacteristic(Service.Switch, Characteristic.On, getter, setter);

    }

}

