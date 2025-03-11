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
    if (!this.stompClient || !this.stompClient.connected) {
      console.error("Impossible de s'abonner: client non connecté");
      return;
    }

    console.log(`Souscription au canal /topic/tickets/${userId}`);
    this.stompClient.subscribe(`/topic/tickets/${userId}`, (message) => {
      console.log("Message reçu via topic spécifique:", message);
      this.processMessage(message);
    });
  }

  private processMessage(message: any): void {
    console.log("Traitement du message:", message.body);

    try {
      const payload = JSON.parse(message.body);
      console.log("Données extraites:", payload);

      const notification = {
        message: payload.message,
        timestamp: new Date().toISOString(),
        read: false
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
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.deactivate();
    }
  }
}
