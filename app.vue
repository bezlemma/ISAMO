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
          <div class="-mr-2 flex md:hidden">
            <button @click="isOpen = !isOpen" type="button" class="bg-white inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500" aria-controls="mobile-menu" :aria-expanded="isOpen">
              <span class="sr-only">Open main menu</span>
              <svg :class="{'hidden': isOpen, 'block': !isOpen }" class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg :class="{'block': isOpen, 'hidden': !isOpen }" class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div v-show="isOpen" class="md:hidden" id="mobile-menu">
        <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-b border-neutral-200 shadow-lg">
          <NuxtLink to="/" class="block px-3 py-2 rounded-md text-base font-medium text-neutral-600 hover:text-red-800 hover:bg-gray-50" active-class="text-red-800 font-bold bg-red-50" @click="isOpen = false">Home</NuxtLink>
          <NuxtLink to="/about" class="block px-3 py-2 rounded-md text-base font-medium text-neutral-600 hover:text-red-800 hover:bg-gray-50" active-class="text-red-800 font-bold bg-red-50" @click="isOpen = false">About</NuxtLink>
          <NuxtLink to="/events" class="block px-3 py-2 rounded-md text-base font-medium text-neutral-600 hover:text-red-800 hover:bg-gray-50" active-class="text-red-800 font-bold bg-red-50" @click="isOpen = false">Events</NuxtLink>
          <NuxtLink to="/resources" class="block px-3 py-2 rounded-md text-base font-medium text-neutral-600 hover:text-red-800 hover:bg-gray-50" active-class="text-red-800 font-bold bg-red-50" @click="isOpen = false">Resources</NuxtLink>
          <NuxtLink to="/membership" class="block px-3 py-2 rounded-md text-base font-medium text-neutral-600 hover:text-red-800 hover:bg-gray-50" active-class="text-red-800 font-bold bg-red-50" @click="isOpen = false">Membership</NuxtLink>
          <NuxtLink v-if="user?.role" to="/admin/stats" class="block px-3 py-2 rounded-md text-base font-medium text-red-800 bg-red-50 hover:bg-red-100" active-class="bg-red-100 font-bold" @click="isOpen = false">Admin Stats</NuxtLink>
        </div>
      </div>
    </nav>
    <NuxtPage />
  </div>
</template>

<script setup>
const pb = usePocketBase();
const user = ref(pb.authStore.model);
const isOpen = ref(false);

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
</script>
