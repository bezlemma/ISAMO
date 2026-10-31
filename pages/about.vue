<template>
  <div class="pt-24 pb-16 px-6 max-w-5xl mx-auto">
    <h1 class="text-4xl md:text-5xl font-bold text-slate-900 mb-10">What is ISAMO?</h1>
    <nav aria-label="About ISAMO" class="flex flex-wrap gap-6 text-red-800 font-semibold mb-10"><a href="#mission">Mission statement</a><a href="#constitution">Constitution &amp; terms</a></nav>
    <section id="mission" class="bg-white p-8 rounded-2xl border border-slate-200 mb-8 scroll-mt-24">
      <h2 class="text-2xl font-bold mb-5">Our mission</h2>
      <p class="text-lg leading-8 text-neutral-700">The International Society for Avian Model Organisms (ISAMO) promotes research using avian model organisms for the public benefit, through scientific meetings and associated workshops.</p>
      <p class="text-lg leading-8 text-neutral-700 mt-5">Research with chickens, quail, songbirds and ducks helps us understand development, evolution, neuroscience, health and disease. We bring researchers together to share discoveries, techniques and resources.</p>
    </section>
    <section id="constitution" class="bg-white p-8 rounded-2xl border border-slate-200 scroll-mt-24">
      <h2 class="text-2xl font-bold mb-5">Constitution &amp; terms</h2>
      <p class="text-neutral-700 leading-7 mb-5">Our constitution describes the society’s purpose, membership, governance and trustee responsibilities.</p>
      <NuxtLink to="/constitution" class="text-red-800 font-semibold underline">Read the draft constitution, dated 4 December 2025</NuxtLink>
      <p class="text-neutral-600 mt-4">Membership terms and fees are being finalised. Payments are not open yet.</p>
    </section>
  </div>
</template>
<script setup>
useHead({ title: 'What is ISAMO? | ISAMO' });
</script>
