import TicketTypeRequest from './lib/TicketTypeRequest.js';
import InvalidPurchaseException from './lib/InvalidPurchaseException.js';

export default class TicketService {
  /**
   * Should only have private methods other than the one below.
   */

  purchaseTickets(accountId, ...ticketTypeRequests) {
    try {
      // check purchase request is valid
      // calculate correct ticket cost
      // make a payment request to `TicketPaymentService`
      // calculate number of seats
      // make a seat reservation request to `SeatReservationService`
    } catch (error) {
      // throws InvalidPurchaseException
      throw new InvalidPurchaseException(`Invalid Purchase: ${error.message}`);
    }
  }
}
