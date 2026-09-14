const Booking = require('../models/Booking');
const Itinerary = require('../models/Itinerary');

/**
 * Booking Agent — saves itinerary to MongoDB and generates booking confirmation.
 * Simulated booking (no real payment).
 */

const memBookings = new Map();

async function createBooking(itineraryData) {
  // Generate booking ID
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  const bookingId = `TRP-${timestamp}-${random}`;

  let itineraryId = 'demo-itinerary-' + timestamp;

  try {
    // Attempt saving to MongoDB if connected
    const itinerary = new Itinerary(itineraryData);
    await itinerary.save();
    itineraryId = itinerary._id;

    const booking = new Booking({
      bookingId,
      itinerary: itinerary._id,
      status: 'booked',
      disruptions: [],
    });
    await booking.save();
    console.log(`✅ Booking Agent: MongoDB Booking saved — ${bookingId}`);
  } catch (err) {
    console.log(`ℹ️ Booking Agent: Using memory booking fallback (${err.message})`);
  }

  const result = {
    bookingId,
    status: 'booked',
    itineraryId,
    message: `Your trip to ${itineraryData.destination} has been booked!`,
    summary: {
      destination: itineraryData.destination,
      days: itineraryData.days,
      people: itineraryData.people,
      total_cost: itineraryData.cost_breakdown?.total || 0,
      stay: itineraryData.selected_stay?.name,
      outbound: `${itineraryData.selected_transport_outbound?.mode} (${itineraryData.selected_transport_outbound?.operator})`,
    },
    itinerary: itineraryData,
  };

  memBookings.set(bookingId, result);
  return result;
}

async function getBooking(bookingId) {
  try {
    const booking = await Booking.findOne({ bookingId }).populate('itinerary');
    if (booking) return booking;
  } catch {}

  const mem = memBookings.get(bookingId);
  if (mem) return mem;

  throw new Error(`Booking ${bookingId} not found`);
}

module.exports = { createBooking, getBooking };
