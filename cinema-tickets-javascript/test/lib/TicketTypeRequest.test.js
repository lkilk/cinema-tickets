import { describe, expect, it } from '@jest/globals';
import TicketTypeRequest from '../../src/pairtest/lib/TicketTypeRequest';

describe('TicketTypeRequest', () => {
  it('Should throw a TypeError for an invalid ticket type', () => {
    expect(() => new TicketTypeRequest('INVALID', 1)).toThrow(TypeError);
    expect(() => new TicketTypeRequest('INVALID', 1)).toThrow(
      'type must be ADULT, CHILD, or INFANT',
    );
  });

  it('Should throw a TypeError if noOfTickets is not an integer', () => {
    expect(() => new TicketTypeRequest('ADULT', 'one')).toThrow(TypeError);
    expect(() => new TicketTypeRequest('ADULT', 'one')).toThrow(
      'noOfTickets must be an integer',
    );
  });

  it('getNoOfTickets should return the correct number of tickets', () => {
    const ticketRequest = new TicketTypeRequest('ADULT', 2);
    expect(ticketRequest.getNoOfTickets()).toEqual(2);
  });

  it('getTicketType should return the correct ticket type', () => {
    const ticketRequest = new TicketTypeRequest('ADULT', 2);
    expect(ticketRequest.getTicketType()).toEqual('ADULT');
  });
});
