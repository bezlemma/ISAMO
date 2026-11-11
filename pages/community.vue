<template>
  <div class="pt-8 pb-12 px-4 max-w-3xl mx-auto">
    <div class="text-center mb-12"><h1 class="text-4xl md:text-5xl font-bold mb-4">Community</h1></div>
    <p class="text-neutral-600 mb-6">News, questions, and opportunities from avian researchers.</p>
    <div class="flex flex-wrap items-center justify-between gap-4 mb-8" aria-label="Your community account">
      <p v-if="!ready" role="status" class="text-neutral-600">Checking sign-in…</p>
      <template v-else-if="member">
        <div>
          <p class="text-neutral-700">Signed in as <strong>{{ member.name }}</strong><span v-if="member.is_admin"> (administrator)</span></p>
          <div class="flex gap-4 mt-2 text-sm"><NuxtLink to="/membership" class="text-brand underline">Your account</NuxtLink><button @click="logOut" :disabled="signingOut" class="text-brand underline disabled:opacity-50">{{ signingOut ? 'Signing out…' : 'Sign out' }}</button></div>
        </div>
        <button v-if="!composing" @click="startPost" class="primary">Write a Post</button>
      </template>
      <NuxtLink v-else :to="eventRequest ? '/membership?next=event' : '/membership'" class="text-brand font-semibold underline">{{ eventRequest ? 'Sign in to share an event' : 'Sign in to your ISAMO account to post or reply' }}</NuxtLink>
    </div>
    <form v-if="ready && composing && member" @submit.prevent="save" class="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 space-y-4 mb-8">
      <h2 class="text-2xl font-bold">{{ draft.kind === 'event' ? (editing ? 'Edit Event' : 'Share an Event') : (editing ? 'Edit Post' : 'Write a Post') }}</h2>
      <p class="text-neutral-600">{{ editing ? 'Editing as' : 'Posting as' }} <strong>{{ member.name }}</strong>.</p>
      <div><label for="post-title" class="block font-medium mb-2">Title</label><input id="post-title" v-model="draft.title" required maxlength="200" class="field" /></div>
      <div><label for="post-body" class="block font-medium mb-2">Message</label><textarea id="post-body" v-model="draft.body" required rows="6" maxlength="10000" class="field" /></div>
      <div><label for="post-kind" class="block font-medium mb-2">Type</label><select id="post-kind" v-model="draft.kind" class="field"><option value="post">Community post</option><option value="event">Event announcement</option></select></div>
      <div v-if="draft.kind === 'event'"><label for="event-date" class="block font-medium mb-2">Event Date</label><input id="event-date" v-model="draft.event_date" type="date" required class="field" /></div>
      <div v-if="draft.kind === 'event'"><label for="event-series" class="block font-medium mb-2">Event Series</label><select id="event-series" v-model="draft.event_series" class="field"><option value="ams">AMS meeting</option><option value="egged">EGGED</option><option value="seminar">Avian Seminar Series</option><option value="other">Other event</option></select></div>
      <div><label for="post-link" class="block font-medium mb-2">Website Link (optional)</label><input id="post-link" v-model="draft.link" type="url" maxlength="2000" placeholder="https://" class="field" /></div>
      <p v-if="saveError" role="alert" class="text-red-800">{{ saveError }}</p>
      <div class="flex gap-4"><button :disabled="saving" class="primary">{{ saving ? 'Saving…' : editing ? 'Save Changes' : draft.kind === 'event' ? 'Publish Event' : 'Publish Post' }}</button><button type="button" @click="composing = false" class="px-4 py-3 text-neutral-600">Cancel</button></div>
    </form>
    <p v-if="loading" role="status" class="text-neutral-600 py-8">Loading posts…</p>
    <div v-if="error" role="alert" class="bg-white border border-neutral-200 rounded-xl p-6 mb-6"><p>{{ error }}</p><button @click="load()" class="text-brand font-semibold underline mt-3">Try again</button></div>
    <p v-if="removed" role="status" class="mb-6">Post removed. <button @click="undo" class="text-brand font-semibold underline">Undo</button></p>
    <div v-if="!loading && !error && !posts.length" class="text-center py-20 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50"><p class="text-slate-600 text-lg">No posts yet.</p></div>
    <article v-for="post in posts" :key="post.id" class="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 mb-6">
      <p class="text-sm text-neutral-500 mb-3">{{ post.author }}<span v-if="post.institution"> · {{ post.institution }}</span> · {{ formatDate(post.created) }}</p>
      <h2 class="text-2xl font-bold mb-4 break-words">{{ post.title }}</h2>
      <p v-if="post.kind === 'event'" class="text-brand font-semibold mb-3">{{ formatDate(post.event_date + 'T12:00:00') }}</p>
      <p class="whitespace-pre-wrap break-words text-neutral-700 leading-7">{{ post.body }}</p>
      <a v-if="post.link" :href="post.link" target="_blank" rel="noopener noreferrer" class="inline-block text-brand font-semibold underline mt-4">Visit website</a>
      <div class="flex flex-wrap gap-5 text-sm mt-6">
        <button @click="toggleReplies(post.id)" class="text-brand font-semibold">{{ openReplies === post.id ? 'Hide Replies' : 'Replies' }}</button>
        <template v-if="member && (member.id === post.author_id || member.is_admin)"><button @click="editPost(post)" class="text-neutral-600">Edit</button><button @click="remove(post.id)" class="text-neutral-600">Remove</button></template>
      </div>
      <section v-if="openReplies === post.id" class="mt-6 pt-6 border-t border-neutral-200" aria-label="Replies">
        <p v-if="replyError" role="alert" class="text-red-800 mb-4">{{ replyError }}</p>
        <div v-for="reply in replies" :key="reply.id" class="mb-5"><p class="font-semibold text-sm mb-1">{{ reply.author }} <span class="text-neutral-500 font-normal">· {{ formatDate(reply.created) }}</span></p><p class="whitespace-pre-wrap break-words text-neutral-700">{{ reply.body }}</p><button v-if="member && (member.id === reply.author_id || member.is_admin)" @click="removeReply(reply.id, post.id)" class="text-sm text-neutral-500 underline mt-2">Remove reply</button></div>
        <form v-if="ready && member" @submit.prevent="addReply(post.id)" class="space-y-3"><label :for="'reply-' + post.id" class="block font-medium">Replying as {{ member.name }}</label><textarea :id="'reply-' + post.id" v-model="replyText" required maxlength="4000" rows="3" class="field" /><button :disabled="replyBusy" class="primary">{{ replyBusy ? 'Posting…' : 'Post Reply' }}</button></form>
        <NuxtLink v-else-if="ready" to="/membership" class="text-brand underline">Sign in to reply</NuxtLink>
      </section>
    </article>
    <button v-if="next" @click="load(true)" :disabled="loading" class="primary">Load More</button>
  </div>
</template>
<script setup>
const { member, ready, api, signOut } = useCommunity();
const route = useRoute();
const eventRequest = computed(() => route.query.compose === 'event');
const signingOut = ref(false);
const posts = ref([]), loading = ref(true), error = ref(''), next = ref(null);
const composing = ref(false), editing = ref(''), saving = ref(false), saveError = ref(''), removed = ref('');
const empty = () => ({ title: '', body: '', kind: 'post', event_date: '', link: '', event_series: 'other' });
const draft = ref(empty());
const openReplies = ref(''), replies = ref([]), replyText = ref(''), replyBusy = ref(false), replyError = ref('');
const formatDate = value => new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
async function load(more = false) { loading.value = true; error.value = ''; try { const result = await api('/posts' + (more && next.value ? '?before=' + encodeURIComponent(next.value) : '')); posts.value = more ? [...posts.value, ...result.posts] : result.posts; next.value = result.next; } catch (e) { error.value = e.message; } finally { loading.value = false; } }
function startPost() { editing.value = ''; draft.value = empty(); saveError.value = ''; composing.value = true; }
watch([ready, () => member.value?.id, () => route.query.compose], () => {
  if (ready.value && member.value && eventRequest.value && !composing.value) {
    startPost(); draft.value.kind = 'event';
    draft.value.event_series = ['ams', 'egged', 'seminar'].includes(route.query.series) ? route.query.series : 'other';
  }
}, { immediate: true });
async function logOut() {
  signingOut.value = true;
  try { await signOut(); } catch { error.value = 'You have been signed out on this device. The server could not be reached.'; }
  finally { composing.value = false; draft.value = empty(); replyText.value = ''; signingOut.value = false; }
}
function editPost(post) { editing.value = post.id; draft.value = { title: post.title, body: post.body, kind: post.kind, event_date: post.event_date, link: post.link, event_series: post.event_series || 'other' }; saveError.value = ''; composing.value = true; window.scrollTo({ top: 0, behavior: 'smooth' }); }
async function save() { saving.value = true; saveError.value = ''; try { await api('/posts' + (editing.value ? '/' + editing.value : ''), { method: editing.value ? 'PATCH' : 'POST', body: draft.value }); composing.value = false; await load(); } catch (e) { saveError.value = e.message; } finally { saving.value = false; } }
async function remove(id) { try { await api('/posts/' + id, { method: 'DELETE' }); removed.value = id; await load(); } catch (e) { error.value = e.message; } }
async function undo() { try { await api('/posts/' + removed.value, { method: 'PATCH', body: { restore: true } }); removed.value = ''; await load(); } catch (e) { error.value = e.message; } }
async function toggleReplies(id) { if (openReplies.value === id) { openReplies.value = ''; return; } openReplies.value = id; replies.value = []; replyText.value = ''; replyError.value = ''; try { replies.value = await api('/posts/' + id + '/comments'); } catch (e) { replyError.value = e.message; } }
async function addReply(id) { replyBusy.value = true; replyError.value = ''; try { await api('/posts/' + id + '/comments', { method: 'POST', body: { body: replyText.value } }); replies.value = await api('/posts/' + id + '/comments'); replyText.value = ''; } catch (e) { replyError.value = e.message; } finally { replyBusy.value = false; } }
async function removeReply(id, post) { try { await api('/comments/' + id, { method: 'DELETE' }); replies.value = await api('/posts/' + post + '/comments'); } catch (e) { replyError.value = e.message; } }
onMounted(() => load());
useHead({ title: 'Community | ISAMO' });
</script>
<style scoped>
.field { @apply w-full bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-3 text-neutral-900; }
.primary { @apply bg-brand-fill hover:bg-brand-hover disabled:opacity-50 px-5 py-3 rounded-lg font-semibold text-brand-on-fill; }
</style>
