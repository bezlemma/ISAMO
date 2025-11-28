<template>
  <div class="min-h-screen bg-white text-slate-900 font-sans">
    <!-- Navigation -->
    <nav class="fixed top-0 left-0 right-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center">
            <NuxtLink to="/" class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
              ISAMO
            </NuxtLink>
          </div>
          <div class="hidden md:block">
            <div class="ml-10 flex items-baseline space-x-4">
              <NuxtLink to="/" class="px-3 py-2 rounded-md text-sm font-medium hover:text-blue-600 transition-colors" active-class="text-blue-600">Home</NuxtLink>
              <NuxtLink to="/about" class="px-3 py-2 rounded-md text-sm font-medium hover:text-blue-600 transition-colors" active-class="text-blue-600">About</NuxtLink>
              <NuxtLink to="/events" class="px-3 py-2 rounded-md text-sm font-medium hover:text-blue-600 transition-colors" active-class="text-blue-600">Events</NuxtLink>
              <NuxtLink to="/resources" class="px-3 py-2 rounded-md text-sm font-medium hover:text-blue-600 transition-colors" active-class="text-blue-600">Resources</NuxtLink>
              <NuxtLink to="/membership" class="px-3 py-2 rounded-md text-sm font-medium hover:text-blue-600 transition-colors" active-class="text-blue-600">Membership</NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Page Content -->
    <NuxtPage />
  </div>
</template>
