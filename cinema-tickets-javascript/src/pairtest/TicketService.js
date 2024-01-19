import TicketTypeRequest from './lib/TicketTypeRequest';
import InvalidPurchaseException from './lib/InvalidPurchaseException';
import TicketPaymentService from '../thirdparty/paymentgateway/TicketPaymentService';
import SeatReservationService from '../thirdparty/seatbooking/SeatReservationService';

export default class TicketService {
  /**
   * Should only have private methods other than the one below.
   */

  purchaseTickets(accountId, ...ticketTypeRequests) {
    if (!Number.isInteger(accountId) || accountId <= 0) {
      throw new InvalidPurchaseException(
        'Invalid Purchase: Account ID not recognised.',
      );
    }
    try {
      // check purchase request is valid
      this.#validatePurchase(ticketTypeRequests);
      // calculate total ticket cost
      const totalTicketCost = this.#calculateTicketCost(ticketTypeRequests);
      // make a payment request to `TicketPaymentService`
      this.#makePayment(accountId, totalTicketCost);
      // calculate number of seats
      const seatsToReserve = this.#calculateSeats(ticketTypeRequests);
      // make a seat reservation request to `SeatReservationService`
      this.#reserveSeats(accountId, seatsToReserve);
      return `Successfully reserved ${seatsToReserve} seats. Total cost: £${totalTicketCost}.`;
    } catch (error) {
      throw new InvalidPurchaseException(`Invalid Purchase: ${error.message}`);
    }
  }

  // check purchase request is valid
  #validatePurchase(ticketTypeRequests) {
    if (!ticketTypeRequests || ticketTypeRequests.length === 0) {
      throw new Error(
        'No ticket type selection made, please request an Adult, Child or Infant Ticket.',
      );
    }

    let hasAdultTicket = false;
    let hasChildofInfantTicket = false;

    ticketTypeRequests.forEach((request) => {
      if (request.getTicketType() === 'ADULT') {
        hasAdultTicket = true;
      }
      if (
        request.getTicketType() === 'CHILD' ||
        request.getTicketType() === 'INFANT'
      ) {
        hasChildofInfantTicket = true;
      }
    });

    if (hasChildofInfantTicket && !hasAdultTicket) {
      throw new Error(
        'An Adult ticket must be purchased alongside a Child or Infant ticket.',
      );
    }
  }

  // calculate ticket cost
  #calculateTicketCost(ticketTypeRequests) {
    const initialValue = 0;
    return ticketTypeRequests.reduce((costTotal, request) => {
      switch (request.getTicketType()) {
        case 'ADULT':
          return costTotal + request.getNoOfTickets() * 20;
        case 'CHILD':
          return costTotal + request.getNoOfTickets() * 10;
        case 'INFANT':
          return costTotal;
        default:
          throw new Error(`Unkown ticket type: ${request.getTicketType()}`);
      }
    }, initialValue);
  }

  // make payment request
  #makePayment(accountId, amount) {
    const paymentService = new TicketPaymentService();
    paymentService.makePayment(accountId, amount);
  }

  // calculate seat reservation
  #calculateSeats(ticketTypeRequests) {
    let totalTickets = 0;
    let infantTickets = 0;

    ticketTypeRequests.forEach((request) => {
      const noOfTickets = request.getNoOfTickets();
      totalTickets += noOfTickets;
      //find the number of INFANT tickets
      if (request.getTicketType() === 'INFANT') {
        infantTickets += noOfTickets;
      }
    });

    if (totalTickets > 20) {
      throw new Error('Exceeded Maximum limit of 20 tickets.');
    }

    // remover INFANT tickets from the total
    return totalTickets - infantTickets;
  }

  // make seat reservation request
  #reserveSeats(accountId, seats) {
    const reservationService = new SeatReservationService();
    reservationService.reserveSeat(accountId, seats);
  }
}
