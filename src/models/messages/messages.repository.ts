import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Message, MessageDocument } from "./entities/message.entity";
import { ModelRepository } from "../model.repository";

@Injectable()
export class MessagesRepository extends ModelRepository<MessageDocument> {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>
  ) {
    super(messageModel);
  }

  async findTheLastMessage(userId: string, receiverId: string) {
    return await this.messageModel
      .findOne({
        $or: [
          { sender_id: userId, receiver_id: receiverId },
          { sender_id: receiverId, receiver_id: userId },
        ],
      })
      .sort({ _id: -1 })
      .limit(1);
  }

  async getMessagesCount(id: string) {
    return await this.messageModel
      .find({
        $or: [{ sender_id: id }, { receiver_id: id }],
      })
      .count();
  }

  async searchMessagesData(name: any, userId: any, receiverId: any) {
    return await this.messageModel.aggregate([
      {
        $lookup: {
          from: "users",
          let: { senderId: "$sender_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", { $toObjectId: "$$senderId" }] },
              },
            },
          ],
          as: "matches",
        },
      },
      {
        $match: {
          $and: [{ $or: [{ receiver_id: userId }, { sender_id: userId }] }],
        },
      },
      {
        $match: {
          $and: [
            { $or: [{ receiver_id: receiverId }, { sender_id: receiverId }] },
          ],
        },
      },
      { $match: { message: { $regex: name, $options: "i" } } },
      { $sort: { _id: -1 } },
      { $limit: 10 },
      {
        $project: {
          message: "$message",
          sender_id: "$sender_id",
          receiver_id: "$receiver_id",
          file_upload: "$file_upload",
          createdAt: "$createdAt",
          user_id: "$matches._id",
          name: "$matches.name",
          image: "$matches.image",
        },
      },
    ]);
  }

  async getReceiverMessage(id: string) {
    return await this.messageModel.aggregate([
      {
        $lookup: {
          from: "users",
          let: { senderId: "$sender_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", { $toObjectId: "$$senderId" }] },
              },
            },
          ],
          as: "matches",
        },
      },
      {
        $match: {
          $and: [{ $or: [{ receiver_id: id }, { sender_id: id }] }],
        },
      },
      {
        $project: {
          message: "$message",
          sender_id: "$sender_id",
          receiver_id: "$receiver_id",
          file_upload: "$file_upload",
          createdAt: "$createdAt",
          user_id: "$matches._id",
          name: "$matches.name",
          image: "$matches.image",
        },
      },
    ]);
  }

  async getUserMessages(id: string, startFrom: number) {
    return await this.messageModel.aggregate([
      {
        $lookup: {
          from: "users",
          let: { senderId: "$sender_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", { $toObjectId: "$$senderId" }] },
              },
            },
          ],
          as: "matches",
        },
      },
      {
        $lookup: {
          from: "contacts",
          let: { nsenderId: "$sender_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$user_id", "$$nsenderId"] },
              },
            },
            { $limit: 1 },
          ],
          as: "nmatches",
        },
      },
      {
        $match: {
          $and: [{ $or: [{ receiver_id: id }, { sender_id: id }] }],
        },
      },
      { $sort: { _id: -1 } },
      { $skip: startFrom },
      { $limit: 10 },
      {
        $project: {
          message: "$message",
          flag: "$flag",
          sender_id: "$sender_id",
          receiver_id: "$receiver_id",
          file_upload: "$file_upload",
          createdAt: "$createdAt",
          updatedAt: "$updatedAt",
          user_id: "$matches._id",
          name: "$nmatches.name",
          image: "$matches.image",
        },
      },
    ]);
  }
}
