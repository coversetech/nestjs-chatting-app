import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Contact, ContactDocument } from "./entities/contact.entity";
import { ModelRepository } from "../model.repository";

@Injectable()
export class ContactsRepository extends ModelRepository<ContactDocument> {
  constructor(
    @InjectModel(Contact.name) private contactModel: Model<ContactDocument>
  ) {
    super(contactModel);
  }

  async getAllContacts(userId: string) {
    return await this.contactModel.aggregate([
      {
        $lookup: {
          from: "users",
          let: { userId: "$user_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", { $toObjectId: "$$userId" }] },
              },
            },
          ],
          as: "user",
        },
      },
      {
        $lookup: {
          from: "messages",
          let: { userId: "$user_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$sender_id", "$$userId"] },
              },
            },
            { $sort: { _id: -1 } },
            { $limit: 1 },
          ],
          as: "message",
        },
      },
      { $sort: { name: 1 } },
      { $match: { created_by: userId } },
      {
        $project: {
          name: "$name",
          email: "$email",
          user_id: "$user_id",
          created_by: "$created_by",
          userImg: "$user.image",
          createdAt: "$user.createdAt",
          location: "$user.location",
          message: "$message.message",
          file_upload: "$message.file_upload",
          created_at: "$message.createdAt",
        },
      },
    ]);
  }

  async contactListSearch(name: string, userId: string) {
    return await this.contactModel.aggregate([
      {
        $lookup: {
          from: "users",
          let: { userId: "$user_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", { $toObjectId: "$$userId" }] },
              },
            },
          ],
          as: "user",
        },
      },
      {
        $lookup: {
          from: "messages",
          let: { userId: "$user_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$sender_id", "$$userId"] },
              },
            },
            { $sort: { _id: -1 } },
            { $limit: 1 },
          ],
          as: "message",
        },
      },
      { $sort: { name: 1 } },
      { $match: { name: { $regex: name, $options: "i" } } },
      { $match: { created_by: userId } },
      {
        $project: {
          name: "$name",
          email: "$email",
          user_id: "$user_id",
          created_by: "$created_by",
          userImg: "$user.image",
          createdAt: "$user.createdAt",
          location: "$user.location",
          message: "$message.message",
          file_upload: "$message.file_upload",
          created_at: "$message.createdAt",
        },
      },
    ]);
  }

  async getContactsByUserIdWise(userId: string) {
    return await this.contactModel.aggregate([
      {
        $lookup: {
          from: "users",
          let: { userId: "$user_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", { $toObjectId: "$$userId" }] },
              },
            },
          ],
          as: "user",
        },
      },
      {
        $lookup: {
          from: "messages",
          let: { userId: "$user_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$unread", "0"] },
              },
            },
            {
              $match: {
                $expr: { $eq: ["$sender_id", "$$userId"] },
              },
            },
          ],
          as: "msg",
        },
      },
      { $sort: { msg: -1 } },
      { $match: { created_by: userId } },
      {
        $project: {
          name: "$name",
          email: "$email",
          user_id: "$user_id",
          created_by: "$created_by",
          userImg: "$user.image",
          createdAt: "$user.createdAt",
          location: "$user.location",
          unreadMsg: "$msg.unread",
          last_msg_date: "$last_msg_date",
        },
      },
    ]);
  }

  async getContactListByUserId(userId: string, createdBy: Date) {
    return await this.contactModel.aggregate([
      {
        $lookup: {
          from: "users",
          let: { userId: "$user_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", { $toObjectId: "$$userId" }] },
              },
            },
          ],
          as: "user",
        },
      },
      { $match: { user_id: userId } },
      { $match: { created_by: createdBy } },
      {
        $project: {
          name: "$name",
          email: "$email",
          user_id: "$user_id",
          created_by: "$created_by",
          userImg: "$user.image",
          createdAt: "$user.createdAt",
          location: "$user.location",
        },
      },
    ]);
  }
}
