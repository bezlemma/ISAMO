<template>
  <div class="relative min-h-[80vh] bg-white flex items-center justify-center overflow-hidden">
    <!-- Subtle Bird-like Gradient Background -->
    <div class="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-orange-50 opacity-70"></div>
    
    <!-- Content -->
    <div class="relative z-10 text-center px-4 max-w-5xl mx-auto">
      <h1 class="text-6xl md:text-8xl font-bold tracking-tight mb-12 text-slate-900">
        International Society for <br />
        <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-teal-500 to-amber-500">
          Avian Model Organisms
        </span>
      </h1>
      
      <div class="flex flex-col sm:flex-row gap-6 justify-center items-center">
        <NuxtLink to="/membership" class="px-10 py-4 bg-slate-900 text-white rounded-full font-bold text-lg hover:bg-slate-800 transition-all hover:-translate-y-1 shadow-xl shadow-slate-200">
          Become a Member
        </NuxtLink>
        <NuxtLink to="/events" class="px-10 py-4 bg-white text-slate-900 border-2 border-slate-200 rounded-full font-bold text-lg hover:border-blue-500 hover:text-blue-600 transition-all hover:-translate-y-1">
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
