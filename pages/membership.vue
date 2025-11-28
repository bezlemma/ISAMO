<template>
  <div class="pt-24 pb-12 px-4 max-w-3xl mx-auto">
    
    <!-- Logged In View -->
    <div v-if="user" class="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-bold text-neutral-900">Welcome, {{ user.name || user.email }}</h1>
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
          <button v-if="!showRenewalOptions" @click="showRenewalOptions = true" class="px-4 py-2 bg-red-800 hover:bg-red-700 rounded-lg text-sm font-semibold text-white">
            Renew Membership
          </button>
          
          <div v-else class="mt-4 animate-fade-in">
            <p class="text-sm text-neutral-600 mb-3 font-medium">Select a plan to renew:</p>
            <div class="grid gap-3 md:grid-cols-2">
              <div @click="handleCheckout('student')" class="p-3 border border-neutral-200 rounded-xl hover:border-red-800/50 hover:bg-red-50/50 transition-colors cursor-pointer bg-white text-center">
                <h3 class="font-bold text-neutral-900">Student</h3>
                <p class="text-neutral-500 text-xs">$25 / year</p>
              </div>
              <div @click="handleCheckout('regular')" class="p-3 border border-neutral-200 rounded-xl hover:border-red-800/50 hover:bg-red-50/50 transition-colors cursor-pointer bg-white text-center">
                <h3 class="font-bold text-neutral-900">Regular</h3>
                <p class="text-neutral-500 text-xs">$100 / year</p>
              </div>
            </div>
            <button @click="showRenewalOptions = false" class="mt-3 text-xs text-neutral-500 hover:text-neutral-800 underline">
              Cancel
            </button>
          </div>
        </div>
      </div>

      <!-- Profile Details -->
      <div>
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-bold text-neutral-900">Your Profile</h3>
          <button @click="isEditing = !isEditing" class="text-sm text-red-800 hover:text-red-700 font-semibold">
            {{ isEditing ? 'Cancel' : 'Edit Profile' }}
          </button>
        </div>

        <!-- Edit Mode -->
        <div v-if="isEditing" class="bg-neutral-50 p-6 rounded-xl border border-neutral-200 mb-6">
          <form @submit.prevent="updateProfile" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-neutral-600 mb-1">Full Name</label>
              <input v-model="editName" type="text" class="w-full bg-white border border-neutral-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-800 focus:outline-none" />
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-600 mb-1">Avatar</label>
              <input type="file" @change="handleFileChange" accept="image/*" class="w-full text-sm text-neutral-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"/>
            </div>
            <div v-if="updateError" class="text-red-600 text-sm">{{ updateError }}</div>
            <button :disabled="updating" type="submit" class="px-4 py-2 bg-red-800 text-white rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-50">
              {{ updating ? 'Saving...' : 'Save Changes' }}
            </button>
          </form>
        </div>

        <!-- View Mode -->
        <div v-else class="grid gap-4 text-sm">
          <div class="flex items-center gap-4 mb-4">
            <img v-if="user.avatar" :src="pb.files.getURL(user, user.avatar)" class="h-16 w-16 rounded-full object-cover border border-neutral-200" />
            <div v-else class="h-16 w-16 rounded-full bg-neutral-100 flex items-center justify-center text-xl font-bold text-neutral-500 border border-neutral-200">
              {{ (user.name || '?').charAt(0) }}
            </div>
            <div>
              <p class="font-bold text-neutral-900 text-lg">{{ user.name || 'No Name' }}</p>
              <p class="text-neutral-500">{{ user.email }}</p>
            </div>
          </div>
          
          <div class="grid grid-cols-3 border-b border-neutral-100 pb-2">
            <span class="text-neutral-500">Joined</span>
            <span class="col-span-2 text-neutral-900">{{ new Date(user.created).toLocaleDateString() }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Logged Out View (Auth Form) -->
    <div v-else class="max-w-md mx-auto">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold mb-2 text-neutral-900">
          {{ isForgotPassword ? 'Reset Password' : (isSignUp ? 'Create Account' : 'Member Login') }}
        </h1>
        <p class="text-neutral-600">
          {{ isForgotPassword ? 'Enter your email to receive a reset link.' : (isSignUp ? 'Join ISAMO to access member benefits.' : 'Access your ISAMO membership account.') }}
        </p>
        <div v-if="selectedPlan && isSignUp" class="mt-4 p-3 bg-red-50 text-red-800 rounded-lg text-sm font-semibold border border-red-100">
          Creating account for <span class="capitalize">{{ selectedPlan }}</span> Membership
        </div>
      </div>

      <form @submit.prevent="handleAuth" class="space-y-4 bg-white p-8 rounded-2xl border border-neutral-200 shadow-sm">
        <div v-if="isSignUp">
          <label class="block text-sm font-medium text-neutral-600 mb-1">Full Name</label>
          <input v-model="name" type="text" required 
                 class="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-800 focus:outline-none text-neutral-900" />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-neutral-600 mb-1">Email</label>
          <input v-model="email" type="email" required 
                 class="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-800 focus:outline-none text-neutral-900" />
        </div>
        
        <div v-if="!isForgotPassword">
          <label class="block text-sm font-medium text-neutral-600 mb-1">Password</label>
          <input v-model="password" type="password" required 
                 class="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-800 focus:outline-none text-neutral-900" />
        </div>

        <div v-if="isSignUp">
          <label class="block text-sm font-medium text-neutral-600 mb-1">Confirm Password</label>
          <input v-model="passwordConfirm" type="password" required 
                 class="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-800 focus:outline-none text-neutral-900" />
        </div>
        
        <div v-if="loginError" class="text-red-800 text-sm text-center">
          {{ loginError }}
        </div>
        
        <div v-if="successMessage" class="text-emerald-700 text-sm text-center bg-emerald-50 p-2 rounded-lg border border-emerald-100">
          {{ successMessage }}
        </div>

        <button :disabled="loading" type="submit" 
                class="w-full bg-red-800 hover:bg-red-700 disabled:opacity-50 py-2 rounded-lg font-semibold transition-colors text-white">
          {{ loading ? 'Processing...' : (isSignUp ? 'Create Account' : (isForgotPassword ? 'Send Reset Link' : 'Sign In')) }}
        </button>

        <div class="text-center text-sm text-neutral-500 mt-4 space-y-2">
          <button v-if="!isForgotPassword && !isSignUp" type="button" @click="toggleForgotPassword" class="text-neutral-600 hover:text-red-800 transition-colors block w-full">
            Forgot Password?
          </button>
          
          <button type="button" @click="toggleAuthMode" class="text-red-800 hover:underline font-medium">
            {{ isForgotPassword ? 'Back to Sign In' : (isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up') }}
          </button>
        </div>
      </form>

      <div id="plans-section" class="mt-8 text-center">
        <p class="text-neutral-600 mb-4">Not a member yet?</p>
        <div class="grid gap-4">
          <div @click="handleCheckout('student')" class="p-4 border border-neutral-200 rounded-xl hover:border-red-800/50 transition-colors cursor-pointer bg-white">
            <h3 class="font-bold text-lg text-neutral-900">Student Membership</h3>
            <p class="text-neutral-500 text-sm">$25 / year</p>
          </div>
          <div @click="handleCheckout('regular')" class="p-4 border border-neutral-200 rounded-xl hover:border-red-800/50 transition-colors cursor-pointer bg-white">
            <h3 class="font-bold text-lg text-neutral-900">Regular Membership</h3>
            <p class="text-neutral-500 text-sm">$100 / year</p>
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
const passwordConfirm = ref('');
const name = ref('');
const loading = ref(false);
const loginError = ref('');
const isEditing = ref(false);
const editName = ref('');
const avatarFile = ref(null);
const updating = ref(false);
const updateError = ref('');
const showRenewalOptions = ref(false);

// Initialize edit form when user loads
watchEffect(() => {
  if (user.value) {
    editName.value = user.value.name || '';
  }
});

const handleFileChange = (event) => {
  avatarFile.value = event.target.files[0];
};

const updateProfile = async () => {
  updating.value = true;
  updateError.value = '';
  
  try {
    const formData = new FormData();
    formData.append('name', editName.value);
    if (avatarFile.value) {
      formData.append('avatar', avatarFile.value);
    }
    
    const updatedUser = await pb.collection('users').update(user.value.id, formData);
    
    // Update local user state
    user.value = updatedUser;
    isEditing.value = false;
    avatarFile.value = null;
    
  } catch (e) {
    updateError.value = e.message || "Failed to update profile";
  } finally {
    updating.value = false;
  }
};

const isSignUp = ref(false);
const isForgotPassword = ref(false);
const successMessage = ref('');
const selectedPlan = ref(null);

const toggleAuthMode = () => {
  isSignUp.value = !isSignUp.value;
  isForgotPassword.value = false;
  loginError.value = '';
  successMessage.value = '';
};

const toggleForgotPassword = () => {
  isForgotPassword.value = !isForgotPassword.value;
  isSignUp.value = false;
  loginError.value = '';
  successMessage.value = '';
};

const handleAuth = async () => {
  loading.value = true;
  loginError.value = '';
  successMessage.value = '';
  
  try {
    if (isForgotPassword.value) {
      await pb.collection('users').requestPasswordReset(email.value);
      successMessage.value = "If an account exists, a reset email has been sent!";
      loading.value = false;
      return;
    }

    if (isSignUp.value) {
      // Register
      if (password.value !== passwordConfirm.value) {
        throw new Error("Passwords do not match.");
      }
      
      const data = {
        email: email.value,
        password: password.value,
        passwordConfirm: passwordConfirm.value,
        name: name.value,
        membership_type: selectedPlan.value || undefined, // Store intended plan
      };
      
      await pb.collection('users').create(data);
      
      // Auto-login after creation
      await pb.collection('users').authWithPassword(email.value, password.value);
    } else {
      // Login
      await pb.collection('users').authWithPassword(email.value, password.value);
    }
    
    user.value = pb.authStore.model;
    
    // If they selected a plan before signing up, trigger checkout now
    if (selectedPlan.value) {
      await handleCheckout(selectedPlan.value);
    }
    
  } catch (e) {
    console.error(e);
    loginError.value = isSignUp.value 
      ? (e.data?.message || e.message || "Failed to create account.") 
      : "Invalid email or password.";
  } finally {
    loading.value = false;
  }
};

const logout = () => {
  pb.authStore.clear();
  user.value = null;
  selectedPlan.value = null;
};

const scrollToPlans = () => {
  const plansElement = document.getElementById('plans-section');
  if (plansElement) {
    plansElement.scrollIntoView({ behavior: 'smooth' });
  }
};

const handleCheckout = async (type) => {
  // If not logged in, switch to Sign Up mode and save their selection
  if (!user.value) {
    selectedPlan.value = type;
    isSignUp.value = true;
    // Scroll to top or form
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  
  // TODO: Replace with real Price IDs from Stripe Dashboard
  const priceIds = {
    student: 'price_H5ggYwtDq4fbrJ', // Placeholder
    regular: 'price_H5ggYwtDq4fbrK'  // Placeholder
  };

  try {
    const { url } = await $fetch('/api/stripe/checkout', {
      method: 'POST',
      body: {
        priceId: priceIds[type],
        successUrl: window.location.origin + '/membership?success=true',
        cancelUrl: window.location.origin + '/membership?canceled=true',
        userEmail: user.value.email,
        userId: user.value.id
      }
    });
    
    if (url) {
      window.location.href = url;
    }
  } catch (err) {
    alert("Checkout failed: " + err.message);
  }
};
</script>
