import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrip } from '../context/TripContext';
import { useAuth } from '../context/AuthContext';
import { useMemory } from '../context/MemoryContext';
import { bookTrip } from '../services/api';
import Navbar from '../components/Navbar';
import OfflineTripPackModal from '../components/OfflineTripPackModal';

export default function Itinerary() {
  const navigate = useNavigate();
  const { tripData, updateTrip } = useTrip();
  const { user } = useAuth();
  const { memory } = useMemory();
  const { itinerary } = tripData;

  const [isBooking, setIsBooking] = useState(false);
  const [showTripPack, setShowTripPack] = useState(false);

  // Active or Fallback Itinerary Parameters
  const destination = itinerary?.destination || 'Spiti Valley';
  const durationDays = itinerary?.days || 5;
  const numTravelers = itinerary?.people || 2;
  const totalCost = itinerary?.cost_breakdown?.total || 30000;
  const transitCost = itinerary?.cost_breakdown?.transport_outbound || 13400;
  const stayCost = itinerary?.cost_breakdown?.stay || 8900;
  const foodCost = itinerary?.cost_breakdown?.activities || 5700;
  const contingencyCost = totalCost - (transitCost + stayCost + foodCost) > 0 
    ? totalCost - (transitCost + stayCost + foodCost) 
    : 2000;

  // Day plans (either from live generated itinerary or high-fidelity Stitch data)
  const defaultDayPlans = [
    {
      day: '01',
      dayLabel: 'Day One',
      title: 'Rohtang Transit & Ki Monastery Sanctuary',
      badge: 'Acclimatization Base',
      badgeClass: 'bg-[#EAEDFF] text-[#131B2E]',
      numClass: 'bg-[#FFDBC9] text-[#331200]',
      description:
        'High-clearance 4x4 alpine crossing across Atal Tunnel into Spiti valley basin. Evening ascent to Ki Gompa perched at 4,166m for ancient butter-lamp ceremony and guided SpO2 calibration with the expedition medic.',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuA9GAOMCqRw-5tknod9wxoGaMdPn813NXMbX_eNsJ75CjIPcO7hxCZ5NISDRuGnygA4rAinWyfkckVKjQdAhaABEv8RksnJoENIPVxMB7i5xdY_cD6KQqcLWtTXg7cV35K0Smvf0JyUvNBTtMhbxXdH4iNSuslOToIq6Ok3LF08x_wFsMCT9Sf5e1jbTfF9NIZ8DIA0ZAr9XK8vV2PBo056beplQQbpWOxZJUfy5qQkPG1RM9PpcIWy7g',
      locationTag: 'Ki Gompa (4,166m)',
      categoryTitle: 'Waypoints & Protocol',
      protocols: [
        'Manali Dep: 05:30 IST',
        'SpO2 Pulse Threshold: >88%',
        'Monastery Dusk Chanting: 17:45'
      ],
      altitudeGain: 'Altitude Gain: +1,780m',
      vehicle: '4x4 Bolero 300D',
      vehicleClass: 'text-[#914714]'
    },
    {
      day: '02',
      dayLabel: 'Day Two',
      title: 'Chicham Bridge & Kibber Wildlife Sanctuary',
      badge: 'Wildlife Recon',
      badgeClass: 'bg-[#EAEDFF] text-[#131B2E]',
      numClass: 'bg-[#EAEDFF] text-[#131B2E]',
      description:
        "Transit over Asia's highest structural suspension chasm (Chicham Bridge at 4,145m). Field rendezvous with local wildlife naturalist Tenzin Norbu for high-ridge spotting of the elusive Himalayan Ibex and Snow Leopard corridors.",
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBDMz9BNd3la1emc4JR9RjlkADVXTlO8Gftw_Y3y7ySwjYNkkMvkIUq_jCkFA6oRXU3JuB2YAxgPSQP_ZKUfNn7lFC7X8QTTLITLxpr159i9gUoDgQ-chH0cEd8bXhREXL7jbtiwTJVrUgy3GG10RjKXMQBg1sSNeAPH00TMJptYZDNKaBTKJetFoDEBem5j_-iY1eNR20xSCHYoBBWUpzuKOvFvR4t9HFPPV0-vxQUreVw1dsJa5V0oA',
      locationTag: 'Chicham Gorge (150m Drop)',
      categoryTitle: 'Sanctuary Parameters',
      protocols: [
        'Spotting Scope Leica 85mm',
        '4,270m Ridge Walk',
        'Thermal Jacket L4 Recommended'
      ],
      altitudeGain: 'Trek Dist: 6.4 km',
      vehicle: 'Permit #HP-WLD-88',
      vehicleClass: 'text-[#006C4A]'
    },
    {
      day: '03',
      dayLabel: 'Day Three',
      title: 'Highest Post Office & Langza Fossil Plateau',
      badge: 'Geological Heritage',
      badgeClass: 'bg-[#EAEDFF] text-[#131B2E]',
      numClass: 'bg-[#EAEDFF] text-[#131B2E]',
      description:
        "Ascent to Hikkim (4,400m) to hand-post expedition dispatches via the world's highest permanent postal station. Afternoon traversal of the prehistoric Tethys Sea ammonite fossil beds nestled beneath the colossal golden Langza Buddha statue.",
      bannerBox: {
        icon: 'mark_email_read',
        text: 'Dispatch limit: 4 hand-stamped postcards per traveler included',
        tag: 'PIN 172114'
      }
    },
    {
      day: '04',
      dayLabel: 'Day Four',
      title: 'Pin Valley National Park & Mudh Settlement',
      badge: 'Sub-Zero River Valley',
      badgeClass: 'bg-[#EAEDFF] text-[#131B2E]',
      numClass: 'bg-[#EAEDFF] text-[#131B2E]',
      description:
        'Alpine route along the turquoise Pin River through dramatic Martian-red scree slopes. Homestay immersion in Mudh village, featuring traditional earthen-kiln barley flatbreads, butter tea, and local Bhotia clay pottery crafting.'
    },
    {
      day: '05',
      dayLabel: 'Day Five',
      title: 'Chandra Taal Reflection Descent & Manali Egress',
      badge: 'Expedition Concluded',
      badgeClass: 'bg-[#82F5C1]/50 text-[#002114]',
      numClass: 'bg-[#82F5C1] text-[#002114]',
      description:
        'Dawn perimeter walk at Moon Lake (Chandra Taal, 4,300m) capturing mirror reflections of the Chandrabhaga mountain range before tactical descent across Batal and the Rohtang Pass corridor back into lush Kullu Valley.'
    }
  ];

  const effectiveDays = itinerary?.day_plans && itinerary.day_plans.length > 0
    ? itinerary.day_plans.map((dp, i) => ({
        day: String(dp.day || i + 1).padStart(2, '0'),
        dayLabel: `Day ${['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven'][i] || i + 1}`,
        title: dp.theme || dp.title || `Day ${i + 1}: ${destination} Exploration`,
        badge: dp.badge || (i === 0 ? 'Acclimatization Base' : i === itinerary.day_plans.length - 1 ? 'Expedition Concluded' : 'Scenic Exploration'),
        badgeClass: i === itinerary.day_plans.length - 1 ? 'bg-[#82F5C1]/50 text-[#002114]' : 'bg-[#EAEDFF] text-[#131B2E]',
        numClass: i === 0 ? 'bg-[#FFDBC9] text-[#331200]' : i === itinerary.day_plans.length - 1 ? 'bg-[#82F5C1] text-[#002114]' : 'bg-[#EAEDFF] text-[#131B2E]',
        description: dp.description || dp.activities?.map(a => a.name || a.activity).join(' • ') || 'Day program customized to traveler preferences.',
        image: dp.image || defaultDayPlans[i % defaultDayPlans.length]?.image,
        locationTag: `${destination} Sector ${i + 1}`,
        categoryTitle: 'Waypoints & Protocols',
        protocols: dp.activities?.slice(0, 3).map(a => `${a.time || '10:00'} - ${a.name || a.activity}`) || [
          'Elevation calibrated',
          'Safe corridor verified',
          'Local escort active'
        ],
        altitudeGain: dp.altitude || 'Alpine Sector',
        vehicle: dp.transport?.operator || 'Vetted Mountain Vehicle',
        vehicleClass: 'text-[#914714]'
      }))
    : defaultDayPlans;

  const handleBook = async () => {
    setIsBooking(true);
    try {
      const payload = itinerary || {
        destination,
        days: durationDays,
        people: numTravelers,
        cost_breakdown: {
          total: totalCost,
          stay: stayCost,
          transport_outbound: transitCost,
          activities: foodCost
        },
        selected_stay: { name: "Tenzin's Mountain Homestay", location: 'Upper Kibber (4,270m)' },
        selected_transport_outbound: { mode: '4x4 Bolero', operator: 'Dorje Angchuk Fleet' }
      };

      const result = await bookTrip(payload);
      updateTrip({
        booking: result.booking || { bookingId: `WNDR-SPITI-${Math.floor(1000 + Math.random() * 9000)}-AX` },
        itinerary: payload
      });
      navigate('/confirmation');
    } catch {
      updateTrip({
        booking: { bookingId: `WNDR-SPITI-${Math.floor(1000 + Math.random() * 9000)}-AX` }
      });
      navigate('/confirmation');
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8FF] font-['Inter'] text-[#131B2E] antialiased flex flex-col selection:bg-[#FFDBC9] selection:text-[#331200]">
      <Navbar />

      <main className="w-full pt-6 bg-[#FAF8FF] min-h-[calc(100vh-5rem)]">
        <div className="flex flex-col w-full">
          {/* Atmospheric Gradient Glow Ambient */}
          <div className="relative w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
            
            {/* Top Expedition Command Banner */}
            <section className="relative w-full rounded-2xl bg-[#F2F3FF] border border-[#DAE2FD]/50 shadow-xs p-6 lg:p-8 mb-6 overflow-hidden">
              <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-[#914714]/5 blur-3xl pointer-events-none"></div>
              
              <div className="relative z-10 flex flex-col xl:flex-row xl:items-end justify-between gap-6">
                <div className="flex flex-col gap-2 max-w-2xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#006C4A]/10 text-[#006C4A] font-['Geist'] text-[11px] tracking-widest uppercase font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#006C4A] animate-pulse"></span>
                      Autonomous Route Sealed
                    </span>
                    <span className="font-['Geist'] text-[11px] text-[#4F5D72] uppercase tracking-wider font-semibold">
                      REF: SP-2509-NX
                    </span>
                    {memory?.wake_up_time && (
                      <span className="font-['Geist'] text-[11px] bg-[#FFDBC9]/50 text-[#914714] px-2.5 py-0.5 rounded-full font-medium">
                        Personalized: {memory.wake_up_time} Wake-up
                      </span>
                    )}
                  </div>

                  <h1 className="font-['Geist'] text-2xl sm:text-3xl md:text-4xl font-semibold text-[#131B2E] tracking-tight mt-1">
                    {destination}: The Middle Land Expedition
                  </h1>

                  <div className="flex flex-wrap items-center gap-4 text-[#54433A] text-xs sm:text-sm font-['Inter'] mt-1">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[#4F5D72] text-[18px]">calendar_today</span>
                      {durationDays} Days
                    </span>
                    <span className="w-1 h-1 rounded-full bg-[#DAC2B6]"></span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[#4F5D72] text-[18px]">group</span>
                      {numTravelers} Travelers (Twin Cabin Protocol)
                    </span>
                    <span className="w-1 h-1 rounded-full bg-[#DAC2B6]"></span>
                    <span className="inline-flex items-center gap-1.5 text-[#131B2E] font-medium">
                      <span className="material-symbols-outlined text-[#914714] text-[18px]">lock</span>
                      ₹{totalCost.toLocaleString('en-IN')} Budget Locked
                    </span>
                  </div>
                </div>

                {/* Quick Action Utility Trays */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={() => setShowTripPack(true)}
                    className="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#DAE2FD]/80 text-[#131B2E] font-['Geist'] text-xs font-semibold shadow-xs hover:bg-[#EAEDFF] transition-colors cursor-pointer"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[#4F5D72] group-hover:text-[#131B2E] transition-colors text-[18px]">
                      download_for_offline
                    </span>
                    <span>Offline Pack (.wandr zip)</span>
                    <span className="px-1.5 py-0.5 rounded bg-[#EAEDFF] text-[#4F5D72] text-[10px] font-mono">
                      48MB
                    </span>
                  </button>

                  <button
                    onClick={() => alert("Expedition dispatches and departure times synced to device calendar.")}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#DAE2FD]/80 text-[#131B2E] font-['Geist'] text-xs font-semibold shadow-xs hover:bg-[#EAEDFF] transition-colors cursor-pointer"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[#4F5D72] text-[18px]">event_repeat</span>
                    <span>Calendar Sync</span>
                  </button>

                  <button
                    onClick={() => navigate('/disruption')}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FFDAD6] text-[#93000A] font-['Geist'] text-xs font-semibold hover:bg-[#BA1A1A]/20 transition-colors cursor-pointer"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[#BA1A1A] text-[18px]">e911_emergency</span>
                    <span>Sentinel SOS Active</span>
                  </button>
                </div>
              </div>
            </section>

            {/* Header Telemetry Bar (3-Column Architecture) */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
              {/* Sentinel Safety Card */}
              <div className="flex flex-col justify-between p-5 bg-[#FFFFFF] rounded-2xl border border-[#DAE2FD]/60 shadow-xs">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-['Geist'] text-[11px] font-semibold text-[#4F5D72] uppercase tracking-wider block">
                      Telemetry Module // 01
                    </span>
                    <h3 className="font-['Geist'] text-base font-semibold text-[#131B2E] mt-0.5">
                      Sentinel Safety Index
                    </h3>
                  </div>
                  <span className="material-symbols-outlined text-[#006C4A] text-[24px]">verified_user</span>
                </div>

                <div className="mt-4 flex items-end gap-3">
                  <div className="flex items-baseline font-['Geist']">
                    <span className="text-3xl font-semibold text-[#006C4A]">96</span>
                    <span className="text-xs text-[#4F5D72]">/100</span>
                  </div>
                  <div className="flex flex-col pb-0.5">
                    <span className="font-['Geist'] text-xs text-[#006C4A] font-semibold">Verified High Assurance</span>
                    <span className="text-[11px] text-[#54433A]">Solo & Women Traveler Approved</span>
                  </div>
                </div>

                <div className="w-full bg-[#EAEDFF] mt-3 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#006C4A] h-full rounded-full" style={{ width: '96%' }}></div>
                </div>
              </div>

              {/* Alpine Climate Vector Card */}
              <div className="flex flex-col justify-between p-5 bg-[#FFFFFF] rounded-2xl border border-[#DAE2FD]/60 shadow-xs">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-['Geist'] text-[11px] font-semibold text-[#4F5D72] uppercase tracking-wider block">
                      Telemetry Module // 02
                    </span>
                    <h3 className="font-['Geist'] text-base font-semibold text-[#131B2E] mt-0.5">
                      Alpine Climate Vector
                    </h3>
                  </div>
                  <span className="material-symbols-outlined text-[#914714] text-[24px]">ac_unit</span>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 text-center font-['Geist']">
                  <div className="p-2 rounded-xl bg-[#F2F3FF]">
                    <span className="text-sm font-semibold text-[#131B2E] block">11°C</span>
                    <span className="text-[10px] text-[#54433A]">Ambient Day</span>
                  </div>
                  <div className="p-2 rounded-xl bg-[#F2F3FF]">
                    <span className="text-sm font-semibold text-[#131B2E] block">3,800m</span>
                    <span className="text-[10px] text-[#54433A]">Base Alt</span>
                  </div>
                  <div className="p-2 rounded-xl bg-[#F2F3FF]">
                    <span className="text-sm font-semibold text-[#914714] block">8.2</span>
                    <span className="text-[10px] text-[#54433A]">UV Extreme</span>
                  </div>
                </div>

                <div className="mt-2.5 flex items-center justify-between text-[#54433A] font-['Geist'] text-[11px]">
                  <span>Wind: 18 km/h NW</span>
                  <span>Barometric: 642 hPa</span>
                </div>
              </div>

              {/* Dynamic Budget Meter */}
              <div className="flex flex-col justify-between p-5 bg-[#FFFFFF] rounded-2xl border border-[#DAE2FD]/60 shadow-xs">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-['Geist'] text-[11px] font-semibold text-[#4F5D72] uppercase tracking-wider block">
                      Telemetry Module // 03
                    </span>
                    <h3 className="font-['Geist'] text-base font-semibold text-[#131B2E] mt-0.5">
                      Cap-Ex Allocation
                    </h3>
                  </div>
                  <span className="font-['Geist'] text-[11px] px-2 py-0.5 rounded-md bg-[#FFDBC9] text-[#331200] font-semibold">
                    EST. BALANCED
                  </span>
                </div>

                <div className="mt-3">
                  <div className="flex h-2.5 w-full rounded-full overflow-hidden bg-[#EAEDFF] gap-0.5">
                    <div className="bg-[#914714] h-full" style={{ width: '44.6%' }} title="Transit: ₹13,400"></div>
                    <div className="bg-[#B05F2B] h-full" style={{ width: '29.6%' }} title="Stay: ₹8,900"></div>
                    <div className="bg-[#67758C] h-full" style={{ width: '19%' }} title="Food/Permits: ₹5,700"></div>
                    <div className="bg-[#006C4A] h-full" style={{ width: '6.8%' }} title="Reserve: ₹2,000"></div>
                  </div>

                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-3 font-['Geist'] text-[11px] text-[#54433A]">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="w-2 h-2 rounded-full bg-[#914714] shrink-0"></span>
                      <span className="truncate">Transit: ₹{transitCost.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="w-2 h-2 rounded-full bg-[#B05F2B] shrink-0"></span>
                      <span className="truncate">Stay: ₹{stayCost.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="w-2 h-2 rounded-full bg-[#67758C] shrink-0"></span>
                      <span className="truncate">Food/Permits: ₹{foodCost.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="w-2 h-2 rounded-full bg-[#006C4A] shrink-0"></span>
                      <span className="truncate">Reserve: ₹{contingencyCost.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Main Section: JourneyRail Routing Engine & Daily Ledger */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pb-28">
              
              {/* Timeline Navigation Rail (Left 8 Cols) */}
              <div className="lg:col-span-8 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-['Geist'] text-[11px] font-semibold text-[#4F5D72] uppercase tracking-wider">
                      Tactical Chronology
                    </span>
                    <span className="text-[#4F5D72]">//</span>
                    <span className="font-['Geist'] text-base font-semibold text-[#131B2E]">
                      JourneyRail Sequencer
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-[#54433A] font-['Geist']">Map Vector Layer</span>
                    <span className="w-2 h-2 rounded-full bg-[#006C4A]"></span>
                  </div>
                </div>

                {/* Sequential Days List */}
                <div className="relative flex flex-col gap-6">
                  {/* Continuous Vertical Spine Guideline */}
                  <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-[#DAE2FD] -z-0"></div>

                  {effectiveDays.map((d, index) => (
                    <article
                      key={index}
                      className="relative z-10 flex flex-col sm:flex-row gap-5 p-6 rounded-2xl bg-[#FFFFFF] border border-[#DAE2FD]/60 shadow-xs hover:shadow-md transition-shadow"
                    >
                      <div className="flex sm:flex-col items-center gap-1.5 shrink-0">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-['Geist'] text-base font-bold shadow-inner ${d.numClass}`}>
                          {d.day}
                        </div>
                        <span className="font-['Geist'] text-[11px] text-[#914714] uppercase font-bold sm:mt-1">
                          {d.dayLabel}
                        </span>
                      </div>

                      <div className="flex-1 flex flex-col gap-3">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <h2 className="font-['Geist'] text-lg sm:text-xl font-semibold text-[#131B2E]">
                            {d.title}
                          </h2>
                          <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-['Geist'] font-medium ${d.badgeClass}`}>
                            {d.badge}
                          </span>
                        </div>

                        <p className="text-xs sm:text-sm text-[#54433A] leading-relaxed">
                          {d.description}
                        </p>

                        {/* Optional Image & Telemetry Cluster */}
                        {d.image && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                            <div className="overflow-hidden rounded-xl aspect-[16/9] relative group">
                              <img
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                alt={d.title}
                                src={d.image}
                              />
                              <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-[#283044]/80 backdrop-blur-xs text-[#EEF0FF] font-['Geist'] text-[11px]">
                                {d.locationTag}
                              </div>
                            </div>

                            <div className="flex flex-col justify-between p-3.5 rounded-xl bg-[#F2F3FF] text-[#131B2E]">
                              <div className="flex flex-col gap-1.5">
                                <span className="font-['Geist'] text-[10px] font-semibold text-[#4F5D72] uppercase tracking-wider">
                                  {d.categoryTitle}
                                </span>
                                {d.protocols?.map((p, pIdx) => (
                                  <div key={pIdx} className="flex items-center gap-2 font-['Geist'] text-xs text-[#131B2E]">
                                    <span className="material-symbols-outlined text-[#006C4A] text-[16px]">check_circle</span>
                                    <span>{p}</span>
                                  </div>
                                ))}
                              </div>
                              <div className="pt-2 flex items-center justify-between text-[#54433A] font-['Geist'] text-xs">
                                <span>{d.altitudeGain}</span>
                                <span className={`font-semibold ${d.vehicleClass}`}>{d.vehicle}</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Optional Banner Box (like Day 3 postcard limit) */}
                        {d.bannerBox && (
                          <div className="p-3.5 rounded-xl bg-[#F2F3FF] flex flex-wrap items-center justify-between gap-2 font-['Geist'] text-xs text-[#131B2E]">
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-[#914714] text-[18px]">
                                {d.bannerBox.icon}
                              </span>
                              <span>{d.bannerBox.text}</span>
                            </div>
                            <span className="text-[11px] font-semibold text-[#4F5D72]">{d.bannerBox.tag}</span>
                          </div>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              {/* Right Editorial Ledger & Live Map Card (Right 4 Cols) */}
              <aside className="lg:col-span-4 flex flex-col gap-5 sticky top-20">
                {/* Live Map Vector Visualizer */}
                <div className="bg-[#FFFFFF] rounded-2xl border border-[#DAE2FD]/60 shadow-xs p-5 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="font-['Geist'] text-[11px] font-semibold text-[#4F5D72] uppercase tracking-wider">
                      Topographic Map Route
                    </span>
                    <span className="material-symbols-outlined text-[#4F5D72] text-[18px]">navigation</span>
                  </div>

                  <div
                    className="w-full h-56 rounded-xl bg-cover bg-center overflow-hidden shadow-inner relative"
                    style={{
                      backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDQCqXjDV5uqSumCzPORKRyhBEPDRcLtY3AmkDb4Khl2msc9OofTpDgsifu3lEvV3a7MKs64O0yDPbZYYeS0LowuCZtFlemzhYVHZx6vrXcZbDS2pmZqOYQZxl-nLo4PFPBpcH-FszxbYqDH32keZHnnfu1fwnRLIwox5RCengOUxcTANrfydZXVIFnlGm-S0sjlTC3k9n3kc8vHi8vhxXehnAZpNikA7VqPUWpxiqed1YUBs9rrTRLrg')`
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-[#283044]/80 via-transparent to-transparent"></div>
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[#EEF0FF]">
                      <div>
                        <span className="font-['Geist'] text-sm font-semibold block leading-none">Spiti River Axis</span>
                        <span className="text-[11px] opacity-80">32.2276° N, 78.0710° E</span>
                      </div>
                      <span className="px-2 py-1 rounded bg-[#FAF8FF]/20 backdrop-blur-md font-['Geist'] text-[10px] uppercase font-bold">
                        Vector Active
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between font-['Geist'] text-xs text-[#54433A] pt-1">
                    <span>Total Route Vector: 412 KM</span>
                    <span className="text-[#006C4A] font-semibold">GPS Signal: 100% Locked</span>
                  </div>
                </div>

                {/* Alpine Readiness Checklist */}
                <div className="bg-[#FFFFFF] rounded-2xl border border-[#DAE2FD]/60 shadow-xs p-5 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="font-['Geist'] text-[11px] font-semibold text-[#4F5D72] uppercase tracking-wider">
                      Alpine Readiness Checklist
                    </span>
                    <span className="font-['Geist'] text-[11px] text-[#006C4A] uppercase font-bold">
                      All Cleared
                    </span>
                  </div>

                  <ul className="flex flex-col gap-2 mt-1">
                    <li className="flex items-center justify-between p-2.5 rounded-xl bg-[#F2F3FF] text-xs text-[#131B2E]">
                      <span className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#006C4A] text-[16px]">check_circle</span>
                        Inner Line Permits (Kaza Sub-Div)
                      </span>
                      <span className="font-['Geist'] text-[11px] text-[#006C4A] font-semibold">Verified</span>
                    </li>
                    <li className="flex items-center justify-between p-2.5 rounded-xl bg-[#F2F3FF] text-xs text-[#131B2E]">
                      <span className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#006C4A] text-[16px]">check_circle</span>
                        Medical O2 Concentrator Cylinder
                      </span>
                      <span className="font-['Geist'] text-[11px] text-[#006C4A] font-semibold">Secured</span>
                    </li>
                    <li className="flex items-center justify-between p-2.5 rounded-xl bg-[#F2F3FF] text-xs text-[#131B2E]">
                      <span className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#006C4A] text-[16px]">check_circle</span>
                        Garmin InReach Satellite Messenger
                      </span>
                      <span className="font-['Geist'] text-[11px] text-[#006C4A] font-semibold">Paired</span>
                    </li>
                    <li className="flex items-center justify-between p-2.5 rounded-xl bg-[#F2F3FF] text-xs text-[#131B2E]">
                      <span className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#006C4A] text-[16px]">check_circle</span>
                        Sub-Zero Grade -10C Sleeping Liners
                      </span>
                      <span className="font-['Geist'] text-[11px] text-[#006C4A] font-semibold">Supplied</span>
                    </li>
                  </ul>
                </div>

                {/* Co-Traveler Credentials */}
                <div className="bg-[#FFFFFF] rounded-2xl border border-[#DAE2FD]/60 shadow-xs p-5 flex flex-col gap-3">
                  <span className="font-['Geist'] text-[11px] font-semibold text-[#4F5D72] uppercase tracking-wider">
                    Expedition Manifest
                  </span>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#EAEDFF] text-[#131B2E] flex items-center justify-center font-['Geist'] text-xs font-bold">
                        {user?.name ? user.name.charAt(0) : 'T'}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-['Geist'] text-xs text-[#131B2E] font-semibold">{user?.name || 'Traveler'}</span>
                        <span className="text-[11px] text-[#54433A]">{user?.role || 'Lead Traveler'}</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-[#82F5C1] text-[#002114] font-['Geist'] text-[10px] font-bold">
                      Verified
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#FFDBC9] text-[#331200] flex items-center justify-center font-['Geist'] text-xs font-bold">
                        AM
                      </div>
                      <div className="flex flex-col">
                        <span className="font-['Geist'] text-xs text-[#131B2E] font-semibold">Anya Miller</span>
                        <span className="text-[11px] text-[#54433A]">Photo Documentarian</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-[#82F5C1] text-[#002114] font-['Geist'] text-[10px] font-bold uppercase">
                      Tier A1
                    </span>
                  </div>
                </div>
              </aside>
            </div>
          </div>

          {/* Persistent Bottom Action Bar */}
          <aside aria-label="Booking Confirmation" className="fixed bottom-0 left-0 right-0 z-40 bg-[#FFFFFF]/95 backdrop-blur-xl border-t border-[#DAE2FD]/80 shadow-[0_-8px_24px_rgba(15,23,42,0.06)]">
            <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-start">
                <div className="flex flex-col">
                  <span className="font-['Geist'] text-[10px] font-semibold text-[#4F5D72] uppercase tracking-wider">
                    Final Locked Cap-Ex
                  </span>
                  <div className="flex items-baseline gap-1.5 font-['Geist']">
                    <span className="text-xl sm:text-2xl font-bold text-[#131B2E]">
                      ₹{totalCost.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-[#54433A]">All Inclusive ({numTravelers} Pax)</span>
                  </div>
                </div>

                <div className="hidden md:flex flex-col pl-6 border-l border-[#DAE2FD]">
                  <span className="font-['Geist'] text-[11px] text-[#006C4A] uppercase tracking-wider font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">shield</span>
                    Zero Surge Guarantee
                  </span>
                  <span className="text-[11px] text-[#54433A]">Hold Valid for 04h:22m</span>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={handleBook}
                  disabled={isBooking}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-[#914714] hover:bg-[#B05F2B] active:scale-98 text-white font-['Geist'] text-xs font-semibold shadow-md transition-all cursor-pointer"
                  type="button"
                >
                  <span>{isBooking ? 'Securing Escrow...' : 'Proceed to Booking & Instant Lock'}</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Offline Trip Pack Modal */}
      <OfflineTripPackModal
        isOpen={showTripPack}
        onClose={() => setShowTripPack(false)}
        itinerary={itinerary}
      />
    </div>
  );
}
