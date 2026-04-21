type MessageContainer = {
  msg?: unknown;
  message?: unknown;
  error?: unknown;
  detail?: unknown;
  errors?: unknown;
};

const STATUS_CODE_MESSAGE_RE = /request failed with status code\s+\d+/i;

const toCleanString = (value: unknown): string | null => {
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  if (!trimmed) return null;
  if (STATUS_CODE_MESSAGE_RE.test(trimmed)) return null;

  return trimmed;
};

const extractFromObject = (value: unknown): string | null => {
  if (!value || typeof value !== "object") return null;

  const data = value as MessageContainer;

  const direct =
    toCleanString(data.msg) ||
    toCleanString(data.message) ||
    toCleanString(data.error) ||
    toCleanString(data.detail);

  if (direct) return direct;

  if (Array.isArray(data.errors)) {
    for (const item of data.errors) {
      const nested =
        toCleanString(item) ||
        extractFromObject(item) ||
        toCleanString((item as { msg?: unknown })?.msg) ||
        toCleanString((item as { message?: unknown })?.message);

      if (nested) return nested;
    }
  }

  return null;
};

export const getServerMessage = (source: unknown): string | null => {
  return (
    toCleanString(source) ||
    extractFromObject(source) ||
    extractFromObject((source as { data?: unknown })?.data) ||
    extractFromObject(
      (source as { response?: { data?: unknown } })?.response?.data,
    ) ||
    toCleanString((source as { message?: unknown })?.message)
  );
};

export const getErrorMessage = (error: unknown, fallback: string): string => {
  return getServerMessage(error) || fallback;
};

export const getSuccessMessage = (
  response: unknown,
  fallback: string,
): string => {
  return getServerMessage(response) || fallback;
};
