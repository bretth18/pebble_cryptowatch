#include <pebble.h>

// #define KEY_TEMPERATURE 0
// #define KEY_CONDITIONS 1

// declarations
// static pointer to window
static Window *s_main_window;

// static pointer to a text layer
static TextLayer *s_time_layer;
static TextLayer *s_date_layer;
static TextLayer *s_weather_layer;

// layers
static Layer *s_battery_layer;

// global font
static GFont s_time_font;
static GFont s_date_font;
static GFont s_weather_font;

// image pointers
static BitmapLayer *s_background_layer, *s_bt_icon_layer;
static GBitmap *s_background_bitmap, *s_bt_icon_bitmap;

// ints
static int s_battery_level;





// function that updates our time
static void update_time() {
  // get a tm struct
  time_t temp = time(NULL);
  struct tm *tick_time = localtime(&temp);
  
  
  // write the current hours and mins into buffer
  static char s_buffer[8];
  strftime(s_buffer, sizeof(s_buffer), clock_is_24h_style() ? "%H:%M" : "%I:%M", tick_time);
  
  // display this time on the textLayer
  text_layer_set_text(s_time_layer, s_buffer);
  
}

// function that updates date
static void update_date() {
  // tm struct
  time_t now = time(NULL);
  struct tm *date = localtime(&now);
  
  static char s_date_buffer[10];
  strftime(s_date_buffer, sizeof(s_date_buffer), "%e %h %g", date);
  text_layer_set_text(s_date_layer, s_date_buffer);
}


// tick handler for clock function
// whenever time changes, we are provided with a struct containing time
// in various forms as well as const TimeUnits value telling what changed
static void tick_handler(struct tm *tick_time, TimeUnits units_changed) {
  update_time();
  
  // update weather every 30 mins
  if (tick_time->tm_min % 30 == 0) {
    // begin dict
    DictionaryIterator *iter;
    app_message_outbox_begin(&iter);
    
    // add a key val pair
    dict_write_uint8(iter, 0, 0);
    
    // send message
    app_message_outbox_send();
  }
  
}

// layer update proc used to draw battery meter
static void battery_update_proc(Layer *layer, GContext *ctx) {
  GRect bounds = layer_get_bounds(layer);
  
  // find width of the bay
  int width = (s_battery_level * 114) / 100;
  
  // draw background
  graphics_context_set_fill_color(ctx, GColorBlack);
  graphics_fill_rect(ctx, bounds, 0, GCornerNone);
  
  // draw bar
  graphics_context_set_fill_color(ctx, GColorWhite);
  graphics_fill_rect(ctx, GRect(0,0, width, bounds.size.h), 0, GCornerNone);
  
}


// bluetooth callback handler
static void bluetooth_callback(bool connected) {
  // show icon if disconnect
  layer_set_hidden(bitmap_layer_get_layer(s_bt_icon_layer), connected);
  
  if(!connected) {
    // vibrate
    vibes_double_pulse();
  }
  
}




//handler functions to manage creation of window sub-elements
// takes param of window pointer
static void main_window_load(Window *window) {
  
  // get info about the window (device)
  Layer *window_layer = window_get_root_layer(window);
  GRect bounds = layer_get_bounds(window_layer);
  
  // create GBitmap
  s_background_bitmap = gbitmap_create_with_resource(RESOURCE_ID_IMAGE_BACKGROUND);
  
  // create bitmaplayer to display gbitmap
  s_background_layer = bitmap_layer_create(bounds);
  
  // set bitmap onto the layer and add to window
  bitmap_layer_set_bitmap(s_background_layer, s_background_bitmap);
  layer_add_child(window_layer, bitmap_layer_get_layer(s_background_layer));
  
  
  // create the textlayer with the specific bounds now, handles time round
  s_time_layer = text_layer_create(
      GRect(0, PBL_IF_ROUND_ELSE(58,52), bounds.size.w,50));
  
  // create GFont
  s_time_font = fonts_load_custom_font(resource_get_handle(RESOURCE_ID_FONT_PERFECT_DOS_48));
  
  
  // make the layout a watchface
  text_layer_set_background_color(s_time_layer, GColorClear);
  text_layer_set_text_color(s_time_layer, GColorWhite);
  text_layer_set_font(s_time_layer, s_time_font);
  text_layer_set_text_alignment(s_time_layer, GTextAlignmentCenter);
  
  
  // add this as a child layer to the windows root layer
  layer_add_child(window_layer, text_layer_get_layer(s_time_layer));
  
  
  
  // create the textlayer for the date
  s_date_layer = text_layer_create(
      GRect(0, PBL_IF_ROUND_ELSE(125,120), bounds.size.w, 25));
  
  // create GFont
  s_date_font = fonts_load_custom_font(resource_get_handle(RESOURCE_ID_FONT_PERFECT_DOS_14));

  // make the date layout
  text_layer_set_background_color(s_date_layer, GColorClear);
  text_layer_set_text_color(s_date_layer, GColorWhite);
  text_layer_set_font(s_date_layer, s_date_font);
  text_layer_set_text_alignment(s_date_layer, GTextAlignmentCenter); 
  
  // add this as a child layer to the windows root layer
  layer_add_child(window_layer, text_layer_get_layer(s_date_layer));
  
  
  
  
  // create temperature Layer
  s_weather_layer = text_layer_create(
      GRect(0, PBL_IF_ROUND_ELSE(135, 130), bounds.size.w, 25));
  
  // create GFont
  s_weather_font = fonts_load_custom_font(resource_get_handle(RESOURCE_ID_FONT_PERFECT_DOS_20));

  // style the text
  text_layer_set_background_color(s_weather_layer, GColorClear);
  text_layer_set_text_color(s_weather_layer, GColorWhite);
  text_layer_set_font(s_weather_layer, s_weather_font);
  text_layer_set_text_alignment(s_weather_layer, GTextAlignmentCenter);
  text_layer_set_text(s_weather_layer, "Loading...");
  
  // add this as a child layer
  layer_add_child(window_get_root_layer(window), text_layer_get_layer(s_weather_layer));

  
  
  // create battery layer
  s_battery_layer = layer_create(GRect(14, 54, 115, 2));
  layer_set_update_proc(s_battery_layer, battery_update_proc);
  
  // add to window
  layer_add_child(window_get_root_layer(window), s_battery_layer);
  
  
  
  // create bluetooth icon
  s_bt_icon_bitmap = gbitmap_create_with_resource(RESOURCE_ID_IMAGE_BT_ICON);
  
  // create bitmap layer to display the gbitmap
  s_bt_icon_layer = bitmap_layer_create(GRect(59, 12, 30, 30));
  bitmap_layer_set_bitmap(s_bt_icon_layer, s_bt_icon_bitmap);
  layer_add_child(window_get_root_layer(window), bitmap_layer_get_layer(s_bt_icon_layer));
  
  // show correct state of bt connection from start
  bluetooth_callback(connection_service_peek_pebble_app_connection());
}

static void main_window_unload(Window *window) {
  // destroy gbitmap
  gbitmap_destroy(s_background_bitmap);
  gbitmap_destroy(s_bt_icon_bitmap);
  
  //destroy bitmaplayer
  bitmap_layer_destroy(s_background_layer);
  bitmap_layer_destroy(s_bt_icon_layer);
  
  // destroy textlayer
  text_layer_destroy(s_time_layer);
  text_layer_destroy(s_date_layer);
  text_layer_destroy(s_weather_layer);
  
  // unload GFont
  fonts_unload_custom_font(s_time_font);
  fonts_unload_custom_font(s_date_font);
  fonts_unload_custom_font(s_weather_font);
  
  // destroy battery layer
  layer_destroy(s_battery_layer);
  

}



// callback functions 

static void inbox_received_callback(DictionaryIterator *iterator, void *context) {
  // store incoming information
  static char temperature_buffer[8];
  static char conditions_buffer[32];
  static char weather_layer_buffer[32];
  
  // read tuples for data
  Tuple *temp_tuple = dict_find(iterator, MESSAGE_KEY_TEMPERATURE);
  Tuple *conditions_tuple = dict_find(iterator, MESSAGE_KEY_CONDITIONS);
  
  // if all data is there we use it
  if (temp_tuple && conditions_tuple) {
    snprintf(temperature_buffer, sizeof(temperature_buffer), "%dC", (int)temp_tuple->value->int32);
    snprintf(conditions_buffer, sizeof(conditions_buffer), "%s", conditions_tuple->value->cstring);
    
    // assemble string and display
    snprintf(weather_layer_buffer, sizeof(weather_layer_buffer), "%s,%s", temperature_buffer, conditions_buffer);
    text_layer_set_text(s_weather_layer, weather_layer_buffer);
  }
}

static void inbox_dropped_callback(AppMessageResult reason, void *context) {
  APP_LOG(APP_LOG_LEVEL_ERROR, "Message dropped");
}

static void outbox_failed_callback(DictionaryIterator *iterator, AppMessageResult reason, void *context) {
  APP_LOG(APP_LOG_LEVEL_ERROR, "outbox send failed");
}

static void outbox_sent_callback(DictionaryIterator *iterator, void *context) {
  APP_LOG(APP_LOG_LEVEL_ERROR, "outbox send success");
}


static void battery_callback(BatteryChargeState state) {
  // record new battery level
  s_battery_level = state.charge_percent;
  
  // update meter (ask system to re-render)
  layer_mark_dirty(s_battery_layer);
}





static void init() {
  
  // register with tickTimerService
  tick_timer_service_subscribe(MINUTE_UNIT, tick_handler);
    
  // register callbacks
  app_message_register_inbox_received(inbox_received_callback);
  app_message_register_inbox_dropped(inbox_dropped_callback);
  app_message_register_outbox_failed(outbox_failed_callback);
  app_message_register_outbox_sent(outbox_sent_callback);
  battery_state_service_subscribe(battery_callback);
  
  // register for BT connection updates
  connection_service_subscribe((ConnectionHandlers) {
    .pebble_app_connection_handler = bluetooth_callback
  });
  
  // open AppMessage
  const int inbox_size = 128;
  const int outbox_size = 128;
  app_message_open(inbox_size, outbox_size);
  
  // create main window element and assign to pointer
  s_main_window = window_create();
  
  // set handlers to manage elements inside window
  window_set_window_handlers(s_main_window, (WindowHandlers) {
    .load = main_window_load,
    .unload = main_window_unload 
  });
  
  window_set_background_color(s_main_window, GColorBlack);
  
  // show window on the watch with animated = true
  window_stack_push(s_main_window, true);
    
  // display time from the start
  update_time();
  update_date();
  
  // display battery level at the start
  battery_callback(battery_state_service_peek());
  
}


static void deinit() {
  // destroy window
  window_destroy(s_main_window);
  
}


int main(void) {
  init();
  app_event_loop();
  deinit();
}

