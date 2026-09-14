import React, { useState } from 'react';
import TransportSelectionScene from './TransportSelectionScene';

export default function JourneyRail({
  dayPlans = [],
  selectedStay = null,
  transportOptions = [],
  stayOptions = [],
  budget = 30000,
  destination = '',
  onUpdateTransport = null,
  onUpdateStay = null,
  highlightedField = null,
  changedDay = null,
}) {
  const [editingItemId, setEditingItemId] = useState(null);

  if (!dayPlans || dayPlans.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-[var(--ink-muted)]">
        No itinerary items available
      </div>
    );
  }

  return (
    <div className="relative py-4">
      {/* Central Route Line on desktop, left rail on mobile */}
      <div
        className="absolute top-6 bottom-6 left-4 md:left-1/2 w-0.5 -translate-x-1/2 bg-[var(--route)] opacity-70"
        aria-hidden="true"
      />

      <div className="space-y-12">
        {dayPlans.map((dayPlan) => {
          // Collect items for this day
          const items = [];

          if (dayPlan.transport) {
            items.push({
              id: `transport-${dayPlan.day}`,
              type: 'transit',
              time: dayPlan.transport.departure || 'Morning',
              title: `${dayPlan.transport.operator} (${dayPlan.transport.mode})`,
              subtitle: `Duration ${dayPlan.transport.duration_hours}h · ₹${dayPlan.transport.price_inr?.toLocaleString('en-IN')}/seat`,
              raw: dayPlan.transport,
              isDisrupted: highlightedField === 'transport' && (changedDay === 'all' || changedDay === dayPlan.day),
              canEdit: !!onUpdateTransport,
            });
          }

          if (dayPlan.activities && dayPlan.activities.length > 0) {
            dayPlan.activities.forEach((act, actIdx) => {
              items.push({
                id: `act-${dayPlan.day}-${actIdx}`,
                type: 'activity',
                time: actIdx === 0 ? '10:00' : '14:30',
                title: act.name,
                subtitle: `${act.duration_hours}h · ${act.description}`,
                category: act.category,
                raw: act,
                isDisrupted: highlightedField === 'activities' && (changedDay === 'all' || changedDay === dayPlan.day),
                canEdit: false,
              });
            });
          }

          if (dayPlan.stay || selectedStay) {
            const stayObj = dayPlan.stay || selectedStay;
            items.push({
              id: `stay-${dayPlan.day}`,
              type: 'stay',
              time: '18:00',
              title: stayObj.name,
              subtitle: `₹${stayObj.price_per_night_inr?.toLocaleString('en-IN')}/night${stayObj.local_owner_name ? ` · Host: ${stayObj.local_owner_name}` : ''}`,
              isLocalPick: stayObj.is_local_homestay,
              raw: stayObj,
              isDisrupted: highlightedField === 'stay' && (changedDay === 'all' || changedDay === dayPlan.day),
              canEdit: !!onUpdateStay,
            });
          }

          return (
            <div key={dayPlan.day} className="relative">
              {/* Day Header Marker */}
              <div className="flex items-center gap-3 pl-2 md:pl-0 md:justify-center mb-6">
                <div className="relative z-10 flex items-center gap-2 bg-[var(--paper)] px-3 py-1 border border-[var(--route)] rounded-full text-xs font-semibold text-[var(--route)]">
                  <span className="w-2 h-2 rounded-full bg-[var(--route)]" />
                  <span>Day {dayPlan.day}</span>
                  <span className="text-[var(--ink-muted)] font-normal">· {dayPlan.date}</span>
                </div>
              </div>

              {/* Day's stops branching off left and right */}
              <div className="space-y-6">
                {items.map((item, itemIdx) => {
                  const isLeft = itemIdx % 2 === 0;
                  const isEditing = editingItemId === item.id;

                  return (
                    <div
                      key={item.id}
                      className={`relative flex flex-col md:flex-row items-start ${
                        isLeft ? 'md:flex-row-reverse' : ''
                      }`}
                    >
                      {/* Branch line to center on desktop */}
                      <div
                        className={`hidden md:block absolute top-5 w-1/2 h-0.5 bg-[var(--route)] opacity-50 ${
                          isLeft ? 'right-1/2' : 'left-1/2'
                        }`}
                        aria-hidden="true"
                      />

                      {/* Small node on the rail */}
                      <div
                        className="absolute left-4 md:left-1/2 top-4 w-2.5 h-2.5 -translate-x-1/2 rounded-full bg-[var(--paper)] border-2 border-[var(--route)] z-10"
                        aria-hidden="true"
                      />

                      {/* Card Content branching out */}
                      <div
                        className={`w-full pl-10 md:pl-0 md:w-[46%] ${
                          isLeft ? 'md:pr-6 md:text-right' : 'md:pl-6 md:text-left'
                        }`}
                      >
                        <div
                          className={`p-4 rounded-lg border transition-all ${
                            item.isDisrupted
                              ? 'bg-[var(--paper-card)] border-[var(--madder)] shadow-sm'
                              : 'bg-[var(--paper-card)] border-[var(--paper-border)] hover:border-[var(--paper-border-strong)]'
                          }`}
                        >
                          <div
                            className={`flex items-center gap-2 text-xs text-[var(--ink-muted)] mb-1 ${
                              isLeft ? 'md:justify-end' : ''
                            }`}
                          >
                            <span className="font-mono text-[11px] text-[var(--route)]">{item.time}</span>
                            <span>·</span>
                            <span className="capitalize">{item.type}</span>
                            {item.isLocalPick && (
                              <span className="badge-local-pick ml-1">
                                ★ Local Pick
                              </span>
                            )}
                            {item.isDisrupted && (
                              <span className="text-[11px] text-[var(--madder)] font-medium ml-1">
                                Adjusted
                              </span>
                            )}

                            {/* "Change" action on finished itinerary cards */}
                            {item.canEdit && !isEditing && (
                              <button
                                type="button"
                                onClick={() => setEditingItemId(item.id)}
                                className="text-[11px] text-[var(--route)] hover:underline ml-2 font-medium cursor-pointer"
                              >
                                Change
                              </button>
                            )}
                          </div>

                          <h4 className="text-sm font-semibold text-[var(--ink)]">
                            {item.title}
                          </h4>

                          <p className="text-xs text-[var(--ink-dim)] mt-1 leading-relaxed">
                            {item.subtitle}
                          </p>

                          {/* Inline Edit Picker for Transit */}
                          {isEditing && item.type === 'transit' && (
                            <div className="mt-3 pt-3 border-t border-[var(--paper-border)] text-left">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-[11px] font-semibold text-[var(--ink)]">
                                  Select alternative transit connection:
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setEditingItemId(null)}
                                  className="text-[11px] text-[var(--ink-muted)] hover:underline cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </div>
                              <TransportSelectionScene
                                options={transportOptions.length > 0 ? transportOptions : [item.raw]}
                                budget={budget}
                                destination={destination}
                                initialStage={item.raw?.mode?.includes('flight') ? 'sky' : 'road'}
                                onSelect={(newOpt) => {
                                  onUpdateTransport(newOpt);
                                  setEditingItemId(null);
                                }}
                                inline={true}
                              />
                            </div>
                          )}

                          {/* Inline Edit Picker for Stay */}
                          {isEditing && item.type === 'stay' && (
                            <div className="mt-3 pt-3 border-t border-[var(--paper-border)] text-left space-y-2">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-[11px] font-semibold text-[var(--ink)]">
                                  Select alternative lodging:
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setEditingItemId(null)}
                                  className="text-[11px] text-[var(--ink-muted)] hover:underline cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </div>

                              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                                {(stayOptions.length > 0 ? stayOptions : [item.raw]).map((stay) => (
                                  <div
                                    key={stay.id}
                                    className="p-3 rounded border border-[var(--paper-border)] bg-[var(--paper)] text-xs space-y-2"
                                  >
                                    <div className="flex items-center justify-between gap-2">
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="font-semibold text-[var(--ink)]">{stay.name}</span>
                                        {stay.is_local_homestay && (
                                          <span className="badge-local-pick text-[10px] whitespace-nowrap">
                                            ★ Local Pick
                                          </span>
                                        )}
                                      </div>
                                      <span className="font-bold text-xs text-[var(--route)] font-mono whitespace-nowrap">
                                        ₹{stay.price_per_night_inr?.toLocaleString('en-IN')}/night
                                      </span>
                                    </div>

                                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-[var(--paper-border)] text-[11px] text-[var(--ink-muted)]">
                                      <span>{stay.local_owner_name ? `Host: ${stay.local_owner_name}` : 'Verified Local Stay'}</span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          onUpdateStay(stay);
                                          setEditingItemId(null);
                                        }}
                                        className="btn-route text-xs py-1 px-3 whitespace-nowrap"
                                      >
                                        Choose this
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
