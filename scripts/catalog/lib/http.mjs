// Polite HTTP helpers for the catalog pull: browser-ish headers, a timeout, a
// small retry budget and a delay between requests so we never hammer a shop.

import { execFile as execFileCallback } from 'node:child_process';
import { promisify } from 'node:util';

const execFile = promisify(execFileCallback);

const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';

// Several supermarket CDNs reject requests that carry a browser User-Agent but
// none of the headers a browser always sends alongside it. Sending the complete
// set is what makes those hosts answer at all.
const DEFAULT_HEADERS = {
  'user-agent': USER_AGENT,
  accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'accept-language': 'en-GB,en;q=0.9',
  'sec-ch-ua': '"Chromium";v="128", "Not;A=Brand";v="24", "Google Chrome";v="128"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"macOS"',
  'sec-fetch-dest': 'document',
  'sec-fetch-mode': 'navigate',
  'sec-fetch-site': 'none',
  'sec-fetch-user': '?1',
  'upgrade-insecure-requests': '1',
};

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export class HttpError extends Error {
  constructor(status, url) {
    super(`HTTP ${status} for ${url}`);
    this.status = status;
    this.url = url;
  }
}

export const fetchText = async (url, {
  method = 'GET',
  headers = {},
  body,
  timeoutMs = 30000,
  retries = 2,
  retryDelayMs = 1500,
  http2 = false,
} = {}) => {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    if (attempt > 0) await sleep(retryDelayMs * attempt);
    try {
      return http2
        ? await curlText(url, { method, headers, body, timeoutMs })
        : await undiciText(url, { method, headers, body, timeoutMs });
    } catch (error) {
      lastError = error;
      // Bot walls and hard 404s will not improve on a retry.
      if (error instanceof HttpError && error.status !== 429 && error.status < 500) throw error;
    }
  }
  throw lastError;
};

const undiciText = async (url, { method, headers, body, timeoutMs }) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      method,
      headers: { ...DEFAULT_HEADERS, ...headers },
      body,
      redirect: 'follow',
      signal: controller.signal,
    });
    if (!response.ok) throw new HttpError(response.status, url);
    return { text: await response.text(), url: response.url };
  } finally {
    clearTimeout(timer);
  }
};

// Some retailers' edge protection rejects HTTP/1.1 outright, and Node's fetch
// cannot speak HTTP/2, so those hosts are fetched through curl instead.
const curlText = async (url, { method, headers, body, timeoutMs }) => {
  const args = ['-sS', '--http2', '--compressed', '-L', '--max-time', String(Math.ceil(timeoutMs / 1000)),
    '-o', '-', '-w', '\\n%{http_code}', '-X', method];
  for (const [name, value] of Object.entries({ ...DEFAULT_HEADERS, ...headers })) {
    args.push('-H', `${name}: ${value}`);
  }
  if (body !== undefined) args.push('--data-binary', body);
  args.push(url);

  const { stdout } = await execFile('curl', args, { maxBuffer: 64 * 1024 * 1024 });
  const split = stdout.lastIndexOf('\n');
  const status = Number.parseInt(stdout.slice(split + 1), 10);
  const text = stdout.slice(0, split);
  if (!Number.isFinite(status) || status < 200 || status >= 300) throw new HttpError(status, url);
  return { text, url };
};

export const fetchJson = async (url, options = {}) => {
  const { text } = await fetchText(url, {
    ...options,
    headers: { accept: 'application/json', ...(options.headers || {}) },
  });
  return JSON.parse(text);
};
