<template>
  <div>
    <MemberAccount />
    <div class="px-4 pb-12">
      <img :src="baseURL + 'images/embryo-embroidery.jpg'" alt="Embroidery of an embryo surrounded by branching blood vessels" class="w-full max-w-md mx-auto rounded-2xl" loading="lazy" decoding="async" />
    </div>
  </div>
</template>
<script setup>
const { baseURL } = useRuntimeConfig().app;
useHead({ title: 'Membership | ISAMO' });
</script>
