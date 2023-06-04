import { UserDocument } from 'src/models/users/entities/user.entity';

export interface SignInResponse {
  token: string;
  user: UserDocument;
}
