
var Service  = require('../homebridge.js').Service;
var Characteristic  = require('../homebridge.js').Characteristic;
var Accessory = require('../accessory.js');
var Request = require('yow/request');
var isObject = require('yow/isObject')

module.exports = class Switch extends Accessory {

    constructor(options) {

        super(options);
 
        this.switchState = false;
        
        this.addService(new Service.Switch(this.name));
        this.enableCharacteristic(Service.Switch, Characteristic.On, this.getSwitchState.bind(this), this.setSwitchState.bind(this));
    }

    updateSwitchState(value) {
        if (value != undefined)
            this.switchState = value;

        this.getService(Service.Switch).getCharacteristic(Characteristic.On).updateValue(this.switchState);
        return Promise.resolve();        
    }

    getSwitchState() {
        return this.switchState;
    }

    setSwitchState(value) {
        value = value ? true : false;

        return new Promise((resolve, reject) => {
            Promise.resolve().then(() => {
                if (this.switchState == value)
                    return Promise.resolve();

                this.switchState = value;
                this.debug(`Setting switch "${this.name}" state to "${this.switchState}".`);
                return this.switchState ? this.turnOn() : this.turnOff();
            })
            .then(() => {
                resolve();
            })
            .catch((error) => {
                reject(error);
            })
        });
    }

    turnOn() {
		var {method = 'get', path = '/', url, query, body} = this.config;

		if (isObject(this.config.request)) {

			var request = new Request(url);
			var options = {};
	
			if (isObject(body))
				options.body = body;
	
			if (isObject(query))
				options.query = query;
	
			return request.request(method, path, options);
	
		}
		else {
			return Promise.resolve();

		}
    }

    turnOff() {
        return Promise.resolve();
    }

}

