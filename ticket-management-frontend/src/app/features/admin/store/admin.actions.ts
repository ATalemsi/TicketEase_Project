import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Page} from "../../../shared/models/page.model";
import {TicketResponse, User} from "../../../shared/models/ticket-response.model";

export const AdminActions = createActionGroup({
  source: 'Admin',
  events: {
    // Load all tickets
    'Load Tickets': props<{ page: number; size: number }>(),
    'Load Tickets Success': props<{ tickets: Page<TicketResponse> }>(),
    'Load Tickets Failure': props<{ error: string }>(),


    'Update User Status': props<{ userId: number, active: boolean }>(),
    'Update User Status Success': props<{ user: User }>(),
    'Update User Status Failure': props<{ error: string }>(),



    // Performance metrics
    'Load Performance Metrics': emptyProps(),
    'Load Performance Metrics Success': props<{ metrics: any }>(),
    'Load Performance Metrics Failure': props<{ error: string }>(),

    // Load tickets by agent
    'Load Agent Tickets': props<{ agentId: number; page: number; size: number }>(),
    'Load Agent Tickets Success': props<{ tickets: Page<TicketResponse> }>(),
    'Load Agent Tickets Failure': props<{ error: string }>(),

    // Load assigned tickets
    'Load Assigned Tickets': props<{ page: number; size: number }>(),
    'Load Assigned Tickets Success': props<{ tickets: Page<TicketResponse> }>(),
    'Load Assigned Tickets Failure': props<{ error: string }>(),



    // Ticket unassignment
    'Load Unassigned Tickets': emptyProps(),
    'Load Unassigned Tickets Success': props<{ tickets: Page<TicketResponse> }>(),
    'Load Unassigned Tickets Failure': props<{ error: string }>(),

    // Assign ticket to agent
    'Assign Ticket': props<{ ticketId: number; agentId: number }>(),
    'Assign Ticket Success': props<{ ticket: TicketResponse }>(),
    'Assign Ticket Failure': props<{ error: string }>(),

    // Load all users
    'Load Users': emptyProps(),
    'Load Users Success': props<{ users: User[] }>(),
    'Load Users Failure': props<{ error: string }>(),


    'Load Agents': emptyProps(),
    'Load Agents Success': props<{ agents: User[] }>(),
    'Load Agents Failure': props<{ error: string }>(),

    // Reset state
    'Reset State': emptyProps(),
  }
});
