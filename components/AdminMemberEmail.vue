<template>
  <div class="space-y-6">
    <section v-if="selection" class="bg-white border rounded-2xl p-6 sm:p-8" aria-labelledby="email-heading">
      <h2 id="email-heading" class="text-2xl font-bold mb-3">Email members</h2>
      <p class="mb-5">{{ selection.label }}</p>
      <form v-if="!preview" @submit.prevent="prepare" class="space-y-4">
        <label class="block">Purpose<select v-model="form.kind" class="field"><option value="news">News and events</option><option value="membership">Membership administration</option></select></label>
        <p class="text-sm text-neutral-600">{{ form.kind === 'news' ? 'Only subscribed members with confirmed email addresses will receive this message. An unsubscribe link is included.' : 'For account or dues matters only. Selected members will receive this even if they opted out of news.' }}</p>
        <label class="block">Subject<input v-model="form.subject" required maxlength="150" class="field" /></label>
        <label class="block">Message<textarea v-model="form.body" required maxlength="10000" rows="10" class="field" /></label>
        <div class="flex gap-4 items-center"><button :disabled="busy || !mail.enabled" class="primary">Preview email</button><button type="button" @click="$emit('close')" class="link">Cancel</button></div>
      </form>
      <div v-else class="space-y-4">
        <p>From ISAMO &lt;admin@avianmodel.org&gt;. Replies go to admin@avianmodel.org.</p>
        <p class="font-semibold">{{ preview.recipients.length }} recipients. Each receives a separate email.</p>
        <p v-if="preview.excluded" class="text-neutral-600">{{ preview.excluded }} excluded because they have opted out or have not confirmed their email.</p>
        <details class="border rounded-lg p-3"><summary class="cursor-pointer">Review recipients</summary><ul class="mt-3 space-y-1"><li v-for="recipient in preview.recipients" :key="recipient.member_id" class="break-words">{{ recipient.name }} &lt;{{ recipient.recipient }}&gt;</li></ul></details>
        <div class="border rounded-xl p-5 bg-neutral-50"><h3 class="font-bold mb-4">{{ preview.subject }}</h3><p class="whitespace-pre-wrap break-words">{{ preview.body }}</p><p class="mt-5">ISAMO<br />admin@avianmodel.org</p><p v-if="preview.kind === 'news'" class="mt-4 text-sm">Unsubscribe from ISAMO news and events: [personal unsubscribe link]</p></div>
        <div class="flex gap-4 items-center"><button @click="send" :disabled="busy || preview.recipients.length > mail.remaining" class="primary">{{ busy ? 'Queuing…' : `Send to ${preview.recipients.length} members` }}</button><button @click="preview = null" :disabled="busy" class="link">Back to edit</button></div>
        <p v-if="preview.recipients.length > mail.remaining" role="status" class="text-red-800">There are {{ mail.remaining }} recipients left in the current 24-hour allowance. Choose a smaller group or send later.</p>
      </div>
    </section>
    <p v-if="error" role="alert" class="text-red-800">{{ error }}</p><p v-if="notice" role="status">{{ notice }}</p>
    <section class="bg-white border rounded-2xl p-6 sm:p-8">
      <div class="flex justify-between gap-4"><h2 class="text-2xl font-bold">Email history</h2><button @click="refresh" :disabled="busy" class="link">Refresh</button></div>
      <p class="text-sm text-neutral-600 my-4">{{ mail.enabled ? `${mail.remaining} recipients available in the current 24-hour period (200 maximum).` : 'Email sending is unavailable.' }}</p>
      <p v-if="!mail.emails.length" class="text-neutral-600">No member emails sent yet.</p>
      <ul class="divide-y"><li v-for="email in mail.emails" :key="email.id" class="py-4"><button @click="show(email.id)" class="link text-left font-semibold">{{ email.subject }}</button><p class="text-sm mt-1">{{ date(email.created) }} · {{ email.author }} · {{ email.sent }}/{{ email.total }} sent<span v-if="email.pending"> · {{ email.pending }} waiting</span><span v-if="email.failed"> · {{ email.failed }} failed</span><span v-if="email.skipped"> · {{ email.skipped }} skipped or cancelled</span></p></li></ul>
    </section>
    <section v-if="detail" class="bg-white border rounded-2xl p-6 sm:p-8">
      <div class="flex justify-between gap-4"><h2 class="text-2xl font-bold break-words">{{ detail.subject }}</h2><button @click="detail = null" class="link">Close</button></div>
      <p class="whitespace-pre-wrap break-words mt-4">{{ detail.body }}</p>
      <p class="text-sm text-neutral-600 my-5">“Sent” means the mail server accepted the message. Check admin@avianmodel.org for replies and delivery notices.</p>
      <div class="flex flex-wrap gap-4 mb-5">
        <button @click="show(detail.id)" :disabled="busy" class="link">Refresh delivery status</button>
        <button v-if="detail.state === 'queued' && detail.recipients.some(r => r.status === 'failed')" @click="action('retry')" :disabled="busy" class="link">Retry failed messages</button>
        <button v-if="detail.state === 'queued' && detail.recipients.some(r => ['pending','sending'].includes(r.status))" @click="action('cancel')" :disabled="busy" class="link">Stop unsent messages</button>
      </div>
      <ul class="divide-y"><li v-for="recipient in detail.recipients" :key="recipient.member_id" class="py-3 break-words"><span class="font-semibold">{{ recipient.name }}</span> · {{ recipient.recipient }}<p class="text-sm">{{ statuses[recipient.status] }}<span v-if="recipient.last_error"> · {{ recipient.last_error }}</span></p></li></ul>
    </section>
  </div>
</template>
<script setup>
const props = defineProps({ selection: { type: Object, default: null } });
const emit = defineEmits(['close']);
const { api } = useCommunity();
const mail = ref({ emails: [], enabled: false, remaining: 0 }), preview = ref(null), detail = ref(null);
const form = ref({ kind: 'news', subject: '', body: '' }), busy = ref(false), error = ref(''), notice = ref('');
const statuses = { pending: 'Waiting to send', sending: 'Sending', sent: 'Sent', failed: 'Failed', skipped: 'Skipped', cancelled: 'Cancelled' };
const date = value => new Date(value).toLocaleString();
async function refresh() { try { mail.value = await api('/admin/emails'); } catch (e) { error.value = e.message; } }
async function prepare() { busy.value = true; error.value = ''; notice.value = ''; try { preview.value = await api('/admin/emails/preview', { method: 'POST', body: { ...form.value, ...props.selection.audience } }); await refresh(); } catch (e) { error.value = e.message; } finally { busy.value = false; } }
async function send() {
  busy.value = true; error.value = '';
  try { detail.value = await api(`/admin/emails/${preview.value.id}/send`, { method: 'POST' }); preview.value = null; form.value = { kind: 'news', subject: '', body: '' }; notice.value = 'Email queued. Sending continues in the background; refresh the delivery status below to check progress.'; emit('close'); await refresh(); }
  catch (e) { error.value = e.message; } finally { busy.value = false; }
}
async function show(id) { error.value = ''; try { detail.value = await api('/admin/emails/' + id); } catch (e) { error.value = e.message; } }
async function action(name) { busy.value = true; error.value = ''; try { detail.value = await api(`/admin/emails/${detail.value.id}/${name}`, { method: 'POST' }); notice.value = name === 'cancel' ? 'Unsent messages stopped. Messages already being sent may still arrive.' : 'Failed messages queued for another attempt.'; await refresh(); } catch (e) { error.value = e.message; } finally { busy.value = false; } }
watch(() => props.selection, () => { preview.value = null; notice.value = ''; error.value = ''; });
onMounted(refresh);
</script>
<style scoped>
.field { @apply block w-full mt-1 bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-3 text-neutral-900; }
.primary { @apply bg-red-800 hover:bg-red-900 disabled:opacity-50 px-5 py-3 rounded-lg font-semibold text-white; }
.link { @apply text-red-800 underline underline-offset-2 disabled:opacity-50; }
</style>
