export const useCommunity = () => {
  const config = useRuntimeConfig().public;
  const member = useState<any>('community-member', () => null);
  const token = useState<string>('community-token', () => '');
  const initialized = useState<boolean>('community-initialized', () => false);
  const ready = useState<boolean>('community-ready', () => false);

  const api = async (path: string, options: { method?: string; body?: unknown } = {}) => {
    try {
      return await $fetch<any>(String(config.communityUrl) + path, {
        method: (options.method || 'GET') as any,
        body: options.body as any,
        headers: { 'X-Demo-Key': String(config.communityKey), ...(token.value ? { Authorization: 'Bearer ' + token.value } : {}) }
      });
    } catch (error: any) {
      throw new Error(error.data?.error || 'Could not connect. Please try again.');
    }
  };
  const remember = (result: any) => {
    token.value = result.token; member.value = result.member;
    localStorage.setItem('isamo-member-session', result.token);
  };
  const signOut = async () => {
    try { await api('/auth/logout', { method: 'POST' }); } finally {
      token.value = ''; member.value = null; localStorage.removeItem('isamo-member-session');
    }
  };
  onMounted(async () => {
    if (initialized.value) return;
    initialized.value = true;
    token.value = localStorage.getItem('isamo-member-session') || '';
    if (token.value) {
      try { member.value = await api('/me'); } catch { token.value = ''; localStorage.removeItem('isamo-member-session'); }
    }
    ready.value = true;
  });
  return { member, ready, api, remember, signOut };
};
