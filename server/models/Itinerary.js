const mongoose = require('mongoose');

const costBreakdownSchema = new mongoose.Schema({
  transport_outbound: { type: Number, default: 0 },
  transport_return: { type: Number, default: 0 },
  stay: { type: Number, default: 0 },
  food: { type: Number, default: 0 },
  activities: { type: Number, default: 0 },
  local_travel: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
}, { _id: false });

const activitySchema = new mongoose.Schema({
  name: String,
  type: { type: String, enum: ['indoor', 'outdoor'] },
  time: String,
  duration_hours: Number,
  cost_inr: { type: Number, default: 0 },
  category: String, // nature, food, culture, adventure
  description: String,
}, { _id: false });

const dayPlanSchema = new mongoose.Schema({
  day: Number,
  date: String,
  transport: { type: mongoose.Schema.Types.Mixed, default: null },
  stay: { type: mongoose.Schema.Types.Mixed, default: null },
  activities: [activitySchema],
  meals: [{
    type_name: String, // breakfast, lunch, dinner
    suggestion: String,
    estimated_cost_inr: Number,
  }],
}, { _id: false });

const itinerarySchema = new mongoose.Schema({
  origin: { type: String, required: true },
  destination: { type: String, required: true },
  days: { type: Number, required: true },
  people: { type: Number, required: true },
  budget_inr: { type: Number, required: true },
  preferences: [String],
  constraints: {
    max_travel_hours_per_day: Number,
    earliest_start_time: String,
  },
  day_plans: [dayPlanSchema],
  cost_breakdown: costBreakdownSchema,
  selected_transport_outbound: { type: mongoose.Schema.Types.Mixed },
  selected_transport_return: { type: mongoose.Schema.Types.Mixed },
  selected_stay: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Itinerary', itinerarySchema);
