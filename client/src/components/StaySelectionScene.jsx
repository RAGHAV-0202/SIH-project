import React, { useState } from 'react';

const DESTINATION_DEFAULT_STAYS = {
  rishikesh: [
    {
      id: 'S-RSK-001',
      name: 'Ganga View Ashram Homestay',
      destination: 'Rishikesh',
      location: 'Tapovan',
      type: 'homestay',
      price_per_night_inr: 1500,
      rating: 4.8,
      is_local_homestay: true,
      local_owner_name: 'Swami Anand & Devika',
      amenities: ['rooftop yoga', 'organic sattvic meals', 'Ganga views', 'herbal tea'],
      description: 'Peaceful ashram-style homestay overlooking the sacred Ganges. Enjoy morning meditation and home-cooked Garhwali vegetarian meals.',
      highlights: ['Direct Ganges river view', 'Daily yoga sessions', 'Authentic Garhwali food'],
      images: ['https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=800&q=80'],
    },
    {
      id: 'S-RSK-002',
      name: 'Tapovan Eco Guesthouse',
      destination: 'Rishikesh',
      location: 'Laxman Jhula',
      type: 'guesthouse',
      price_per_night_inr: 2000,
      rating: 4.6,
      is_local_homestay: true,
      local_owner_name: 'Vikram Rawat',
      amenities: ['balcony mountain view', 'solar water heater', 'wifi', 'cafe'],
      description: 'Family-run eco-friendly guesthouse steps from Laxman Jhula with serene mountain views and peaceful gardens.',
      highlights: ['Central location', 'Eco-conscious', 'Great hospitality'],
      images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80'],
    },
    {
      id: 'S-RSK-003',
      name: 'Zostel Rishikesh (Tapovan)',
      destination: 'Rishikesh',
      location: 'Tapovan',
      type: 'hostel',
      price_per_night_inr: 750,
      rating: 4.5,
      is_local_homestay: false,
      local_owner_name: null,
      amenities: ['rooftop cafe', 'wifi', 'community lounge', 'hot water'],
      description: 'Energetic backpacker hostel in Tapovan with rooftop cafe, Ganga view deck, and daily yoga gatherings.',
      highlights: ['Budget friendly', 'Social community', 'Walk to Ganga'],
      images: ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80'],
    },
  ],
  manali: [
    {
      id: 'S-MNL-001',
      name: 'Himalayan Apple Orchard Stay',
      destination: 'Manali',
      location: 'Old Manali',
      type: 'homestay',
      price_per_night_inr: 1800,
      rating: 4.8,
      is_local_homestay: true,
      local_owner_name: 'Dharamveer Thakur',
      amenities: ['apple orchard garden', 'wood-fired tandoor', 'mountain panorama', 'home-cooked dham'],
      description: 'Traditional Himachali stone-and-wood home surrounded by organic apple trees with panoramic views of snow peaks.',
      highlights: ['Organic apple orchard', 'Stone & timber architecture', 'Authentic Himachali Dham'],
      images: ['https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=800&q=80'],
    },
    {
      id: 'S-MNL-003',
      name: 'Cedar Wood Cottage & Homestay',
      destination: 'Manali',
      location: 'Naggar / Old Manali',
      type: 'guesthouse',
      price_per_night_inr: 2200,
      rating: 4.7,
      is_local_homestay: true,
      local_owner_name: 'Sunil Negi',
      amenities: ['wood stove', 'cedar pine views', 'home-cooked trout', 'mountain garden'],
      description: 'Cozy heritage wooden cottage nestled amidst deodar pine trees with panoramic valley views.',
      highlights: ['Quiet pine forest', 'Personal host care', 'Traditional Himachali meals'],
      images: ['https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80'],
    },
    {
      id: 'S-MNL-002',
      name: 'Old Manali Backpacker Lodge',
      destination: 'Manali',
      location: 'Vashisht',
      type: 'hostel',
      price_per_night_inr: 800,
      rating: 4.4,
      is_local_homestay: false,
      local_owner_name: null,
      amenities: ['communal lounge', 'cafe', 'guitar jams', 'hot water'],
      description: 'Vibrant budget lodge near Vashisht hot springs, popular with trekkers and solo adventurers.',
      highlights: ['Budget friendly', 'Walk to hot springs', 'Backpacker community'],
      images: ['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80'],
    },
  ],
  'spiti valley': [
    {
      id: 'S-SPT-001',
      name: "Tenzin's Mountain Homestay",
      destination: 'Spiti Valley',
      location: 'Kaza',
      type: 'homestay',
      price_per_night_inr: 1200,
      rating: 4.8,
      is_local_homestay: true,
      local_owner_name: 'Tenzin Dorje',
      amenities: ['bukhari heating', 'home-cooked meals', 'mountain views', 'local guide'],
      description: 'A warm Spitian stone home run by Tenzin and his family. Experience authentic Spitian dishes (thukpa, momos) and Buddhist hospitality.',
      highlights: ['Authentic local host', 'Traditional wood-fired Bukhari', 'Organic mountain meals'],
      images: ['https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?auto=format&fit=crop&w=800&q=80'],
    },
    {
      id: 'S-SPT-003',
      name: 'Dekyid Alpine Guest House',
      destination: 'Spiti Valley',
      location: 'Kaza',
      type: 'guesthouse',
      price_per_night_inr: 1800,
      rating: 4.7,
      is_local_homestay: true,
      local_owner_name: 'Dekyid Angmo',
      amenities: ['attached bathroom', 'thermal solar water', 'garden terrace', 'home dining'],
      description: "Family-run guesthouse with beautifully maintained rooms and a lovely garden. Dekyid Aunty's rajma-chawal and butter tea are renowned.",
      highlights: ['Family hospitality', 'Valley garden view', 'Hot water & comfort'],
      images: ['https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80'],
    },
    {
      id: 'S-SPT-005',
      name: "Sonam's Heritage Bukhari Haven",
      destination: 'Spiti Valley',
      location: 'Kaza Khas',
      type: 'homestay',
      price_per_night_inr: 2400,
      rating: 4.9,
      is_local_homestay: true,
      local_owner_name: 'Sonam & Dolma',
      amenities: ['cast-iron bukhari', 'starlink wifi', 'triple-glazed windows', 'organic greenhouse'],
      description: 'Third-generation traditional stone farmhouse with passive solar sunroom and unobstructed views of the Key Gompa ridge.',
      highlights: ['Direct host dividend', 'Starlink internet', 'Cozy winter insulation'],
      images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuBFU8hBJ2lvCMlg2Xq-JSWJp8MzTkW4NL7ZYR1htZHfWvgJcaWIGjXxykzu75PIQKPZ3uQnhwFB4OSPFTH-5jMzjU_NFy0lNgjCn759X9Pw5v4Ty7auuAo_NrNa9nl-AVcOE2JZQb3S7d4yygiKUQvvxp64XpacrEvUKwUnElpGE4YUcnf-3yjtbqE-fSqzZKIvjMC02ZXrUDWl91MR6qrDnv2PyeHt6XWShpjwm-uzYeTfZkC4OhqYFg'],
    },
    {
      id: 'S-SPT-002',
      name: 'Zostel Spiti Valley',
      destination: 'Spiti Valley',
      location: 'Kaza',
      type: 'hostel',
      price_per_night_inr: 750,
      rating: 4.4,
      is_local_homestay: false,
      local_owner_name: null,
      amenities: ['common lounge', 'wifi', 'rooftop cafe', 'traveler community'],
      description: 'Popular backpacker hostel with a vibrant community vibe. Great for meeting fellow mountain explorers and solo travelers.',
      highlights: ['Budget friendly', 'Social lounge', 'Central Kaza walk'],
      images: ['https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=800&q=80'],
    },
  ],
  coorg: [
    {
      id: 'S-CRG-001',
      name: 'Plantation Trails Homestay',
      destination: 'Coorg',
      location: 'Pollibetta',
      type: 'homestay',
      price_per_night_inr: 2200,
      rating: 4.9,
      is_local_homestay: true,
      local_owner_name: 'Bopanna & Kaveri',
      amenities: ['coffee estate walk', 'homemade pandi curry', 'bird watching'],
      description: 'Century-old planter bungalow nestled inside a working 200-acre Arabica coffee plantation.',
      images: ['https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=800&q=80'],
    },
    {
      id: 'S-CRG-002',
      name: 'Madikeri Heritage Homestay',
      destination: 'Coorg',
      location: 'Madikeri',
      type: 'homestay',
      price_per_night_inr: 1600,
      rating: 4.7,
      is_local_homestay: true,
      local_owner_name: 'Muthappa',
      amenities: ['misty hill view', 'traditional breakfast', 'fireplace'],
      description: 'Charming Kodava heritage home overlooking misty Western Ghats valleys.',
      images: ['https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80'],
    },
    {
      id: 'S-CRG-003',
      name: 'Zostel Coorg',
      destination: 'Coorg',
      location: 'Suntikoppa',
      type: 'hostel',
      price_per_night_inr: 800,
      rating: 4.5,
      is_local_homestay: false,
      local_owner_name: null,
      amenities: ['communal bonfire', 'cafe', 'nature trails'],
      description: 'Backpacker hostel in the heart of Coorg coffee hills with social cafe and outdoor games.',
      images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'],
    },
  ],
};

function getStayImage(stay = {}, destination = '') {
  if (stay.images && stay.images.length > 0 && stay.images[0]) {
    return stay.images[0];
  }
  const raw = (stay.destination || destination || '').toLowerCase();
  const defs = DESTINATION_DEFAULT_STAYS[raw];
  if (defs) {
    const match = defs.find(d => d.id === stay.id || d.name === stay.name);
    if (match?.images?.[0]) return match.images[0];
    if (defs[0]?.images?.[0]) return defs[0].images[0];
  }
  return 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=800&q=80';
}

function getStaysForDestination(destination = '', providedOptions = []) {
  if (providedOptions && providedOptions.length >= 3) {
    return providedOptions.slice(0, 3);
  }

  const raw = (destination || '').toLowerCase().trim();
  let foundKey = null;
  if (raw.includes('rishikesh') || raw.includes('dehradun')) foundKey = 'rishikesh';
  else if (raw.includes('manali') || raw.includes('kullu')) foundKey = 'manali';
  else if (raw.includes('coorg') || raw.includes('madikeri')) foundKey = 'coorg';
  else if (raw.includes('spiti') || raw.includes('kaza') || raw.includes('kinnaur') || raw.includes('ladakh')) foundKey = 'spiti valley';

  const defaultList = foundKey ? DESTINATION_DEFAULT_STAYS[foundKey] : [
    {
      id: `S-${raw.slice(0, 3).toUpperCase()}-001`,
      name: `${destination || 'Local'} Heritage Homestay`,
      destination: destination || 'Local Region',
      location: 'Central Old Town / Village',
      type: 'homestay',
      price_per_night_inr: 1800,
      rating: 4.8,
      is_local_homestay: true,
      local_owner_name: 'Verified Village Host Family',
      amenities: ['home cooked meals', 'hot water', 'local travel guide', 'wifi'],
      description: `Authentic resident family homestay in ${destination || 'the region'} with organic farm meals and local hospitality.`,
      highlights: ['100% Direct to host', 'Farm fresh food', 'Peaceful surroundings'],
      images: ['https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=800&q=80'],
    },
    {
      id: `S-${raw.slice(0, 3).toUpperCase()}-002`,
      name: `${destination || 'Scenic'} Orchard & Valley Retreat`,
      destination: destination || 'Local Region',
      location: 'Quiet Valley Edge',
      type: 'homestay',
      price_per_night_inr: 2400,
      rating: 4.9,
      is_local_homestay: true,
      local_owner_name: 'Community Host Collective',
      amenities: ['mountain view', 'traditional breakfast', 'guided village trail'],
      description: `Scenic family retreat overlooking nature trails and terraced gardens in ${destination || 'the area'}.`,
      highlights: ['Panoramic views', 'Handcrafted regional tea', 'Eco-friendly'],
      images: ['https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80'],
    },
    {
      id: `S-${raw.slice(0, 3).toUpperCase()}-003`,
      name: `Zostel / Traveler Hub ${destination || ''}`,
      destination: destination || 'Local Region',
      location: 'Traveler Quarter',
      type: 'hostel',
      price_per_night_inr: 850,
      rating: 4.5,
      is_local_homestay: false,
      local_owner_name: null,
      amenities: ['common cafe', 'high speed wifi', 'rooftop hangout', 'games'],
      description: `Lively backpacker and nomad hostel with coworking cafe, social evenings, and group expeditions.`,
      highlights: ['Budget friendly', 'Social lounge', 'Workstation friendly'],
      images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'],
    }
  ];

  if (providedOptions && providedOptions.length > 0) {
    const merged = [...providedOptions];
    for (const d of defaultList) {
      if (!merged.some(m => m.id === d.id || m.name === d.name)) {
        merged.push(d);
      }
    }
    return merged.slice(0, 3);
  }

  return defaultList.slice(0, 3);
}

export default function StaySelectionScene({
  options = [],
  budget = 30000,
  destination = '',
  people = 2,
  days = 4,
  onSelect,
  onSkip,
  inline = false,
}) {
  const stays = getStaysForDestination(destination, options);
  const [selectedStay, setSelectedStay] = useState(stays[0] || null);
  const [hoveredStay, setHoveredStay] = useState(stays[0] || null);

  const activeStay = hoveredStay || selectedStay;
  const activeCost = activeStay ? (activeStay.price_per_night_inr || 1200) * (days || 4) : 0;
  const remainingBudget = Math.max(0, budget - activeCost);
  const percentUsed = Math.min(100, Math.round((activeCost / Math.max(budget, 1)) * 100));

  // ─── Inline (compact) mode ───────────────────────────────────────────────────
  if (inline) {
    return (
      <div className="w-full rounded-2xl border border-[#DAE2FD]/80 bg-white p-5 shadow-xs text-[#131B2E] space-y-4 font-['Geist']">
        <div className="flex items-center justify-between border-b border-[#DAE2FD]/40 pb-2.5">
          <span className="text-xs font-bold text-[#131B2E] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#006C4A]" />
            Select Curated Local Homestay
          </span>
          <span className="text-xs text-[#4F5D72] font-mono">
            {stays.length} verified outposts
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {stays.map((stay, idx) => (
            <div
              key={stay.id || idx}
              className={`p-4 rounded-xl border flex flex-col justify-between transition-all bg-white ${
                stay.is_local_homestay
                  ? 'border-[#914714] shadow-md ring-1 ring-[#914714]/20'
                  : 'border-slate-200 hover:border-slate-300 shadow-2xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-[#914714] font-medium">⭐ {stay.rating || '4.8'}</span>
                  <span className="text-[#131B2E] font-bold text-sm">₹{stay.price_per_night_inr?.toLocaleString('en-IN')}/n</span>
                </div>
                <h4 className="text-xs font-semibold text-[#131B2E]">{stay.name}</h4>
                {stay.local_owner_name && (
                  <div className="text-[11px] text-[#006C4A] font-medium mt-1">Host: {stay.local_owner_name}</div>
                )}
              </div>

              <button
                type="button"
                onClick={() => onSelect && onSelect(stay)}
                className="mt-3.5 w-full py-2 px-3 rounded-lg bg-[#131B2E] hover:bg-[#914714] text-white font-semibold text-xs cursor-pointer transition-colors shadow-xs"
              >
                Choose
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ─── Full decision scene: Stitch Daylight Editorial Layout ──────────────────
  return (
    <div className="w-full max-w-[1360px] mx-auto flex flex-col gap-6 pb-28 select-none font-['Geist']">

      {/* Editorial Stage Intro Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-[#DAE2FD]/80">
        <div className="flex flex-col gap-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase text-[#914714] tracking-widest font-['Geist']">
              Stage 03 — Local Homestay Curation
            </span>
            <span className="bg-[#82F5C1] text-[#002114] px-2.5 py-0.5 rounded-full text-[11px] font-bold">
              100% Direct Village Dividend
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#131B2E] tracking-tight">
            Choose Your Accommodation in {destination || 'Your Destination'}
          </h1>
          <p className="text-xs sm:text-sm text-[#4F5D72] leading-relaxed">
            Zero aggregator markups. 100% of your stay tariff directly supports verified resident host families, farm-to-table meals, and regional heritage preservation.
          </p>
        </div>

        {/* Quick Reserve KPI Widget */}
        <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-[#DAE2FD]/80 shadow-xs">
          <div>
            <span className="text-[10px] font-bold uppercase text-[#4F5D72] block">Reserve Budget Kept</span>
            <span className="text-xl font-extrabold text-[#131B2E]">₹{remainingBudget.toLocaleString('en-IN')}</span>
          </div>
          <div className="w-px h-8 bg-[#DAE2FD]" />
          <div>
            <span className="text-[10px] font-bold uppercase text-[#4F5D72] block">Tariff ({days} Nights)</span>
            <span className="text-xl font-extrabold text-[#006C4A]">₹{activeCost.toLocaleString('en-IN')}</span>
          </div>
          <div className="w-px h-8 bg-[#DAE2FD]" />
          <div className="flex items-center gap-1.5 bg-[#82F5C1]/30 text-[#002114] px-3 py-1.5 rounded-xl text-xs font-bold">
            <span className="material-symbols-outlined text-[16px] text-[#006C4A]">savings</span>
            <span>{Math.max(0, 100 - percentUsed)}% Kept</span>
          </div>
        </div>
      </div>

      {/* Direct Host Economic Impact Banner */}
      <div className="w-full bg-[#FFFFFF] rounded-2xl border border-[#DAE2FD]/80 p-5 sm:p-6 shadow-xs flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl bg-[#EAEDFF] text-[#006C4A] flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[24px]">handshake</span>
        </div>
        <div className="flex-1 text-xs sm:text-sm text-[#4F5D72] leading-relaxed">
          <strong className="font-bold text-[#131B2E]">100% Direct Local Resident Host Escrow: </strong>
          Unlike traditional OTAs that charge up to 25% commissions, Wandr deposits your entire room tariff directly to host families. Every property is verified for safety, hot water reliability, and homemade organic food.
        </div>
        {onSkip && (
          <button
            type="button"
            onClick={onSkip}
            className="hidden sm:inline-flex text-xs font-semibold text-[#914714] hover:text-[#B05F2B] underline underline-offset-4 cursor-pointer whitespace-nowrap"
          >
            Auto-select top host →
          </button>
        )}
      </div>

      {/* Photo-Rich Verified Homestay Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stays.map((stay, idx) => {
          const isSelected = selectedStay?.id === stay.id;
          const isLocalPick = stay.is_local_homestay;
          const totalStayPrice = (stay.price_per_night_inr || 1200) * (days || 4);
          const stayImg = getStayImage(stay, destination);

          return (
            <div
              key={stay.id || idx}
              onClick={() => setSelectedStay(stay)}
              onMouseEnter={() => setHoveredStay(stay)}
              className={`bg-white rounded-3xl border transition-all duration-300 flex flex-col justify-between overflow-hidden group relative shadow-xs hover:shadow-lg cursor-pointer ${
                isSelected
                  ? 'border-[#914714] ring-2 ring-[#914714]/20 shadow-md'
                  : 'border-[#DAE2FD]/80 hover:border-[#914714]/40'
              }`}
            >
              {/* Photo Banner with Gradient Overlay */}
              <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                <img
                  src={stayImg}
                  alt={stay.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Overlaid Badges */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  {isLocalPick ? (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#914714] text-white shadow-md flex items-center gap-1">
                      ★ Verified Host Pick
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-900/80 backdrop-blur-md text-white shadow-md">
                      {stay.type === 'guesthouse' ? 'Eco Guesthouse' : 'Community Hostel'}
                    </span>
                  )}
                </div>

                <div className="absolute top-3 right-3 flex items-center gap-1.5">
                  {isSelected && (
                    <span className="w-6 h-6 rounded-full bg-[#006C4A] text-white flex items-center justify-center shadow-md">
                      <span className="material-symbols-outlined text-[16px]">check</span>
                    </span>
                  )}
                  <span className="px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-md text-[11px] font-mono font-medium text-[#131B2E] shadow-2xs">
                    Option {idx + 1}
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                  <span className="font-semibold text-amber-300 flex items-center gap-1 bg-black/40 backdrop-blur-md px-2.5 py-0.5 rounded-md font-mono">
                    ⭐ {stay.rating || '4.8'}
                  </span>
                  <span className="font-bold bg-black/40 backdrop-blur-md px-2.5 py-0.5 rounded-md font-mono text-white">
                    ₹{stay.price_per_night_inr?.toLocaleString('en-IN')} / night
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <div className="w-8 h-8 rounded-xl bg-[#EAEDFF] text-[#914714] flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[18px]">home</span>
                    </div>
                    <h4 className="text-base font-bold text-[#131B2E] group-hover:text-[#914714] transition-colors leading-snug">
                      {stay.name}
                    </h4>
                  </div>

                  {/* Host badge */}
                  {stay.local_owner_name ? (
                    <div className="text-xs text-[#006C4A] font-semibold flex items-center gap-1.5 bg-[#82F5C1]/20 px-2.5 py-1 rounded-lg border border-[#82F5C1]/40 my-2">
                      <span className="material-symbols-outlined text-[15px]">verified_user</span>
                      <span>Resident Host: {stay.local_owner_name}</span>
                    </div>
                  ) : (
                    <div className="text-xs text-[#4F5D72] font-semibold flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 my-2">
                      <span className="material-symbols-outlined text-[15px]">groups</span>
                      <span>Backpacker Hub · Kaza Central</span>
                    </div>
                  )}

                  {/* Amenities pills */}
                  {stay.amenities?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 my-2.5">
                      {stay.amenities.slice(0, 4).map((amenity, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#F2F3FF] text-[#131B2E] font-medium capitalize border border-[#DAE2FD]/60"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Description */}
                  <p className="text-xs text-[#4F5D72] leading-relaxed line-clamp-3">
                    {stay.description}
                  </p>
                </div>

                {/* Price & Action Button */}
                <div className="pt-4 border-t border-[#DAE2FD]/40 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] text-[#4F5D72] block font-semibold uppercase tracking-wider">
                      Total ({days || 4} nights)
                    </span>
                    <div className="text-xl font-black text-[#131B2E] font-mono tracking-tight">
                      ₹{totalStayPrice.toLocaleString('en-IN')}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedStay(stay);
                      if (onSelect) onSelect(stay);
                    }}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-xs ${
                      isSelected
                        ? 'bg-[#914714] text-white shadow-md'
                        : 'bg-[#131B2E] hover:bg-[#914714] text-white'
                    }`}
                  >
                    <span>{isSelected ? 'Selected' : 'Select'}</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Trade-off Comparison Pill Bar */}
      <div className="bg-white rounded-2xl border border-[#DAE2FD]/80 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 text-[#4F5D72] flex-wrap">
          <div className="w-7 h-7 rounded-lg bg-[#FFDBC9] text-[#914714] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[16px]">balance</span>
          </div>
          <span className="font-bold text-[#131B2E]">Altitude Lodging Ethics:</span>
          <span className="text-[#4F5D72]">
            Option 1 & 3 provide wood-fired bukhari heating and double-insulated stone walls for cold nights.
          </span>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-center text-[#006C4A] bg-[#82F5C1]/20 border border-[#82F5C1]/40 px-3 py-1 rounded-full font-medium">
          <span className="w-2 h-2 rounded-full bg-[#006C4A]" />
          <span>Community Verified Standard</span>
        </div>
      </div>

      {/* Floating Action Execution Bar (Stage 3/5 Advance) */}
      <div className="fixed bottom-6 left-0 right-0 z-40 px-4 sm:px-6 pointer-events-none">
        <div className="max-w-[1360px] mx-auto flex justify-end">
          <div className="pointer-events-auto bg-white/95 backdrop-blur-xl p-3 sm:p-4 rounded-2xl shadow-xl border border-[#DAE2FD]/80 flex items-center gap-4 sm:gap-6">
            <div className="hidden sm:flex flex-col pr-4 border-r border-[#DAE2FD]">
              <span className="font-['Geist'] text-[10px] font-semibold text-[#4F5D72] uppercase tracking-wider">
                Selected Basecamp
              </span>
              <span className="font-['Geist'] text-xs font-semibold text-[#131B2E]">
                {selectedStay ? selectedStay.name : 'Choose a Homestay'} · ₹{selectedStay ? ((selectedStay.price_per_night_inr || 1200) * (days || 4)).toLocaleString('en-IN') : '0'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (onSelect) onSelect(selectedStay || stays[0]);
                }}
                className="bg-[#914714] hover:bg-[#B05F2B] active:scale-98 text-white px-5 sm:px-7 py-3 rounded-xl font-['Geist'] text-xs font-semibold flex items-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <span>Confirm Homestay & Advance to Activities (Stage 3/5)</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
