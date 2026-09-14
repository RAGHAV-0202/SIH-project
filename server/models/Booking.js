const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  bookingId: { type: String, required: true, unique: true },
  itinerary: { type: mongoose.Schema.Types.ObjectId, ref: 'Itinerary', required: true },
  status: {
    type: String,
    enum: ['pending', 'booked', 'modified', 'cancelled'],
    default: 'booked',
  },
  disruptions: [{
    type: { type: String, enum: ['transport_cancelled', 'weather_alert', 'stay_unavailable'] },
    details: mongoose.Schema.Types.Mixed,
    resolved: { type: Boolean, default: false },
    resolvedAt: Date,
    oldItinerarySnapshot: mongoose.Schema.Types.Mixed,
    newItinerarySnapshot: mongoose.Schema.Types.Mixed,
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

bookingSchema.pre('save', function () {
  this.updatedAt = Date.now();
});

module.exports = mongoose.model('Booking', bookingSchema);
