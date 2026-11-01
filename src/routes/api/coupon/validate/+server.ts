import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '#lib/server/db/index';
import { CouponService } from '#lib/server/services/coupon.service';

export const POST: RequestHandler = async ({ request, platform }) => {
	try {
		const body = (await request.json()) as { code?: unknown; subtotal?: unknown };
		const code = typeof body?.code === 'string' ? body.code.slice(0, 50) : '';
		const subtotal = Number(body?.subtotal) || 0;

		const result = await CouponService.validateCoupon(getDb(platform), code, subtotal);
		if (!result.valid) {
			return json({ valid: false, message: result.message });
		}

		const { coupon } = result;
		return json({
			valid: true,
			message: result.message,
			coupon: {
				code: coupon.code,
				discountType: coupon.discountType,
				discountValue: coupon.discountValue,
				minOrderAmount: coupon.minOrderAmount,
				maxDiscountAmount: coupon.maxDiscountAmount
			}
		});
	} catch (err) {
		console.error('Coupon validation failed:', err);
		return json({ valid: false, message: 'কুপন যাচাই করা যায়নি। আবার চেষ্টা করুন।' }, { status: 500 });
	}
};
