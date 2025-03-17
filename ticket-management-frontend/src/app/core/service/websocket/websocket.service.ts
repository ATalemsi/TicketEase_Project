import { Injectable } from '@angular/core';
import { Client, StompSubscription } from '@stomp/stompjs';
import { BehaviorSubject, Observable, Subscription, of } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import SockJS from "sockjs-client";

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
  private stompClient!: Client;
  private readonly notificationsSubject = new BehaviorSubject<any[]>(this.loadNotificationsFromStorage());
  private connectionPromise!: Promise<void>;
  private roleSubscription: Subscription | null = null;
  private currentUserId: string | null = null;
  private activeStompSubscriptions: StompSubscription[] = [];

  constructor() {}

  // Backward compatible method with single parameter
  connect(userId: string): void;
  // New method with role observable
  connect(userId: string, userRole$: Observable<string | null>): void;
  // Implementation that handles both cases
  connect(userId: string, userRole$?: Observable<string | null>): void {
    this.currentUserId = userId;

    // If userRole$ is not provided, create a default observable with null value
    const roleObservable = userRole$ || of(null);

    this.stompClient = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str) => console.log('STOMP Debug:', str),
    });

    this.connectionPromise = new Promise((resolve, reject) => {
      this.stompClient.onConnect = () => {
        console.log('WebSocket connected');

        // Unsubscribe from previous role subscription if exists
        if (this.roleSubscription) {
          this.roleSubscription.unsubscribe();
        }

        // Subscribe to the role observable
        this.roleSubscription = roleObservable.pipe(
          filter(role => role !== null)
        ).subscribe(role => {
          console.log(`Setting up subscriptions for role: ${role}`);

          // Unsubscribe from any existing topics first
          this.unsubscribeFromAllTopics();

          // If no role provided or null, subscribe to the default user notifications
          if (!role) {
            this.subscribeToUserNotifications(userId);
            return;
          }

          // Subscribe based on role
          if (role === 'CLIENT') {
            this.subscribeToUserNotificationsForClient(userId);
          } else if (role === 'AGENT') {
            this.subscribeToUserNotificationsForAgent(userId);
          } else if (role === 'ADMIN') {
            // Subscribe to both channels for admin
            this.subscribeToUserNotificationsForClient(userId);
            this.subscribeToUserNotificationsForAgent(userId);
          }
        });

        // If no roles are provided, subscribe to default user notifications
        if (!userRole$) {
          this.subscribeToUserNotifications(userId);
        }

        resolve();
      };

      this.stompClient.onStompError = (error) => {
        console.error('WebSocket error:', error);
        reject(error);
      };

      // Set the user-id in headers
      this.stompClient.connectHeaders = {
        'user-id': userId
      };

      // If a role observable is provided, get the current role
      if (userRole$) {
        // Get current role to set in headers before connecting
        userRole$.pipe(
          filter(role => role !== null),
          take(1)
        ).subscribe(role => {
          if (this.stompClient && role) {
            this.stompClient.connectHeaders['user-role'] = role;
          }
          this.stompClient.activate();
        });
      } else {
        // No role provided, just activate the connection
        this.stompClient.activate();
      }
    });
  }

  // Original subscription method for backward compatibility
  subscribeToUserNotifications(userId: string): void {
    if (!this.stompClient || !this.stompClient.connected) {
      console.error("Impossible de s'abonner: client non connecté");
      return;
    }

    console.log(`Souscription au canal /topic/tickets/${userId}`);
    const subscription = this.stompClient.subscribe(`/topic/tickets/${userId}`, (message) => {
      console.log("Message reçu via topic spécifique:", message);
      this.processMessage(message);
    });

    // Store the subscription reference
    this.activeStompSubscriptions.push(subscription);
  }

  private unsubscribeFromAllTopics(): void {
    if (!this.stompClient || !this.stompClient.connected) {
      return;
    }

    // Properly unsubscribe from all active subscriptions
    this.activeStompSubscriptions.forEach(subscription => {
      if (subscription && subscription.id) {
        console.log(`Unsubscribing from subscription: ${subscription.id}`);
        subscription.unsubscribe();
      }
    });

    // Clear the array
    this.activeStompSubscriptions = [];
  }

  subscribeToUserNotificationsForClient(userId: string): void {
    if (!this.stompClient || !this.stompClient.connected) {
      console.error("Impossible de s'abonner: client non connecté");
      return;
    }

    console.log(`Souscription au canal /topic/tickets/${userId}`);
    const subscription = this.stompClient.subscribe(`/topic/tickets/${userId}`, (message) => {
      console.log("Message reçu via topic pour client:", message);
      this.processMessage(message, 'ticket');
    });

    // Store the subscription reference
    this.activeStompSubscriptions.push(subscription);
  }

  subscribeToUserNotificationsForAgent(userId: string): void {
    if (!this.stompClient || !this.stompClient.connected) {
      console.error("Impossible de s'abonner: agent non connecté");
      return;
    }

    console.log(`Souscription au canal /topic/assigned/${userId}`);
    const subscription = this.stompClient.subscribe(`/topic/assigned/${userId}`, (message) => {
      console.log("Message reçu via topic pour agent:", message);
      this.processMessage(message, 'assigned');
    });

    // Store the subscription reference
    this.activeStompSubscriptions.push(subscription);
  }

  async ensureConnected(): Promise<void> {
    if (this.connectionPromise) {
      return this.connectionPromise;
    }
    return Promise.reject(new Error('Connection not initiated'));
  }

  // Support both old and new message processing
  private processMessage(message: any, channel?: string): void {
    console.log("Traitement du message:", message.body);
    try {
      const payload = JSON.parse(message.body);
      console.log("Données extraites:", payload);
      const notification = {
        message: payload.message,
        timestamp: new Date().toISOString(),
        read: false,
        channel: channel || 'ticket' // Default to 'ticket' for backward compatibility
      };

      console.log("Ajout de notification:", notification);
      const currentNotifications = [...this.notificationsSubject.value];
      currentNotifications.unshift(notification);
      this.notificationsSubject.next(currentNotifications);
      this.saveNotificationsToStorage(currentNotifications);
    } catch (error) {
      console.error("Erreur lors du traitement du message:", error);
    }
  }

  getNotifications(): Observable<any[]> {
    return this.notificationsSubject.asObservable();
  }

  markAsRead(index: number): void {
    const notifications = this.notificationsSubject.value;
    if (notifications[index]) {
      notifications[index].read = true;
      this.notificationsSubject.next(notifications);
      this.saveNotificationsToStorage(notifications);
    }
  }

  clearNotifications(): void {
    this.notificationsSubject.next([]);
    this.saveNotificationsToStorage([]);
  }

  private saveNotificationsToStorage(notifications: any[]): void {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }

  private loadNotificationsFromStorage(): any[] {
    const stored = localStorage.getItem('notifications');
    return stored ? JSON.parse(stored) : [];
  }

  disconnect(): void {
    // Clean up rxjs subscription
    if (this.roleSubscription) {
      this.roleSubscription.unsubscribe();
      this.roleSubscription = null;
    }

    // Unsubscribe from all STOMP subscriptions
    this.unsubscribeFromAllTopics();

    // Disconnect the client
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.deactivate();
    }
  }
}
