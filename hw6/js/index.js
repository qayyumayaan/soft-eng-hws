
const { MakeReservation, LookupReservations, CancelReservation, FindAvailableDates } = require('./processor');

function handleMakeReservation(data) {
  // Extract data from request and call MakeReservation
  const { attendee, dtstart, dtstamp, method, status } = data;
  return MakeReservation(attendee, dtstart, dtstamp, method, status);
}

function handleLookupReservation(patientID) {
  return LookupReservations(patientID);
}

function handleCancelReservation(confirmationCode) {
  return CancelReservation(confirmationCode);
}

function handleFindAvailableDates(data) {
  const { startDate, endDate, numberOfDates } = data;
  return FindAvailableDates(startDate, endDate, numberOfDates);
}

module.exports = {
  handleMakeReservation,
  handleLookupReservation,
  handleCancelReservation,
  handleFindAvailableDates
};
