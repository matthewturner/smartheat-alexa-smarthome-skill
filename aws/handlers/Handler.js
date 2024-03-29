const DefaultThermostatRepository = require('@matthewturner/smartheat-core/core/ThermostatRepository');
const ThermostatService = require('@matthewturner/smartheat-core/core/ThermostatService');
const DefaultHoldStrategy = require('@matthewturner/smartheat-core/core/HoldStrategy');
const DynamodbThermostatRepository = require('@matthewturner/smartheat-aws/aws/ThermostatRepository');
const AwsHoldStrategy = require('@matthewturner/smartheat-aws/aws/HoldStrategy');
const SetTemperatureStrategy = require('../DeferredSetTemperatureStrategy');
const {
    ProfileGateway,
    MockProfileGateway
} = require('@matthewturner/smartheat-aws/aws/ProfileGateway');
const helpers = require('@matthewturner/smartheat-aws/aws/helpers');
const Factory = require('@matthewturner/smartheat-core/core/Factory');
const AlexaResponseBuilder = require('../AlexaResponseBuilder');

class Handler {
    constructor(logger) {
        this._logger = logger;
    }

    async createControlService(event) {
        const profile = await this.retrieveProfile(event);
        const userId = profile.user_id;
        const shortUserId = helpers.truncateUserId(userId);
        this._logger.prefix = shortUserId;
        const source = this.retrieveSource(event);
        const context = {
            userId: userId,
            shortUserId: shortUserId,
            source: source
        };
        this._logger.debug(`Creating context for source: ${context.source}...`);
        const repository = this.createRepository();
        const holdStrategy = this.createHoldStrategy(context);
        const setTemperatureStrategy = new SetTemperatureStrategy(this._logger, event);
        const factory = new Factory(this._logger);
        const service = new ThermostatService(this._logger, context, factory,
            repository, holdStrategy, setTemperatureStrategy);
        return service;
    }

    createHoldStrategy(context) {
        if (process.env.HOLD_STRATEGY === 'aws') {
            return new AwsHoldStrategy(this._logger, context);
        }
        return new DefaultHoldStrategy(this._logger, context);
    }

    createRepository() {
        if (process.env.THERMOSTAT_REPOSITORY === 'dynamodb') {
            return new DynamodbThermostatRepository(this._logger);
        }
        return new DefaultThermostatRepository(this._logger);
    }

    createProfileGateway() {
        if (process.env.PROFILE_GATEWAY_TYPE === 'aws') {
            return new ProfileGateway();
        }
        return new MockProfileGateway();
    }

    retrieveSource(event) {
        if (event.directive.payload && event.directive.payload.source) {
            return event.directive.payload.source;
        }
        return 'user';
    }

    async retrieveProfile(event) {
        if (event.directive.endpoint && event.directive.endpoint.userId) {
            this._logger.debug('UserId found; skipping profile data...');
            return {
                user_id: event.directive.endpoint.userId
            };
        }

        this._logger.debug('Retrieving profile data...');
        const tokenContainer = event.directive.endpoint || event.directive.payload;
        const accessToken = tokenContainer.scope.token;
        const profileGateway = this.createProfileGateway();
        return await profileGateway.get(accessToken);
    }

    responseFor(event) {
        return new AlexaResponseBuilder(this._logger).from(event);
    }

    static namespaceFor(event) {
        return ((event.directive || {}).header || {}).namespace;
    }
}

module.exports = Handler;