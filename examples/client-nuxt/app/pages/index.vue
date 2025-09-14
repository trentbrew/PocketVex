<script setup
        lang="ts">
          import { ref } from 'vue'

          const showAlert = ref(false)
          const buttonVariant = ref('default')
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="border-b bg-white shadow-sm">
      <div class="container mx-auto px-4 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Nuxt 4 + PocketVex</h1>
            <p class="text-gray-600 mt-2">Simple setup with PocketBase integration</p>
          </div>
          <div class="flex items-center gap-2">
            <span class="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">Nuxt 4</span>
            <span class="px-2 py-1 bg-green-100 text-green-800 text-sm rounded">PocketVex</span>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-8">
      <div class="grid gap-8">
        <!-- Demo Section -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold mb-4">Component Showcase</h2>
          <p class="text-gray-600 mb-6">Testing basic HTML elements and Vue functionality</p>

          <div class="space-y-6">
            <!-- Buttons -->
            <div class="space-y-4">
              <h3 class="text-lg font-semibold">Buttons</h3>
              <div class="flex flex-wrap gap-2">
                <button class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Default</button>
                <button class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">Secondary</button>
                <button class="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50">Outline</button>
                <button class="px-4 py-2 text-gray-700 rounded hover:bg-gray-100">Ghost</button>
                <button class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Destructive</button>
                <button class="px-4 py-2 text-blue-600 underline hover:text-blue-700">Link</button>
              </div>
            </div>

            <!-- Form Elements -->
            <div class="space-y-4">
              <h3 class="text-lg font-semibold">Form Elements</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
                  <input id="email" type="email" placeholder="Enter your email"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div class="space-y-2">
                  <label for="message" class="block text-sm font-medium text-gray-700">Message</label>
                  <textarea id="message" placeholder="Type your message here" rows="3"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <input type="checkbox" id="terms" class="rounded" />
                <label for="terms" class="text-sm text-gray-700">Accept terms and conditions</label>
              </div>
            </div>

            <!-- Alerts -->
            <div class="space-y-4">
              <h3 class="text-lg font-semibold">Alerts</h3>
              <div class="p-4 bg-blue-50 border border-blue-200 rounded-md">
                <h4 class="font-semibold text-blue-800">Heads up!</h4>
                <p class="text-blue-700 mt-1">This is a simple alert message.</p>
              </div>
              <div class="p-4 bg-red-50 border border-red-200 rounded-md">
                <h4 class="font-semibold text-red-800">Error</h4>
                <p class="text-red-700 mt-1">Your session has expired. Please log in again.</p>
              </div>
            </div>

            <!-- Interactive Demo -->
            <div class="space-y-4">
              <h3 class="text-lg font-semibold">Interactive Demo</h3>
              <div class="flex gap-2">
                <button @click="showAlert = !showAlert"
                  class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  {{ showAlert ? 'Hide' : 'Show' }} Alert
                </button>
                <button @click="buttonVariant = buttonVariant === 'default' ? 'destructive' : 'default'"
                  class="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
                  Toggle Button Style
                </button>
              </div>

              <div v-if="showAlert"
                :class="buttonVariant === 'destructive' ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'"
                class="p-4 border rounded-md">
                <h4 :class="buttonVariant === 'destructive' ? 'text-red-800' : 'text-blue-800'" class="font-semibold">
                  {{ buttonVariant === 'destructive' ? 'Destructive' : 'Default' }} Alert
                </h4>
                <p :class="buttonVariant === 'destructive' ? 'text-red-700' : 'text-blue-700'" class="mt-1">
                  This alert changes based on the button variant.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Navigation -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold mb-4">Navigation</h2>
          <p class="text-gray-600 mb-4">Quick links to other pages and demos</p>
          <div class="flex flex-wrap gap-2">
            <a href="/pocketvex-demo" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              PocketVex Demo
            </a>
            <a href="/health" class="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
              Health Check
            </a>
          </div>
        </div>

        <!-- CSS Demo -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold mb-4">CSS Features</h2>
          <p class="text-gray-600 mb-4">Demonstrating various CSS utilities</p>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg">
              <h4 class="font-semibold">Gradient Background</h4>
              <p class="text-sm opacity-90">Using CSS gradients</p>
            </div>
            <div class="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors">
              <h4 class="font-semibold">Hover Effects</h4>
              <p class="text-sm text-gray-600">Hover to see the border change</p>
            </div>
            <div class="p-4 bg-gray-100 rounded-lg">
              <h4 class="font-semibold">Simple Styling</h4>
              <p class="text-sm text-gray-600">Clean and minimal design</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>

  /* Basic utility classes */
  .min-h-screen {
    min-height: 100vh;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
  }

  .grid {
    display: grid;
  }

  .grid-cols-1 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }

  .grid-cols-3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .gap-2 {
    gap: 0.5rem;
  }

  .gap-4 {
    gap: 1rem;
  }

  .gap-8 {
    gap: 2rem;
  }

  .flex {
    display: flex;
  }

  .flex-wrap {
    flex-wrap: wrap;
  }

  .items-center {
    align-items: center;
  }

  .justify-between {
    justify-content: space-between;
  }

  .space-x-2>*+* {
    margin-left: 0.5rem;
  }

  .space-y-2>*+* {
    margin-top: 0.5rem;
  }

  .space-y-4>*+* {
    margin-top: 1rem;
  }

  .space-y-6>*+* {
    margin-top: 1.5rem;
  }

  .p-4 {
    padding: 1rem;
  }

  .p-6 {
    padding: 1.5rem;
  }

  .px-2 {
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }

  .px-3 {
    padding-left: 0.75rem;
    padding-right: 0.75rem;
  }

  .px-4 {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .py-1 {
    padding-top: 0.25rem;
    padding-bottom: 0.25rem;
  }

  .py-2 {
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
  }

  .py-6 {
    padding-top: 1.5rem;
    padding-bottom: 1.5rem;
  }

  .py-8 {
    padding-top: 2rem;
    padding-bottom: 2rem;
  }

  .mt-1 {
    margin-top: 0.25rem;
  }

  .mt-2 {
    margin-top: 0.5rem;
  }

  .mb-4 {
    margin-bottom: 1rem;
  }

  .mb-6 {
    margin-bottom: 1.5rem;
  }

  .text-sm {
    font-size: 0.875rem;
    line-height: 1.25rem;
  }

  .text-lg {
    font-size: 1.125rem;
    line-height: 1.75rem;
  }

  .text-xl {
    font-size: 1.25rem;
    line-height: 1.75rem;
  }

  .text-3xl {
    font-size: 1.875rem;
    line-height: 2.25rem;
  }

  .font-medium {
    font-weight: 500;
  }

  .font-semibold {
    font-weight: 600;
  }

  .font-bold {
    font-weight: 700;
  }

  .text-gray-600 {
    color: rgb(75 85 99);
  }

  .text-gray-700 {
    color: rgb(55 65 81);
  }

  .text-gray-800 {
    color: rgb(31 41 55);
  }

  .text-gray-900 {
    color: rgb(17 24 39);
  }

  .text-blue-600 {
    color: rgb(37 99 235);
  }

  .text-blue-700 {
    color: rgb(29 78 216);
  }

  .text-blue-800 {
    color: rgb(30 64 175);
  }

  .text-red-700 {
    color: rgb(185 28 28);
  }

  .text-red-800 {
    color: rgb(153 27 27);
  }

  .text-white {
    color: rgb(255 255 255);
  }

  .bg-white {
    background-color: rgb(255 255 255);
  }

  .bg-gray-50 {
    background-color: rgb(249 250 251);
  }

  .bg-gray-100 {
    background-color: rgb(243 244 246);
  }

  .bg-blue-50 {
    background-color: rgb(239 246 255);
  }

  .bg-blue-100 {
    background-color: rgb(219 234 254);
  }

  .bg-blue-600 {
    background-color: rgb(37 99 235);
  }

  .bg-red-50 {
    background-color: rgb(254 242 242);
  }

  .bg-red-600 {
    background-color: rgb(220 38 38);
  }

  .bg-gradient-to-r {
    background-image: linear-gradient(to right, var(--tw-gradient-stops));
  }

  .from-blue-500 {
    --tw-gradient-from: #3b82f6;
    --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(59, 130, 246, 0));
  }

  .to-purple-600 {
    --tw-gradient-to: #9333ea;
  }

  .border {
    border-width: 1px;
  }

  .border-b {
    border-bottom-width: 1px;
  }

  .border-2 {
    border-width: 2px;
  }

  .border-gray-200 {
    border-color: rgb(229 231 235);
  }

  .border-gray-300 {
    border-color: rgb(209 213 219);
  }

  .border-blue-200 {
    border-color: rgb(191 219 254);
  }

  .border-red-200 {
    border-color: rgb(254 202 202);
  }

  .border-dashed {
    border-style: dashed;
  }

  .rounded {
    border-radius: 0.25rem;
  }

  .rounded-md {
    border-radius: 0.375rem;
  }

  .rounded-lg {
    border-radius: 0.5rem;
  }

  .shadow {
    box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  }

  .shadow-sm {
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  }

  .hover\:bg-blue-700:hover {
    background-color: rgb(29 78 216);
  }

  .hover\:bg-gray-50:hover {
    background-color: rgb(249 250 251);
  }

  .hover\:bg-gray-100:hover {
    background-color: rgb(243 244 246);
  }

  .hover\:bg-gray-700:hover {
    background-color: rgb(55 65 81);
  }

  .hover\:bg-red-700:hover {
    background-color: rgb(185 28 28);
  }

  .hover\:border-blue-500:hover {
    border-color: rgb(59 130 246);
  }

  .hover\:text-blue-700:hover {
    color: rgb(29 78 216);
  }

  .focus\:outline-none:focus {
    outline: 2px solid transparent;
    outline-offset: 2px;
  }

  .focus\:ring-2:focus {
    --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);
    --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);
    box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);
  }

  .focus\:ring-blue-500:focus {
    --tw-ring-color: rgb(59 130 246);
  }

  .transition-colors {
    transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 150ms;
  }

  .underline {
    text-decoration-line: underline;
  }

  .opacity-90 {
    opacity: 0.9;
  }

  .block {
    display: block;
  }

  .w-full {
    width: 100%;
  }

  .rows-3 {
    grid-template-rows: repeat(3, minmax(0, 1fr));
  }

  @media (min-width: 768px) {
    .md\:grid-cols-2 {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .md\:grid-cols-3 {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }
</style>
