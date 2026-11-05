import { emailLayout } from './layout';

interface PasswordResetData {
	userName?: string;
	resetUrl: string;
	storeName?: string;
	expiresInMinutes?: number;
}

export function passwordResetTemplate(data: PasswordResetData): { subject: string; html: string; text: string } {
	const name = data.userName || 'সম্মানিত গ্রাহক';
	const expires = data.expiresInMinutes ?? 60;

	const content = `
    <h2 style="margin:0 0 8px;font-size:20px;font-weight:800;color:#0f172a;">পাসওয়ার্ড রিসেট</h2>
    <p style="margin:0 0 20px;font-size:14px;color:#64748b;">${name},</p>

    <p style="margin:0 0 24px;font-size:14px;color:#334155;line-height:1.6;">
      আপনার অ্যাকাউন্টের পাসওয়ার্ড রিসেটের জন্য একটি অনুরোধ করা হয়েছে।
      নিচের বাটনে ক্লিক করুন — এই লিংকটি <strong>${expires} মিনিট</strong> পর্যন্ত বৈধ।
    </p>

    <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr>
        <td style="border-radius:10px;background:#ef4444;">
          <a href="${data.resetUrl}"
             style="display:inline-block;padding:14px 28px;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;border-radius:10px;">
            নতুন পাসওয়ার্ড সেট করুন
          </a>
        </td>
      </tr>
    </table>

    <div style="margin:0 0 20px;padding:14px;background:#fef9c3;border-radius:10px;border:1px solid #fde047;">
      <p style="margin:0;font-size:12px;color:#854d0e;line-height:1.5;">
        ⚠️ যদি আপনি এই অনুরোধটি না করে থাকেন, তাহলে এই ইমেইলটি উপেক্ষা করুন। আপনার পাসওয়ার্ড পরিবর্তন হবে না।
      </p>
    </div>

    <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.6;">
      যদি বাটনটি কাজ না করে:<br/>
      <span style="color:#ef4444;word-break:break-all;">${data.resetUrl}</span>
    </p>
  `;

	return {
		subject: 'পাসওয়ার্ড রিসেট করুন',
		html: emailLayout(content, { storeName: data.storeName, accentColor: '#ef4444' }),
		text: `পাসওয়ার্ড রিসেট করতে এই লিংকে যান: ${data.resetUrl}\n\nএই লিংকটি ${expires} মিনিট পর্যন্ত বৈধ।\n\nযদি আপনি এই অনুরোধ না করে থাকেন, এই ইমেইল উপেক্ষা করুন।`
	};
}
