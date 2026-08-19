/* DASH booking submission client. This file is intentionally isolated from vehicle-database.js. */
(function () {
  'use strict';
  const ENDPOINT = 'https://roywoofgypiyoobdcrwx.supabase.co/functions/v1/create-service-request';
  const $ = id => document.getElementById(id);
  const val = id => $(id) ? String($(id).value || '').trim() : '';
  const choices = () => [...document.querySelectorAll('input[name="specialChoice"]:checked')].map(x => x.value);

  async function sendBooking() {
    const required = ['service','year','make','model','engine','trim','date','time','locationStreet','locationCity','locationState','locationZip','addressRestrictions','firstName','lastName','phone','email'];
    for (const id of required) {
      if (!val(id)) { alert('Please complete all required booking fields before submitting.'); $(id)?.focus(); return; }
    }
    if (!/^[A-Za-z]{2}$/.test(val('locationState'))) { alert('Please enter a valid two-letter state.'); $('locationState').focus(); return; }
    if (!/^\d{5}(?:-\d{4})?$/.test(val('locationZip'))) { alert('Please enter a valid ZIP code.'); $('locationZip').focus(); return; }
    if (!$('consent')?.checked) { alert('Please accept the contact authorization before submitting.'); return; }
    const restrictionNeedsProof = ['yes','unsure'].includes(val('addressRestrictions'));
    if (restrictionNeedsProof && (!$('restrictionProof')?.files?.length || !val('restrictionDetails'))) {
      alert('Because you selected Yes or Unsure for address restrictions, please provide the explanation and proof/authorization.');
      return;
    }
    const service = $('service');
    const request = {
      client_request_number: 'DASH-' + Date.now() + '-' + Math.floor(100000 + Math.random() * 900000),
      service_key: val('service'), service_name: service?.options[service.selectedIndex]?.text || 'Requested Service',
      vehicle_year: val('year'), vehicle_make: val('make'), vehicle_model: val('model'), vehicle_engine: val('engine'), vehicle_trim: val('trim'),
      preferred_date: val('date'), preferred_time: val('time'),
      street_address: val('locationStreet'), city: val('locationCity'), state: val('locationState').toUpperCase(), postal_code: val('locationZip'),
      restriction_answer: val('addressRestrictions'), restriction_details: val('restrictionDetails'), customer_notes: val('notes'), special_options: choices(),
      estimated_labor: $('laborPrice')?.textContent || '', estimated_parts: $('partsPrice')?.textContent || '', estimated_total: $('totalPrice')?.textContent || '',
      first_name: val('firstName'), last_name: val('lastName'), phone: val('phone'), email: val('email'),
      contact_preference: val('contactPreference'), consent: true
    };
    const button = $('contact')?.querySelector('button.continue');
    if (button) { button.disabled = true; button.textContent = 'Submitting...'; }
    try {
      const r = await fetch(ENDPOINT, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({request}) });
      const text = await r.text(); let data = {}; try { data = JSON.parse(text); } catch (_) { data = {message:text}; }
      if (!r.ok) throw new Error(data.message || 'The booking could not be saved.');
      if (data.request_number) sessionStorage.setItem('dashServerRequestNumber', data.request_number);
      alert('Your DASH service request ' + (data.request_number || request.client_request_number) + ' was submitted successfully.');
    } catch (err) {
      alert('DASH could not submit the request: ' + err.message);
    } finally {
      if (button) { button.disabled = false; button.textContent = 'Submit Service Request'; }
    }
  }

  function install() {
    if (typeof window.submitRequest !== 'function') { setTimeout(install, 100); return; }
    if (window.submitRequest.__dashExternalSubmit) return;
    window.submitRequest = sendBooking;
    window.submitRequest.__dashExternalSubmit = true;
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install); else install();
})();
