const cityAreas = {
  "Chennai":["Anna Nagar","T Nagar","Velachery","Adyar","Besant Nagar","Guindy","Chromepet","Tambaram","Perambur","Nungambakkam"],
  "Coimbatore":["RS Puram","Peelamedu","Gandhipuram","Saibaba Colony","Saravanampatti","Town Hall","Ukkadam","Kovaipudur","Ramanathapuram"],
  "Bangalore":["Whitefield","MG Road","Koramangala","Indiranagar","HSR Layout","BTM Layout","Electronic City","Yelahanka","Jayanagar","Rajajinagar"],
  "Mumbai":["Andheri","Bandra","Juhu","Powai","Dadar","Borivali","Churchgate","Colaba","Worli","Chembur"],
  "Delhi":["Connaught Place","Karol Bagh","Dwarka","Rohini","Lajpat Nagar","Saket","Janakpuri","Chandni Chowk","Vasant Kunj","Greater Kailash"],
  "Hyderabad":["Banjara Hills","Jubilee Hills","Secunderabad","Gachibowli","Hitech City","Madhapur","Begumpet","Kukatpally","Charminar","Mehdipatnam"],
  "Pune":["Shivaji Nagar","Kothrud","Viman Nagar","Koregaon Park","Wakad","Aundh","Hinjewadi","Baner","Camp","Yerwada"],
  "Kolkata":["Salt Lake","Park Street","Howrah","Dum Dum","Garia","New Town","Behala","Ballygunge","Esplanade","Jadavpur"]
};

let slots = [];
let selectedSlot = null;
let intervalTimers = {};

function loadAreas(){
  const city = document.getElementById("city").value;
  const area = document.getElementById("area");
  area.innerHTML="";
  if(city && cityAreas[city]){
    cityAreas[city].forEach(a=>{
      let opt=document.createElement("option");
      opt.text=a; area.add(opt);
    });
    document.getElementById("slotSection").style.display="block";
    renderSlots();
  } else {
    document.getElementById("slotSection").style.display="none";
  }
}

function renderSlots(){
  const container=document.getElementById("slots");
  container.innerHTML="";
  slots=Array(15).fill().map((_,i)=>({id:i+1,status:"available",user:null,startTime:null,endTime:null}));
  slots.forEach(slot=>{
    let div=document.createElement("div");
    div.className="slot available";
    div.textContent="Slot "+slot.id;
    div.onclick=()=>openBookingForm(slot.id);
    container.appendChild(div);
  });
}

function openBookingForm(id){
  selectedSlot=id;
  const slot = slots.find(s=>s.id===id);
  document.getElementById("bookingForm").style.display="block";
  if(slot.status==="available"){
    document.getElementById("formTitle").textContent="Book Slot";
    document.getElementById("bookBtn").style.display="inline-block";
    document.getElementById("takeVehicleBtn").style.display="none";
    document.getElementById("name").value="";
    document.getElementById("vehicle").value="";
    document.getElementById("time").value="";
  } else {
    document.getElementById("formTitle").textContent="Take Vehicle & Pay";
    document.getElementById("bookBtn").style.display="none";
    document.getElementById("takeVehicleBtn").style.display="inline-block";
    document.getElementById("name").value = slot.user.name;
    document.getElementById("vehicle").value = slot.user.vehicle;
  }
}

function confirmBooking(){
  const name=document.getElementById("name").value.trim();
  const vehicle=document.getElementById("vehicle").value.trim();
  const minutes=parseInt(document.getElementById("time").value);

  if(!name||!vehicle||isNaN(minutes)||minutes<=0) return alert("Enter valid details");

  const slot = slots.find(s=>s.id===selectedSlot);
  slot.status="booked";
  slot.user={name,vehicle};
  slot.startTime=Date.now();
  slot.endTime=slot.startTime + minutes*60000;
  updateSlotUI(slot);
  document.getElementById("bookingForm").style.display="none";

  startCountdown(slot);
  alert(`Slot ${slot.id} booked for ${minutes} minute(s).\nExpected cost: ₹${minutes*5}`);
}

function startCountdown(slot){
  if(intervalTimers[slot.id]) clearInterval(intervalTimers[slot.id]);
  intervalTimers[slot.id] = setInterval(()=>{
    const now = Date.now();
    if(now >= slot.endTime && slot.status==="booked"){
      slot.status="expired";
      updateSlotUI(slot);
      clearInterval(intervalTimers[slot.id]);
    }
  }, 1000);
}

function takeVehicle(){
  const slot = slots.find(s=>s.id===selectedSlot);
  const now = Date.now();
  
  const actualMinutes = Math.ceil((now - slot.startTime)/60000);
  const bookedMinutes = Math.ceil((slot.endTime - slot.startTime)/60000);
  const extraMinutes = Math.max(0, actualMinutes - bookedMinutes);
  const normalMinutes = actualMinutes - extraMinutes;

  // ✅ Correct pricing
  const cost = normalMinutes*5 + extraMinutes*10; 

  alert(`Vehicle taken.\nTotal time: ${actualMinutes} min(s)\nNormal: ${normalMinutes} min(s) × ₹5 = ₹${normalMinutes*5}\nFine: ${extraMinutes} min(s) × ₹10 = ₹${extraMinutes*10}\n\nTotal payable: ₹${cost}`);

  // Reset slot
  slot.status="available";
  slot.user=null;
  slot.startTime=null;
  slot.endTime=null;
  updateSlotUI(slot);
  document.getElementById("bookingForm").style.display="none";
  if(intervalTimers[slot.id]) clearInterval(intervalTimers[slot.id]);
}

function updateSlotUI(slot){
  const div=document.querySelectorAll(".slot")[slot.id-1];
  if(slot.status==="available") div.className="slot available";
  else if(slot.status==="booked") div.className="slot booked";
  else if(slot.status==="expired") div.className="slot expired";
  div.textContent="Slot "+slot.id;
}
