/* DASH VEHICLE CATALOG LAYER
   Selector: Year -> Make -> Model -> Engine -> Trim -> Service
   1989-2026 vehicle coverage. Models are discovered from the manual make list
   plus NHTSA vPIC. Engine/trim data is only shown when a catalog entry exists;
   otherwise the customer can enter the exact factory configuration.
*/
(function(){
  'use strict';

  const SERVICES = [
    ['oil','Oil Change'],['wipers','Wiper Replacement'],['battery','Battery Replacement'],
    ['jump','Jump-Start Service'],['tire','Tire Pressure Check & Inflation'],
    ['tire-replacement','Tire Replacement'],['air','Engine Air Filter Replacement'],
    ['cabin','Cabin Air Filter Replacement'],['headlight','Headlight Assembly Replacement'],
    ['brake-light','Brake/Tail Light Assembly Replacement'],['fluid','Fluid Top-Off Service']
  ];

  // Curated factory configuration data. This is deliberately separate from
  // discovery data so additional vehicles can be added without changing UI code.
  const CATALOG = {
    'Ford|Mustang': {
      engines:['2.3L EcoBoost I4','5.0L Coyote V8','5.2L V8'],
      trims:['EcoBoost','GT','Dark Horse','Premium','GT Premium','Dark Horse Premium']
    },
    'Ford|F-150': {
      engines:['2.7L EcoBoost V6','3.0L Power Stroke V6 Diesel','3.3L Ti-VCT V6','3.5L EcoBoost V6','5.0L Ti-VCT V8','5.2L Supercharged V8'],
      trims:['XL','STX','XLT','Lariat','King Ranch','Platinum','Tremor','Raptor','Limited']
    },
    'Chevrolet|Silverado 1500': {
      engines:['2.7L TurboMax I4','4.3L EcoTec3 V6','5.3L EcoTec3 V8','6.2L EcoTec3 V8','3.0L Duramax I6 Diesel'],
      trims:['Work Truck','Custom','LT','RST','LTZ','High Country','Custom Trail Boss','LT Trail Boss','ZR2']
    },
    'Honda|Civic': {
      engines:['1.5L Turbo I4','2.0L I4','2.0L Atkinson-Cycle Hybrid I4'],
      trims:['LX','Sport','EX','EX-L','Touring','Si','Type R','Hybrid Sport','Hybrid Sport Touring']
    },
    'Toyota|Camry': {
      engines:['2.5L I4','2.5L Hybrid I4','3.5L V6'],
      trims:['LE','SE','XLE','XSE','TRD','Hybrid LE','Hybrid SE','Hybrid XLE']
    },
    'Toyota|Corolla': {
      engines:['1.8L I4','2.0L Dynamic Force I4','1.8L Hybrid I4'],
      trims:['L','LE','SE','XLE','Hybrid LE','Hybrid SE','GR Corolla']
    },
    'Toyota|RAV4': {
      engines:['2.5L I4','2.5L Hybrid I4','2.5L Plug-in Hybrid I4'],
      trims:['LE','XLE','XLE Premium','Adventure','Limited','SE','XSE','TRD Off-Road']
    },
    'Honda|Accord': {
      engines:['1.5L Turbo I4','2.0L Turbo I4','2.0L Hybrid I4'],
      trims:['LX','Sport','EX-L','Touring','Sport Hybrid','Sport-L Hybrid','Touring Hybrid']
    },
    'Nissan|Altima': {
      engines:['2.5L I4','2.0L VC-Turbo I4'],
      trims:['S','SV','SR','SL','SR VC-Turbo']
    },
    'Jeep|Wrangler': {
      engines:['2.0L Turbo I4','3.0L EcoDiesel V6','3.6L Pentastar V6','6.4L HEMI V8','2.0L 4xe Plug-in Hybrid'],
      trims:['Sport','Willys','Sahara','Rubicon','High Altitude','4xe']
    },
    'Tesla|Model 3': {
      engines:['Single Motor Electric','Dual Motor Electric'],
      trims:['Rear-Wheel Drive','Long Range','Performance']
    },
    'BMW|3 Series': {
      engines:['2.0L Turbo I4','3.0L Turbo I6'],
      trims:['330i','330e','M340i','M3']
    },
    'Mercedes-Benz|C-Class': {
      engines:['2.0L Turbo I4','3.0L Turbo I6','2.0L Turbo I4 Plug-in Hybrid'],
      trims:['C 300','C 300 4MATIC','AMG C 43','AMG C 63']
    },
    'Audi|A4': {
      engines:['2.0L Turbo I4'],
      trims:['Premium','Premium Plus','Prestige','S line']
    },
    'Hyundai|Elantra': {
      engines:['2.0L I4','1.6L Turbo I4','1.6L Hybrid I4'],
      trims:['SE','SEL','Limited','N Line','N','Blue Hybrid','Limited Hybrid']
    },
    'Kia|Forte': {
      engines:['2.0L I4','1.6L Turbo I4'],
      trims:['FE','LX','LXS','GT-Line','GT','GT Manual']
    },
    'Subaru|Outback': {
      engines:['2.5L Boxer H4','2.4L Turbo Boxer H4'],
      trims:['Base','Premium','Onyx Edition','Limited','Wilderness','Touring']
    },
    'Mazda|CX-5': {
      engines:['2.5L Skyactiv-G I4','2.5L Turbo Skyactiv-G I4'],
      trims:['2.5 S','Select','Preferred','Premium','Premium Plus','Carbon Edition','Turbo']
    },
    'Volkswagen|Jetta': {
      engines:['1.5L Turbo I4','1.4L Turbo I4'],
      trims:['S','Sport','SE','SEL','GLI']
    },
    'Lexus|RX': {
      engines:['2.4L Turbo I4','2.5L Hybrid I4','3.5L V6 Hybrid'],
      trims:['Base','Premium','Luxury','F Sport','F Sport Handling','350h','450h+']
    }
  };

  window.DASH_VEHICLE_CATALOG = { SERVICES, CATALOG };
})();
