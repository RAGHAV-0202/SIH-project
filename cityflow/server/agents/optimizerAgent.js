function optimizeRoutes(routes, intent) {
  const { preferences = [] } = intent;

  // Defaults
  let wTime = 1, wCost = 1, wCarbon = 1, wComfort = 1;

  if (preferences.includes('fastest')) wTime = 3;
  if (preferences.includes('cheapest')) wCost = 3;
  if (preferences.includes('greenest')) wCarbon = 3;
  
  let walkingPenalty = preferences.includes('least_walking') ? 2 : 1;

  // Find max values for normalization
  const maxTime = Math.max(...routes.map(r => r.total_time_min));
  const maxCost = Math.max(...routes.map(r => r.total_cost_inr));
  const maxCarbon = Math.max(...routes.map(r => r.total_carbon_kg || r.carbon_kg || 0.1));

  const ranked = routes.map(route => {
    const nTime = route.total_time_min / maxTime;
    const nCost = route.total_cost_inr / maxCost;
    const nCarbon = (route.carbon_kg || 0) / maxCarbon;
    const nComfort = 1 - (route.comfort_score / 10); // invert comfort

    let walkDist = 0;
    route.segments.forEach(s => {
      if (s.mode === 'walk') walkDist += s.distance_km;
    });

    const score = (nTime * wTime) + (nCost * wCost) + (nCarbon * wCarbon) + (nComfort * wComfort) + (walkDist * walkingPenalty * 0.5);
    
    return { ...route, score };
  });

  ranked.sort((a, b) => a.score - b.score);
  return ranked;
}

module.exports = { optimizeRoutes };
