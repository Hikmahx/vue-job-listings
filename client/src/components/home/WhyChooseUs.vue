<script setup lang="ts">
import SectionTitle from './SectionTitle.vue'
</script>

<template>
  <section class="py-16 lg:py-24">
    <div class="">
      <SectionTitle title="WHY CHOOSE US" />

      <!-- Global Opportunities Section -->
      <div class="grid md:grid-cols-2 gap-4 sm:gap-16 md:gap-3 lg:gap-10 items-center mb-12 lg:mb-16">
        <div class="order-2 md:order-1 max-w-xl m-auto text-center md:text-left md:ml-auto md:mr-0 px-4">
          <h2 class="text-2xl font-semibold text-cyan-900 mb-4 tracking-[0.6px] !leading-10 sm:mt-7 md:mt-0">
            Global Job Opportunities to Build a Career From Anywhere Worldwide
          </h2>
          <p class="text-grayish-cyan leading-relaxed">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
            exercitation ullamco laboris.
          </p>
        </div>
        <div class="order-1 md:order-2 relative sm:h-72 xl:h-[330px] 2xl:h-[450px]">
          <div
            class="p-0 lg:h-inherit flex items-center justify-center before:content-[''] before:absolute before:h-3/4 before:sm:h-[80%] before:2xl:h-[372px] before:top-0 before:right-0 before:w-4/5 before:xl:w-[93%] before:rounded-l-lg before:bg-grayish-cyan"
          >
            <img
              src="@/assets/img/map.png"
              class="relative xl:h-[400px] 2xl:h-[450px] w-full max-w-3xl object-cover"
              alt="map"
            />
          </div>
        </div>
      </div>

      <!-- Filter Accuracy Section -->
      <div class="grid md:grid-cols-2 gap-4 sm:gap-16 md:gap-3 lg:gap-10 items-center">
        <div class="relative sm:h-72 xl:h-[330px] 2xl:h-[450px] xl:flex">
          <div
            class="p-0 lg:h-inherit flex items-center justify-center before:content-[''] before:absolute before:top-0 before:left-0 before:w-4/5 before:xl:w-[93%] before:h-3/4 before:sm:h-[80%] before:2xl:h-full before:rounded-r-lg before:bg-grayish-cyan"
          >
            <!-- <div class="bg-white rounded-lg shadow-lg p-4">
              <div class="space-y-4">
                <div class="h-4 bg-cyan-400 rounded w-3/4"></div>
                <div class="h-3 bg-gray-200 rounded w-full"></div>
                <div class="h-3 bg-gray-200 rounded w-2/3"></div>
                <div class="space-y-2 mt-4">
                  <div class="h-2 bg-gray-200 rounded"></div>
                  <div class="h-2 bg-gray-200 rounded"></div>
                </div>
                <div class="text-xs text-grayish-cyan mt-4">Filter Modal Preview</div>
              </div>
            </div> -->
            <img
              src="@/assets/img/filters.png"
              class="relative h-full 2xl:h-[380px] 3xl:h-[450px] w-auto object-cover object-right 3xl:object-center"
              alt="filters"
            />
          </div>
        </div>
        <div class="order-1 md:order-2 max-w-xl m-auto text-center md:text-left md:mr-auto md:ml-0 px-4">
          <h2 class="text-2xl font-semibold text-cyan-900 mb-4 tracking-[0.6px] !leading-10 mt-6 md:mt-0">
            High Accuracy in Sorting and Filtering jobs to your preference
          </h2>
          <p class="text-grayish-cyan leading-relaxed">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
            exercitation ullamco laboris.
          </p>
        </div>
      </div>
    </div>

    <!-- Global Opportunities Section -->
    <div class="grid md:grid-cols-2 gap-4 sm:gap-16 md:gap-3 lg:gap-10 items-center mt-12 lg:m-0 mb-12 lg:mb-16">
      <div
        class="order-2 md:order-1 max-w-xl m-auto text-center md:text-left md:ml-auto md:mr-0 px-4"
      >
        <h2
          class="text-2xl font-semibold text-cyan-900 mb-4 tracking-[0.6px] !leading-10 sm:mt-7 md:mt-0"
        >
          AI-Powered Search Filtering — switch between smart and precise
        </h2>
        <p class="text-grayish-cyan leading-relaxed">
          Our AI-powered search goes beyond keywords to understand intent, delivering more accurate
          job matches. Easily switch between AI search and regular filters explores the database semantically, while filters give precise control, all without losing
          your selected preferences.
        </p>
      </div>
      <div class="order-1 md:order-2 relative sm:h-72 xl:h-[330px] 2xl:h-[450px]">
        <div
          class="p-0 lg:h-inherit flex items-center justify-center before:content-[''] before:absolute before:h-full before:sm:h-3/4 before:2xl:h-[372px] before:top-0 before:right-0 before:w-4/5 before:xl:w-[93%] before:rounded-l-lg before:bg-grayish-cyan"
        >
          <img
            src="@/assets/img/ai-powered-search.png"
            class="relative w-[90%] md:mt-6 xl:mt-9 ml-auto  object-cover"
            alt="map"
          />
        </div>
      </div>
    </div>
  </section>
</template>
