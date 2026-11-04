export interface CsvColumn<Row> {
	header: string;
	value: (row: Row) => string | number | boolean | null | undefined;
}

/** Text that starts like a spreadsheet formula is prefixed so Excel shows it as plain text. */
function escapeCell(raw: string | number | boolean | null | undefined): string {
	let text = raw === null || raw === undefined ? '' : String(raw);
	if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
	return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function toCsv<Row>(rows: Row[], columns: CsvColumn<Row>[]): string {
	const lines = [columns.map((c) => escapeCell(c.header)).join(',')];
	for (const row of rows) lines.push(columns.map((c) => escapeCell(c.value(row))).join(','));
	return lines.join('\r\n');
}

/** Starts a browser download. The BOM makes Excel read Bangla text as UTF-8. */
export function downloadCsv(fileName: string, csv: string): void {
	const blob = new Blob(['﻿', csv], { type: 'text/csv;charset=utf-8' });
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = fileName;
	document.body.appendChild(link);
	link.click();
	link.remove();
	URL.revokeObjectURL(url);
}
