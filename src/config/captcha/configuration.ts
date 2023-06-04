import { registerAs } from "@nestjs/config";
export default registerAs("captcha", () => ({
  secret: process.env.CAPTCHA_SECRET,
  siteKey: process.env.CAPTCHA_SITEKEY,
}));
