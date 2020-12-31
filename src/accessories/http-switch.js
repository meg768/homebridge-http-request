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
					this.log('Turning off again in 500ms...');
					setTimeout(() => {
						characteristic.updateValue(state = false);
					}, 1000);
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
/*
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
		*/
		this.addService(service);
		this.addCharacteristic(service, Characteristic.On, setter, getter);

//        this.addService(new Service.Switch(this.name, this.UUID));
//		this.enableCharacteristic(Service.Switch, Characteristic.On, setter.bind(this), getter.bind(this));
    }


	addCharacteristic(service, characteristic, setter, getter) {

		var ctx = service.getCharacteristic(characteristic);

		ctx.on('get', (callback) => {
            callback(null, getter());
        });

        ctx.on('set', (value, callback) => {

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
	}

}

