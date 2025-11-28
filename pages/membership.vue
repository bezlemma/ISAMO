<template>
  <div class="pt-24 pb-12 px-4 max-w-3xl mx-auto">
    
    <!-- Logged In View -->
    <div v-if="user" class="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-bold text-slate-900">Welcome, {{ user.name || user.email }}</h1>
          <p class="text-slate-500">Member ID: {{ user.id }}</p>
        </div>
        <button @click="logout" class="text-sm text-red-600 hover:text-red-500 font-semibold">
          Sign Out
        </button>
      </div>

      <!-- Membership Status Card -->
      <div class="bg-slate-50 rounded-xl p-6 border border-slate-200 mb-8">
        <h2 class="text-sm uppercase tracking-wider text-slate-500 font-bold mb-4">Membership Status</h2>
        <div class="flex items-center gap-4">
          <div :class="[
            'h-3 w-3 rounded-full',
            user.subscription_status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'
          ]"></div>
          <span class="text-xl font-medium capitalize text-slate-900">
            {{ user.subscription_status || 'Inactive' }}
          </span>
        </div>
        <div v-if="user.subscription_status !== 'active'" class="mt-4">
          <button class="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-semibold">
            Renew Membership
          </button>
        </div>
      </div>

      <!-- Profile Details -->
      <div>
        <h3 class="text-lg font-bold mb-4 text-slate-900">Your Profile</h3>
        <div class="grid gap-4 text-sm">
          <div class="grid grid-cols-3 border-b border-slate-100 pb-2">
            <span class="text-slate-500">Email</span>
            <span class="col-span-2 text-slate-900">{{ user.email }}</span>
          </div>
          <div class="grid grid-cols-3 border-b border-slate-100 pb-2">
            <span class="text-slate-500">Joined</span>
            <span class="col-span-2 text-slate-900">{{ new Date(user.created).toLocaleDateString() }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Logged Out View (Login Form) -->
    <div v-else class="max-w-md mx-auto">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold mb-2 text-slate-900">Member Login</h1>
        <p class="text-slate-600">Access your ISAMO membership account.</p>
      </div>

      <form @submit.prevent="login" class="space-y-4 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <label class="block text-sm font-medium text-slate-600 mb-1">Email</label>
          <input v-model="email" type="email" required 
                 class="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-900" />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-600 mb-1">Password</label>
          <input v-model="password" type="password" required 
                 class="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-900" />
        </div>
        
        <div v-if="loginError" class="text-red-500 text-sm text-center">
          {{ loginError }}
        </div>

        <button :disabled="loading" type="submit" 
                class="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 py-2 rounded-lg font-semibold transition-colors">
          {{ loading ? 'Signing in...' : 'Sign In' }}
        </button>
      </form>

      <div class="mt-8 text-center">
        <p class="text-slate-600 mb-4">Not a member yet?</p>
        <div class="grid gap-4">
          <div class="p-4 border border-slate-200 rounded-xl hover:border-blue-500/50 transition-colors cursor-pointer bg-white">
            <h3 class="font-bold text-lg text-slate-900">Student Membership</h3>
            <p class="text-slate-500 text-sm">$25 / year</p>
          </div>
          <div class="p-4 border border-slate-200 rounded-xl hover:border-blue-500/50 transition-colors cursor-pointer bg-white">
            <h3 class="font-bold text-lg text-slate-900">Regular Membership</h3>
            <p class="text-slate-500 text-sm">$100 / year</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const pb = usePocketBase();
const user = ref(pb.authStore.model);
const email = ref('');
const password = ref('');
const loading = ref(false);
const loginError = ref('');

const login = async () => {
  loading.value = true;
  loginError.value = '';
  try {
    await pb.collection('users').authWithPassword(email.value, password.value);
    user.value = pb.authStore.model;
  } catch (e) {
    loginError.value = 'Invalid email or password.';
  } finally {
    loading.value = false;
  }
};

const logout = () => {
  pb.authStore.clear();
  user.value = null;
};
</script>
