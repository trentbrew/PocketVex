<script lang="ts">
  import { authActions } from '../../stores/auth.js';
  import Button from '../ui/Button.svelte';
  import Input from '../ui/Input.svelte';

  let email = '';
  let password = '';
  let isLoading = false;
  let error = '';

  async function handleSubmit() {
    if (!email || !password) return;
    
    isLoading = true;
    error = '';
    
    const result = await authActions.login(email, password);
    
    if (!result.success) {
      error = result.error;
    }
    
    isLoading = false;
  }
</script>

<div class="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
  <h2 class="text-2xl font-bold mb-6 text-center">Login</h2>
  
  {#if error}
    <div class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
      {error}
    </div>
  {/if}

  <form on:submit|preventDefault={handleSubmit}>
    <div class="mb-4">
      <Input
        type="email"
        bind:value={email}
        placeholder="Email"
        required
        disabled={isLoading}
      />
    </div>
    
    <div class="mb-6">
      <Input
        type="password"
        bind:value={password}
        placeholder="Password"
        required
        disabled={isLoading}
      />
    </div>
    
    <Button
      type="submit"
      disabled={isLoading || !email || !password}
      class="w-full"
    >
      {isLoading ? 'Logging in...' : 'Login'}
    </Button>
  </form>
</div>
