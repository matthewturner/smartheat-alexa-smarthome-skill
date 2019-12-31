[![Maintainability](https://api.codeclimate.com/v1/badges/c456d5f04d612ce8c6fe/maintainability)](https://codeclimate.com/github/matthewturner/smartheat-alexa-smarthome-skill/maintainability) [![Reviewed by Hound](https://img.shields.io/badge/Reviewed_by-Hound-8E64B0.svg)](https://houndci.com) [![Action Status](https://github.com/matthewturner/smartheat-alexa-smarthome-skill/workflows/Node%20CI/badge.svg)](https://github.com/matthewturner/smartheat-alexa-smarthome-skill/actions)

# SmartHeat Legacy Thermostat Skill

An Alexa App (skill) to control older heating systems which are not integrated with Alexa.

## Utterances

The Smarthome API supports many of the common utterances around controlling heating systems. A full list can be found [here](https://developer.amazon.com/en-US/docs/alexa/device-apis/alexa-thermostatcontroller.html#utterances).

## Supported Devices

### Salus IT500

Please note that this is really ugly because Salus don't provide any kind of API. This skill logs onto their web app using your username and password and sets the temperature as you would in their mobile (web) app. For that reason, you need to embed your login details into web app and host this skill yourself! Do not offer this skill in the Alexa store for other people because it's not secure to collect other people's usernames and passwords.

Until Salus provide their own Alexa skill or a federated authentication method then this is the only option, unfortunately.

### Heatmiser

Please note that this is also pretty ugly because Heatmiser does not provide an appropriate API. This skill requires an open port to connect to on your router.

Until Heatmiser provide their own Alexa skill or a federated authentication method then this is the only option, unfortunately.

## Auto-switch off/Hold time

Some thermostats have a hold time which keeps the thermostat on for the specified time and automatically switches it off when the hold time has elapsed.

* You will need to prevent Salus/Heatmiser from overriding this by setting the off times to a late time (eg 10pm)
* It is optional and requires a hosted lambda, step function and dynamodb table

## Deploying with CloudFormation (in development)

1. Use the deploy-stack.sh to deploy the lambda, dynamodb tables etc

1. Enter your lambda ARN in your SmartHome Skill [here](https://developer.amazon.com/alexa/console)

## Setting up the SmartHome API Skill

1. Create a lambda and deploy the code using the package/publish scripts

1. Create a topic to publish to and subscribe the lambda to it

1. Declare your username/password and the default temperatures for on/off using environment variables

1. Optionally create the step function and dynamodb table for hold times/auto-switch off
