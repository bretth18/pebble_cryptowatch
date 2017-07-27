
// constants
var apiKey = 'a2672ea41a1a0f8685ae5e3fe009ef93';


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
    
    // begin crypto
    
    var cryptoUrl = 'https://api.coinmarketcap.com/v1/ticker/?convert=USD&limit=20';
    
    // send request
    request(cryptoUrl, 'GET', function(responseText) {
      cryptoData = JSON.parse(responseText);
      console.log('cryptodata', cryptoData);
      // sent prices back to watch 

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
            'one_symbol': cryptoData[0].symbol,
            'one_price': cryptoData[0].price_usd,
            'two_symbol': cryptoData[1].symbol,
            'two_price': cryptoData[1].price_usd,
            'three_symbol': cryptoData[2].symbol,
            'three_price': cryptoData[2].price_usd,
            'four_symbol': cryptoData[3].symbol,
            'four_price': cryptoData[3].price_usd,
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
        'one_symbol': cryptoData[0].symbol,
        'one_price': cryptoData[0].price_usd,
        'two_symbol': cryptoData[1].symbol,
        'two_price': cryptoData[1].price_usd,
        'three_symbol': cryptoData[2].symbol,
        'three_price': cryptoData[2].price_usd,
        'four_symbol': cryptoData[3].symbol,
        'four_price': cryptoData[3].price_usd,
      }
    });
  }
});
