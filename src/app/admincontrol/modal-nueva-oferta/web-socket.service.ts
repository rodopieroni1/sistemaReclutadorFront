import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private socket: WebSocket | undefined;

  connect(url: string): void {
    this.socket = new WebSocket(url);

    this.socket.onopen = () => {};

    this.socket.onmessage = (event) => {
      console.log('Mensaje recibido:', event.data);
      // Aquí puedes implementar la lógica para manejar el mensaje recibido
    };

    this.socket.onerror = (error) => {
      console.error('Error en la conexión WebSocket:', error);
    };

    this.socket.onclose = () => {
      console.log('Conexión WebSocket cerrada');
    };
  }

  sendMessage(message: string): void {
    if (!this.socket) {
      console.error('No hay conexión WebSocket establecida');
      return;
    }
    this.socket.send(message); // Enviar mensaje al servidor
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close(); // Cierra la conexión
    }
  }
}
