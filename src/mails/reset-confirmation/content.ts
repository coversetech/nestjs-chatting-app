export const resetConfirmationTitle = () =>
  `Reset Your Password - Important Action Required`;
export const resetConfirmationContent = (
  firstName: string,
  resetTokenUrl: string,
  expirationTime: string,
  companyName = "Sample",
  supportEmail = "support@example.com",
  supportPhone = "+1234567890"
): string => {
  return `
  <p>Dear ${firstName},</p>
  
  <p>We have received a request to reset your password for your account. 
  To ensure the security of your account, please follow the instructions below to set a new password:</p>

  <ol>
      <li>Click on the following link to access the password reset page: 
      <a href="${resetTokenUrl}">Reset Password</a>
      </li>
      <li>On the password reset page, enter the reset token and your new password in the designated field.</li>
      <li>Confirm your new password by re-entering it in the provided field.</li>
      <li>Click the "Reset Password" button to complete the process.</li>
  </ol>

  <p>Please note the following important information:</p>
  <ul>
    <li>This password reset token is valid for a limited time and will expire in ${expirationTime}min.</li>
    <li>If you did not request a password reset, please ignore this email or contact our support team immediately.</li>
  </ul>

  <p>For your security, please do not share this email or the password reset link with anyone. We will never ask you to disclose your password or any sensitive information.</p>

  <p>If you require further assistance or have any questions, please don't hesitate to contact our support team at ${supportEmail} or ${supportPhone}.</p>

  <p>Thank you for choosing ${companyName}. We appreciate your cooperation in maintaining the security of your account.</p>

  <p>Best regards,</p>
  <p>${companyName} Team</p>
  `;
};
