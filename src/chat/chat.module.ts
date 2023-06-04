import { Module } from '@nestjs/common';
import { VideoCallGateway } from './video-call.gateway';
import { ChatGateway } from './chat.getway';

@Module({ providers: [ChatGateway, VideoCallGateway] })
export class ChatModule {}
