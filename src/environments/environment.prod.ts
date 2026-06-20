const defaultApiUrl = 'https://wavesend-api.tryordira.com/api/v1';

function normalizeApiUrl(url?: string): string {
  const trimmed = (url || '').trim().replace(/\/+$/, '');
  if (!trimmed) {
    return defaultApiUrl;
  }
  return trimmed.endsWith('/api/v1') ? trimmed : `${trimmed}/api/v1`;
}

const runtimeApiUrl =
  typeof window !== 'undefined' ? (window as any).appConfig?.apiUrl : undefined;

export const environment = {
  production: true,
  apiUrl: normalizeApiUrl(runtimeApiUrl),
  stripePublishableKey: 'pk_test_51OaEANBL7OKV3JrokH1Emj8BmIXB9suTSQUoVXJglIUJPsl4dpe1rTgYn4coKb5He89WcU3JK2ILrrH1IkQZ1wMf006DlQnQ57'
};
