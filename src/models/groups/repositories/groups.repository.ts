import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Group, GroupDocument } from "../entities/group.entity";
import { ModelRepository } from "../../model.repository";

@Injectable()
export class GroupsRepository extends ModelRepository<GroupDocument> {
  constructor(
    @InjectModel(Group.name) private groupModel: Model<GroupDocument>
  ) {
    super(groupModel);
  }
}
