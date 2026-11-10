import { emailLayout } from './layout';

interface WelcomeEmailData {
	userName?: string;
	storeName?: string;
	storeUrl?: string;
}

export function welcomeEmailTemplate(data: WelcomeEmailData): { subject: string; html: string; text: string } {
	const name = data.userName || 'সম্মানিত গ্রাহক';
	const storeUrl = data.storeUrl || '/';

	const content = `
    <h2 style="margin:0 0 8px;font-size:20px;font-weight:800;color:#0f172a;">স্বাগতম! 🎉</h2>
    <p style="margin:0 0 20px;font-size:14px;color:#64748b;">${name},</p>

    <p style="margin:0 0 20px;font-size:14px;color:#334155;line-height:1.6;">
      আপনার অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে। এখন থেকে আপনি সহজে কেনাকাটা করতে এবং অর্ডার ট্র্যাক করতে পারবেন।
    </p>

    <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr>
        <td style="border-radius:10px;background:#5845eb;">
          <a href="${storeUrl}"
             style="display:inline-block;padding:14px 28px;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;border-radius:10px;">
            কেনাকাটা শুরু করুন
          </a>
        </td>
      </tr>
    </table>

    <p style="margin:0;font-size:13px;color:#64748b;line-height:1.6;">
      ধন্যবাদ আমাদের সাথে যোগ দেওয়ার জন্য। যেকোনো সমস্যায় আমাদের সাথে যোগাযোগ করুন।
    </p>
  `;

	return {
		subject: `স্বাগতম ${data.storeName || 'Store'}-এ!`,
		html: emailLayout(content, { storeName: data.storeName }),
		text: `স্বাগতম ${name}! আপনার অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে। কেনাকাটা করুন: ${storeUrl}`
	};
}
