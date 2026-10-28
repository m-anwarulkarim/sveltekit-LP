export interface ConfirmOptions {
	title?: string;
	message: string;
	confirmText?: string;
	cancelText?: string;
	variant?: 'destructive' | 'warning' | 'primary';
	icon?: 'trash' | 'alert' | 'help';
}

class ConfirmManager {
	isOpen = $state(false);
	title = $state('');
	message = $state('');
	confirmText = $state('নিশ্চিত করুন');
	cancelText = $state('বাতিল');
	variant = $state<'destructive' | 'warning' | 'primary'>('primary');
	icon = $state<'trash' | 'alert' | 'help'>('alert');
	resolvePromise: ((value: boolean) => void) | null = null;

	confirm(options: ConfirmOptions): Promise<boolean> {
		this.title = options.title || 'অনুরোধ নিশ্চিতকরণ';
		this.message = options.message;
		this.confirmText =
			options.confirmText ||
			(options.variant === 'destructive' ? 'হ্যাঁ, ট্র্যাশে পাঠান' : 'নিশ্চিত করুন');
		this.cancelText = options.cancelText || 'বাতিল';
		this.variant = options.variant || 'primary';
		this.icon = options.icon || (options.variant === 'destructive' ? 'trash' : 'alert');
		this.isOpen = true;

		return new Promise<boolean>((resolve) => {
			this.resolvePromise = resolve;
		});
	}

	handleConfirm() {
		this.isOpen = false;
		this.resolvePromise?.(true);
		this.resolvePromise = null;
	}

	handleCancel() {
		this.isOpen = false;
		this.resolvePromise?.(false);
		this.resolvePromise = null;
	}
}

export const confirmStore = new ConfirmManager();

export function confirmModal(options: ConfirmOptions | string): Promise<boolean> {
	if (typeof options === 'string') {
		const isDelete =
			options.includes('ট্র্যাশ') ||
			options.includes('মুছ') ||
			options.includes('ডিলিট') ||
			options.includes('delete') ||
			options.includes('trash') ||
			options.includes('আনব্লক');
		return confirmStore.confirm({
			title: isDelete ? 'সতর্কতা নিশ্চিতকরণ' : 'অনুরোধ নিশ্চিতকরণ',
			message: options,
			confirmText: isDelete ? 'হ্যাঁ, নিশ্চিত করুন' : 'নিশ্চিত করুন',
			variant: isDelete ? 'destructive' : 'primary',
			icon: isDelete ? 'trash' : 'alert'
		});
	}
	return confirmStore.confirm(options);
}

export type ConfirmSubmitParam =
	| ConfirmOptions
	| string
	| (() => ConfirmOptions | string | boolean | Promise<ConfirmOptions | string | boolean>);

/**
 * Svelte action to intercept form submissions and trigger our accessible ConfirmModal.
 * If user confirms, the form proceeds through `use:enhance` seamlessly.
 */
export function confirmSubmit(form: HTMLFormElement, param: ConfirmSubmitParam) {
	let currentParam = param;
	let bypass = false;

	async function handler(e: SubmitEvent) {
		if (bypass) {
			bypass = false;
			return;
		}

		e.preventDefault();
		e.stopImmediatePropagation();

		const submitter = e.submitter as HTMLElement | null;
		let evaluated: any = typeof currentParam === 'function' ? await currentParam() : currentParam;

		// If function returns false or null, cancel submission
		if (evaluated === false || evaluated === null || evaluated === undefined) {
			return;
		}

		let confirmed = true;
		if (typeof evaluated === 'string' || (typeof evaluated === 'object' && evaluated !== null)) {
			confirmed = await confirmModal(evaluated);
		}

		if (confirmed) {
			bypass = true;
			try {
				if (submitter) {
					form.requestSubmit(submitter as HTMLElement as any);
				} else {
					form.requestSubmit();
				}
			} catch {
				form.requestSubmit();
			}
		}
	}

	form.addEventListener('submit', handler, { capture: true });

	return {
		update(newParam: ConfirmSubmitParam) {
			currentParam = newParam;
		},
		destroy() {
			form.removeEventListener('submit', handler, { capture: true });
		}
	};
}

