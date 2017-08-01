var rocky = require('rocky');



// global vars
var weather;
var crypto;
var months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
var colors = ['#e6e6e6', '#cccccc', '#b3b3b3'];
var animationFrame = 0;
var settings = null;



// get weather data from mobile
rocky.on('message', function(event) {
  // receive message from phone
  var message = event.data;
  
  if (message) {
    console.log('message', JSON.stringify(message));
    // save data
    if (message.weather || message.crypto) {
        weather = message.weather;
        crypto = message.crypto;
    } else {
      settings = message;

    }
//     weather = message.weather;
//     crypto = message.crypto;
//     console.log('data:', weather, crypto);
//     settings = message;
    // request redraw to update UI
    rocky.requestDraw();
  }
  
  
});

rocky.on('hourchange', function(event) {
  // send a message to fetch weather info on startup and every hour
  rocky.postMessage({'fetch': true});
});


function drawWeather(ctx, weather) {
  // generate string describing the weather
  var weatherString = weather.fahrenheit + '°F, ' + weather.desc.toUpperCase();
  

  // draw the text
  ctx.fillStyle = 'black';
  ctx.textAlign = 'center';
  if (settings && settings.weatherFontSize) {
    ctx.font = settings.weatherFontSize + 'px Gothic';
  } else {
    ctx.font = '14px Gothic';
  }
  ctx.fillText(weatherString, ctx.canvas.unobstructedWidth /2, ctx.canvas.unobstructedHeight - 37);
  
}

function drawCrypto(ctx, crypto) {
  var cryptoString;
  
  // temporary
  if (settings && settings.coinListings[3] ){
    cryptoString =  'BTC' + ' : ' + crypto.BTC + ' \n' +  'ETH' + ': ' + crypto.ETH + ' \n' +  'LTC' + ': ' + crypto.LTC + '';
  } else {
   cryptoString =  'BTC' + ' : ' + crypto.BTC + ' \n' +  'ETH' + ': ' + crypto.ETH + ' \n' +  'XRP' + ': ' + crypto.XRP + '';

  }
  ctx.fillStyle = 'black';
  ctx.textAlign = 'center';
  
  if (settings && settings.cryptoFontSize) {
    ctx.font = settings.cryptoFontSize + 'px Gothic';
  } else {
    ctx.font = '14px Gothic';
  }
  ctx.fillText(cryptoString, ctx.canvas.unobstructedWidth / 2, (ctx.canvas.unobstructedHeight / 4)-30);
}




rocky.on('draw', function(event) {
  // get the CanvasRenderingContext2D object
  var ctx = event.context;
  var time = new Date();
  
  // set our bounds
  var bounds = { width: ctx.canvas.unobstructedWidth, height: ctx.canvas.unobstructedHeight };
  

  // clear the screen
  ctx.clearRect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);




  // render background stripes
  ctx.fillStyle = colors[animationFrame % 3];
  ctx.fillRect(0, 0, bounds.width, bounds.height / 3);
  
  ctx.fillStyle = colors[(animationFrame + 1) % 3];
  ctx.fillRect(0, bounds.height / 3, bounds.width, 2 * bounds.height / 3);
  
  ctx.fillStyle = colors[(animationFrame + 2) % 3];
  ctx.fillRect(0,2 * bounds.height / 3, bounds.width, bounds.height);
  
  // set text style
  ctx.fillStyle = 'black';
  ctx.textAlign = 'center';
  if (settings && settings.clockFontSize) {
    ctx.font = settings.clockFontSize + 'px bold numbers Leco-numbers';
  } else {
      ctx.font = '42px bold numbers Leco-numbers';

  }
  
  // generate time text (settings for 24hr time default)
  if (!settings || (settings && !settings.StdTime)) {
    ctx.fillText(((time.getHours() +11) % 12 +1) + ':' + (time.getMinutes() < 10 ? '0' + time.getMinutes() : time.getMinutes()),
      bounds.width / 2, bounds.height / 2 - 28);
  } else {
    ctx.fillText(time.getHours() + ':' + (time.getMinutes() < 10 ? '0' + time.getMinutes() : time.getMinutes()),
      bounds.width / 2, bounds.height / 2 - 28);
  }


  
  // generate month text
  if (settings && settings.dateFontSize) {
    ctx.font = settings.dateFontSize + 'px Gothic';
  } else {
    ctx.font = '18px Gothic';
  }
  
  ctx.fillText(time.getDate() + '' + months[time.getMonth()] + ' ' + time.getFullYear(), bounds.width / 2, bounds.height - 27);
  
  // draw weather after clock
  if (weather) {
    drawWeather(ctx, weather);
  }
  
  // draw crypto last
  if (crypto) {
    drawCrypto(ctx, crypto);
  }
  
  animationFrame++;
  animationFrame %= 100;


});

rocky.on('minutechange', function(event) {
  // Display a message in the system logs
  console.log("Another minute with your Pebble!");
  
//   rocky.postMessage({'fetch': true});

  // Request the screen to be redrawn on next pass
  rocky.requestDraw();
});



function leftpad(str, len, ch) {
  str = String(str);
  var i = -1;
  if (!ch && ch !== 0) ch = ' ';
  len = len - str.length;
  while (++i < len) {
    str = ch + str;
  }
  return str;
}


// Borrowed from Clay.js

/**
 * @param {string|boolean|number} color
 * @returns {string}
 */
function cssColor(color) {
  if (typeof color === 'number') {
    color = color.toString(16);
  } else if (!color) {
    return 'transparent';
  }

  color = padColorString(color);

  return '#' + color;
}

/**
 * @param {string} color
 * @return {string}
 */
function padColorString(color) {
  color = color.toLowerCase();

  while (color.length < 6) {
    color = '0' + color;
  }

  return color;
}

rocky.requestDraw();
rocky.postMessage({command: 'settings'});
