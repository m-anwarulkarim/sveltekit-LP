interface LayoutOptions {
	storeName?: string;
	accentColor?: string;
}

export function emailLayout(content: string, opts: LayoutOptions = {}): string {
	const storeName = opts.storeName || 'Store';
	const accent = opts.accentColor || '#5845eb';

	return `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${storeName}</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.07);">

        <!-- Header -->
        <tr>
          <td style="background:${accent};padding:28px 32px;text-align:center;">
            <span style="color:#ffffff;font-size:22px;font-weight:800;letter-spacing:-0.5px;">${storeName}</span>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px;">
            ${content}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f1f5f9;padding:20px 32px;text-align:center;">
            <p style="margin:0;font-size:11px;color:#94a3b8;">
              এই ইমেইলটি স্বয়ংক্রিয়ভাবে পাঠানো হয়েছে। অনুগ্রহ করে এতে সরাসরি রিপ্লাই করবেন না।
            </p>
            <p style="margin:6px 0 0;font-size:11px;color:#94a3b8;">&copy; ${new Date().getFullYear()} ${storeName}</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
