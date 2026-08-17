/* DASH public booking vehicle selector
   Uses NHTSA vPIC for Year -> Make -> Model coverage.
   Engine is a confirmation step because vPIC model results can have multiple engines.
*/
(function () {
  function init() {
    const year = document.getElementById('year');
    const make = document.getElementById('make');
    const model = document.getElementById('model');
    const engine = document.getElementById('engine');
    if (!year || !make || !model || !engine) return;

    const api = 'https://vpic.nhtsa.dot.gov/api/vehicles';

    const fallbackMakes = [
      'Acura','Alfa Romeo','American Motors','Aston Martin','Audi','Avanti','Austin','Autocar',
      'Bentley','BMW','Buick','Cadillac','Checker','Chevrolet','Chrysler','Daewoo','Daihatsu',
      'Datsun','DeLorean','Dodge','Eagle','Edsel','Ferrari','FIAT','Fisker','Ford','Freightliner',
      'Genesis','Geo','GMC','Honda','Hummer','Hyundai','INEOS','INFINITI','International','Isuzu',
      'Jaguar','Jeep','Karma','Kia','Lamborghini','Land Rover','Lexus','Lincoln','Lucid','Mack',
      'Maserati','Maybach','Mazda','McLaren','Mercedes-Benz','Mercury','Merkur','MG','MINI',
      'Mitsubishi','Nissan','Oldsmobile','Opel','Packard','Panoz','Peterbilt','Plymouth','Polestar',
      'Pontiac','Porsche','RAM','Rivian','Rolls-Royce','Rover','Saab','Saturn','Scion','SEAT',
      'Shelby','Smart','Sterling','Studebaker','Subaru','Suzuki','Tesla','Thomas','Toyota','UD',
      'Volkswagen','Volvo','Western Star','Willys','Workhorse'
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

    setOptions(year, 'Select year', Array.from({ length: 46 }, (_, i) => 2026 - i), false);
    setOptions(make, 'Select make', [], true);
    setOptions(model, 'Select model', [], true);
    setOptions(engine, 'Select / confirm engine', [], true);

    year.onchange = async function () {
      setOptions(make, 'Select make', [], true);
      setOptions(model, 'Select model', [], true);
      setOptions(engine, 'Select / confirm engine', [], true);
      if (!this.value) return;

      loading(make, 'Loading makes...');
      try {
        const data = await json(api + '/GetMakesForVehicleType/car?format=json');
        const liveNames = (data.Results || []).map(x => x.MakeName || x.Make_Name).filter(Boolean);
        setOptions(make, 'Select make', [...liveNames, ...fallbackMakes], false);
      } catch (e) {
        setOptions(make, 'Select make', fallbackMakes, false);
      }
    };

    make.onchange = async function () {
      setOptions(model, 'Select model', [], true);
      setOptions(engine, 'Select / confirm engine', [], true);
      if (!year.value || !this.value) return;

      loading(model, 'Loading models...');
      try {
        // First ask vPIC for models for the exact make/year.
        const yearUrl = api + '/GetModelsForMakeYear/make/' + encodeURIComponent(this.value) + '/modelyear/' + encodeURIComponent(year.value) + '/vehicletype/car?format=json';
        const yearData = await json(yearUrl);
        let names = (yearData.Results || []).map(x => x.Model_Name || x.ModelName).filter(Boolean);

        // Some historical, low-volume, and specialty makes do not return
        // complete year-specific results. Fall back to the make's broader model
        // list so the customer can still select the model instead of getting an
        // empty dropdown. Exact year/fitment is still confirmed later.
        if (!names.length) {
          const makeUrl = api + '/GetModelsForMake/make/' + encodeURIComponent(this.value) + '?format=json';
          const makeData = await json(makeUrl);
          names = (makeData.Results || []).map(x => x.Model_Name || x.ModelName).filter(Boolean);
        }

        if (names.length) {
          setOptions(model, 'Select model', names, false);
        } else {
          setOptions(model, 'Model not found — enter below', [], false);
          addCustomModelField();
        }
      } catch (e) {
        // Keep booking usable even when vPIC has no model data for a rare make.
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
        wrap.innerHTML = '<label for="dashCustomModel">Exact model</label><input id="dashCustomModel" placeholder="Example: Model name / trim">';
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
