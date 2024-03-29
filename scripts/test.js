const ThermostatService = require('@matthewturner/smartheat-core/core/ThermostatService');
const DefaultsService = require('@matthewturner/smartheat-core/core/DefaultsService');
const AwsHoldStrategy = require('@matthewturner/smartheat-aws/aws/HoldStrategy');
const DefaultHoldStrategy = require('@matthewturner/smartheat-core/core/HoldStrategy');
const Logger = require('@matthewturner/smartheat-core/core/Logger');
const AwsThermostatRepository = require('@matthewturner/smartheat-aws/aws/ThermostatRepository');
const DefaultThermostatRepository = require('@matthewturner/smartheat-core/core/ThermostatRepository');
const Factory = require('@matthewturner/smartheat-core/core/Factory');
const SetTemperatureStrategy = require('@matthewturner/smartheat-core/core/SetTemperatureStrategy');

const logger = new Logger(Logger.DEBUG);

const report = (messages, logger) => {
    if (messages instanceof Array) {
        for (const message of messages) {
            logger.debug(message);
        }
    } else {
        logger.debug(messages);
    }
};

const reportOn = async (action) => {
    try {
        const {
            messages,
        } = await action();
        report(messages, logger);
    } catch (e) {
        report(e, logger);
    }
};

const createHoldStrategy = (context) => {
    if (process.env.HOLD_STRATEGY === 'aws') {
        return new AwsHoldStrategy(logger, context);
    }
    return new DefaultHoldStrategy(logger, context);
};

const createRepository = () => {
    if (process.env.THERMOSTAT_REPOSITORY === 'aws') {
        return new AwsThermostatRepository(logger);
    }
    return new DefaultThermostatRepository(logger);
};

const createContext = () => {
    return {
        userId: process.env.ALEXA_USER_ID,
        source: 'user'
    };
};

const main = async () => {
    const duration = process.env.DURATION;
    const context = createContext();
    let holdStrategy = createHoldStrategy(context);
    let repository = createRepository();
    let setTemperatureStrategy = new SetTemperatureStrategy();

    const factory = new Factory(logger);
    const thermostatService = new ThermostatService(logger, context, factory, repository, holdStrategy, setTemperatureStrategy);
    const defaultsService = new DefaultsService(logger, context, factory, repository);

    await reportOn(() => defaultsService.defaults());

    await reportOn(() => defaultsService.setDefault('defaultOnTemp', 22));

    await reportOn(() => defaultsService.defaults());

    await reportOn(() => thermostatService.turnOn(duration));

    await reportOn(() => thermostatService.status());

    await reportOn(() => thermostatService.turnOff());
};

main();
