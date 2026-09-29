const corridors = require('../data/corridors.json');

async function getTrafficConditions() {
  const hour = new Date().getHours();
  const isPeak = (hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 20);
  
  return {
    isPeak,
    modifier: isPeak ? 1.5 : 1.0,
    crowd_delay_min: isPeak ? 8 : 2,
    corridors: corridors.corridors.map(c => ({
      name: c.name,
      congestion: isPeak ? c.peak_congestion_level : c.peak_congestion_level * 0.6,
      current_speed: isPeak ? c.avg_speed_peak_kmph : c.avg_speed_offpeak_kmph
    }))
  };
}

module.exports = { getTrafficConditions };
