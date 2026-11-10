<template>
  <div class="pt-8 pb-12 px-4 max-w-3xl mx-auto">
    <div v-if="member" class="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
      <div class="flex items-center justify-between gap-4 mb-8">
        <h1 class="text-3xl font-bold text-neutral-900">Welcome, {{ member.name }}</h1>
        <button @click="logout" class="text-sm text-brand font-semibold">Sign Out</button>
      </div>
      <div v-if="recovery" class="rounded-xl border border-brand-line bg-brand-soft p-6 mb-8">
        <h2 class="font-bold mb-2">Save your recovery code</h2>
        <p class="text-neutral-700 mb-3">Use this code to reset your password if you forget it. Keep it somewhere private.</p>
        <code class="block break-all select-all bg-white p-3 rounded-lg text-sm">{{ recovery }}</code>
        <button @click="recovery = ''" class="mt-4 text-brand font-semibold underline">I’ve saved it</button>
      </div>
      <NuxtLink :to="route.query.next === 'event' ? '/community?compose=event' : '/community'" class="inline-block px-6 py-3 bg-brand-fill text-brand-on-fill rounded-full font-semibold mb-8">{{ route.query.next === 'event' ? 'Share an event' : 'Visit the community' }}</NuxtLink>
      <p v-if="notice" role="status" class="mb-6 text-neutral-700">{{ notice }}</p>
      <div v-if="!member.email_verified && settings.email_enabled" class="bg-neutral-50 rounded-xl p-5 mb-8">
        <p>Confirm your email address to receive mailing-list updates.</p>
        <button @click="resend" :disabled="busy" class="text-brand underline mt-2">Send confirmation email</button>
      </div>
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-bold">Your Profile</h2>
        <button @click="toggleEdit" class="text-sm text-brand font-semibold">{{ edit ? 'Cancel' : 'Edit Profile' }}</button>
      </div>
      <form v-if="edit" @submit.prevent="saveProfile" class="space-y-4 bg-neutral-50 p-6 rounded-xl border border-neutral-200">
        <div><label for="profile-name" class="block font-medium mb-1">Full Name</label><input id="profile-name" v-model="editName" required maxlength="100" autocomplete="name" class="field" /></div>
        <MemberDetailsFields v-model="profile" prefix="profile" />
        <button :disabled="busy" class="primary">{{ busy ? 'Saving…' : 'Save Changes' }}</button>
      </form>
      <div v-else class="text-neutral-600 space-y-2"><p class="font-bold text-lg text-neutral-900">{{ member.name }}</p><p>{{ member.email }}</p><p>{{ member.institution }}</p><p>{{ member.role }}</p><p>News and events: {{ member.mailing_list ? 'Subscribed' : 'Opted out' }}</p></div>
      <section class="mt-8 pt-6 border-t border-neutral-200" aria-labelledby="membership-payment-heading">
        <h2 id="membership-payment-heading" class="text-lg font-bold mb-3">Membership</h2>
        <p class="text-neutral-700 mb-3">{{ membershipPurpose }}</p>
        <p v-if="paidUntil" class="text-neutral-700 mb-3">Membership paid through {{ new Date(paidUntil).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) }}.</p>
        <p v-if="waivedUntil && (!paidUntil || waivedUntil > paidUntil)" class="text-neutral-700 mb-3">Membership fees waived through {{ new Date(waivedUntil).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }) }}.</p>
        <p v-if="!settings.payments_enabled" class="text-neutral-600">Membership payments are not open yet.</p>
        <template v-else><p class="text-neutral-600 mb-3">Choose your membership category. You will see the fee before paying.</p><div class="flex flex-wrap gap-3"><button v-for="plan in settings.plans" :key="plan.id" @click="pay(plan.id)" :disabled="busy" class="primary">{{ plan.label }}</button></div></template>
      </section>
      <section v-if="member.is_admin" class="mt-8 pt-6 border-t border-neutral-200">
        <h2 class="text-lg font-bold mb-3">Administration</h2>
        <NuxtLink to="/admin/members" class="primary inline-block mb-5">Manage members</NuxtLink>
        <p class="text-neutral-600 mb-3">Download members who have confirmed their email and chosen to receive updates.</p>
        <button @click="downloadMailingList" :disabled="busy" class="text-brand font-semibold underline">Download mailing list</button>
      </section>
      <p v-if="error" role="alert" class="text-red-800 mt-4">{{ error }}</p>
    </div>
    <div v-else :class="mode === 'register' ? 'max-w-xl mx-auto' : 'max-w-md mx-auto'">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold mb-2 text-neutral-900">{{ mode === 'register' ? 'Create Account' : ['recover','request-reset'].includes(mode) ? 'Reset Password' : 'Member Login' }}</h1>
        <p class="text-neutral-600">{{ mode === 'register' ? 'Join the ISAMO community.' : mode === 'recover' ? 'Enter the recovery code saved when you created your account.' : mode === 'request-reset' ? 'Enter your account email to receive a password reset link.' : 'Sign in to post and reply.' }}</p>
        <p v-if="['login','register'].includes(mode)" class="text-neutral-600 mt-4">{{ membershipPurpose }}</p>
      </div>
      <form @submit.prevent="submit" class="space-y-4 bg-white p-8 rounded-2xl border border-neutral-200 shadow-sm">
        <div v-if="mode === 'register'"><label for="member-name" class="block text-sm font-medium text-neutral-600 mb-1">Full Name</label><input id="member-name" v-model="name" required maxlength="100" autocomplete="name" class="field" /></div>
        <div><label for="member-email" class="block text-sm font-medium text-neutral-600 mb-1">Email</label><input id="member-email" v-model="email" type="email" required maxlength="254" autocomplete="username" class="field" /></div>
        <MemberDetailsFields v-if="mode === 'register'" v-model="profile" prefix="signup" />
        <div v-if="mode === 'recover'"><label for="recovery-code" class="block text-sm font-medium text-neutral-600 mb-1">Recovery Code</label><input id="recovery-code" v-model="recoveryInput" required autocomplete="off" class="field" /></div>
        <div v-if="mode !== 'request-reset'"><label for="member-password" class="block text-sm font-medium text-neutral-600 mb-1">{{ mode === 'recover' ? 'New Password' : 'Password' }}</label><input id="member-password" v-model="password" type="password" required :minlength="mode === 'login' ? 1 : 12" maxlength="128" :autocomplete="mode === 'login' ? 'current-password' : 'new-password'" class="field" /></div>
        <div v-if="['register','recover'].includes(mode)"><label for="password-confirm" class="block text-sm font-medium text-neutral-600 mb-1">Confirm Password</label><input id="password-confirm" v-model="confirmation" type="password" required autocomplete="new-password" class="field" /></div>
        <p v-if="error" role="alert" class="text-red-800 text-sm">{{ error }}</p>
        <p v-if="notice" role="status">{{ notice }}</p>
        <button :disabled="busy" type="submit" class="primary w-full">{{ busy ? 'Please wait…' : mode === 'register' ? 'Create Account' : mode === 'request-reset' ? 'Email reset link' : mode === 'recover' ? 'Reset Password' : 'Sign In' }}</button>
        <div class="text-center text-sm space-y-3">
          <button v-if="mode === 'login'" type="button" @click="changeMode('request-reset')" class="block w-full text-neutral-600 hover:text-brand">Forgot Password?</button>
          <button v-if="mode === 'request-reset'" type="button" @click="changeMode('recover')" class="block w-full text-neutral-600 hover:text-brand">Use a saved recovery code instead</button>
          <button type="button" @click="changeMode(mode === 'login' ? 'register' : 'login')" class="text-brand hover:underline font-medium">{{ mode === 'login' ? 'Need an account? Sign Up' : 'Back to Sign In' }}</button>
        </div>
      </form>
    </div>
  </div>
</template>
<script setup>
const { member, api, remember, signOut } = useCommunity();
const route = useRoute();
const membershipPurpose = 'Funds raised through membership fees will support conference and workshop travel and attendance for individuals from unfunded environments.';
const mode = ref('login'), name = ref(''), email = ref(''), password = ref(''), confirmation = ref('');
const recoveryInput = ref(''), recovery = ref(''), busy = ref(false), error = ref(''), notice = ref('');
const edit = ref(false), editName = ref('');
const profile = ref({ institution: '', role: '', mailing_list: true });
const settings = ref({ payments_enabled: false, email_enabled: false, plans: [] }), paidUntil = ref(null), waivedUntil = ref(null);
function toggleEdit() { edit.value = !edit.value; editName.value = member.value.name; profile.value = { institution: member.value.institution, role: member.value.role, mailing_list: member.value.mailing_list }; }
function changeMode(next) { mode.value = next; error.value = ''; notice.value = ''; password.value = ''; confirmation.value = ''; }
async function submit() {
  busy.value = true; error.value = '';
  try {
    if (mode.value === 'request-reset') { await api('/auth/request-reset', { method: 'POST', body: { email: email.value } }); notice.value = 'If this email has an ISAMO account, a password reset link is on its way.'; return; }
    if (mode.value !== 'login' && password.value !== confirmation.value) throw new Error('Passwords do not match.');
    const result = await api('/auth/' + mode.value, { method: 'POST', body: { name: name.value, email: email.value, password: password.value, recovery: recoveryInput.value, ...profile.value } });
    remember(result); recovery.value = result.recovery || ''; password.value = ''; confirmation.value = ''; recoveryInput.value = '';
    notice.value = result.email_status === 'queued' ? 'Your account is ready. A confirmation email is on its way.' : '';
    if (route.query.next === 'event' && mode.value === 'login') await navigateTo('/community?compose=event');
    if (route.query.next === 'admin' && result.member.is_admin) await navigateTo('/admin/members');
  } catch (e) { error.value = e.message; } finally { busy.value = false; }
}
async function saveProfile() {
  busy.value = true; error.value = '';
  try { member.value = await api('/me', { method: 'PATCH', body: { name: editName.value, ...profile.value } }); edit.value = false; notice.value = 'Your profile has been saved.'; }
  catch (e) { error.value = e.message; } finally { busy.value = false; }
}
async function logout() { error.value = ''; try { await signOut(); recovery.value = ''; } catch (e) { error.value = e.message; } }
async function resend() { busy.value = true; error.value = ''; try { const result = await api('/auth/resend-confirmation', { method: 'POST' }); notice.value = result.email_status === 'queued' ? 'A confirmation email is on its way.' : result.email_status === 'verified' ? 'Your email address is confirmed.' : 'Email is unavailable at the moment. Please try again later.'; } catch (e) { error.value = e.message; } finally { busy.value = false; } }
async function pay(plan) { busy.value = true; error.value = ''; try { const result = await api('/membership/checkout', { method: 'POST', body: { plan } }); if (new URL(result.url).origin !== 'https://checkout.stripe.com') throw new Error('Could not open checkout.'); window.location.assign(result.url); } catch (e) { error.value = e.message; } finally { busy.value = false; } }
async function downloadMailingList() {
  busy.value = true; error.value = '';
  try {
    const result = await api('/admin/mailing-list');
    if (!result.members.length) { notice.value = 'No confirmed mailing-list subscribers yet.'; return; }
    const cell = value => '"' + String(value || '').replace(/^[=+@\-\t\r]/, "'$&").replaceAll('"', '""') + '"';
    const rows = [['Name', 'Email', 'Institution', 'Role', 'Preference updated'], ...result.members.map(m => [m.name, m.email, m.institution, m.role, m.mailing_updated])];
    const url = URL.createObjectURL(new Blob(['\uFEFF' + rows.map(row => row.map(cell).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = 'ISAMO-mailing-list.csv'; a.click(); URL.revokeObjectURL(url);
  } catch (e) { error.value = e.message; } finally { busy.value = false; }
}
async function loadDues() { const status = await api('/membership/status'); paidUntil.value = status.paid_until; waivedUntil.value = status.waived_until; }
watch(() => member.value?.id, async id => { paidUntil.value = null; waivedUntil.value = null; if (id) { try { await loadDues(); } catch (e) { error.value = e.message; } } });
onMounted(async () => { try { settings.value = await api('/membership/config'); if (member.value) await loadDues(); } catch (e) { error.value = e.message; } });
</script>
<style scoped>
.field { @apply w-full bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-3 text-neutral-900; }
.primary { @apply bg-brand-fill hover:bg-brand-hover disabled:opacity-50 px-5 py-3 rounded-lg font-semibold text-brand-on-fill; }
</style>
