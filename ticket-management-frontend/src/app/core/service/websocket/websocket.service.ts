import { Injectable, OnDestroy } from '@angular/core';
import { Client, IFrame, StompSubscription } from '@stomp/stompjs';
import { BehaviorSubject, Observable } from 'rxjs';
import SockJS from 'sockjs-client';

// Define the exact structure that matches your backend NotificationMessage class
interface NotificationMessage {
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class WebsocketService implements OnDestroy {
  private stompClient!: Client;
    private readonly notificationSubject = new BehaviorSubject<string>('');
  private subscriptions: StompSubscription[] = [];

  constructor() {
    this.initializeStompClient();
  }

  private initializeStompClient(): void {
    console.log('Initializing STOMP client');

    this.stompClient = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (msg: string) => {
        console.log('STOMP Debug:', msg);
      }
    });

    this.stompClient.onConnect = (frame: IFrame) => {
      console.log('WebSocket connected:', frame);
    };

    this.stompClient.onStompError = (frame: IFrame) => {
      console.error('STOMP error:', frame);
    };

    this.stompClient.onWebSocketClose = (event) => {
      console.log('WebSocket closed:', event);
    };
  }

  async subscribeToUserNotifications(userId: string): Promise<void> {
    const destination = `/user/${userId}/queue/tickets`;
    console.log(`Subscribing to ${destination}`);

    try {
      const subscription = this.stompClient.subscribe(
        destination,
        (message) => {
          console.log('Raw message received:', message);
          console.log('Message body:', message.body);

          try {
            // Parse the message body as JSON
            const payload = JSON.parse(message.body);
            console.log('Parsed payload:', payload);

            // Check if the payload has a message property
            if (payload && payload.message) {
              console.log('Notification message:', payload.message);
              this.notificationSubject.next(payload.message);
            } else {
              console.warn('Received payload without message property:', payload);
            }
          } catch (error) {
            console.error('Error parsing message:', error);
            // If parsing fails, use the raw message body
            if (typeof message.body === 'string' && message.body.trim() !== '') {
              console.log('Using raw message body:', message.body);
              this.notificationSubject.next(message.body);
            }
          }
        },
        {
          id: `user-${userId}-subscription`,
        }
      );

      this.subscriptions.push(subscription);
      console.log(`Successfully subscribed to ${destination}`);
    } catch (error) {
      console.error(`Error subscribing to ${destination}:`, error);
    }
  }

  private async waitForConnection(timeout = 10000): Promise<void> {
    console.log('Waiting for WebSocket connection...');

    return new Promise<void>((resolve, reject) => {
      const startTime = Date.now();

      const checkConnection = () => {
        if (this.stompClient.connected) {
          console.log('WebSocket connected successfully');
          resolve();
          return;
        }

        if (Date.now() - startTime > timeout) {
          console.error('WebSocket connection timeout');
          reject(new Error('WebSocket connection timeout'));
          return;
        }

        setTimeout(checkConnection, 500);
      };

      checkConnection();
    });
  }

  private subscribeToUserQueue(userId: string): void {
    const destination = `/user/${userId}/queue/tickets`;
    console.log(`Subscribing to ${destination}`);

    try {
      const subscription = this.stompClient.subscribe(destination, (message) => {
        console.log('Raw message received:', message);
        console.log('Message body:', message.body);

        try {
          // Try to parse the message body as JSON
          const payload = JSON.parse(message.body);
          console.log('Parsed payload:', payload);

          // Check if the payload has a message property
          if (payload && typeof payload.message === 'string') {
            console.log('Notification message:', payload.message);
            this.notificationSubject.next(payload.message);
          } else {
            // If the payload doesn't have a message property but is a string itself
            if (typeof payload === 'string') {
              console.log('Using payload as message:', payload);
              this.notificationSubject.next(payload);
            } else {
              // If the payload is an object but doesn't have a message property
              console.warn('Received payload without message property:', payload);
              // Try to stringify the object as a fallback
              this.notificationSubject.next(JSON.stringify(payload));
            }
          }
        } catch (error) {
          console.error('Error parsing message:', error);
          // If parsing fails, try to use the raw message body
          if (typeof message.body === 'string' && message.body.trim() !== '') {
            console.log('Using raw message body:', message.body);
            this.notificationSubject.next(message.body);
          }
        }
      }, {
        id: `user-${userId}-subscription`
      });

      this.subscriptions.push(subscription);
      console.log(`Successfully subscribed to ${destination}`);
    } catch (error) {
      console.error(`Error subscribing to ${destination}:`, error);
    }
  }

  private unsubscribeAll(): void {
    this.subscriptions.forEach(subscription => {
      try {
        if (subscription && subscription.id) {
          subscription.unsubscribe();
          console.log(`Unsubscribed from ${subscription.id}`);
        }
      } catch (error) {
        console.error(`Error unsubscribing:`, error);
      }
    });

    this.subscriptions = [];
  }

  getNotifications(): Observable<string> {
    return this.notificationSubject.asObservable();
  }

  disconnect(): void {
    console.log('Disconnecting WebSocket');
    this.unsubscribeAll();

    if (this.stompClient && this.stompClient.active) {
      this.stompClient.deactivate();
      console.log('STOMP client deactivated');
    }
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
