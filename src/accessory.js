var {API, Service, Characteristic} = require('./homebridge.js');

module.exports = class extends API.platformAccessory  {

    constructor(options) {
        var {log, debug, config, name, platform, uuid} = options;

		if (config == undefined)
			throw new Error('A configuration of the accessory must be specified.');

		if (platform.config.name == undefined)
			throw new Error('The platform must have a name.');

		if (name == undefined)
			name = config.name;

        if (name == undefined)
            throw new Error('A name of the accessory must be specified.');

        if (uuid == undefined)
            uuid = API.hap.uuid.generate(`${platform.config.name}-${name}`);

		super(name, uuid);

		this.name = name;
		this.displayName = name;
		this.uniqueName = uuid;
		
		this.platform = platform;
		this.config = config;
		this.log = log;
		this.debug = debug;

		this.updateCharacteristicValue(Service.AccessoryInformation, Characteristic.FirmwareRevision, "1.0");

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
