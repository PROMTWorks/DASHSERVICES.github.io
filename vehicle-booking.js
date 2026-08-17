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
      'Acura','Alfa Romeo','Aston Martin','Audi','Bentley','BMW','Buick','Cadillac','Chevrolet','Chrysler','Dodge','Ferrari','FIAT','Ford','Genesis','GMC','Honda','Hyundai','INFINITI','Isuzu','Jaguar','Jeep','Kia','Lamborghini','Land Rover','Lexus','Lincoln','Lucid','Maserati','Mazda','McLaren','Mercedes-Benz','Mercury','MINI','Mitsubishi','Nissan','Oldsmobile','Plymouth','Polestar','Pontiac','Porsche','RAM','Rivian','Rolls-Royce','Saab','Saturn','Scion','Scion','Smart','Subaru','Suzuki','Tesla','Toyota','Volkswagen','Volvo'
    ];

    function setOptions(select, label, values, disabled) {
      select.innerHTML = '';
      select.add(new Option(label, ''));
      [...new Set(values.filter(Boolean))].sort((a,b)=>String(a).localeCompare(String(b))).forEach(v => select.add(new Option(v, v)));
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
        const names = (data.Results || []).map(x => x.MakeName || x.Make_Name);
        setOptions(make, 'Select make', names.length ? names : fallbackMakes, false);
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
        const url = api + '/GetModelsForMakeYear/make/' + encodeURIComponent(this.value) + '/modelyear/' + encodeURIComponent(year.value) + '/vehicletype/car?format=json';
        const data = await json(url);
        const names = (data.Results || []).map(x => x.Model_Name || x.ModelName);
        setOptions(model, 'Select model', names, false);
      } catch (e) {
        setOptions(model, 'Models unavailable — try another make/year', [], true);
      }
    };

    model.onchange = function () {
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