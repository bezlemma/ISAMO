<template>
  <section class="bg-white border rounded-2xl p-6 sm:p-8" aria-labelledby="dues-heading">
    <div class="flex justify-between gap-4"><h2 id="dues-heading" tabindex="-1" class="text-2xl font-bold scroll-mt-24">{{ person.name }}</h2><button class="link" @click="$emit('close')">Close</button></div>
    <p class="mt-2 break-all">{{ person.email }}</p><p class="text-neutral-600">{{ person.institution }} · {{ person.role }}</p>
    <p class="text-sm text-neutral-600 mt-2">Joined {{ showDate(person.created) }} · {{ person.email_verified ? 'Email confirmed' : 'Email not confirmed' }} · {{ person.mailing_list ? 'Subscribed to news' : 'Opted out of news' }}<span v-if="person.is_admin"> · Administrator</span></p>
    <h3 class="text-xl font-bold mt-8 mb-4">Record dues</h3>
    <form @submit.prevent="save" class="grid sm:grid-cols-2 gap-4">
      <label>Entry type<select v-model="form.kind" class="field"><option value="paid">Payment received</option><option value="waived">Fee waiver</option></select></label>
      <label>{{ form.kind === 'paid' ? 'Payment date' : 'Waiver date' }}<input v-model="form.paid_date" type="date" :max="today" required class="field" /></label>
      <label v-if="form.kind === 'paid'">Amount<input v-model="amount" type="number" min="0.01" max="1000000" step="0.01" required class="field" /></label>
      <label v-if="form.kind === 'paid'">Currency<select v-model="form.currency" class="field"><option v-for="currency in ['GBP','USD','EUR','CAD','AUD']" :key="currency">{{ currency }}</option></select></label>
      <label>Membership covered through<input v-model="form.valid_until" type="date" :min="form.paid_date" required class="field" /></label>
      <label v-if="form.kind === 'paid'">Payment method<select v-model="form.method" class="field"><option>bank transfer</option><option>cash</option><option>cheque</option><option>other</option></select></label>
      <label class="sm:col-span-2">Note (optional)<input v-model="form.note" maxlength="1000" class="field" placeholder="Payment reference or reason for a waiver" /></label>
      <div class="sm:col-span-2"><button :disabled="busy" class="primary">{{ busy ? 'Saving…' : 'Save dues entry' }}</button></div>
    </form>
    <p v-if="error" role="alert" class="text-red-800 mt-4">{{ error }}</p><p v-if="notice" role="status" class="mt-4">{{ notice }}</p>
    <h3 class="text-xl font-bold mt-8 mb-4">Dues history</h3>
    <p v-if="loading">Loading…</p><p v-else-if="!history.records.length && !history.online.length" class="text-neutral-600">No dues recorded.</p>
    <ul v-else class="space-y-4">
      <li v-for="entry in history.records" :key="entry.id" class="border rounded-xl p-4" :class="entry.voided_at ? 'bg-neutral-50 text-neutral-500' : ''">
        <p class="font-semibold">{{ entry.kind === 'waived' ? 'Fee waiver' : money(entry.amount, entry.currency) }} · through {{ showDate(entry.valid_until) }}<span v-if="entry.voided_at"> · Voided</span></p>
        <p class="text-sm mt-1">{{ showDate(entry.paid_at) }} · {{ entry.method }} · Recorded by {{ entry.recorded_by }} on {{ showDate(entry.created) }}</p>
        <p v-if="entry.note" class="mt-2 whitespace-pre-wrap break-words">{{ entry.note }}</p>
        <p v-if="entry.voided_at" class="mt-2">Voided by {{ entry.voided_by_name }}: {{ entry.void_reason }}</p>
        <template v-else>
          <button v-if="voidId !== entry.id" @click="voidId = entry.id; reason = ''" class="link mt-3">Correct this entry</button>
          <form v-else @submit.prevent="voidEntry(entry.id)" class="mt-3 space-y-3">
            <p>Void this entry, then add the corrected details above. The original will remain in the history.</p>
            <label class="block">Reason<input v-model="reason" required maxlength="400" class="field" /></label>
            <button :disabled="busy" class="primary">Void entry</button><button type="button" @click="voidId = ''" class="link ml-4">Cancel</button>
          </form>
        </template>
      </li>
      <li v-for="entry in history.online" :key="entry.id" class="border rounded-xl p-4">
        <p class="font-semibold">{{ money(entry.amount, entry.currency) }} · through {{ showDate(entry.valid_until) }} · Online payment<span v-if="entry.revoked"> · Refunded</span></p>
        <p>{{ showDate(entry.paid_at) }}</p><p v-if="entry.review_reason">Review: {{ entry.review_reason }}</p>
      </li>
    </ul>
  </section>
</template>
<script setup>
const props = defineProps({ person: { type: Object, required: true } });
const emit = defineEmits(['close', 'changed']);
const { api } = useCommunity();
const today = new Date().toISOString().slice(0, 10);
const emptyForm = () => ({ id: crypto.randomUUID(), kind: 'paid', currency: 'GBP', paid_date: today, valid_until: '', method: 'bank transfer', note: '' });
const form = ref(emptyForm()), amount = ref(''), busy = ref(false), loading = ref(false), error = ref(''), notice = ref(''), voidId = ref(''), reason = ref('');
const history = ref({ records: [], online: [] });
const showDate = value => new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
const money = (amount, currency) => new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amount / 100);
async function load() { loading.value = true; try { history.value = await api(`/admin/members/${props.person.id}/dues`); } finally { loading.value = false; } }
async function save() {
  busy.value = true; error.value = ''; notice.value = '';
  try { await api(`/admin/members/${props.person.id}/dues`, { method: 'POST', body: { ...form.value, amount: form.value.kind === 'waived' ? 0 : Math.round(Number(amount.value) * 100) } }); form.value = emptyForm(); amount.value = ''; notice.value = 'Dues entry saved.'; await load(); emit('changed'); }
  catch (e) { error.value = e.message; } finally { busy.value = false; }
}
async function voidEntry(id) {
  busy.value = true; error.value = ''; notice.value = '';
  try { await api(`/admin/dues/${id}/void`, { method: 'POST', body: { reason: reason.value } }); voidId.value = ''; notice.value = 'Entry voided. Add a new entry above if needed.'; await load(); emit('changed'); }
  catch (e) { error.value = e.message; } finally { busy.value = false; }
}
onMounted(async () => { try { await load(); } catch (e) { error.value = e.message; } });
</script>
<style scoped>
.field { @apply block w-full mt-1 bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-3 text-neutral-900; }
.primary { @apply bg-brand-fill hover:bg-brand-hover disabled:opacity-50 px-5 py-3 rounded-lg font-semibold text-brand-on-fill; }
.link { @apply text-brand underline underline-offset-2; }
</style>
