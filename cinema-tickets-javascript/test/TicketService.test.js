import { describe, beforeEach, afterEach, expect, it } from '@jest/globals';
import TicketService from '../src/pairtest/TicketService';
import TicketTypeRequest from '../src/pairtest/lib/TicketTypeRequest';
import InvalidPurchaseException from '../src/pairtest/lib/InvalidPurchaseException';
import SeatReservationService from '../src/thirdparty/seatbooking/SeatReservationService';
import TicketPaymentService from '../src/thirdparty/paymentgateway/TicketPaymentService';

jest.mock('../src/pairtest/lib/TicketTypeRequest', () => {
  return jest.fn().mockImplementation((type, number) => {
    return {
      getTicketType: () => type,
      getNoOfTickets: () => number,
    };
  });
});
const mockMakePayment = jest.fn();
jest.mock('../src/thirdparty/paymentgateway/TicketPaymentService', () => {
  return jest.fn().mockImplementation(() => {
    return { makePayment: mockMakePayment };
  });
});
const mockReserveSeat = jest.fn();
jest.mock('../src/thirdparty/seatbooking/SeatReservationService', () => {
  return jest.fn().mockImplementation(() => {
    return { reserveSeat: mockReserveSeat };
  });
});

describe('TicketService', () => {
  let ticketService;
  let adultTicketRequest;
  let childTicketRequest;
  let infantTicketRequest;

  beforeEach(() => {
    ticketService = new TicketService();
    adultTicketRequest = new TicketTypeRequest('ADULT', 1);
    childTicketRequest = new TicketTypeRequest('CHILD', 2);
    infantTicketRequest = new TicketTypeRequest('INFANT', 1);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('throws an error if accountID is not a number greater than 0', () => {
    const purchaseRequest = () =>
      ticketService.purchaseTickets(-1, adultTicketRequest);
    expect(purchaseRequest).toThrow(InvalidPurchaseException);
    expect(purchaseRequest).toThrow(
      'Invalid Purchase: Account ID not recognised.',
    );
  });

  it('throws an error if no tickets are selected', () => {
    const purchaseRequest = () => ticketService.purchaseTickets(101);
    expect(purchaseRequest).toThrow(InvalidPurchaseException);
  });

  it('throws an error if infant or child tickets are purchased without an adult ticket', () => {
    const purchaseRequest = () =>
      ticketService.purchaseTickets(
        101,
        childTicketRequest,
        infantTicketRequest,
      );
    expect(purchaseRequest).toThrow(InvalidPurchaseException);
    expect(purchaseRequest).toThrow(
      'Invalid Purchase: An Adult ticket must be purchased alongside a Child or Infant ticket.',
    );
  });

  it('throws an error if a ticket type is unrecognised', () => {
    const falseTicketRequest = new TicketTypeRequest('FALSE', 1);
    const purchaseRequest = () =>
      ticketService.purchaseTickets(
        101,
        falseTicketRequest,
        adultTicketRequest,
      );
    expect(purchaseRequest).toThrow(InvalidPurchaseException);
    expect(purchaseRequest).toThrow(
      'Invalid Purchase: Unkown ticket type: FALSE',
    );
  });

  it('throws an error if total number of tickets exceed 20', () => {
    const largeTicketRequest = new TicketTypeRequest('ADULT', 20);
    const purchaseRequest = () =>
      ticketService.purchaseTickets(
        101,
        largeTicketRequest,
        infantTicketRequest,
      );
    expect(purchaseRequest).toThrow(InvalidPurchaseException);
    expect(purchaseRequest).toThrow(
      'Invalid Purchase: Exceeded Maximum limit of 20 tickets.',
    );
  });

  it('successfully purchases tickets', () => {
    expect(() =>
      ticketService.purchaseTickets(
        101,
        adultTicketRequest,
        childTicketRequest,
      ),
    ).not.toThrow();
  });

  it('makes payment and reserves seats when successful', () => {
    const ticketRequest = new TicketTypeRequest('ADULT', 2);

    ticketService.purchaseTickets(101, ticketRequest);
    expect(mockMakePayment).toHaveBeenCalledTimes(1);
    expect(mockReserveSeat).toHaveBeenCalledTimes(1);
  });

  it('makes payment with the correct total amount', () => {
    const adultTicketCost = 20;
    const childTicketCost = 10;
    const infantTicketCost = 0;
    // puchase of 1 adult tickets, 2 child and 1 infant.
    const totalCost =
      adultTicketCost + childTicketCost + childTicketCost + infantTicketCost;

    ticketService.purchaseTickets(
      101,
      adultTicketRequest,
      childTicketRequest,
      infantTicketRequest,
    );
    expect(mockMakePayment).toHaveBeenCalledWith(101, totalCost);
  });

  it('makes seat reservation for correct amount of seats', () => {
    // Total of 4 tickets - 3 seats required.
    const requiredSeats = 3;

    ticketService.purchaseTickets(
      101,
      adultTicketRequest,
      childTicketRequest,
      infantTicketRequest,
    );
    expect(mockReserveSeat).toHaveBeenCalledWith(101, 3);
  });
});
