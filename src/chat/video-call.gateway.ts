import { Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { Server } from 'ws';

@WebSocketGateway({ namespace: '/video' })
export class VideoCallGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  vausers = [];
  users = {};

  private logger: Logger = new Logger('MessageGateway');

  async handleConnection(socket: Socket) {
    // Handle new socket connections
    return this.logger.log(`Client connected: ${socket.id}`);
  }

  async handleDisconnect(socket: Socket) {
    // Handle socket disconnections
    return this.logger.log(`Client disconnected: ${socket.id}`);
  }

  @SubscribeMessage('isbusy')
  async onIsBusy(client: Socket, rid: string) {
    for (const key in this.users) {
      if (rid == this.users[key]) {
        client.to(key).emit('itbusy');
      }
    }
  }

  @SubscribeMessage('cutphone')
  async onCutPhone(client: Socket, uid: string) {
    for (const key in this.users) {
      if (uid == this.users[key]) {
        client.to(key).emit('cutphoness');
      }
    }
  }

  @SubscribeMessage('cutanswerd')
  async onCutPhoneAnswered(client: Socket, rsid: string) {
    for (const key in this.users) {
      if (rsid == this.users[key]) {
        client.to(key).emit('cutpeeranswer');
      }
    }
  }

  @SubscribeMessage('answerd')
  async onAnswered(client: Socket, rspid: string, ctype: string) {
    for (const key in this.users) {
      if (rspid == this.users[key]) {
        client.to(key).emit('answered', rspid, ctype);
      }
    }
  }

  @SubscribeMessage('ringcall')
  async onRingCall(
    client: Socket,
    uid: string,
    scid: string,
    name: string,
    image: string,
    ctype: string,
  ) {
    for (const key in this.users) {
      if (uid == this.users[key]) {
        client.to(key).emit('ringcalling', uid, scid, name, image, ctype);
      }
    }
  }

  @SubscribeMessage('vccallmsg')
  async onVideoMessage(client: Socket, message) {
    const data = JSON.parse(message);
    const user = this.findUser(data.username);

    switch (data.type) {
      case 'store_user':
        if (user != null) {
          return;
        }
        const newUser = {
          conn: client.id,
          username: data.username,
        };
        this.vausers.push(newUser);
        break;
      case 'store_offer':
        if (user == null) return;
        user.offer = data.offer;
        break;
      case 'store_candidate':
        if (user == null) {
          return;
        }
        if (user.candidates == null) user.candidates = [];
        user.candidates.push(data.candidate);
        break;
      case 'send_answer':
        if (user == null) {
          return;
        }
        this.sendData(
          {
            type: 'answer',
            answer: data.answer,
          },
          user.conn,
        );
        break;
      case 'send_candidate':
        if (user == null) {
          return;
        }

        this.sendData(
          {
            type: 'candidate',
            candidate: data.candidate,
          },
          user.conn,
        );
        break;
      case 'join_call':
        if (user == null) {
          return;
        }

        this.sendData(
          {
            type: 'offer',
            offer: user.offer,
          },
          client,
        );
        user.candidates.forEach((candidate) => {
          this.sendData(
            {
              type: 'candidate',
              candidate: candidate,
            },
            client,
          );
        });
        break;
    }
  }

  @SubscribeMessage('closevc')
  async onCloseVideoCall(client: Socket, sameId: string) {
    for (const key in this.users) {
      if (sameId == this.users[key]) {
        client.to(key).emit('cutvc');
      }
    }
    this.vausers.forEach((user) => {
      if (user.conn == client.id) {
        this.vausers.splice(this.vausers.indexOf(user), 1);
        return;
      }
    });
  }

  private findUser(username: string) {
    for (let i = 0; i < this.vausers.length; i++) {
      if (this.vausers[i].username == username) {
        return this.vausers[i];
      }
    }
  }
  private sendData(data: any, conn: Socket): void {
    conn.emit('getingonmsgs', JSON.stringify(data));
  }
}
