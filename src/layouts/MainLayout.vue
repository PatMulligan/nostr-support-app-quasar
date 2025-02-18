<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-primary text-white" style="height: 50px">
      <q-toolbar>
        <q-toolbar-title>Nostr Support</q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts"></script>
