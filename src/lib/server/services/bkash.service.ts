import type { DrizzleD1Database } from 'drizzle-orm/d1';
import * as schema from '../db/schema';
import { SettingsService } from './settings.service';

export interface BkashCredentials {
	appKey: string;
	appSecret: string;
	username: string;
	password: string;
	mode: 'sandbox' | 'live';
}

export interface BkashTokenResult {
	success: boolean;
	idToken?: string;
	statusCode?: string;
	message: string;
}

export interface BkashCreatePaymentResult {
	success: boolean;
	paymentID?: string;
	bkashURL?: string;
	statusCode?: string;
	message: string;
}

export interface BkashExecutePaymentResult {
	success: boolean;
	trxID?: string;
	paymentID?: string;
	amount?: string;
	customerMsisdn?: string;
	statusCode?: string;
	message: string;
	raw?: any;
}

export class BkashService {
	private static getBaseUrl(mode: 'sandbox' | 'live'): string {
		return mode === 'live'
			? 'https://tokenized.pay.bka.sh/v1.2.0-beta/tokenized'
			: 'https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized';
	}

	/**
	 * Retrieves configured bKash credentials from D1 store_settings
	 */
	static async getCredentials(
		db: DrizzleD1Database<typeof schema>
	): Promise<BkashCredentials | null> {
		try {
			const paymentConfig = await SettingsService.getPaymentConfig(db);
			if (!paymentConfig.bkashAppKey || !paymentConfig.bkashAppSecret) {
				return null;
			}

			return {
				appKey: paymentConfig.bkashAppKey.trim(),
				appSecret: paymentConfig.bkashAppSecret.trim(),
				username: paymentConfig.bkashUsername.trim(),
				password: paymentConfig.bkashPassword.trim(),
				mode: paymentConfig.bkashMode || 'sandbox'
			};
		} catch (e) {
			console.error('Failed to get bKash credentials:', e);
			return null;
		}
	}

	/**
	 * 1. Grant Token: Generates Bearer id_token using App Key, Secret, Username and Password
	 */
	static async grantToken(creds: BkashCredentials): Promise<BkashTokenResult> {
		if (!creds.appKey || !creds.appSecret || !creds.username || !creds.password) {
			return {
				success: false,
				message: 'App Key, App Secret, Username এবং Password সব ফিল্ড পূরণ করা আবশ্যক'
			};
		}

		const url = `${this.getBaseUrl(creds.mode)}/checkout/token/grant`;

		try {
			const res = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Accept: 'application/json',
					username: creds.username,
					password: creds.password
				},
				body: JSON.stringify({
					app_key: creds.appKey,
					app_secret: creds.appSecret
				})
			});

			const data: any = await res.json();

			if (data && data.id_token) {
				return {
					success: true,
					idToken: data.id_token,
					statusCode: data.statusCode || '0000',
					message: 'bKash Bearer Token সফলভাবে জেনারেট হয়েছে'
				};
			}

			return {
				success: false,
				statusCode: data?.statusCode,
				message: data?.statusMessage || data?.message || 'bKash অথেন্টিকেশন ব্যর্থ হয়েছে'
			};
		} catch (err: any) {
			console.error('Bkash grantToken Network Error:', err);
			return {
				success: false,
				message: err?.message || 'bKash সার্ভারের সাথে যোগাযোগ করা যায়নি'
			};
		}
	}

	/**
	 * Test bKash API Connection right from admin dashboard
	 */
	static async testConnection(creds: BkashCredentials): Promise<{
		success: boolean;
		message: string;
		mode: string;
		statusCode?: string;
	}> {
		const tokenRes = await this.grantToken(creds);
		if (tokenRes.success && tokenRes.idToken) {
			return {
				success: true,
				mode: creds.mode.toUpperCase(),
				statusCode: tokenRes.statusCode,
				message: `bKash API সফলভাবে সংযুক্ত হয়েছে! (${creds.mode.toUpperCase()} মোড সক্রিয়)`
			};
		}

		return {
			success: false,
			mode: creds.mode.toUpperCase(),
			statusCode: tokenRes.statusCode,
			message: tokenRes.message || 'ক্রেডেনশিয়াল সঠিক নয় বা bKash সার্ভার রিজেক্ট করেছে'
		};
	}

	/**
	 * 2. Create Payment: Initializes transaction and retrieves bkashURL for customer redirect
	 */
	static async createPayment(
		creds: BkashCredentials,
		order: {
			amount: number;
			orderNumber: string;
			customerPhone?: string;
			callbackUrl: string;
		}
	): Promise<BkashCreatePaymentResult> {
		const tokenRes = await this.grantToken(creds);
		if (!tokenRes.success || !tokenRes.idToken) {
			return {
				success: false,
				message: tokenRes.message || 'bKash টোকেন পেতে সমস্যা হয়েছে'
			};
		}

		const url = `${this.getBaseUrl(creds.mode)}/checkout/create`;
		const formattedAmount = Number(order.amount).toFixed(2);

		try {
			const res = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Accept: 'application/json',
					Authorization: tokenRes.idToken,
					'x-app-key': creds.appKey
				},
				body: JSON.stringify({
					mode: '0011',
					payerReference: order.customerPhone || '01',
					callbackURL: order.callbackUrl,
					amount: formattedAmount,
					currency: 'BDT',
					intent: 'sale',
					merchantInvoiceNumber: order.orderNumber
				})
			});

			const data: any = await res.json();

			if (data && data.paymentID && data.bkashURL) {
				return {
					success: true,
					paymentID: data.paymentID,
					bkashURL: data.bkashURL,
					statusCode: data.statusCode || '0000',
					message: 'bKash পেমেন্ট গেটওয়ে URL তৈরি হয়েছে'
				};
			}

			return {
				success: false,
				statusCode: data?.statusCode,
				message: data?.statusMessage || data?.message || 'পেমেন্ট তৈরি করতে ব্যর্থ'
			};
		} catch (err: any) {
			console.error('Bkash createPayment Network Error:', err);
			return {
				success: false,
				message: err?.message || 'bKash নেটওয়ার্ক ত্রুটি'
			};
		}
	}

	/**
	 * 3. Execute Payment: Finalizes transaction after customer provides PIN and OTP
	 */
	static async executePayment(
		creds: BkashCredentials,
		paymentID: string
	): Promise<BkashExecutePaymentResult> {
		const tokenRes = await this.grantToken(creds);
		if (!tokenRes.success || !tokenRes.idToken) {
			return {
				success: false,
				message: tokenRes.message || 'টোকেন অথেন্টিকেশন সমস্যা'
			};
		}

		const url = `${this.getBaseUrl(creds.mode)}/checkout/execute`;

		try {
			const res = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Accept: 'application/json',
					Authorization: tokenRes.idToken,
					'x-app-key': creds.appKey
				},
				body: JSON.stringify({
					paymentID
				})
			});

			const data: any = await res.json();

			if (data && data.statusCode === '0000' && data.trxID) {
				return {
					success: true,
					trxID: data.trxID,
					paymentID: data.paymentID || paymentID,
					amount: data.amount,
					customerMsisdn: data.customerMsisdn,
					statusCode: '0000',
					message: 'পেমেন্ট সফলভাবে সম্পন্ন হয়েছে!',
					raw: data
				};
			}

			return {
				success: false,
				paymentID,
				statusCode: data?.statusCode,
				message: data?.statusMessage || data?.message || 'পেমেন্ট এক্সিকিউট ব্যর্থ হয়েছে',
				raw: data
			};
		} catch (err: any) {
			console.error('Bkash executePayment Error:', err);
			return {
				success: false,
				paymentID,
				message: err?.message || 'সার্ভার যোগাযোগ ত্রুটি'
			};
		}
	}

	/**
	 * 4. Query Payment: Check transaction status directly by paymentID
	 */
	static async queryPayment(
		creds: BkashCredentials,
		paymentID: string
	): Promise<any> {
		const tokenRes = await this.grantToken(creds);
		if (!tokenRes.success || !tokenRes.idToken) return null;

		const url = `${this.getBaseUrl(creds.mode)}/checkout/payment/query/${paymentID}`;
		try {
			const res = await fetch(url, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					Accept: 'application/json',
					Authorization: tokenRes.idToken,
					'x-app-key': creds.appKey
				}
			});
			return await res.json();
		} catch (err) {
			console.error('Bkash queryPayment Error:', err);
			return null;
		}
	}
}

