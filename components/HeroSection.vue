<template>
  <div class="relative min-h-screen flex items-center justify-center overflow-hidden bg-white">
    <!-- Background Image -->
    <div class="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
      <!-- Chicken Image with blend mode to sit better on white -->
      <img src="/Ruby.png" alt="Background" class="h-[85%] w-auto object-contain opacity-80 mix-blend-multiply" />
      <!-- Subtle white gradient at the bottom to fade it out if needed -->
      <div class="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
    </div>

    <div class="relative z-10 text-center px-4 max-w-5xl mx-auto flex flex-col items-center">
      <h1 class="text-6xl md:text-8xl font-bold tracking-tight mb-8 text-neutral-900 drop-shadow-sm">
        International Society for <br />
        <span class="text-transparent bg-clip-text bg-gradient-to-r from-red-700 via-red-600 to-red-800">
          Avian Model Organisms
        </span>
      </h1>
      
      <div class="flex flex-col sm:flex-row gap-6 justify-center items-center mt-8">
        <NuxtLink to="/membership" class="px-10 py-4 bg-red-800 text-white rounded-full font-bold text-lg hover:bg-red-900 transition-all hover:-translate-y-1 shadow-xl shadow-red-900/20 border border-red-700">
          Become a Member
        </NuxtLink>
        <NuxtLink to="/events" class="px-10 py-4 bg-white text-neutral-900 border-2 border-neutral-200 rounded-full font-bold text-lg hover:border-red-800 hover:text-red-800 transition-all hover:-translate-y-1">
          View Events
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
const randomStyle = () => {
  const size = Math.random() * 300 + 50 + 'px';
  return {
    width: size,
    height: size,
    left: Math.random() * 100 + '%',
    top: Math.random() * 100 + '%',
    animationDuration: Math.random() * 10 + 10 + 's',
    animationDelay: Math.random() * 5 + 's',
  }
}
</script>

<style scoped>
@keyframes float {
  0%, 100% { transform: translate(0, 0); }
  25% { transform: translate(10px, -20px); }
  50% { transform: translate(-15px, 15px); }
  75% { transform: translate(20px, 10px); }
}

.animate-float {
  animation: float infinite ease-in-out;
}
</style>
