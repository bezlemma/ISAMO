<template>
  <NuxtLink to="/" aria-label="ISAMO home">
    <img :src="baseURL + 'logos/green.svg'" alt="ISAMO" width="390" height="127" class="h-auto w-[clamp(10rem,50vw,13rem)] sm:w-60 xl:w-64" />
  </NuxtLink>
</template>

<script setup>
const { baseURL } = useRuntimeConfig().app;
</script>
