<script>

  import { dataDir, join } from '@tauri-apps/api/path';
  import { onMount, onDestroy } from "svelte";
  import { push } from 'svelte-spa-router';

  import {
    appWindow,
    LogicalSize
  } from '@tauri-apps/api/window';

  import { convertFileSrc, invoke } from '@tauri-apps/api/tauri';

  import {
    register as registerShortcut,
    unregister
  } from "@tauri-apps/api/globalShortcut";

  import { langCode, langText, volumeEnable, audio } from '../lib/store';
  import { lists } from '../lib/Lists';

  let langValue;
  let langTValue;
  let volumeValue;

  let isFromHide = false;

  let isVisible = true;

  appWindow.listen('tauri://focus', ({ event }) => {
    if(!isVisible) {
      if(isFromHide) registerLangKLey();
      console.log("##FOCUS##", isFromHide);
      if(!_isSetting && isFromHide) registerAllHotKeys();
    }
  });

  langCode.subscribe(value => {
    langValue = value;
  });

  langText.subscribe(value => {
    langTValue = value;
  });

  volumeEnable.subscribe(value => {
    volumeValue = value;
  });

  // 윈도 설정
  let selectedWindow = appWindow.label

  // 윈도맵 설정
  const windowMap = {
    [selectedWindow]: appWindow
  }

  // 활성화 단축키
  let LANG_TOGGLE_HOTKEY;

  // 언어설정
  let _language = "한국어";
  let _langCode = "1";
  let _init = false;

  // 언어 드랍메뉴 보기
  let _show = false;

  // 볼륨 활성화 여부
  let _isVolume = true;

  // 설정화면 여부
  let _isSetting = false;

  let TOGGLE_HOTKEY_1;
  let TOGGLE_HOTKEY_2;
  let TOGGLE_HOTKEY_3;
  let TOGGLE_HOTKEY_4;
  let TOGGLE_HOTKEY_5;
  let TOGGLE_HOTKEY_6;
  let TOGGLE_HOTKEY_7;
  let TOGGLE_HOTKEY_8;
  let TOGGLE_HOTKEY_9;

  let shortcut;

  globalThis.detectState = function(arg) {
    if(arg == 'show') {
      isFromHide = true;
      setTimeout(() => {
        isFromHide = false;
      }, 10);
      unregisterAllHotKeys();
      reloadHotkeys();
      if(!_isSetting) {
        registerLangKLey();
        registerAllHotKeys();
      } else {
        registerLangKLey();
      }
    } else {
      isFromHide = false;
      unregister(LANG_TOGGLE_HOTKEY);
      unregisterAllHotKeys();
    }
  }

  function registerInvoke() {
    let shortcut_ = shortcut;
    registerShortcut(shortcut_, () => {
      invoke("handle_short_key");
    })
      .then(() => {
        unregisterAllHotKeys();
        if(!_isSetting) registerAllHotKeys();
      })
      .catch();
  }

  function registerLangKLey() {
    registerShortcut(LANG_TOGGLE_HOTKEY, () => {
      let _target;
      let _current = Number(_langCode);

      let langObj = $lists["languages"];

      let _langLists = Object.keys(langObj).map((key) => [Number(key), langObj[key]][1]);

      let _availableLangs = _langLists.filter(v => v.published);

      if((_current) >= _availableLangs.length) {
        _target = _availableLangs[0].id;
      } else {
        _target = $lists["languages"][_current].id;
      }

      changeLanguage(_target);
    });
  }

  function reloadHotkeys() {
    LANG_TOGGLE_HOTKEY = $lists["lang_change_key"];
    TOGGLE_HOTKEY_1 = String($lists["buttons"][0].key);
    TOGGLE_HOTKEY_2 = String($lists["buttons"][1].key);
    TOGGLE_HOTKEY_3 = String($lists["buttons"][2].key);
    TOGGLE_HOTKEY_4 = String($lists["buttons"][3].key);
    TOGGLE_HOTKEY_5 = String($lists["buttons"][4].key);
    TOGGLE_HOTKEY_6 = String($lists["buttons"][5].key);
    TOGGLE_HOTKEY_7 = String($lists["buttons"][6].key);
    TOGGLE_HOTKEY_8 = String($lists["buttons"][7].key);
    TOGGLE_HOTKEY_9 = String($lists["buttons"][8].key);
  }

  function registerAllHotKeys() {
    registerShortcut(TOGGLE_HOTKEY_1, () => { handleClick(1) });
    registerShortcut(TOGGLE_HOTKEY_2, () => { handleClick(2) });
    registerShortcut(TOGGLE_HOTKEY_3, () => { handleClick(3) });
    registerShortcut(TOGGLE_HOTKEY_4, () => { handleClick(4) });
    registerShortcut(TOGGLE_HOTKEY_5, () => { handleClick(5) });
    registerShortcut(TOGGLE_HOTKEY_6, () => { handleClick(6) });
    registerShortcut(TOGGLE_HOTKEY_7, () => { handleClick(7) });
    registerShortcut(TOGGLE_HOTKEY_8, () => { handleClick(8) });
    registerShortcut(TOGGLE_HOTKEY_9, () => { handleClick(9) });
  }

  function unregisterAllHotKeys() {
    unregister(TOGGLE_HOTKEY_1);
    unregister(TOGGLE_HOTKEY_2);
    unregister(TOGGLE_HOTKEY_3);
    unregister(TOGGLE_HOTKEY_4);
    unregister(TOGGLE_HOTKEY_5);
    unregister(TOGGLE_HOTKEY_6);
    unregister(TOGGLE_HOTKEY_7);
    unregister(TOGGLE_HOTKEY_8);
    unregister(TOGGLE_HOTKEY_9);
  }

  const getSoundFile = async (fileName) => {
    try {
      const dataPath = await dataDir();
      let res = join(dataPath, 'medical-sound-touch-data', 'sounds', fileName);
      return res;
    } catch(e) {
      console.log(e);
      return false;
    }
  }

  function handleClick(id) {
    let _id = document.getElementById("btn_" + id);
    let _tooltip = document.getElementById("tooltip_" + id);

    if(!volumeValue) {
      audio.volume = 0;
    } else {
      audio.volume = 1;
    }

    if(!_id.classList.contains("grayscale")) {

      _tooltip.classList.add("tooltip-open");
      setTimeout(() => {
        // _id.classList.add("grayscale");
        _tooltip.classList.remove("tooltip-open");
      }, 2000);

      let file = langValue + "_" + id + ".mp3";

      getSoundFile(file).then(res => {
        let _src = convertFileSrc(res.toString());

        if(audio.canPlayType('audio/mpeg')) {
          audio.getElementsByTagName("source")[0].src = _src;
          audio.load();
          audio.pause();
          audio.currentTime = 0;
          audio.play();
        }
      });
    }

    // if(document.getElementById("btn-reset").classList.contains("hidden")) {
    //   document.getElementById("btn-reset").classList.remove("hidden");
    // }
  }

  onMount(() => {
    windowMap[selectedWindow].center();
    windowMap[selectedWindow].setAlwaysOnTop(true);

    setTimeout(() => {
      console.log("MAIN MOUNTED");
      shortcut = $lists["invoke_key"];
      reloadHotkeys();
      unregisterAllHotKeys();
      registerInvoke();
      registerLangKLey();
      registerAllHotKeys();
    }, 500);

    document
      .getElementById('titlebar-minimize')
      .addEventListener('click', () => {
        unregisterAllHotKeys();
        unregister(LANG_TOGGLE_HOTKEY);
        invoke("handle_short_key");
        appWindow.hide();
        isVisible = false;
      });

    document
      .getElementById('titlebar-close')
      .addEventListener('click', () => {
        invoke("handle_quit");
      });
  });

  onDestroy(() => {
    // hotkeys.unbind(LANG_TOGGLE_HOTKEY);
  });

  function select(arg) {
    _show = false;
    switch (arg) {
      case 0:
        _isSetting = false;
        windowMap[selectedWindow].setSize(new LogicalSize(1280, 278));
        push("/");
        break;
      case 1:
        _isSetting = false;
        windowMap[selectedWindow].setSize(new LogicalSize(1280, 278));
        push("/main");
        shortcut = $lists["invoke_key"];
        LANG_TOGGLE_HOTKEY = $lists["lang_change_key"];
        unregister(shortcut);
        unregister(LANG_TOGGLE_HOTKEY);
        unregisterAllHotKeys();
        reloadHotkeys();
        setTimeout(() => {
          console.log("REGISTER");
          registerInvoke();
          registerLangKLey();
        }, 100);
        windowMap[selectedWindow].center();
        windowMap[selectedWindow].setAlwaysOnTop(true);
        break;
      case 2:
        _isSetting = true;
        windowMap[selectedWindow].setSize(new LogicalSize(1280, 1000));
        push("/config");
        shortcut = $lists["invoke_key"];
        LANG_TOGGLE_HOTKEY = $lists["lang_change_key"];
        unregister(shortcut);
        unregister(LANG_TOGGLE_HOTKEY);
        unregisterAllHotKeys();
        reloadHotkeys();
        setTimeout(() => {
          registerInvoke();
          registerLangKLey();
        }, 100);
        windowMap[selectedWindow].center();
        windowMap[selectedWindow].setAlwaysOnTop(true);
        break;
    }
  }

  // 언어 변경
  function changeLanguage(lang) {
    let humanLanguage;
    _langCode = lang;

    langCode.set(lang);

    humanLanguage = $lists["languages"][Number(_langCode) - 1].name;
    _language = humanLanguage;

    langText.set(_language);

    _show = false;
    handleReset();
  }

  // 볼륨 조절
  function handleVolume() {
    _isVolume = !_isVolume;
    volumeEnable.set(_isVolume);
    if(_isVolume) {
      audio.volume = 1;
    } else {
      audio.volume = 0;
    }
  }

  // 설정 진입
  function handleConfig() {
    _isSetting = !_isSetting;
    if(_isSetting) {
      select(2);
      if(!document.getElementById("btn-reset").classList.contains("hidden")) {
        document.getElementById("btn-reset").classList.add("hidden");
      }
    } else {
      select(1);
    }
  }

  function handleReset() {
    if(!_isSetting) {
      setTimeout(() => {
        document.getElementById("btn-reset").classList.add("hidden");
      }, 200);

      for(let i = 1; i <= 9; i++) {
        let _id = document.getElementById("btn_" + i);
        _id.classList.remove("grayscale");
      }
    }
  }
</script>

<div id="windowMenu" data-tauri-drag-region class="flex bg-black titlebar">

  <div id="titlebar-minimize" class="items-end titlebar-button" >
    <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M18 12H6" />
    </svg>
  </div>

  <div id="titlebar-close" class="items-end ml-4 titlebar-button" >
    <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  </div>
</div>

<div class="with-title-bar">
  {#if !_init}
  <div id="nav" class="flex min-h-0 px-10 py-1 m-0 navbar bg-gradient-to-b from-sky-700 to-sky-400">
    <div class="flex items-start justify-start flex-none w-40 cursor-default">
      <p class="text-xl font-bold text-white normal-case select-none">Medical Sound</p>
    </div>

    <div class="flex items-center justify-center grow">
      <div class="z-50 dropdown">
        <div>
          <!-- svelte-ignore a11y-label-has-associated-control -->
          <label
            id="menu-button"
            class="m-0 text-xl font-bold text-white normal-case bg-transparent justify-items-center btn btn-ghost outline-disable "
            tabindex="0"
            on:click={() => (_show = !_show) }
            aria-expanded="false" aria-haspopup="false">{langTValue}</label>
        </div>

        {#if _show}
          <div class="absolute mt-2 rounded-md shadow-lg" role="menu" aria-orientation="vertical" aria-labelledby="menu-button" tabindex="-1">
            <div class="py-0" role="none">
              <ul tabindex="0" class="p-1 -ml-12 overflow-y-auto bg-white rounded-sm shadow w-44 dropdown-content menu {!_isSetting ? 'max-h-44' : ''}">
                {#each $lists["languages"] as language }
                  {#if language.published}
                    <li>
                      <button id="menu-item-0" role="menuitem" class="justify-center py-1 text-gray-900 bg-transparent text-bold hover:bg-slate-200" on:click={() => changeLanguage(language.id) }>{language.name}</button>
                    </li>
                  {/if}
                {/each}
                <!-- <li><button id="menu-item-0" role="menuitem" class="justify-center font-bold text-gray-900 bg-transparent hover:bg-slate-200" on:click={() => changeLanguage("1") }>한국어</button></li>
                <li><button id="menu-item-1" role="menuitem" class="justify-center font-bold text-gray-900 bg-transparent hover:bg-slate-200" on:click={() => changeLanguage("2") }>태국어</button></li> -->
              </ul>
            </div>
          </div>
        {/if}
      </div>
    </div>

    <div class="flex items-end justify-end flex-none w-40">

      <label id="btn-reset" class="hidden mr-4 swap swap-rotate">

        <input type="checkbox" class="outline-disable" on:click={() => handleReset()} />

        <!-- reset on icon -->
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 -3.2 28 28" stroke="white" width="32" height="32" stroke-width="2" class="transition-transform duration-200 ease-in-out transform swap-on">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>

        <!-- reset off icon -->
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 -3.2 28 28" stroke="white" width="32" height="32" stroke-width="2" class="transition-transform duration-200 ease-in-out transform swap-off">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </label>

      <label class="swap">

        <input type="checkbox" class="outline-disable" on:click={() => handleVolume()} />

        <!-- volume on icon -->
        <svg class="fill-white swap-on" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
          <path d="M3,9H7L12,4V20L7,15H3V9M16.59,12L14,9.41L15.41,8L18,10.59L20.59,8L22,9.41L19.41,12L22,14.59L20.59,16L18,13.41L15.41,16L14,14.59L16.59,12Z"/>
        </svg>

        <!-- volume off icon -->
        <svg class="fill-white swap-off" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
          <path d="M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.84 14,18.7V20.77C18,19.86 21,16.28 21,12C21,7.72 18,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16C15.5,15.29 16.5,13.76 16.5,12M3,9V15H7L12,20V4L7,9H3Z"/>
        </svg>

      </label>

      <label class="ml-4 swap swap-rotate">

        <input type="checkbox" class="outline-disable" on:click={() => handleConfig()} />

        <!-- setting on icon -->
        <svg class="fill-white swap-on" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 -1.2 21.33 21.33">
          <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
        </svg>

        <!-- setting off icon -->
        <svg class="fill-white swap-off" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 -1.2 21.33 21.33">
          <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
        </svg>
      </label>

    </div>
  </div>
  {/if}
</div>

<style lang="postcss">
  .outline-disable {
    outline: none;
  }

  .with-title-bar {
    margin-top: 30px;
  }

  .titlebar {
    width: 100%;
    height: 30px;
    user-select: none;
    display: flex;
    justify-content: flex-end;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    cursor: move;
    -webkit-app-region: no-drag;
  }
  .titlebar-button {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    width: 30px;
    height: 30px;
    color: #fff;
    cursor: pointer;
    -webkit-app-region: no-drag;
  }
  .titlebar-button:hover {
    @apply bg-red-600;
  }

</style>
