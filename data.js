// Kadco Systems service platform — demo data (fictitious). All names are samples.
window.KD = (function(){
  const today = new Date('2026-10-23T09:00:00+05:30');
  const d = (days)=>{ const x=new Date(today); x.setDate(x.getDate()+days); return x.toISOString().slice(0,10); };
  const engineers = [
    {id:'E1', name:'Arun', base:'Thrissur', skills:['UX','laser'], phone:'98xxx 11001', loc:'Thrissur office', status:'free', free:'now'},
    {id:'E2', name:'Faisal', base:'Coimbatore', skills:['UX'], phone:'98xxx 11002', loc:'On site · Gobichettipalayam', status:'onsite', free:'15:30'},
    {id:'E3', name:'Deepak', base:'Ernakulam', skills:['UX','laser'], phone:'98xxx 11003', loc:'Travelling · Aluva', status:'travel', free:'12:00'},
    {id:'E4', name:'Sanjay', base:'Chennai', skills:['UX'], phone:'98xxx 11004', loc:'Chennai office', status:'free', free:'now'},
    {id:'E5', name:'Vishnu', base:'Palakkad', skills:['UX'], phone:'98xxx 11005', loc:'On site · Pallavur', status:'onsite', free:'13:00'},
    {id:'E6', name:'Ramesh', base:'Thrissur', skills:['laser'], phone:'98xxx 11006', loc:'Leave', status:'leave', free:'tomorrow'}
  ];
  const customers = [
    {id:'C1', name:'Malabar Foods Pvt Ltd', site:'Kanjikode, Palakkad', contact:'Mr. Biju', phone:'94xxx 20001', district:'Palakkad'},
    {id:'C2', name:'Periyar Rice Mills', site:'Kalady, Ernakulam', contact:'Mr. Thomas', phone:'94xxx 20002', district:'Ernakulam'},
    {id:'C3', name:'Coastal Cashews', site:'Kollam', contact:'Ms. Rekha', phone:'94xxx 20003', district:'Kollam'},
    {id:'C4', name:'Sree Polymers', site:'Erumathala, Aluva', contact:'Mr. Anand', phone:'94xxx 20004', district:'Ernakulam'},
    {id:'C5', name:'Green Valley Beverages', site:'Gobichettipalayam, Erode', contact:'Mr. Murugan', phone:'94xxx 20005', district:'Erode'},
    {id:'C6', name:'Pallavoor Agro Mill', site:'Pallavur, Palakkad', contact:'Mr. Shanif', phone:'94xxx 20006', district:'Palakkad'},
    {id:'C7', name:'Hilltop Tea Packers', site:'Coonoor, Nilgiris', contact:'Ms. Priya', phone:'94xxx 20007', district:'Nilgiris'},
    {id:'C8', name:'Nila Dairy Products', site:'Ottapalam, Palakkad', contact:'Mr. Hari', phone:'94xxx 20008', district:'Palakkad'},
    {id:'C9', name:'Southern Spices Ltd', site:'Guindy, Chennai', contact:'Mr. Karthik', phone:'94xxx 20009', district:'Chennai'},
    {id:'C10', name:'Kerala Snacks Co', site:'Ollur, Thrissur', contact:'Mr. Jose', phone:'94xxx 20010', district:'Thrissur'}
  ];
  // machines: cover = warranty | amc | none
  const machines = [
    {serial:'27241212', model:'Hitachi UX-D160W', cust:'C1', installed:'2026-03-14', warrantyEnd:'2027-03-13', amc:null, hours:6102, ink:1, makeup:2, line:'Conveyor line 2', ink_t:'1067K', makeup_t:'S100A'},
    {serial:'34624505', model:'Hitachi UX-D160W', cust:'C2', installed:'2025-05-01', warrantyEnd:'2026-04-30', amc:{plan:'Comprehensive', start:'2026-05-01', end:'2027-04-30', visits:4, used:2, price:60000}, hours:9840, ink:2, makeup:1, line:'Auto feeder', ink_t:'1067K', makeup_t:'S100A'},
    {serial:'37483604', model:'Hitachi UX-D160W', cust:'C6', installed:'2026-09-02', warrantyEnd:'2027-09-01', amc:null, hours:410, ink:3, makeup:3, line:'Conveyor line, with stand', ink_t:'1067K', makeup_t:'S100A'},
    {serial:'31190877', model:'Hitachi UX-D140W', cust:'C3', installed:'2024-11-20', warrantyEnd:'2025-11-19', amc:{plan:'Non-comprehensive', start:'2025-11-20', end:'2026-11-19', visits:2, used:2, price:36000}, hours:14230, ink:1, makeup:1, line:'Packing line A', ink_t:'1067K', makeup_t:'S100A'},
    {serial:'29004411', model:'Hitachi UX-D160W', cust:'C4', installed:'2025-08-10', warrantyEnd:'2026-08-09', amc:null, hours:8120, ink:0, makeup:2, line:'Extruder line', ink_t:'1067K', makeup_t:'S100A'},
    {serial:'30557219', model:'Hitachi UX-D160W', cust:'C5', installed:'2024-02-15', warrantyEnd:'2025-02-14', amc:{plan:'Comprehensive', start:'2026-02-15', end:'2027-02-14', visits:4, used:3, price:60000}, hours:17950, ink:2, makeup:2, line:'Bottling line 1', ink_t:'1067K', makeup_t:'S100A'},
    {serial:'JPT-5W-0276', model:'JPT fibre laser 5W', cust:'C7', installed:'2026-06-20', warrantyEnd:'2027-06-19', amc:null, hours:1320, ink:null, makeup:null, line:'Pouch packing machine', ink_t:'—', makeup_t:'—'},
    {serial:'28831950', model:'Hitachi UX-D160W', cust:'C8', installed:'2025-12-01', warrantyEnd:'2026-11-30', amc:null, hours:5400, ink:2, makeup:1, line:'Pouch line', ink_t:'1067K', makeup_t:'S100A'},
    {serial:'26118342', model:'Hitachi UX-D140W', cust:'C9', installed:'2023-09-05', warrantyEnd:'2024-09-04', amc:{plan:'Comprehensive', start:'2025-09-05', end:'2026-11-04', visits:4, used:4, price:58000}, hours:21100, ink:1, makeup:0, line:'Carton line', ink_t:'1067K', makeup_t:'S100A'},
    {serial:'33301177', model:'Hitachi UX-D160W', cust:'C10', installed:'2026-01-18', warrantyEnd:'2027-01-17', amc:null, hours:4120, ink:2, makeup:2, line:'Flow-wrap line', ink_t:'1067K', makeup_t:'S100A'},
    {serial:'32208865', model:'Hitachi UX-D160W', cust:'C1', installed:'2025-03-01', warrantyEnd:'2026-02-28', amc:{plan:'Comprehensive', start:'2026-03-01', end:'2027-02-28', visits:4, used:2, price:60000}, hours:11300, ink:1, makeup:1, line:'Conveyor line 1', ink_t:'1067K', makeup_t:'S100A'},
    {serial:'JPT-5W-0301', model:'JPT fibre laser 5W', cust:'C9', installed:'2026-04-10', warrantyEnd:'2027-04-09', amc:null, hours:2050, ink:null, makeup:null, line:'Liquid pouch line', ink_t:'—', makeup_t:'—'}
  ];
  const calls = [
    {id:'KS-10698', serial:'34624505', type:'Breakdown', status:'Pending – parts', eng:'E3', opened:d(-4), due:d(-2), priority:'High', problem:'MV8 valve found damaged during ultra-cleaning; PI shared for the part.', cover:'AMC'},
    {id:'KS-10701', serial:'30557219', type:'Preventive visit', status:'Closed', eng:'E2', opened:d(-9), due:d(-7), priority:'Normal', problem:'Scheduled AMC visit 3 of 4.', cover:'AMC', closed:d(-7), rating:5},
    {id:'KS-10703', serial:'29004411', type:'Consumables order', status:'Closed', eng:null, opened:d(-8), due:d(-7), priority:'Normal', problem:'2 × ink 1067K, 1 × makeup S100A.', cover:'Chargeable', closed:d(-7), invoice:{no:'KD-1130/26-27', amount:14160, paid:14160}},
    {id:'KS-10705', serial:'31190877', type:'Breakdown', status:'Closed', eng:null, opened:d(-6), due:d(-6), priority:'High', problem:'No print after power cut.', cover:'AMC', closed:d(-6), remote:true, rating:4},
    {id:'KS-10707', serial:'26118342', type:'Warranty / AMC request', status:'Pending – customer', eng:null, opened:d(-5), due:d(1), priority:'Normal', problem:'AMC renewal quotation sent; awaiting confirmation.', cover:'AMC'},
    {id:'KS-10709', serial:'28831950', type:'Technical support', status:'Remote support', eng:'E1', opened:d(-1), due:d(0), priority:'Normal', problem:'Print quality drifting on second shift; operator asked for settings check.', cover:'Warranty'},
    {id:'KS-10710', serial:'33301177', type:'Breakdown', status:'In progress', eng:'E1', opened:d(0), due:d(0), priority:'High', problem:'"Ink viscosity" alarm, line stopped.', cover:'Warranty'},
    {id:'KS-10711', serial:'JPT-5W-0276', type:'Installation / trial', status:'Visit planned', eng:'E6', opened:d(-2), due:d(3), priority:'Normal', problem:'Trial marking on new pouch film.', cover:'Chargeable'},
    {id:'KS-10712', serial:'27241212', type:'Breakdown', status:'New', eng:null, opened:d(0), due:d(0), priority:'High', problem:'"Ink drop charge too high" alarm, line stopped.', cover:'Warranty'},
    {id:'KS-10713', serial:'32208865', type:'Preventive visit', status:'Engineer assigned', eng:'E5', opened:d(-3), due:d(1), priority:'Normal', problem:'Scheduled AMC visit 3 of 4.', cover:'AMC'},
    {id:'KS-10714', serial:'JPT-5W-0301', type:'Spare parts enquiry', status:'Under review', eng:null, opened:d(0), due:d(1), priority:'Normal', problem:'Lens 350 mm price and availability.', cover:'Chargeable'},
    {id:'KS-10715', serial:'31190877', type:'Breakdown', status:'Pending – customer', eng:'E3', opened:d(-2), due:d(1), priority:'Normal', problem:'Nozzle blocked; customer to arrange line stoppage for visit.', cover:'Chargeable'},
    {id:'KS-10716', serial:'30557219', type:'Breakdown', status:'Closed', eng:'E2', opened:d(-12), due:d(-11), priority:'High', problem:'Ink leakage at main tank.', cover:'AMC', closed:d(-11), rating:5},
    {id:'KS-10717', serial:'26118342', type:'Breakdown', status:'Closed', eng:'E4', opened:d(-15), due:d(-14), priority:'High', problem:'Charge plate contaminated.', cover:'Chargeable', closed:d(-14), invoice:{no:'KD-1125/26-27', amount:3540, paid:0}, rating:4},
    {id:'KS-10718', serial:'29004411', type:'Breakdown', status:'Closed', eng:'E3', opened:d(-20), due:d(-19), priority:'Normal', problem:'Print head cleaning and stream alignment.', cover:'Chargeable', closed:d(-19), invoice:{no:'KD-1118/26-27', amount:3540, paid:3540}, rating:5},
    {id:'KS-10719', serial:'28831950', type:'Preventive visit', status:'Visit planned', eng:'E1', opened:d(-1), due:d(4), priority:'Normal', problem:'Pre-warranty-expiry inspection.', cover:'Warranty'},
    {id:'KS-10720', serial:'34624505', type:'Breakdown', status:'Closed', eng:null, opened:d(-30), due:d(-30), priority:'High', problem:'Ink viscosity alarm after refill.', cover:'AMC', closed:d(-30), remote:true, rating:5},
    {id:'KS-10721', serial:'34624505', type:'Breakdown', status:'Closed', eng:'E3', opened:d(-45), due:d(-44), priority:'High', problem:'Ink viscosity alarm; MV9 filter cleaned.', cover:'AMC', closed:d(-44), rating:4},
    {id:'KS-10722', serial:'27241212', type:'Breakdown', status:'Closed', eng:'E1', opened:d(-25), due:d(-25), priority:'High', problem:'Ink drop charge too high; head and charge plates cleaned, 50 ml drained, excitation adjusted.', cover:'Warranty', closed:d(-25), rating:5},
    {id:'KS-10723', serial:'32208865', type:'Consumables order', status:'Closed', eng:null, opened:d(-3), due:d(-2), priority:'Normal', problem:'1 × ink 1067K.', cover:'Chargeable', closed:d(-2), invoice:{no:'KD-1134/26-27', amount:5900, paid:0}}
  ];
  // preventive visits due (from AMC schedule / hours) — for the assistant
  const due = [
    {serial:'32208865', date:d(1), kind:'AMC', eng:'E5'},
    {serial:'28831950', date:d(4), kind:'Warranty', eng:'E1'},
    {serial:'30557219', date:d(2), kind:'AMC', eng:null},
    {serial:'34624505', date:d(5), kind:'AMC', eng:null},
    {serial:'26118342', date:d(3), kind:'AMC', eng:null},
    {serial:'33301177', date:d(6), kind:'Warranty', eng:null},
    {serial:'37483604', date:d(12), kind:'Warranty', eng:null},
    {serial:'31190877', date:d(9), kind:'AMC', eng:'E3'}
  ];
  const checklist = ['Printhead and nozzle','Filters','Ink, makeup and consumables','Power supply and connections','UPS and backup','Earthing and electrical safety','Alarms and error history','Print quality','Cables, hoses, connectors','Mounting and line integration','Cooling and ambient','Cleanliness and PM'];

  // Guided-troubleshooting knowledge base (sample; in the real system it is built from Kadco's own resolved calls and the Hitachi manuals)
  const faults = [
    {key:'dropcharge', name:'Ink drop charge too high', kw:['drop charge','charge too high','charge high','charge alarm'], cause:'Ink residue on the charge plate or deflection plate, or the main ink tank over-filled after a refill.', steps:[
      {ask:'Ask: is the printer showing the alarm on screen right now, and did anyone refill the ink today?', do:'Shut the printer down and start it again. Wait for the ink stream to settle (about 2 minutes).', check:'Is the alarm gone and is it printing?'},
      {ask:'Ask the operator to open the print head cover.', do:'Run "Nozzle check" from the Maintenance menu and watch the ink stream: it should be a single straight line into the gutter.', check:'Is the stream straight and the alarm cleared?'},
      {ask:'Ask the operator to look at the charge plate (the small plate just below the nozzle).', do:'If there is dried ink on it, clean it with the supplied cleaning solution and a lint-free tissue, then run ink circulation.', check:'Is the charge plate clean and the alarm cleared?'},
      {ask:'Ask: how full is the main ink tank window?', do:'If it is above the upper mark, drain about 50 ml into the drainage bottle, then run "Ink circulation".', check:'Is the level between the marks and the alarm cleared?'}]},
    {key:'viscosity', name:'Ink viscosity alarm (high / low)', kw:['viscosity','ink thick','ink thin','viscos'], cause:'Makeup not being added (empty makeup cartridge or wrong type), or the line room is too hot or cold.', steps:[
      {ask:'Ask: which cartridge is fitted as makeup, and is the makeup level above the minimum?', do:'Fit a full makeup cartridge of the correct type (S100A for the UX series).', check:'Does the makeup level rise and the alarm clear within 10 minutes?'},
      {ask:'Ask: what is the temperature near the printer?', do:'Run "Viscosity auto-adjust" from the Maintenance menu and keep the printer running for 15 minutes.', check:'Has the viscosity reading moved into the green band?'},
      {ask:'Ask when the ink was last changed.', do:'If the ink has been in the machine longer than its shelf life, plan an ink change at the next visit; keep printing meanwhile.', check:'Is the printer printing acceptably for now?'}]},
    {key:'noprint', name:'Not printing (no code on product)', kw:['no print','not printing','nothing printing','no code','not marking','blank','stopped printing'], cause:'Print trigger not reaching the printer (photocell / encoder), wrong print mode, or a start-up not completed after a power cut.', steps:[
      {ask:'Ask: is the printer on, and does the screen say "Ready" or show an alarm?', do:'If it shows an alarm, read it out and we take that fault. If it is in "Stop", press Start and wait for "Ready".', check:'Does the screen say Ready?'},
      {ask:'Ask: is the photocell light coming on when a product passes?', do:'Wipe the photocell lens and check the product passes within its range; re-align if needed.', check:'Does the photocell light flash with each product?'},
      {ask:'Ask the operator to run a test print.', do:'From the Print menu select "Test print" onto a piece of card held in front of the head.', check:'Does the test print appear?'},
      {ask:'Ask whether the line was changed or the encoder moved.', do:'Check the encoder cable is connected and the print speed setting matches the line.', check:'Is it printing on product now?'}]},
    {key:'quality', name:'Poor print quality (missing dots, blurred, faint)', kw:['quality','missing dot','blur','faint','smudge','broken','not clear','unclear','half print'], cause:'Partly blocked nozzle, dirty deflection plates, wrong print height, or product too far from the head.', steps:[
      {ask:'Ask the operator to send a photo of the printed code on WhatsApp.', do:'Compare: missing rows = nozzle/plates; blur = distance or speed; faint = ink/viscosity.', check:'Which pattern does the photo show?'},
      {ask:'Ask: what is the distance between the head and the product?', do:'Set the head 10–15 mm from the product and keep it steady.', check:'Is the print sharper?'},
      {ask:'Ask the operator to open the head cover.', do:'Clean the nozzle and the deflection plates with cleaning solution, run "Nozzle check" and a test print.', check:'Is the print complete and clear?'}]},
    {key:'leak', name:'Ink leakage', kw:['leak','leaking','dripping','ink coming out','ink on floor'], cause:'Loose fitting at the main tank or head tube, over-filled tank, or a damaged gutter tube.', steps:[
      {ask:'Ask: where exactly is the ink coming from: the head, the main tank, or the pipe?', do:'Shut the printer down immediately and switch off the mains; wipe the ink with tissue.', check:'Is the printer off and the leak stopped?'},
      {ask:'Ask: was the tank refilled recently?', do:'If the tank is above the upper mark, drain to the mark. Check the fittings at the tank are hand-tight.', check:'After restart, is there any further leak?'},
      {ask:'Ask the operator to send a photo of the leak point.', do:'A leak from the head or gutter tube needs a part: book a visit.', check:'Is a visit needed?'}]},
    {key:'nozzle', name:'Nozzle blocked / ink not ejecting', kw:['nozzle','clog','blocked','not ejecting','no stream','stream'], cause:'Dried ink in the nozzle after a shutdown without cleaning, or a long stop.', steps:[
      {ask:'Ask: how long was the printer off, and was the shutdown done with the cleaning cycle?', do:'Run "Nozzle backflush / clean" from the Maintenance menu twice.', check:'Does the ink stream appear?'},
      {ask:'Ask the operator to open the head cover.', do:'Drop cleaning solution onto the nozzle for 2 minutes, then run "Nozzle check".', check:'Is the stream straight into the gutter?'},
      {ask:'Explain that a deep clean needs an engineer.', do:'Keep the printer off; book a visit for ultra-cleaning of the nozzle and filters.', check:'Is a visit needed?'}]},
    {key:'phase', name:'Phase / charge detection error', kw:['phase','phase error','phase alignment','charge detect'], cause:'Ink stream not aligned to the gutter, viscosity out of band, or a dirty charge sensor.', steps:[
      {ask:'Ask: did the alarm appear after cleaning or after a refill?', do:'Run "Ink stream alignment" from the Maintenance menu and confirm the stream enters the gutter centre.', check:'Is the phase value steady and the alarm cleared?'},
      {ask:'Ask the operator to check the viscosity reading on screen.', do:'If outside the band, follow the viscosity steps; otherwise clean the charge sensor and plates.', check:'Is the alarm cleared?'}]},
    {key:'lowink', name:'Ink / makeup low alarm', kw:['ink low','makeup low','cartridge','empty','low alarm','refill'], cause:'Cartridge empty or not seated; wrong cartridge type.', steps:[
      {ask:'Ask: which alarm, ink or makeup, and is a cartridge fitted?', do:'Fit a full cartridge of the correct type (1067K ink / S100A makeup) and press it home until it clicks.', check:'Does the alarm clear within a minute?'},
      {ask:'Ask: how many cartridges are left at the site?', do:'If fewer than two, raise a consumables order from this call.', check:'Order raised?'}]}
  ];
  const remoteSteps = {
    'Ink drop charge too high':['Shut down and restart the printer','Run nozzle check and ink circulation','Check main ink tank level (over-full?)','Inspect charge plate for ink residue'],
    'Ink viscosity':['Check makeup level and type (S100A)','Run viscosity auto-adjust','Check ambient temperature at the line','Confirm last makeup refill date'],
    'No print':['Check power and UPS','Check photocell / encoder signal','Confirm print trigger from line','Restart and run test print'],
    'default':['Shut down and restart the printer','Run nozzle check','Confirm consumables levels','Send photo of the error screen']
  };
  return {today, d, engineers, customers, machines, calls, due, checklist, remoteSteps, faults};
})();
