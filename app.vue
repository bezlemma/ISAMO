<template>
  <div class="min-h-screen bg-brand-surface text-neutral-900 font-sans">
    <a href="#main-content" class="skip-link">Skip to content</a>
    <nav aria-label="Main navigation" class="fixed top-0 left-0 right-0 z-50 border-b border-neutral-200 bg-white/90 backdrop-blur-md">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <HeaderBrand />
          <div class="hidden lg:block">
            <div class="nav-links ml-3 flex items-baseline gap-1 xl:gap-4">
              <NuxtLink to="/" class="px-3 py-2 rounded-md text-sm font-medium text-neutral-600 hover:text-brand transition-colors" active-class="text-brand font-bold">Home</NuxtLink>
              <NuxtLink to="/about" class="px-3 py-2 rounded-md text-sm font-medium text-neutral-600 hover:text-brand transition-colors" active-class="text-brand font-bold">What is ISAMO</NuxtLink>
              <NuxtLink to="/events" class="px-3 py-2 rounded-md text-sm font-medium text-neutral-600 hover:text-brand transition-colors" active-class="text-brand font-bold">Events</NuxtLink>
              <NuxtLink to="/resources" class="px-3 py-2 rounded-md text-sm font-medium text-neutral-600 hover:text-brand transition-colors" active-class="text-brand font-bold">Resources</NuxtLink>
              <NuxtLink to="/who-we-are" class="px-3 py-2 rounded-md text-sm font-medium text-neutral-600 hover:text-brand transition-colors" active-class="text-brand font-bold">Who are we</NuxtLink>
              <NuxtLink to="/membership" class="px-3 py-2 rounded-md text-sm font-medium text-neutral-600 hover:text-brand transition-colors" active-class="text-brand font-bold">Membership</NuxtLink>
            </div>
          </div>
          <div class="-mr-2 flex lg:hidden">
            <button @click="isOpen = !isOpen" type="button" class="bg-white inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand" aria-controls="mobile-menu" :aria-expanded="isOpen">
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

      <div v-show="isOpen" class="lg:hidden" id="mobile-menu">
        <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-b border-neutral-200 shadow-lg">
          <NuxtLink to="/" class="block px-3 py-2 rounded-md text-base font-medium text-neutral-600 hover:text-brand hover:bg-gray-50" active-class="text-brand font-bold bg-brand-soft" @click="isOpen = false">Home</NuxtLink>
          <NuxtLink to="/about" class="block px-3 py-2 rounded-md text-base font-medium text-neutral-600 hover:text-brand hover:bg-gray-50" active-class="text-brand font-bold bg-brand-soft" @click="isOpen = false">What is ISAMO</NuxtLink>
          <NuxtLink to="/events" class="block px-3 py-2 rounded-md text-base font-medium text-neutral-600 hover:text-brand hover:bg-gray-50" active-class="text-brand font-bold bg-brand-soft" @click="isOpen = false">Events</NuxtLink>
          <NuxtLink to="/resources" class="block px-3 py-2 rounded-md text-base font-medium text-neutral-600 hover:text-brand hover:bg-gray-50" active-class="text-brand font-bold bg-brand-soft" @click="isOpen = false">Resources</NuxtLink>
          <NuxtLink to="/who-we-are" class="block px-3 py-2 rounded-md text-base font-medium text-neutral-600 hover:text-brand hover:bg-gray-50" active-class="text-brand font-bold bg-brand-soft" @click="isOpen = false">Who are we</NuxtLink>
          <NuxtLink to="/membership" class="block px-3 py-2 rounded-md text-base font-medium text-neutral-600 hover:text-brand hover:bg-gray-50" active-class="text-brand font-bold bg-brand-soft" @click="isOpen = false">Membership</NuxtLink>
        </div>
      </div>
    </nav>
    <main id="main-content"><NuxtPage /></main>
  </div>
</template>

<script setup>
const isOpen = ref(false);

useHead({
  link: [
    { rel: 'icon', type: 'image/png', sizes: '64x64', href: useRuntimeConfig().app.baseURL + 'favicon.png' }
  ]
})
</script>

<style>
:focus-visible { outline: 3px solid rgb(var(--brand)); outline-offset: 4px; }
.skip-link { position: fixed; top: -100px; left: 12px; z-index: 100; padding: 12px 18px; background: white; color: rgb(var(--brand)); }
.nav-links a[aria-current="page"] { text-decoration: underline 2px rgb(var(--brand-trim)); text-underline-offset: 6px; }
.skip-link:focus { top: 12px; }
@media (prefers-reduced-motion: reduce) { *, *::before, *::after { scroll-behavior: auto !important; transition: none !important; animation: none !important; } }
</style>
