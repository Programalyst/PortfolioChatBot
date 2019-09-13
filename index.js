// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';
 
const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');
const https = require('https');

process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements
 
exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
 
  function welcome(agent) {
    agent.add(`Yes. Welcome to your portfolio. (Webhook successful)`);
  }
 
  function fallback(agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
  }
  
  function priceHandler(agent) {
  	return getBTCprice().then(function(result){
    	agent.add("The current price of bitcoin is " + result + " USD");

    }).catch(function(fromReject){
        console.log(fromReject);
	});
  }
  
  // A helper function that fetches the price of BTC
  function getBTCprice() {
	  return new Promise((resolve, reject) => {
    
	  // Check the price, then return response after getting the price
      https.get('https://blockchain.info/q/24hrprice', (res) => {
      	let data = '';
        
        // A chunk of data has been recieved.
        res.on('data', (chunk) => {
          data += chunk;
        });
      
        // The whole response has been received. Print out the result.
        res.on('end', () => {
          resolve(JSON.parse(data));
        });
        
      });//https.get   
    });//promise
  }

  // Run the proper function handler based on the matched Dialogflow intent name
  let intentMap = new Map();
  intentMap.set('Portfolio Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  // intentMap.set('your intent name here', yourFunctionHandler);
  intentMap.set('BTC Price Query Intent', priceHandler);
  agent.handleRequest(intentMap);
  
});
