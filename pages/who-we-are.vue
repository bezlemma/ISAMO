<template>
  <div class="pt-24 pb-16">
    <div class="max-w-7xl mx-auto px-6 lg:px-8"><h1 class="text-4xl md:text-5xl font-bold text-slate-900 mb-10">Who are we?</h1><nav aria-label="People and contact" class="flex flex-wrap gap-6 text-red-800 font-semibold mb-4"><a href="#trustees">Trustees</a><a href="#advisory-board">Scientific Advisory Board</a><a href="#contact">Contact us</a></nav></div>
    <CommitteeDirectory />
    <div class="max-w-7xl mx-auto px-6 lg:px-8">
      <section id="advisory-board" class="py-12 border-b border-neutral-200 scroll-mt-24">
        <h2 class="text-3xl font-bold mb-6">Scientific Advisory Board</h2>
        <p class="text-neutral-600 mb-6">The board advises the trustees on the society’s scientific activities.</p>
        <h3 class="font-semibold text-lg">Susanne Dietrich</h3><p class="text-neutral-600">University of Portsmouth</p>
      </section>
      <section id="contact" class="pt-12 scroll-mt-24"><h2 class="text-3xl font-bold mb-5">Contact us</h2><p class="text-neutral-600 mb-4">For membership, events and society enquiries, email:</p><a href="mailto:admin@avianmodel.org" class="text-lg text-red-800 font-semibold underline">admin@avianmodel.org</a></section>
    </div>
  </div>
</template>
<script setup>useHead({ title: 'Who are we? | ISAMO' });</script>
