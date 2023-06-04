import { Injectable } from "@nestjs/common";
import { UsersRepository } from "./users.repository";
import { LogClass } from "src/common/decorators/log-class.decorator";

@Injectable()
@LogClass()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  /* Email Match */
  async userEmailMatch(email: string) {
    const contact = await this.usersRepository.findByEmail(email);
    return contact;
  }

  /* Receiver Data Get */
  async getUserInfo(id: string) {
    const userInfo = await this.usersRepository.findById(id);
    return userInfo;
  }

  /* Current user name edit */
  async userNameUpdate(id: string, name: string) {
    const messageUpdate = await this.usersRepository.updateOne(
      { id },
      { name }
    );

    return messageUpdate;
  }

  /* Notification security */
  async notificationUpdate(id: string, notification: string) {
    const messageUpdate = await this.usersRepository.updateOne(
      { id },
      { notification }
    );
    return messageUpdate;
  }

  /* Notification muted security */
  async notificationMutedUpdate(id: string, isMuted: boolean) {
    const messageUpdate = await this.usersRepository.updateOne(
      { id },
      { is_muted: isMuted }
    );
    return messageUpdate;
  }

  /* Profile Upload */
  async profileUpdate(id: string, image: string) {
    const messageUpdate = await this.usersRepository.updateOne(
      { id },
      { image }
    );
    return messageUpdate;
  }
  /* User leaves chat */
  async userLeave(id: string) {
    const user = await this.usersRepository.updateOne(
      { id },
      { $set: { active: "false" } }
    );
    return user;
  }
}
