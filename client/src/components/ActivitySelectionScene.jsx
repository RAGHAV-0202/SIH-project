import React, { useState } from 'react';

const DEFAULT_EXPERIENCES = {
  'spiti valley': [
    {
      id: 'act-spt-1',
      name: 'Key Monastery Morning Chanting & Meditation',
      category: 'culture',
      duration_hours: 2.5,
      cost_inr: 0,
      safety_note: 'Gentle Pace · Spiritual Warmth',
      description: 'Join the resident monks at dawn in the 1,000-year-old assembly hall for butter lamp lighting and chanting at 4,166m.',
      icon: 'temple_buddhist',
      image: 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'act-spt-2',
      name: 'Chandratal Moon Lake Alpine Ridge Walk',
      category: 'nature',
      duration_hours: 5,
      cost_inr: 500,
      safety_note: 'Acclimatized Travelers (4,300m)',
      description: 'Crescent-shaped high altitude glacial lake with shifting turquoise reflections. Unmatched panoramic views of the Chandra-Bhaga range.',
      icon: 'landscape',
      image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'act-spt-3',
      name: 'Langza Village Marine Fossil Discovery',
      category: 'adventure',
      duration_hours: 3,
      cost_inr: 200,
      safety_note: 'Moderate Walk · Village Escort',
      description: 'Explore the prehistoric Tethys ocean fossil beds at 4,400m below the imposing golden Buddha statue facing Chau Chau Kang Nilda.',
      icon: 'travel_explore',
      image: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'act-spt-4',
      name: 'Traditional Spitian Cooking with Host Family',
      category: 'culinary',
      duration_hours: 2.5,
      cost_inr: 350,
      safety_note: 'Indoor Hearth · Cozy Evening',
      description: 'Hands-on kitchen session kneading fresh siddu dough, shaping steamed momos, and brewing salted yak butter tea by the wood stove.',
      icon: 'skillet',
      image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'act-spt-5',
      name: 'Dhankar Cliffside Monastery & High Ridge Lake',
      category: 'culture',
      duration_hours: 4,
      cost_inr: 250,
      safety_note: 'Steady Incline · Hydration Check',
      description: 'Precariously perched 12th-century fortress monastery overlooking the confluence of the Spiti and Pin rivers.',
      icon: 'fort',
      image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'act-spt-6',
      name: 'Yak Wool Weaving & Indigenous Loom Session',
      category: 'culture',
      duration_hours: 2,
      cost_inr: 300,
      safety_note: 'Artisanal Studio · Direct Dividend',
      description: 'Learn ancient pit-loom wool processing techniques from local Kaza women cooperatives, preserving traditional Himalayan craft.',
      icon: 'palette',
      image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
    },
  ],
  default: [
    {
      id: 'act-gen-1',
      name: 'Heritage Valley Walking Trail & Local Flora',
      category: 'nature',
      duration_hours: 3,
      cost_inr: 200,
      safety_note: 'All Fitness Levels',
      description: 'Gentle exploration of native pine groves, seasonal wildflower meadows, and scenic riverbanks with a village elder.',
      icon: 'nature_people',
      image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'act-gen-2',
      name: 'Regional Culinary Heritage Masterclass',
      category: 'culinary',
      duration_hours: 2.5,
      cost_inr: 400,
      safety_note: 'Family Kitchen',
      description: 'Learn secret heirloom spices and traditional slow-cooking methods with farm-fresh organic produce.',
      icon: 'soup_kitchen',
      image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'act-gen-3',
      name: 'Ancient Architecture & Cultural Sanctum Visit',
      category: 'culture',
      duration_hours: 3,
      cost_inr: 150,
      safety_note: 'Respectful Cultural Immersion',
      description: 'Private guided walkthrough of protected heritage monuments and sacred shrines with community historians.',
      icon: 'museum',
      image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'act-gen-4',
      name: 'Stargazing & Himalayan Night Sky Observation',
      category: 'nature',
      duration_hours: 2,
      cost_inr: 100,
      safety_note: 'Thermal Layers Recommended',
      description: 'Experience Zero Light Pollution skies. Spot the Milky Way core, passing satellites, and constellations with spotting scope.',
      icon: 'nights_stay',
      image: 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?auto=format&fit=crop&w=800&q=80',
    },
  ],
};

function formatRawActivities(rawActivities = {}, destination = '') {
  const combined = [];
  const outdoor = rawActivities.outdoor || [];
  const indoor = rawActivities.indoor || [];

  outdoor.forEach((act, idx) => {
    combined.push({
      id: `outdoor-${idx}`,
      name: act.name,
      category: act.category || 'nature',
      duration_hours: act.duration_hours || 3,
      cost_inr: act.cost_inr || 0,
      safety_note: act.duration_hours > 4 ? 'Moderate Trek Pace' : 'Gentle Mountain Walk',
      description: act.description || 'Verified local regional activity conducted by licensed community guides.',
      icon: act.category === 'culture' ? 'temple_buddhist' : 'landscape',
      image: 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?auto=format&fit=crop&w=800&q=80',
    });
  });

  indoor.forEach((act, idx) => {
    combined.push({
      id: `indoor-${idx}`,
      name: act.name,
      category: act.category || 'culture',
      duration_hours: act.duration_hours || 2,
      cost_inr: act.cost_inr || 200,
      safety_note: 'Indoor Hearth Session',
      description: act.description || 'Authentic community cultural workshop supporting indigenous artisan families.',
      icon: act.category === 'food' ? 'skillet' : 'palette',
      image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
    });
  });

  if (combined.length >= 4) {
    return combined.slice(0, 6);
  }

  const destKey = (destination || '').toLowerCase();
  const defaults = DEFAULT_EXPERIENCES[destKey];
  if (defaults && defaults.length >= 4) {
    return defaults;
  }

  // If combined has elements from backend, keep them and fill up to 4 with destination-relevant items
  const dynamicDefaults = [
    {
      id: `act-dyn-1`,
      name: `${destination || 'Old Town'} Heritage & Architecture Walk`,
      category: 'culture',
      duration_hours: 2.5,
      cost_inr: 250,
      safety_note: 'Guided Cultural Tour',
      description: `Explore historic streets, ancient monuments, and artisan quarters in ${destination || 'the town'} with a resident cultural guide.`,
      icon: 'temple_buddhist',
      image: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: `act-dyn-2`,
      name: `${destination || 'Scenic Valley'} Nature Trail & Viewpoint`,
      category: 'nature',
      duration_hours: 3.5,
      cost_inr: 0,
      safety_note: 'Gentle Walking Pace',
      description: `Guided walk through lush landscape trails, viewpoints, and hidden natural groves in ${destination || 'the area'}.`,
      icon: 'landscape',
      image: 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: `act-dyn-3`,
      name: `Local Spice, Craft & Farmers Market Immersion`,
      category: 'culture',
      duration_hours: 2.0,
      cost_inr: 100,
      safety_note: 'Village Market Walk',
      description: `Visit centuries-old community bazaars, taste authentic street produce, and meet resident weavers & potters.`,
      icon: 'palette',
      image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: `act-dyn-4`,
      name: `Farm-to-Table Culinary & Tasting Session`,
      category: 'food',
      duration_hours: 2.0,
      cost_inr: 450,
      safety_note: 'Organic Food Tasting',
      description: `Learn how traditional regional dishes are cooked using ancestral earthen methods and home-grown spices.`,
      icon: 'skillet',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    }
  ];

  if (combined.length > 0) {
    const combinedNames = new Set(combined.map(c => c.name.toLowerCase()));
    const needed = dynamicDefaults.filter(d => !combinedNames.has(d.name.toLowerCase()));
    return [...combined, ...needed].slice(0, 6);
  }

  return dynamicDefaults;
}

export default function ActivitySelectionScene({
  activities = {},
  destination = '',
  days = 4,
  onSelect,
  onSkip,
}) {
  const allExperiences = formatRawActivities(activities, destination);

  // Pre-select first 4 experiences by default
  const [selectedIds, setSelectedIds] = useState(
    () => new Set(allExperiences.slice(0, 4).map(e => e.id))
  );
  const [activeFilter, setActiveFilter] = useState('all');

  const toggleExperience = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size > 1) { // Keep at least one selected
          next.delete(id);
        }
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectedList = allExperiences.filter(e => selectedIds.has(e.id));
  const totalHours = selectedList.reduce((acc, curr) => acc + curr.duration_hours, 0);
  const totalCost = selectedList.reduce((acc, curr) => acc + curr.cost_inr, 0);

  const filteredExperiences = allExperiences.filter(e => {
    if (activeFilter === 'all') return true;
    return e.category === activeFilter;
  });

  return (
    <div className="w-full max-w-[1360px] mx-auto flex flex-col gap-6 pb-28 select-none font-['Geist']">

      {/* Editorial Stage Intro Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-[#DAE2FD]/80">
        <div className="flex flex-col gap-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase text-[#914714] tracking-widest font-['Geist']">
              Stage 04 — Curated Regional Experiences
            </span>
            <span className="bg-[#82F5C1] text-[#002114] px-2.5 py-0.5 rounded-full text-[11px] font-bold">
              100% Community Guides
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#131B2E] tracking-tight">
            Curate Your Experiences in {destination || 'Your Destination'}
          </h1>
          <p className="text-xs sm:text-sm text-[#4F5D72] leading-relaxed">
            Select the cultural traditions, heritage exploration, and guided nature walks you wish to weave into your {days}-day journey.
          </p>
        </div>

        {/* Quick Activity Stats KPI Card */}
        <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-[#DAE2FD]/80 shadow-xs">
          <div>
            <span className="text-[10px] font-bold uppercase text-[#4F5D72] block">Selected Experiences</span>
            <span className="text-xl font-extrabold text-[#131B2E]">{selectedIds.size} Activities</span>
          </div>
          <div className="w-px h-8 bg-[#DAE2FD]" />
          <div>
            <span className="text-[10px] font-bold uppercase text-[#4F5D72] block">Total Exploration</span>
            <span className="text-xl font-extrabold text-[#006C4A]">~{totalHours}h Pacing</span>
          </div>
          <div className="w-px h-8 bg-[#DAE2FD]" />
          <div className="flex items-center gap-1.5 bg-[#82F5C1]/30 text-[#002114] px-3 py-1.5 rounded-xl text-xs font-bold">
            <span className="material-symbols-outlined text-[16px] text-[#006C4A]">check_circle</span>
            <span>Altitude Safe</span>
          </div>
        </div>
      </div>

      {/* Category Filter Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: 'all', label: 'All Curated Experiences' },
            { id: 'culture', label: 'Monastery & Heritage' },
            { id: 'nature', label: 'Alpine Nature & Lakes' },
            { id: 'culinary', label: 'Local Culinary Masterclasses' },
            { id: 'adventure', label: 'Geology & Trails' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveFilter(cat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeFilter === cat.id
                  ? 'bg-[#131B2E] text-white shadow-xs'
                  : 'bg-white hover:bg-[#F2F3FF] text-[#4F5D72] border border-[#DAE2FD]/60'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <span className="text-xs text-[#4F5D72]">
          Showing {filteredExperiences.length} curated options
        </span>
      </div>

      {/* Activity Cards Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredExperiences.map((exp) => {
          const isSelected = selectedIds.has(exp.id);

          return (
            <div
              key={exp.id}
              onClick={() => toggleExperience(exp.id)}
              className={`bg-white rounded-2xl border transition-all duration-300 p-5 flex flex-col justify-between cursor-pointer group shadow-xs hover:shadow-md ${
                isSelected
                  ? 'border-[#914714] ring-2 ring-[#914714]/20 shadow-sm'
                  : 'border-[#DAE2FD]/80 hover:border-[#914714]/40'
              }`}
            >
              <div className="space-y-3">
                {/* Header with Icon & Checkbox */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-[#FFDBC9] text-[#914714]' : 'bg-[#EAEDFF] text-[#4F5D72]'
                    }`}>
                      <span className="material-symbols-outlined text-[20px]">{exp.icon}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#914714] block">
                        {exp.category}
                      </span>
                      <h4 className="text-sm font-bold text-[#131B2E] leading-snug group-hover:text-[#914714] transition-colors">
                        {exp.name}
                      </h4>
                    </div>
                  </div>

                  {/* Selection Checkbox Pill */}
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                    isSelected ? 'bg-[#006C4A] text-white shadow-xs' : 'border border-[#DAE2FD] bg-slate-50'
                  }`}>
                    {isSelected && (
                      <span className="material-symbols-outlined text-[16px]">check</span>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-[#4F5D72] leading-relaxed line-clamp-3">
                  {exp.description}
                </p>

                {/* Metadata Pills */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="px-2 py-0.5 rounded-full bg-[#F2F3FF] text-[#131B2E] text-[10px] font-medium border border-[#DAE2FD]/60 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px] text-[#4F5D72]">schedule</span>
                    {exp.duration_hours} hours
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#82F5C1]/20 text-[#006C4A] text-[10px] font-semibold border border-[#82F5C1]/40 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">health_and_safety</span>
                    {exp.safety_note}
                  </span>
                </div>
              </div>

              {/* Bottom Card Action */}
              <div className="mt-4 pt-3 border-t border-[#DAE2FD]/40 flex items-center justify-between text-xs">
                <span className="font-bold text-[#131B2E]">
                  {exp.cost_inr === 0 ? 'Complimentary' : `₹${exp.cost_inr} community fee`}
                </span>

                <span className={`text-[11px] font-bold flex items-center gap-1 ${
                  isSelected ? 'text-[#006C4A]' : 'text-[#914714]'
                }`}>
                  {isSelected ? '✓ Added to Plan' : '+ Tap to Include'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Action Execution Bar (Stage 4/5 Advance) */}
      <div className="fixed bottom-6 left-0 right-0 z-40 px-4 sm:px-6 pointer-events-none">
        <div className="max-w-[1360px] mx-auto flex justify-end">
          <div className="pointer-events-auto bg-white/95 backdrop-blur-xl p-3 sm:p-4 rounded-2xl shadow-xl border border-[#DAE2FD]/80 flex items-center gap-4 sm:gap-6">
            <div className="hidden sm:flex flex-col pr-4 border-r border-[#DAE2FD]">
              <span className="font-['Geist'] text-[10px] font-semibold text-[#4F5D72] uppercase tracking-wider">
                Experience Package
              </span>
              <span className="font-['Geist'] text-xs font-semibold text-[#131B2E]">
                {selectedList.length} Experiences · ~{totalHours}h Paced Activity
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (onSelect) onSelect(selectedList);
                }}
                className="bg-[#914714] hover:bg-[#B05F2B] active:scale-98 text-white px-5 sm:px-7 py-3 rounded-xl font-['Geist'] text-xs font-semibold flex items-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <span>Confirm Experiences & Advance to Final Review (Stage 4/5)</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
