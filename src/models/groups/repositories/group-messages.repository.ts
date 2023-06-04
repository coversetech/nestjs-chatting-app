import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ModelRepository } from '../../model.repository';
import {
  GroupMessage,
  GroupMessageDocument,
} from '../entities/group-message.entity';

@Injectable()
export class GroupMessagesRepository extends ModelRepository<GroupMessageDocument> {
  constructor(
    @InjectModel(GroupMessage.name)
    private groupMsgModel: Model<GroupMessageDocument>,
  ) {
    super(groupMsgModel);
  }

  async getGroupMsgsCount(groupId: string) {
    return await this.groupMsgModel.find({ group_id: groupId }).count();
  }

  async searchGroupMessagesData(name: string, id: string) {
    return await this.groupMsgModel.aggregate([
      {
        $lookup: {
          from: 'users',
          let: { senderId: '$sender_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$_id', { $toObjectId: '$$senderId' }] },
              },
            },
          ],
          as: 'matches',
        },
      },
      { $match: { group_id: id } },
      { $match: { message: { $regex: name, $options: 'i' } } },
      { $sort: { _id: -1 } },
      { $limit: 10 },
      {
        $project: {
          message: '$message',
          sender_id: '$sender_id',
          group_id: '$group_id',
          name: '$matches.name',
          image: '$matches.image',
          file_upload: '$file_upload',
          createdAt: '$createdAt',
        },
      },
    ]);
  }

  async getGroupMessages(id: string, startm = 0) {
    return await this.groupMsgModel.aggregate([
      {
        $lookup: {
          from: 'users',
          let: { senderId: '$sender_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$_id', { $toObjectId: '$$senderId' }] },
              },
            },
          ],
          as: 'matches',
        },
      },
      { $match: { group_id: id } },
      { $sort: { _id: -1 } },
      { $skip: startm },
      { $limit: 10 },
      {
        $project: {
          message: '$message',
          sender_id: '$sender_id',
          group_id: '$group_id',
          createdAt: '$createdAt',
          name: '$matches.name',
          image: '$matches.image',
          file_upload: '$file_upload',
        },
      },
    ]);
  }
}
