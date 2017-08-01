module.exports = [
  {
    "type": "heading",
    "defaultValue": "Watchface Configuration"
  },
  {
    "type": "text",
    "defaultValue": "crypto-watch settings"
  },
  {
    "type": "section",
    "items": [
      {
        "type": "heading",
        "defaultValue": "More Settings"
      },
      {
        "type": "toggle",
        "messageKey": "StdTime",
        "label": "Enable 24HR clock",
        "defaultValue": true
      }
    ]
  },
  {
  "type": "select",
  "messageKey": "clockFontSize",
  "defaultValue": "42",
  "label": "clock font size",
  "options": [
    { 
      "label": "42", 
      "value": "42" 
    },
    { 
      "label": "38",
      "value": "38" 
    },
    { 
      "label": "36",
      "value": "36" 
    },
    { 
      "label": "32",
      "value": "32" 
    }
  ]
},
{
  "type": "select",
  "messageKey": "dateFontSize",
  "defaultValue": "18",
  "label": "date font size",
  "options": [
    { 
      "label": "14", 
      "value": "14" 
    },
    { 
      "label": "18",
      "value": "18" 
    },
    { 
      "label": "24",
      "value": "24" 
    },
    { 
      "label": "28",
      "value": "28" 
    }
  ]
},
  {
  "type": "select",
  "messageKey": "cryptoFontSize",
  "defaultValue": "14",
  "label": "crypto font size",
  "options": [
    { 
      "label": "14", 
      "value": "14" 
    },
    { 
      "label": "18",
      "value": "18" 
    },
    { 
      "label": "24",
      "value": "24" 
    },
    { 
      "label": "28",
      "value": "28" 
    }
  ]
},
    {
  "type": "select",
  "messageKey": "weatherFontSize",
  "defaultValue": "14",
  "label": "weather font size",
  "options": [
    { 
      "label": "14", 
      "value": "14" 
    },
    { 
      "label": "18",
      "value": "18" 
    },
    { 
      "label": "24",
      "value": "24" 
    },
    { 
      "label": "28",
      "value": "28" 
    }
  ]
},
  {
  "type": "checkboxgroup",
  "messageKey": "coinListings",
  "label": "Crypto prices to display",
  "defaultValue": [true, true, true, false],
  "options": ["BTC", "ETH", "XRP", "LTC"]
},
  {
    "type": "submit",
    "defaultValue": "Save Settings"
  }
];