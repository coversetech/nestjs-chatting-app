import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User, UserDocument } from "./entities/user.entity";
import { ModelRepository } from "../model.repository";

@Injectable()
export class UsersRepository extends ModelRepository<UserDocument> {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {
    super(userModel);
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return await this.userModel.findOne({ email });
  }

  async findByEmailAndGetPassword(email: string): Promise<UserDocument | null> {
    return await this.userModel.findOne({ email }).select("+password");
  }
}
