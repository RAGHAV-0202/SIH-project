function handleDisruption(routes, disruption) {
  // disruption: { type, affected_area, severity }
  return routes.map(route => {
    let affected = false;
    let newSegments = route.segments.map(s => {
      if (s.mode === 'metro' && disruption.type === 'metro_delay') {
        affected = true;
        return { ...s, duration_min: s.duration_min + 15 * disruption.severity, instructions: s.instructions + ' (Expect delays)' };
      }
      if (['bus', 'cab', 'auto'].includes(s.mode) && disruption.type === 'road_closure') {
        affected = true;
        return { ...s, duration_min: s.duration_min + 20, instructions: s.instructions + ' (Rerouted due to closure)' };
      }
      return s;
    });

    if (affected) {
      const newTime = newSegments.reduce((sum, s) => sum + s.duration_min, 0);
      return { ...route, total_time_min: newTime, segments: newSegments, disruption_note: `Adjusted for ${disruption.type}` };
    }
    return route;
  });
}

module.exports = { handleDisruption };
