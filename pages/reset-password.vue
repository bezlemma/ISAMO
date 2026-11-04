<template>
  <div class="pt-24 pb-16 px-4 max-w-lg mx-auto">
    <h1 class="text-3xl font-bold mb-6">Set your ISAMO password</h1>
    <div v-if="recovery" class="bg-white border rounded-xl p-6 space-y-4"><p>Your password has been changed. Save this recovery code somewhere private.</p><code class="block break-all bg-neutral-50 p-3">{{ recovery }}</code><NuxtLink to="/membership" class="text-red-800 underline block">Sign in to ISAMO</NuxtLink></div>
    <form v-else @submit.prevent="submit" class="bg-white border rounded-xl p-6 space-y-4">
      <label class="block">New password<input v-model="password" type="password" required minlength="12" maxlength="128" autocomplete="new-password" class="field" /></label>
      <label class="block">Confirm password<input v-model="confirmation" type="password" required autocomplete="new-password" class="field" /></label>
      <p v-if="error" role="alert" class="text-red-800">{{ error }}</p>
      <button :disabled="busy || !code" class="bg-red-800 text-white rounded-lg px-5 py-3 font-semibold disabled:opacity-50">{{ busy ? 'Saving…' : 'Save password' }}</button>
      <NuxtLink to="/membership" class="text-red-800 underline block">Back to member login</NuxtLink>
    </form>
  </div>
</template>
<script setup>
const { api, signOut } = useCommunity();
const code = ref(''), password = ref(''), confirmation = ref(''), error = ref(''), busy = ref(false), recovery = ref('');
onMounted(() => { code.value = location.hash.slice(1); history.replaceState(history.state, '', location.pathname); if (!/^[a-f0-9]{64}$/.test(code.value)) error.value = 'Open the password reset link from your email, or request another from the login page.'; });
async function submit() {
  error.value = ''; busy.value = true;
  try { if (password.value !== confirmation.value) throw new Error('Passwords do not match.'); const result = await api('/auth/reset-password', { method: 'POST', body: { token: code.value, password: password.value } }); recovery.value = result.recovery; password.value = ''; confirmation.value = ''; code.value = ''; await signOut().catch(() => {}); }
  catch (e) { error.value = e.message; } finally { busy.value = false; }
}
</script>
<style scoped>.field { @apply block w-full mt-1 bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-3 text-neutral-900; }</style>
