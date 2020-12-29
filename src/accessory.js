var {API, Service, Characteristic} = require('./homebridge.js');



// Basic accessory - may be used for most projects

class Accessory extends API.platformAccessory  {

    constructor(options) {
        var {log, debug, config, name, platform, uuid} = options;

		if (config == undefined)
			throw new Error('A configuration of the accessory must be specified.');

		if (name == undefined)
			name = config.name;

        if (name == undefined)
            throw new Error('A name of the accessory must be specified.');

        if (uuid == undefined)
            uuid = API.hap.uuid.generate(name);

		console.log('CREATING ACCESSORY', name, uuid);
		super(name, uuid);

		this.name = name;
        this.displayName = name;



        var service = this.getService(Service.AccessoryInformation);
        service.getCharacteristic(Characteristic.FirmwareRevision, "1.0");
//        this.addService(service); 

		this.platform = platform;
		this.config = config;
		this.log = log;
		this.debug = debug;

		console.log(this);
  
      // Seems like we have to give it a name...
/*
        this.name = name;
        this.displayName = name;
		this.UUID = uuid;
*/
  }

	getServices() {
		return this.services;
	}
	
	pause(ms) {
        return new Promise((resolve, reject) => {
            setTimeout(resolve, ms);
        });
    }
    
    updateCharacteristicValue(service, characteristic, value) {
        this.getService(service).getCharacteristic(characteristic).updateValue(value);
    }

    enableCharacteristic(service, characteristic, getter, setter) {

        service = this.getService(service);
        
        if (typeof getter === 'function') {
            service.getCharacteristic(characteristic).on('get', callback => {
                callback(null, getter());
            });
        }

        if (typeof setter === 'function') {
            service.getCharacteristic(characteristic).on('set', (value, callback) => {
                var response = setter(value);

                if (response instanceof Promise) {
                    response.then(() => {
                    })
                    .catch((error) => {
                        this.log(error);
                    })
                    .then(() => {
                        callback(null, getter());                
                    });
                }
                else
                    callback(null, getter());
            });
    
        }

    }


};

/*
class Accessory extends Events {

    constructor(options) {
        super();

        var {log, debug, config, name, platform, uuid} = options;

		if (config == undefined)
			throw new Error('A configuration of the accessory must be specified.');

		if (name == undefined)
			name = config.name;

        if (name == undefined)
            throw new Error('A name of the accessory must be specified.');

        if (uuid == undefined)
            uuid = homebridge.hap.uuid.generate(name);

        this.services = [];

        var service = new Service.AccessoryInformation();
        service.getCharacteristic(Characteristic.FirmwareRevision, "1.0");
        this.addService(service); 

        // Seems like we have to give it a name...
        this.name = name;
        this.displayName = name;
		this.UUID = uuid;
		this.platform = platform;
		this.config = config;
		this.log = log;
		this.debug = debug;
    }

    pause(ms) {
        return new Promise((resolve, reject) => {
            setTimeout(resolve, ms);
        });
    }
    
    addService(service) {
        this.services.push(service);
    }

    updateCharacteristicValue(service, characteristic, value) {
        this.getService(service).getCharacteristic(characteristic).updateValue(value);
    }

    enableCharacteristic(service, characteristic, getter, setter) {

        service = this.getService(service);
        
        if (typeof getter === 'function') {
            service.getCharacteristic(characteristic).on('get', callback => {
                callback(null, getter());
            });
        }

        if (typeof setter === 'function') {
            service.getCharacteristic(characteristic).on('set', (value, callback) => {
                var response = setter(value);

                if (response instanceof Promise) {
                    response.then(() => {
                    })
                    .catch((error) => {
                        this.log(error);
                    })
                    .then(() => {
                        callback(null, getter());                
                    });
                }
                else
                    callback(null, getter());
            });
    
        }

    }

    getService(name) {
        if (name instanceof Service)
            return name;

        for (var index in this.services) {
            var service = this.services[index];
            
            if (typeof name === 'string' && (service.displayName === name || service.name === name))
                return service;
            else if (typeof name === 'function' && ((service instanceof name) || (name.UUID === service.UUID)))
                return service;
          }
        
    }

    getServices() {
        return this.services;
    }
};

*/

module.exports = Accessory;