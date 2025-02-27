import { Injectable } from '@angular/core';
import { Client } from '@stomp/stompjs';
import { BehaviorSubject, Observable } from 'rxjs';
import SockJS from 'sockjs-client';

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
  private stompClient!: Client;
  private readonly notificationsSubject = new BehaviorSubject<any[]>(this.loadNotificationsFromStorage());
  private connectionPromise!: Promise<void>;

  constructor() {}

  connect(userId: string): void {
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
        this.subscribeToUserNotifications(userId);
        resolve();
      };
      this.stompClient.onStompError = (error) => {
        console.error('WebSocket error:', error);
        reject(error);
      };
      this.stompClient.connectHeaders = { 'user-id': userId };
    });

    this.stompClient.activate();
  }

  subscribeToUserNotifications(userId: string): void {
    if (!this.stompClient.connected) return;

    this.stompClient.subscribe(`/user/${userId}/queue/tickets`, (message) => {
      const payload = JSON.parse(message.body);
      const notification = { message: payload.message, timestamp: new Date().toISOString(), read: false };
      const currentNotifications = this.notificationsSubject.value;
      currentNotifications.unshift(notification); // Add new notification to the top
      this.notificationsSubject.next(currentNotifications);
      this.saveNotificationsToStorage(currentNotifications);
    });
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
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.deactivate();
    }
  }
}
