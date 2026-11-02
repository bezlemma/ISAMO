import { pageDefaults } from '~/shared/site-pages.mjs';

export const useSitePage = (page: string) => {
  const { api } = useCommunity();
  const content = useState<any>('site-page-' + page, () => JSON.parse(JSON.stringify(pageDefaults[page])));
  const revision = useState<number>('site-page-revision-' + page, () => 0);
  const initialized = useState<boolean>('site-page-initialized-' + page, () => false);
  const loadError = useState<string>('site-page-error-' + page, () => '');
  async function refresh() {
    try {
      const result = await api('/pages/' + page);
      content.value = result.content; revision.value = result.revision; loadError.value = '';
    } catch (error: any) { loadError.value = error.message; throw error; }
  }
  async function save(draft: any, expectedRevision: number) {
    const result = await api('/pages/' + page, { method: 'PATCH', body: { content: draft, revision: expectedRevision } });
    content.value = result.content; revision.value = result.revision;
  }
  onMounted(async () => { if (!initialized.value) { initialized.value = true; try { await refresh(); } catch {} } });
  return { content, revision, loadError, refresh, save };
};
