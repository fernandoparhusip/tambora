<script setup lang="ts"></script>

<template>
  <div class="w-20 h-20 relative flex items-center justify-center">
    <div
      class="h-12 w-12 bg-pln bg-contain bg-center bg-no-repeat rounded-full"
    />
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid"
      class="w-20 h-20 absolute top-0 left-0"
    >
      <circle
        cx="50"
        cy="50"
        fill="none"
        stroke="#ffec00"
        stroke-width="3"
        r="35"
        stroke-dasharray="164.93361431346415 56.97787143782138"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          repeatCount="indefinite"
          dur="1s"
          values="0 50 50;360 50 50"
          keyTimes="0;1"
        />
      </circle>
    </svg>
  </div>
</template>

<style scoped>
.bg-pln {
  background-image: url("@/assets/logo/LogoLargePLN.png");
  background-color: #ffec00;
  border: #ffec00 2px solid;
}
</style>
