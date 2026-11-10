<template>
  <div class="flex items-center gap-3 sm:gap-4">
    <NuxtLink to="/" aria-label="ISAMO home">
      <img :src="baseURL + 'logos/' + theme + '.svg'" alt="ISAMO" width="390" height="127" class="h-auto w-[clamp(10rem,50vw,13rem)] sm:w-60 xl:w-64" />
    </NuxtLink>
    <div class="flex flex-col border-l-2 border-brand-trim pl-2 sm:pl-3">
      <label for="site-theme" class="text-xs leading-tight text-neutral-600">Theme</label>
      <select id="site-theme" :value="theme" class="cursor-pointer rounded bg-white py-1 pr-1 text-sm font-semibold text-brand" @change="choose($event.target.value)">
        <option v-for="option in themes" :key="option" :value="option">{{ labels[option] }}</option>
      </select>
    </div>
  </div>
</template>

<script setup>
const { baseURL } = useRuntimeConfig().app;
const route = useRoute();
const router = useRouter();
const labels = { red: 'Red', buff: 'Buff', green: 'Green' };
const themes = Object.keys(labels);
const theme = ref('red');
const storageKey = 'isamo-theme';

useHead(() => ({ htmlAttrs: { 'data-theme': theme.value } }));

function apply(value) {
  if (!themes.includes(value)) return;
  theme.value = value;
  try { localStorage.setItem(storageKey, value); } catch { /* Storage is optional. */ }
}

function choose(value) {
  apply(value);
  router.replace({ path: route.path, query: { ...route.query, theme: value }, hash: route.hash });
}

onMounted(() => {
  if (themes.includes(route.query.theme)) {
    apply(route.query.theme);
  } else {
    try { apply(localStorage.getItem(storageKey)); } catch { /* Use the default theme. */ }
  }
});
watch(() => route.query.theme, apply);
</script>
