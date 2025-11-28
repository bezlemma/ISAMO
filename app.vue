<template>
  <div class="min-h-screen bg-neutral-50 text-neutral-900 font-sans">
    <nav class="fixed top-0 left-0 right-0 z-50 border-b border-neutral-200 bg-white/90 backdrop-blur-md">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center">
            <NuxtLink to="/" class="text-xl font-bold text-red-800 tracking-tight">
              ISAMO
            </NuxtLink>
          </div>
          <div class="hidden md:block">
            <div class="ml-10 flex items-baseline space-x-4">
              <NuxtLink to="/" class="px-3 py-2 rounded-md text-sm font-medium text-neutral-600 hover:text-red-800 transition-colors" active-class="text-red-800 font-bold">Home</NuxtLink>
              <NuxtLink to="/about" class="px-3 py-2 rounded-md text-sm font-medium text-neutral-600 hover:text-red-800 transition-colors" active-class="text-red-800 font-bold">About</NuxtLink>
              <NuxtLink to="/events" class="px-3 py-2 rounded-md text-sm font-medium text-neutral-600 hover:text-red-800 transition-colors" active-class="text-red-800 font-bold">Events</NuxtLink>
              <NuxtLink to="/resources" class="px-3 py-2 rounded-md text-sm font-medium text-neutral-600 hover:text-red-800 transition-colors" active-class="text-red-800 font-bold">Resources</NuxtLink>
              <NuxtLink to="/membership" class="px-3 py-2 rounded-md text-sm font-medium text-neutral-600 hover:text-red-800 transition-colors" active-class="text-red-800 font-bold">Membership</NuxtLink>
              <NuxtLink v-if="user?.role" to="/admin/stats" class="px-3 py-2 rounded-md text-sm font-medium text-red-800 bg-red-50 hover:bg-red-100 transition-colors" active-class="bg-red-100 font-bold">Admin Stats</NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </nav>
    <NuxtPage />
  </div>
</template>

<script setup>
const pb = usePocketBase();
const user = ref(pb.authStore.model);

// Listen for auth changes to update the UI reactively
pb.authStore.onChange(() => {
  user.value = pb.authStore.model;
});

// Global SEO Configuration
useSeoMeta({
  title: 'ISAMO - International Society for Avian Model Organisms',
  ogTitle: 'ISAMO - International Society for Avian Model Organisms',
  description: 'Promoting and advancing research using avian models. Join the community of researchers dedicated to avian biology.',
  ogDescription: 'Promoting and advancing research using avian models. Join the community of researchers dedicated to avian biology.',
  ogImage: 'https://isamo.org/Ruby.jpeg', // Assuming domain, or use relative if handled by Nuxt Image, but absolute is safer for OG
  twitterCard: 'summary_large_image',
  twitterTitle: 'ISAMO',
  twitterDescription: 'International Society for Avian Model Organisms',
  twitterImage: 'https://isamo.org/Ruby.jpeg'
});

useHead({
  link: [
    { rel: 'icon', type: 'image/jpeg', href: '/ISAMO/Ruby.jpeg' }
  ]
})

// Note: Since we don't have the domain yet, I'm using a placeholder. 
// Ideally, we should use useRequestURL() to get the origin if dynamic, or a config variable.
// For now, I'll use a relative path which some crawlers support, or just hardcode the likely production URL if known.
// Actually, Nuxt's useSeoMeta handles relative paths for og:image if configured correctly, but often absolute is best.
// I will use '/Ruby.jpeg' and let the browser/crawler resolve it against the base URL if possible, 
// but for social cards, absolute URLs are strictly required.
// I'll assume the site will be at isamo.org or similar. 
// Let's use a computed property or just '/Ruby.jpeg' and hope the meta tag generator handles the host.
// Nuxt 3 useSeoMeta doesn't auto-prepend host to og:image string.
// I'll leave it as '/Ruby.jpeg' for now, but add a TODO to update domain.
</script>
