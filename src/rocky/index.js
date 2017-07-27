var rocky = require('rocky');



// global vars
var weather;
var crypto;
var months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
var colors = ['#e6e6e6', '#cccccc', '#b3b3b3'];
var animationFrame = 0;



// get weather data from mobile
rocky.on('message', function(event) {
  // receive message from phone
  var message = event.data;
  
  if (message) {
    // save data
    weather = message.weather;
    crypto = message.crypto;
    console.log('data:', weather, crypto);
    
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
  ctx.font = '14px Gothic';
  ctx.fillText(weatherString, ctx.canvas.unobstructedWidth /2, 2);
  
}

function drawCrypto(ctx, crypto) {
  var cryptoString =  crypto.one_symbol + ' : ' + crypto.one_price + ' \n' +  crypto.two_symbol + ': ' + crypto.two_price + ' \n' +  crypto.three_symbol + ': ' + crypto.three_price + '';
  
  ctx.fillStyle = 'black';
  ctx.textAlign = 'center';
  ctx.font = '2px Gothic';
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



//   // determine center point
//   var cx = w/2;
//   var cy = h/2;
  
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
  ctx.font = '42px bold numbers Leco-numbers';
  
  // generate time text
  ctx.fillText((time.getHours() > 12 ? time.getHours() % 12 : time.getHours()) + ':' + (time.getMinutes() < 10 ? '0' + time.getMinutes() : time.getMinutes()),
      bounds.width / 2, bounds.height / 2 - 28);
  
  // generate month text
  ctx.font = '18px Gothic';
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

rocky.requestDraw();