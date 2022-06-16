<script>
  import '../public/global.css';

  import Router from 'svelte-spa-router';
  import { onMount } from "svelte";

  import Header from './components/Header.svelte';
  import Welcome from './components/Welcome.svelte';
  import Main from './components/Main.svelte';
  import Config from './components/Config.svelte';

  import { lists, list_store } from './lib/Lists';

  import {
    currentMonitor,
    availableMonitors,
    appWindow,
    LogicalSize,
    LogicalPosition
  } from '@tauri-apps/api/window';

  const routes = {
    '/': Welcome,
    '/main': Main,
    '/config': Config
  }

  let promise;

  list_store.init();
  onMount(() => {
    setTimeout(() => {
      promise = $lists;

      setTimeout(() => {
        let selectedMonitor = $lists["selected_monitor"];

        let _monitors = [];

        availableMonitors().then(res => {
          let count = 0;
          res.forEach(val => {
            count++
            _monitors.push(val);
            if(count >= res.length) {
              _monitors.forEach(monitor => {
                if(selectedMonitor == monitor.name) {
                  appWindow.setPosition(new LogicalPosition(monitor.position.x / monitor.scaleFactor, 0)).then(res => {
                    appWindow.center();
                    appWindow.show();
                  });
                }
              });
            }
          });
        });
      }, 100);
    }, 100);
  });

  document.addEventListener('contextmenu', e => {
    e.preventDefault();
    return false;
  }, { capture: true });

  document.addEventListener('selectstart', e => {
    e.preventDefault();
    return false;
  }, { capture: true });
</script>

{#await promise }
  WAIT
{:then}
  <Header />

  <main>
    <Router {routes} />
  </main>
{:catch error}
  ERROR {error.message}
{/await}



<style>

</style>
