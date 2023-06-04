import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ModelRepository } from "../../model.repository";
import { GroupUser, GroupUserDocument } from "../entities/group-user.entity";

@Injectable()
export class GroupUsersRepository extends ModelRepository<GroupUserDocument> {
  constructor(
    @InjectModel(GroupUser.name)
    private groupUserModel: Model<GroupUserDocument>
  ) {
    super(groupUserModel);
  }

  async getGroupById(groupsId: string) {
    return await this.groupUserModel.aggregate([
      {
        $lookup: {
          from: "users",
          let: { id: "$contact_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", { $toObjectId: "$$id" }] },
              },
            },
          ],
          as: "user",
        },
      },
      { $match: { group_id: groupsId } },
      {
        $project: {
          unread: "$unread",
          is_admin: "$is_admin",
          contact_id: "$contact_id",
          group_id: "$group_id",
          name: "$user.name",
          user_id: "$user._id",
        },
      },
    ]);
  }

  async getGroupContactList(groupsId: string, userId: string) {
    return await this.groupUserModel.aggregate([
      {
        $lookup: {
          from: "users",
          let: { id: "$contact_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", { $toObjectId: "$$id" }] },
              },
            },
          ],
          as: "user",
        },
      },
      {
        $lookup: {
          from: "contacts",
          let: { id: "$contact_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$user_id", "$$id"] },
                    { $eq: ["$created_by", userId] },
                  ],
                },
              },
            },
          ],
          as: "contacts",
        },
      },
      { $match: { group_id: groupsId } },
      {
        $project: {
          unread: "$unread",
          is_admin: "$is_admin",
          contact_id: "$contact_id",
          group_id: "$group_id",
          name: "$user.name",
          user_id: "$user._id",
          contactName: "$contacts.name",
        },
      },
    ]);
  }

  async searchGroupData(name: string, userId: string) {
    return await this.groupUserModel.aggregate([
      {
        $lookup: {
          from: "groups",
          let: { id: "$group_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", { $toObjectId: "$$id" }] },
              },
            },
          ],
          as: "group",
        },
      },
      { $match: { "group.name": { $regex: name, $options: "i" } } },
      { $match: { contact_id: userId } },
      {
        $project: {
          /*   userId: '$user_id', */
          name: "$group.name",
          description: "$group.description",
          userId: "$group.userId",
          group_id: "$group._id",
          unread: "$unread",
          contact_id: "$contact_id",
        },
      },
    ]);
  }

  async getContactListByUser(userId: string) {
    return await this.groupUserModel.aggregate([
      {
        $lookup: {
          from: "groups",
          let: { id: "$group_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", { $toObjectId: "$$id" }] },
              },
            },
          ],
          as: "group",
        },
      },
      { $match: { contact_id: userId } },
      {
        $project: {
          /* userId: '$user_id', */
          name: "$group.name",
          description: "$group.description",
          userId: "$group.userId",
          group_id: "$group._id",
          unread: "$unread",
          contact_id: "$contact_id",
        },
      },
    ]);
  }
}
