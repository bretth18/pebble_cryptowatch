var Clay = require('./clay');
var clayConfig = require('./config');
var clay = new Clay(clayConfig, null, { autoHandleEvents: false });


// constants
var apiKey = 'a2672ea41a1a0f8685ae5e3fe009ef93';



/* CLAY SHIT */

Pebble.addEventListener('showConfiguration', function(e) {
  Pebble.openURL(clay.generateUrl());
});

Pebble.addEventListener('webviewclosed', function(e) {
  if (e && !e.response) {
    return;
  }

  // Return settings from Config Page to watch
  var settings = clay.getSettings(e.response, false);

  // Flatten to match localStorage version
  var settingsFlat = {};
  Object.keys(settings).forEach(function(key) {
    if (typeof settings[key] === 'object' && settings[key]) {
      settingsFlat[key] = settings[key].value;
    } else {
      settingsFlat[key] = settings[key];
    }
  });

  Pebble.postMessage(settingsFlat);
});



function restoreSettings() {
  // Restore settings from localStorage and send to watch
  var settings = JSON.parse(localStorage.getItem('clay-settings'));
  if (settings) {
    Pebble.postMessage(settings);
  }
}
/* ===========================================*/







// make request, has callback
function request(url, type, callback) {
  var xhr = new XMLHttpRequest();
  xhr.onload = function() {
    callback(this.responseText);
  };
  xhr.open(type, url);
  xhr.send();
}



// listen for messages from watch
Pebble.on('message', function(event) {
  
  // grab message that was passed
  var message = event.data;
  
  // GET data
  if (message.fetch) {
    
    // declare local vars
    var weatherData;   
    var cryptoData;
    var dictionary;
    
    // begin crypto
    
    var cryptoUrl = 'https://api.coinmarketcap.com/v1/ticker/?convert=USD&limit=20';
    var cryptoArray = [5];
    // send request
    request(cryptoUrl, 'GET', function(responseText) {
      cryptoData = JSON.parse(responseText);
      console.log('cryptodata', cryptoData);
      // sent prices back to watch
      
      // sort data
      for (var i = 0; i < cryptoData.length; i++) {
        if (cryptoData[i].symbol == "BTC") {
          
          cryptoArray[0] = cryptoData[i];
        }
        if (cryptoData[i].symbol == "ETH") {
          cryptoArray[1] = cryptoData[i];
        }
        if (cryptoData[i].symbol == "LTC") {
          console.log('ltc checking in,', cryptoData[i].price_usd);
          cryptoArray[2] = cryptoData[i];
        }
        if (cryptoData[i].symbol == "XRP") {
          cryptoArray[3] = cryptoData[i];
        }
        
      }
      
     dictionary = {
        'BTC': cryptoArray[0].price_usd,
        'ETH': cryptoArray[1].price_usd,
        'LTC': cryptoArray[2].price_usd,
        'XRP': cryptoArray[3].price_usd
      };

    });
    
    
    
    
    // get location
    
    

    navigator.geolocation.getCurrentPosition(function(pos) {
     
      var urlWeather = 'http://api.openweathermap.org/data/2.5/weather' +
          '?lat=' + pos.coords.latitude +
          '&lon=' + pos.coords.longitude +
          '&appid=' + apiKey;
      
      // request weather data
      request(urlWeather, 'GET', function(responseText) {
         weatherData = JSON.parse(responseText);
        console.log('weather data: ', weatherData);
        Pebble.postMessage({
          'weather': {
            // convert from kelvins
            'celcius': Math.round(weatherData.main.temp - 273.15),
            'fahrenheit': Math.round((weatherData.main.temp - 273.15) * 9/5 + 32),
            'desc': weatherData.weather[0].main,
          },
          'crypto': {
            'BTC': dictionary.BTC,
            'ETH': dictionary.ETH,
            'LTC': dictionary.LTC,
            'XRP': dictionary.XRP,
          }
        });
      });
    }, function(err) {
      console.error('error gettin location');
    },
    { timeout: 15000, maximumAge: 60000});
    
    
    
    // send message back
    Pebble.postMessage({
      'weather': {
        // convert from kelvins
        'celcius': Math.round(weatherData.main.temp - 273.15),
        'fahrenheit': Math.round((weatherData.main.temp - 273.15) * 9/5 + 32),
        'desc': weatherData.weather[0].main,
      },
      'crypto': {
        'BTC': dictionary.BTC,
        'ETH': dictionary.ETH,
        'LTC': dictionary.LTC,
        'XRP': dictionary.XRP,        
      }
    });
  }
  
  
  // clay persist settings
  if (event.data.command === 'settings') {
    restoreSettings();
  }
  
  
});
