import { emailLayout } from './layout';

interface VerifyEmailData {
	userName?: string;
	verificationUrl: string;
	storeName?: string;
	expiresInHours?: number;
}

export function verifyEmailTemplate(data: VerifyEmailData): { subject: string; html: string; text: string } {
	const name = data.userName || 'সম্মানিত গ্রাহক';
	const expires = data.expiresInHours ?? 24;

	const content = `
    <h2 style="margin:0 0 8px;font-size:20px;font-weight:800;color:#0f172a;">ইমেইল যাচাই করুন</h2>
    <p style="margin:0 0 20px;font-size:14px;color:#64748b;">স্বাগতম, ${name}!</p>

    <p style="margin:0 0 24px;font-size:14px;color:#334155;line-height:1.6;">
      আপনার অ্যাকাউন্ট সক্রিয় করতে নিচের বাটনটিতে ক্লিক করুন। এই লিংকটি <strong>${expires} ঘণ্টা</strong> পর্যন্ত বৈধ থাকবে।
    </p>

    <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr>
        <td style="border-radius:10px;background:#5845eb;">
          <a href="${data.verificationUrl}"
             style="display:inline-block;padding:14px 28px;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;border-radius:10px;">
            ইমেইল যাচাই করুন
          </a>
        </td>
      </tr>
    </table>

    <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.6;">
      যদি বাটনটি কাজ না করে, নিচের লিংকটি কপি করে ব্রাউজারে পেস্ট করুন:<br/>
      <span style="color:#5845eb;word-break:break-all;">${data.verificationUrl}</span>
    </p>
  `;

	return {
		subject: 'আপনার ইমেইল যাচাই করুন',
		html: emailLayout(content, { storeName: data.storeName }),
		text: `আপনার ইমেইল যাচাই করতে এই লিংকে যান: ${data.verificationUrl}\n\nএই লিংকটি ${expires} ঘণ্টা পর্যন্ত বৈধ।`
	};
}
