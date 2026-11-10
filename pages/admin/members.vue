<template>
  <div class="pt-8 pb-16 px-4 sm:px-6 max-w-7xl mx-auto">
    <h1 class="text-3xl sm:text-4xl font-bold mb-6">Membership management</h1>
    <p v-if="!ready">Loading your account…</p>
    <div v-else-if="!member?.is_admin"><p>Sign in with a trustee administrator account to manage members.</p><NuxtLink to="/membership?next=admin" class="link inline-block mt-4">Go to member login</NuxtLink></div>
    <template v-else>
      <div class="flex gap-3 mb-6"><button @click="tab = 'members'" :aria-pressed="tab === 'members'" :class="tab === 'members' ? 'primary' : 'secondary'">Members</button><button @click="tab = 'email'" :aria-pressed="tab === 'email'" :class="tab === 'email' ? 'primary' : 'secondary'">Email</button><NuxtLink to="/membership" class="link self-center ml-auto">My account</NuxtLink></div>
      <p v-if="error" role="alert" class="text-red-800 mb-4">{{ error }}</p>
      <div v-show="tab === 'members'" class="space-y-6">
        <form @submit.prevent="applyFilters" class="flex flex-wrap items-end gap-4 bg-white border rounded-xl p-5">
          <label class="flex-1 min-w-48">Search members<input v-model="query" type="search" placeholder="Name, email or institution" maxlength="100" class="field" /></label>
          <label>Dues status<select v-model="dues" class="field"><option value="all">All members</option><option value="paid">Paid</option><option value="waived">Fees waived</option><option value="expired">Expired</option><option value="none">No dues recorded</option></select></label>
          <button :disabled="loading" class="primary">Search</button>
        </form>
        <div class="flex flex-wrap justify-between items-center gap-4"><p>{{ total }} {{ total === 1 ? 'member' : 'members' }}<span v-if="selected.length"> · {{ selected.length }} selected</span></p><div class="flex flex-wrap gap-3"><button @click="compose(false)" :disabled="!selected.length || loading" class="secondary">Email selected</button><button @click="compose(true)" :disabled="!total || loading" class="secondary">Email matching members</button></div></div>
        <div class="overflow-x-auto bg-white border rounded-xl">
          <table class="w-full text-left"><caption class="sr-only">Private member directory</caption><thead class="bg-neutral-100"><tr><th class="p-4"><input type="checkbox" :checked="allSelected" @change="selectPage($event.target.checked)" aria-label="Select this page of members" /></th><th class="p-4">Member</th><th class="p-4">Institution / role</th><th class="p-4">Dues</th><th class="p-4">News emails</th><th class="p-4"><span class="sr-only">Actions</span></th></tr></thead>
            <tbody class="divide-y"><tr v-for="person in members" :key="person.id"><td class="p-4"><input v-model="selected" type="checkbox" :value="person.id" :aria-label="`Select ${person.name}`" /></td><td class="p-4"><button @click="active = person" class="link font-semibold text-left">{{ person.name }}</button><p class="text-sm break-all mt-1">{{ person.email }}</p><p v-if="person.is_admin" class="text-sm text-neutral-500">Administrator</p></td><td class="p-4"><p>{{ person.institution || '—' }}</p><p class="text-sm text-neutral-600">{{ person.role }}</p></td><td class="p-4"><span class="inline-block rounded-full px-3 py-1 text-sm whitespace-nowrap" :class="person.dues_status === 'paid' || person.dues_status === 'waived' ? 'bg-green-50 text-green-900' : 'bg-neutral-100 text-neutral-700'">{{ labels[person.dues_status] }}</span><p v-if="person.covered_until" class="text-sm mt-1 whitespace-nowrap">Through {{ showDate(person.covered_until) }}</p></td><td class="p-4 text-sm">{{ !person.mailing_list ? 'Opted out' : person.email_verified ? 'Subscribed' : 'Awaiting confirmation' }}</td><td class="p-4"><button @click="active = person" class="link whitespace-nowrap">View / record dues</button></td></tr></tbody>
          </table><p v-if="!members.length" class="p-6">{{ loading ? 'Loading members…' : 'No members match these filters.' }}</p>
        </div>
        <div class="flex justify-between items-center"><button @click="load(offset - 100)" :disabled="offset === 0 || loading" class="secondary">Previous</button><span>Page {{ Math.floor(offset / 100) + 1 }}</span><button @click="load(next)" :disabled="next === null || loading" class="secondary">Next</button></div>
        <AdminDues v-if="active" :key="active.id" :person="active" @close="active = null" @changed="load(offset)" />
      </div>
      <AdminMemberEmail v-show="tab === 'email'" :selection="selection" @close="selection = null" />
    </template>
  </div>
</template>
<script setup>
const { member, ready, api } = useCommunity();
useHead({ title: 'Membership management | ISAMO' });
const members = ref([]), total = ref(0), offset = ref(0), next = ref(null), loading = ref(false), error = ref('');
const query = ref(''), dues = ref('all'), applied = ref({ q: '', dues: 'all' }), selected = ref([]), active = ref(null), tab = ref('members'), selection = ref(null);
const labels = { paid: 'Paid', waived: 'Fees waived', expired: 'Expired', none: 'No dues recorded' };
const showDate = value => new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
const allSelected = computed(() => members.value.length > 0 && members.value.every(m => selected.value.includes(m.id)));
function selectPage(checked) { selected.value = checked ? [...new Set([...selected.value, ...members.value.map(m => m.id)])] : selected.value.filter(id => !members.value.some(m => m.id === id)); }
async function load(page = 0) { loading.value = true; error.value = ''; try { const result = await api('/admin/members?' + new URLSearchParams({ ...applied.value, offset: String(page) })); members.value = result.members; total.value = result.total; next.value = result.next; offset.value = page; } catch (e) { error.value = e.message; } finally { loading.value = false; } }
function applyFilters() { applied.value = { q: query.value, dues: dues.value }; selected.value = []; load(0); }
function compose(all) { selection.value = all ? { label: `All ${total.value} members matching the current search and dues filter`, audience: { filter: { ...applied.value } } } : { label: `${selected.value.length} selected members`, audience: { member_ids: [...selected.value] } }; tab.value = 'email'; }
watch(() => ready.value && member.value?.is_admin, allowed => { if (allowed) load(); else { members.value = []; active.value = null; selection.value = null; selected.value = []; } }, { immediate: true });
watch(active, async person => { if (person) { await nextTick(); const heading = document.getElementById('dues-heading'); heading?.focus({ preventScroll: true }); heading?.scrollIntoView({ block: 'start' }); } });
</script>
<style scoped>
.field { @apply block w-full mt-1 bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-3 text-neutral-900; }
.primary { @apply bg-brand-fill hover:bg-brand-hover disabled:opacity-50 px-5 py-3 rounded-lg font-semibold text-brand-on-fill; }
.secondary { @apply border border-neutral-300 bg-white hover:bg-neutral-100 disabled:opacity-50 px-4 py-3 rounded-lg font-semibold; }
.link { @apply text-brand underline underline-offset-2; }
input[type=checkbox] { @apply w-5 h-5 accent-brand; }
</style>
