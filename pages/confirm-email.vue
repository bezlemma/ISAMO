<template>
  <div class="pt-24 pb-16 px-4 max-w-xl mx-auto"><section class="bg-white border border-neutral-200 rounded-2xl p-8">
    <h1 class="text-3xl font-bold mb-6">Confirm your email</h1>
    <p v-if="done" role="status" class="mb-6">Your email address has been confirmed.</p>
    <template v-else><p class="text-neutral-600 mb-6">Confirm this address for your ISAMO account.</p><button @click="confirm" :disabled="busy || !code" class="bg-brand-fill text-brand-on-fill rounded-lg px-5 py-3 font-semibold disabled:opacity-50">{{ busy ? 'Confirming…' : 'Confirm email address' }}</button></template>
    <p v-if="error" role="alert" class="text-red-800 mt-4">{{ error }}</p>
    <NuxtLink to="/membership" class="block mt-6 text-brand underline">Go to your account</NuxtLink>
  </section></div>
</template>
<script setup>
const { api, member } = useCommunity();
const route = useRoute();
const code = ref(''), busy = ref(false), done = ref(false), error = ref('');
onMounted(() => {
  // Nuxt restores URL fragments after hydrating a prerendered page.
  watch(() => route.hash, hash => {
    if (done.value) return;
    code.value = hash.slice(1);
    error.value = code.value ? '' : 'Open the link in your confirmation email, or sign in to request another.';
  }, { immediate: true });
});
async function confirm() { busy.value = true; error.value = ''; try { await api('/auth/confirm-email', { method: 'POST', body: { token: code.value } }); done.value = true; window.history.replaceState(null, '', window.location.pathname); if (member.value) member.value = await api('/me'); } catch (e) { error.value = e.message; } finally { busy.value = false; } }
useHead({ title: 'Confirm email | ISAMO', meta: [{ name: 'referrer', content: 'no-referrer' }] });
</script>
