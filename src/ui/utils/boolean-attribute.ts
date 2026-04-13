export function parseBooleanAttribute(value: unknown): boolean {
	if (value == null) return false;
	if (typeof value === "boolean") return value;
	if (typeof value === "number") return value !== 0;

	const normalized = String(value).trim().toLowerCase();
	if (normalized === "") return true;

	const booleanValues = [
		"true",
		"false",
		"0",
		"1",
		"yes",
		"no",
		"on",
		"off",
		"null",
		"undefined",
	];
	return booleanValues.includes(normalized);
}
