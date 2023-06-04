import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './entities/user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: User.name,
        useFactory: () => {
          const schema = UserSchema;
          schema.pre('save', async function (next) {
            if (!this.isModified('password')) return next();

            /* Hash the password with cost of 12 */
            this.password = await bcrypt.hash(this.password, 12);

            next();
          });

          schema.pre('save', function (next) {
            if (!this.isModified('password') || this.isNew) return next();

            this.passwordChangedAt = new Date(Date.now() - 1000);
            next();
          });

          schema.methods.correctPassword = async function (
            candidatePassword: string,
            userPassword: string,
          ) {
            return await bcrypt.compare(candidatePassword, userPassword);
          };

          schema.methods.changedPasswordAfter = function (
            JWTTimestamp: number,
          ) {
            if (this.passwordChangedAt) {
              const changedTimestamp = parseInt(
                this.passwordChangedAt.getTime(),
              );
              return JWTTimestamp < changedTimestamp;
            }
            /* False means Not Changed */
            return false;
          };

          /**
           * Reset Password
           */
          schema.methods.createPasswordResetToken = function () {
            const resetToken = crypto.randomBytes(32).toString('hex');
            this.passwordResetToken = crypto
              .createHash('sha256')
              .update(resetToken)
              .digest('hex');
            this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
            return resetToken;
          };

          return schema;
        },
      },
    ]),
  ],
  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
