const chai = require('chai');
chai.use(require('chai-as-promised'));
const expect = chai.expect;
const lambda = require('../../aws/smarthome-lambda');
const fs = require('promise-fs');

const createTarget = () => {
    process.env.HOLD_STRATEGY = 'default';
    process.env.THERMOSTAT_REPOSITORY = 'default';
    process.env.THERMOSTAT_TYPE = 'mock';
    process.env.LOG_LEVEL = 'OFF';
    process.env.PROFILE_GATEWAY_TYPE = 'mock';

    return {
        lambda: lambda,
        object: () => {
            return lambda;
        }
    };
};

describe('SmartHome Lambda', async () => {
    describe('Discovery Directive', async () => {
        it('returns the current capabilities', async () => {
            const target = createTarget();

            const request = JSON.parse(await fs.readFile('./test/fixtures/DiscoveryDirective.json'));
            const context = {};

            const handler = target.object().handler;
            const actual = await handler(request, context);

            delete actual.event.header.correlationToken;
            actual.event.header.messageId = 'messageId123';

            const expected = JSON.parse(await fs.readFile('./test/fixtures/DiscoveryResponse.json'));

            expect(actual).to.deep.include(expected);
        });
    });

    describe('SetTargetTemperature Directive', async () => {
        it('sets the target temperature', async () => {
            const target = createTarget();

            const request = JSON.parse(await fs.readFile('./test/fixtures/SetTargetTempDirective.json'));
            const context = {};

            const handler = target.object().handler;
            const actual = await handler(request, context);

            actual.event.header.messageId = 'messageId123';
            actual.context.properties[0].timeOfSample = '2019-09-03T10:45:31.258Z';
            actual.context.properties[1].timeOfSample = '2019-09-03T10:45:31.258Z';

            const expected = JSON.parse(await fs.readFile('./test/fixtures/SetTargetTempResponse.json'));

            expect(actual).to.deep.include(expected);
        });

        it('sets the target temperature and schedule', async () => {
            const target = createTarget();

            const request = JSON.parse(await fs.readFile('./test/fixtures/SetTargetTempWithScheduleDirective.json'));
            const context = {};

            const handler = target.object().handler;
            const actual = await handler(request, context);

            actual.event.header.messageId = 'messageId123';
            actual.context.properties[0].timeOfSample = '2019-09-03T10:45:31.258Z';
            actual.context.properties[1].timeOfSample = '2019-09-03T10:45:31.258Z';

            const expected = JSON.parse(await fs.readFile('./test/fixtures/SetTargetTempWithScheduleResponse.json'));

            expect(actual).to.deep.include(expected);
        });
    });

    describe('AdjustTargetTemperature Directive', async () => {
        it('adjusts the target temperature', async () => {
            const target = createTarget();

            const request = JSON.parse(await fs.readFile('./test/fixtures/AdjustTargetTempDirective.json'));
            const context = {};

            const handler = target.object().handler;
            const actual = await handler(request, context);

            actual.event.header.messageId = 'messageId123';
            actual.context.properties[0].timeOfSample = '2019-09-03T10:45:31.258Z';
            actual.context.properties[1].timeOfSample = '2019-09-03T10:45:31.258Z';

            const expected = JSON.parse(await fs.readFile('./test/fixtures/AdjustTargetTempResponse.json'));

            expect(actual).to.deep.include(expected);
        });
    });

    describe('ReportState Directive', async () => {
        it('reports the current state', async () => {
            const target = createTarget();

            const request = JSON.parse(await fs.readFile('./test/fixtures/ReportStateDirective.json'));
            const context = {};

            const handler = target.object().handler;
            const actual = await handler(request, context);

            actual.event.header.messageId = 'messageId123';

            const expected = JSON.parse(await fs.readFile('./test/fixtures/ReportStateResponse.json'));

            expect(actual).to.deep.include(expected);
        });
    });

    describe('SetThermostatMode Directive', async () => {
        it('turns the heating on', async () => {
            const target = createTarget();

            const request = JSON.parse(await fs.readFile('./test/fixtures/SetThermostatModeHeatDirective.json'));
            const context = {};

            const handler = target.object().handler;
            const actual = await handler(request, context);

            actual.event.header.messageId = 'messageId123';
            actual.context.properties[0].timeOfSample = '2019-09-03T10:45:31.258Z';
            actual.context.properties[1].timeOfSample = '2019-09-03T10:45:31.258Z';
            actual.context.properties[2].timeOfSample = '2019-09-03T10:45:31.258Z';

            const expected = JSON.parse(await fs.readFile('./test/fixtures/SetThermostatModeHeatResponse.json'));

            expect(actual).to.deep.include(expected);
        });

        it('turns the heating off', async () => {
            const target = createTarget();

            const request = JSON.parse(await fs.readFile('./test/fixtures/SetThermostatModeOffDirective.json'));
            const context = {};

            const handler = target.object().handler;
            const actual = await handler(request, context);

            actual.event.header.messageId = 'messageId123';
            actual.context.properties[0].timeOfSample = '2019-09-03T10:45:31.258Z';
            actual.context.properties[1].timeOfSample = '2019-09-03T10:45:31.258Z';
            actual.context.properties[2].timeOfSample = '2019-09-03T10:45:31.258Z';

            const expected = JSON.parse(await fs.readFile('./test/fixtures/SetThermostatModeOffResponse.json'));

            expect(actual).to.deep.include(expected);
        });
    });

    describe('Deferred SetThermostatMode Directive', async () => {
        it('turns the heating off', async () => {
            const target = createTarget();

            const request = JSON.parse(await fs.readFile('./test/fixtures/SetThermostatModeOffDirective-deferred.json'));
            const context = {};

            const handler = target.object().handler;
            const actual = await handler(request, context);

            actual.event.header.messageId = 'messageId123';
            actual.context.properties[0].timeOfSample = '2019-09-03T10:45:31.258Z';
            actual.context.properties[1].timeOfSample = '2019-09-03T10:45:31.258Z';
            actual.context.properties[2].timeOfSample = '2019-09-03T10:45:31.258Z';

            const expected = JSON.parse(await fs.readFile('./test/fixtures/SetThermostatModeOffResponse-deferred.json'));

            expect(actual).to.deep.include(expected);
        });
    });

    describe('Unknown Directive', async () => {
        it('reports the error', async () => {
            const target = createTarget();

            const request = JSON.parse(await fs.readFile('./test/fixtures/UnknownDirective.json'));
            const context = {};

            const handler = target.object().handler;
            const actual = await handler(request, context);

            actual.event.header.messageId = 'messageId123';
            delete actual.event.header.correlationToken;

            const expected = JSON.parse(await fs.readFile('./test/fixtures/UnknownResponse.json'));

            expect(actual).to.deep.include(expected);
        });
    });
});