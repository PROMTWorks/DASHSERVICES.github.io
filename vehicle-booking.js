/* DASH public booking vehicle selector
   Static master make list supplied by PROMT WORKS + NHTSA vPIC model lookup.
   The static make list is authoritative for the dropdown; NHTSA is used only
   to populate model names when available.
*/
(function () {
  'use strict';

  function init() {
    const year = document.getElementById('year');
    const make = document.getElementById('make');
    const model = document.getElementById('model');
    const engine = document.getElementById('engine');
    if (!year || !make || !model || !engine) return;

    const api = 'https://vpic.nhtsa.dot.gov/api/vehicles';

    // Master make list supplied by PROMT WORKS. This list is deliberately
    // static so a make cannot disappear because an external API omits it.
    const masterMakes = [
      'ABT','AC Schnitzer','Acura','Alfa Romeo','Alpina','Alpine','Apex','Arrinera','Artega','Ascari','Aston Martin','Audi',
      'BAC','BAIC','BMW','Bentley','Bertone','Borgward','Brabham','Brabus','Breckland','Bugatti','Buick',
      'Cadillac','Caparo','Carlsson','Caterham','Chevrolet','Chrysler','Citroen','Covini','Cupra','Czinger',
      'DS','Dacia','Daewoo','Daihatsu','Daimler','Datsun','De Tomaso','Devon','Dodge','Donkervoort',
      'EDAG','Edo','Elfin','Eterniti','FM Auto','FPV','Farbio','Ferrari','Fiat','Fisker','Ford',
      'GAC','GM','GMC','GTA','Geely','Genesis','Gordon Murray','Gumpert',
      'HSV','Hamann','Hennessey','Holden','Honda','Hummer','Hyundai',
      'Icona','Infiniti','Isuzu','Italdesign','Iveco',
      'Jaguar','Jeep',
      'KTM','Karma','Kia','Kleemann','Koenigsegg',
      'LCC','Lada','Lamborghini','Lancia','Land Rover','Larte','Leblanc','Lexus','Lincoln','Lobini','Loremo','Lotus','Lucid','Lynk Co',
      'MG','Mahindra','Mansory','Marcos','Maserati','Maybach','Mazda','Mazel','McLaren','Mercedes-Benz','Mercury','Mindset','Mini','Mitsubishi','Mitsuoka','Morgan',
      'NanoFlowcell','Nilu','Nismo','Nissan','Noble',
      'ORCA','Oldsmobile','Opel',
      'PGO','Pagani','Panoz','Peugeot','Pininfarina','Plymouth','Polestar','Pontiac','Porsche','Proton',
      'Qoros',
      'Ram','Renault','Rimac','Rinspeed','Rivian','Rolls-Royce','Rover',
      'Saab','Saleen','Saturn','Scion','Scout','Seat','Singer','Skoda','Slate','Smart','Sony','Spada','Spyker','SsangYong','Startech','Stola','Strosek','StudioTorino','Subaru','Suzuki',
      'TVR','TWR','Tata','TechArt','Tesla','Think','Touring','Toyota','Tramontana',
      'Valmet','Vauxhall','Venturi','VinFast','Volkswagen','Volvo','Vuhl',
      'Wald','Wiesmann',
      'Yes',
      'Zagato','Zenvo'
    ];

    function setOptions(select, label, values, disabled) {
      select.innerHTML = '';
      select.add(new Option(label, ''));
      [...new Set(values.filter(Boolean))]
        .sort((a, b) => String(a).localeCompare(String(b)))
        .forEach(v => select.add(new Option(v, v)));
      select.disabled = !!disabled;
    }

    function loading(select, label) {
      setOptions(select, label, [], true);
    }

    async function json(url) {
      const response = await fetch(url, { headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error('Vehicle database request failed');
      return response.json();
    }

    // Model years. The make list is independent of the year so historic and
    // specialty makes remain selectable; year-specific availability is checked
    // by the model lookup when possible.
    setOptions(year, 'Select year', Array.from({ length: 127 }, (_, i) => 2026 - i), false);
    setOptions(make, 'Select make', [], true);
    setOptions(model, 'Select model', [], true);
    setOptions(engine, 'Select / confirm engine', [], true);

    year.onchange = async function () {
      setOptions(make, 'Select make', masterMakes, false);
      setOptions(model, 'Select model', [], true);
      setOptions(engine, 'Select / confirm engine', [], true);
      if (!this.value) setOptions(make, 'Select make', [], true);
    };

    make.onchange = async function () {
      setOptions(model, 'Select model', [], true);
      setOptions(engine, 'Select / confirm engine', [], true);
      if (!year.value || !this.value) return;

      loading(model, 'Loading models...');
      try {
        const yearUrl = api + '/GetModelsForMakeYear/make/' + encodeURIComponent(this.value) + '/modelyear/' + encodeURIComponent(year.value) + '/vehicletype/car?format=json';
        const yearData = await json(yearUrl);
        let names = (yearData.Results || []).map(x => x.Model_Name || x.ModelName).filter(Boolean);

        if (!names.length) {
          const makeUrl = api + '/GetModelsForMake/make/' + encodeURIComponent(this.value) + '?format=json';
          const makeData = await json(makeUrl);
          names = (makeData.Results || []).map(x => x.Model_Name || x.ModelName).filter(Boolean);
        }

        if (names.length) setOptions(model, 'Select model', names, false);
        else {
          setOptions(model, 'Model not listed — enter below', [], false);
          addCustomModelField();
        }
      } catch (e) {
        setOptions(model, 'Model not listed — enter below', [], false);
        addCustomModelField();
      }
    };

    function addCustomModelField() {
      let wrap = document.getElementById('dashCustomModelWrap');
      if (!wrap) {
        wrap = document.createElement('div');
        wrap.id = 'dashCustomModelWrap';
        wrap.className = 'field full';
        wrap.innerHTML = '<label for="dashCustomModel">Exact model</label><input id="dashCustomModel" placeholder="Enter exact model / trim">';
        model.closest('.field').after(wrap);
      }
      wrap.classList.remove('hidden');
    }

    model.onchange = function () {
      const customModel = document.getElementById('dashCustomModelWrap');
      if (customModel && this.value) customModel.classList.add('hidden');

      setOptions(engine, 'Select / confirm engine', [
        'I know my engine — enter below',
        'Engine not listed — enter below'
      ], false);

      let wrap = document.getElementById('dashCustomEngineWrap');
      if (!wrap) {
        wrap = document.createElement('div');
        wrap.id = 'dashCustomEngineWrap';
        wrap.className = 'field full hidden';
        wrap.innerHTML = '<label for="dashCustomEngine">Exact engine</label><input id="dashCustomEngine" placeholder="Example: 2.5L 4-Cylinder">';
        engine.closest('.field').after(wrap);
      }

      engine.onchange = function () {
        wrap.classList.toggle('hidden', !this.value);
      };
    };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
