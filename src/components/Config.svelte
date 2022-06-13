<script>
  import { dataDir, join } from '@tauri-apps/api/path';
  import { langCode, langText, audio } from '../lib/store';
  import { convertFileSrc } from '@tauri-apps/api/tauri';

  import { lists } from '../lib/Lists';

  import { open } from "@tauri-apps/api/dialog";

  import { BaseDirectory, copyFile, readBinaryFile } from "@tauri-apps/api/fs";
  import { sep } from '@tauri-apps/api/path';
  import { fs } from '@tauri-apps/api';

  import { invoke } from '@tauri-apps/api/tauri';
  import {
    register as registerShortcut,
    unregister,
    unregisterAll
  } from "@tauri-apps/api/globalShortcut";

  let langValue;

  // console.log("## HEADER");

  langCode.subscribe(value => {
    langValue = value;
  });

  const dir = BaseDirectory.Data;

  let defaultPath = null;
  let filter = null;
  let multiple = false;
  let directory = false;

  let invokeKey = $lists["invoke_key"];
  let langKey = $lists["lang_change_key"];

  const unsubscribe = langCode.subscribe(value => {
    langValue = value;
  });

  let obj = $lists["buttons"];
  let langObj = $lists["languages"];

  let _lists;
  _lists = Object.keys(obj).map((key) => [Number(key), obj[key]][1]);

  let _langLists;
  _langLists = Object.keys(langObj).map((key) => [Number(key), langObj[key]][1]);

  // console.log("##LANG##", _langLists);

  let oldValue;

  let key_of_invoke;
  let key_of_lang;

  let shortcut = $lists["invoke_key"];
  let langcut = $lists["lang_change_key"];

  let _langCode = langValue;

  function registerInvoke() {
    let shortcut_ = shortcut;
    registerShortcut(shortcut_, () => {
      console.log(`Shortcut ${shortcut_} triggered`);
      invoke("handle_short_key");
    })
      .then(() => {
        console.log(`Shortcut ${shortcut_} registered successfully`);
      })
      .catch();
  }

  function registerLangKey() {
    registerShortcut(langcut, () => {
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

  function changeLanguage(lang) {
    _langCode = lang;
    langCode.set(lang);

    let humanLanguage = $lists["languages"][Number(_langCode) - 1].name;
    let _language = humanLanguage;

    langText.set(_language);
  }

  const onChangePublished = e => {
    let val = e.target.checked;
    let idx = Number(e.target.id.split("_")[1]);
    $lists["buttons"][idx - 1].published = val;
  }

  const onChangeLangPublished = e => {
    let val = e.target.checked;
    let idx = Number(e.target.id.split("_")[1]);
    $lists["languages"][idx - 1].published = val;
  }

  const onChangeLangName = e => {
    let val = e.target.value;
    let idx = Number(e.target.id.split("_")[1]);
    $lists["languages"][idx - 1].name = val;
  }

  let invokeUp = false;
  let oldInvokeVal = $lists["invoke_key"];

  const onInvokeKeyUp = event => {
    if(key_of_invoke.indexOf("undefined") > -1 || key_of_invoke.indexOf("+") == -1 || key_of_invoke == langKey) {
      event.target.value = oldInvokeVal;
      return false;
    } else {
      if(invokeUp == false) {
        invokeUp = true;
        return false;
      } else {
        unregister(shortcut);
        shortcut = key_of_invoke;
        $lists["invoke_key"] = shortcut;
        event.target.value = shortcut;
        registerInvoke();
        invokeUp = false;
      }
    }
  }
  const onIKnvokeKey = event => {
    let metaKey;
    let codeKey;
    if(event.alt) metaKey = "Alt";
    if(event.shiftKey) metaKey = "Shift";
    if(event.ctrlKey) metaKey = "Ctrl";
    if(event.altKey) metaKey = "Alt";
    if(event.metaKey) metaKey = "Meta";
    if(event.tabKeu) metaKey = "Tab";
    // console.log(event.code);
    if(event.code.length > 0) {
      if(event.code.split('Digit')[1] != undefined) {
        codeKey = event.code.split('Digit')[1];
      } else if(event.code.split('Key')[1] != undefined) {
        codeKey = event.code.split('Key')[1];
      } else {
        codeKey = event.code;
      }
    }
    key_of_invoke = metaKey + "+" + String(codeKey);
    event.target.value = "";
  }

  let langUp = false;
  let oldLangVal = $lists["lang_change_key"];

  const onLangKeyUp = event => {
    console.log(key_of_lang);
    if(key_of_lang.indexOf("undefined") > -1 || key_of_lang.indexOf("+") == -1 || key_of_lang == invokeKey) {
      event.target.value = oldLangVal;
      return false;
    } else {
      if(langUp == false) {
        langUp = true;
        return false;
      } else {
        unregister(langcut);
        langcut = key_of_lang;
        $lists["lang_change_key"] = langcut;
        event.target.value = langcut;
        registerLangKey();
        langUp = false;
      }
    }
  }

  const onLangKey = event => {
    let metaKey;
    let codeKey;

    if(event.alt) metaKey = "Alt";
    if(event.shiftKey) metaKey = "Shift";
    if(event.ctrlKey) metaKey = "Ctrl";
    if(event.altKey) metaKey = "Alt";
    if(event.metaKey) metaKey = "Meta";

    // console.log(event.code);

    if(event.code.length > 0) {
      if(event.code.split('Digit')[1] != undefined) {
        codeKey = event.code.split('Digit')[1];
      } else if(event.code.split('Key')[1] != undefined) {
        codeKey = event.code.split('Key')[1];
      } else {
        codeKey = event.code;
      }
    }
    key_of_lang = metaKey + "+" + codeKey;
    event.target.value = "";
  }

  const onHotKeyFocusIn = e => {
    oldValue = e.target.value;
    e.target.value = null;
  }
  const onHotKeyFocusOut = e => {
    e.target.value = oldValue;
  }
  const onHotKey = e => {
    let val = e.target.value;
    if(val.length > 1) {
      val = val.slice(-1, 2);
      e.target.value = val;
    }

    let tmpArr = [];
    $lists["buttons"].forEach(element => {
      tmpArr = [...tmpArr, element.key];
    });

    let possible = false;
    if(tmpArr.indexOf(val) < 0) {
      possible = true;
    } else {
      if(String(tmpArr[tmpArr.indexOf(val)]) == oldValue) {
        possible = true;
      } else {
        possible = false;
      }
    }

    if(possible) {
      let idx = Number(e.target.id.split("_")[1]);
      $lists["buttons"][idx - 1]["key"] = val;
      oldValue = val;
    } else {
      // alert("ERROR");
      document.getElementById("modal-open-btn").click();
      e.target.value = oldValue;
    }
  }

  const onChangeMessage = e => {
    let val = e.target.value;
    let idx = Number(e.target.id.split("_")[1]);
    $lists["buttons"][idx - 1].message = val;
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

  const onSoundPlay = e => {
    audio.volume = 1;

    let _current = e.currentTarget.id.split("_")[1]

    let file = langValue + "_" + _current + ".mp3";

    getSoundFile(file).then(res => {
      let _src = convertFileSrc(res.toString());

      const readFile = readBinaryFile("medical-sound-touch-data/sounds/" + file, { dir: fs.Dir.Data });
      let _exists = false;
      readFile.then( res => {
        _exists = true;
        if(audio.canPlayType('audio/mpeg') && _exists) {
          audio.getElementsByTagName("source")[0].src = _src;
          audio.load();
          audio.pause();
          audio.currentTime = 0;
          audio.play();
        }
      }).catch( err => {
        _exists = false;
        document.getElementById("modal-sound-btn").click();
      });
    });
  }

  function openDialog(type, e) {
    let seq = e.target.id.split('list_')[1];
    if(type == 'img') {
      filter = 'jpg,jpeg,png';
    } else if(type == 'sound') {
      filter = 'mp3';
    }
    open({
      title: 'My wonderful open dialog',
      defaultPath,
      filters: filter
        ? [
            {
              name: "Tauri Example",
              extensions: filter.split(",").map((f) => f.trim()),
            },
          ]
        : [],
      multiple,
      directory,
    }).then(function (res) {
      if (Array.isArray(res)) {
        console.log(res);
      } else {
        var pathToRead = res;
        var isFile = pathToRead.match(/\S+\.\S+$/g);
        readBinaryFile(pathToRead).then(function (response) {
          if (isFile) {
            if (pathToRead.includes(".png") || pathToRead.includes(".jpg") || pathToRead.includes(".jpeg")) {
              let arrPath = res.split(sep);
              let fileName = arrPath[arrPath.length - 1];
              let ext = fileName.split('.')[1];

              copyFile(
                res,
                "medical-sound-touch-data/images/img_" + seq + "." + ext,
                {
                  dir: dir
                }
              );
              $lists["buttons"][seq - 1]["image"] = seq + "." + ext;
              document.getElementById('imgname_' + (seq)).textContent = seq + "." + ext;
            }
            if (pathToRead.includes(".mp3")) {
              let arrPath = res.split(sep);
              let fileName = arrPath[arrPath.length - 1];
              let ext = fileName.split('.')[1];

              copyFile(
                res,
                "medical-sound-touch-data/sounds/" + langValue + "_" + seq + "." + ext,
                {
                  dir: dir
                }
              );
            }
          }
        });
      }
    });
  }
</script>

<div>
  <div class="px-4 py-4 overflow-x-auto">
    <h3 class="px-2 mb-4 text-lg font-medium leading-6 text-white select-none">설정</h3>

    <table class="table w-full mb-4 table-compact">
      <thead>
        <tr>
          <th class="w-40 text-center text-white select-none">기능</th>
          <th class="text-center text-white select-none">단축키</th>
        </tr>
      </thead>
      <tbody>
        <tr class="h-14">
          <td class="text-center text-white">앱 활성화키</td>
          <td>
            <input class="w-auto text-center text-gray-900 bg-white kbd kbd-md" on:keyup={onInvokeKeyUp} on:keypress={onIKnvokeKey} value={invokeKey} />
            <span class="ml-4 text-white"><kbd class="kbd">Shift</kbd> 또는 <kbd class="kbd">Ctrl</kbd> 키 <kbd class="kbd">+</kbd> 숫자(<kbd class="kbd">0</kbd>~<kbd class="kbd">9</kbd>) 또는 영문(<kbd class="kbd">a</kbd>~<kbd class="kbd">z</kbd>) 조합으로 사용 가능합니다.</span>
          </td>
        </tr>
        <tr class="h-14">
          <td class="text-center text-white select-none">언어 변경키</td>
          <td>
            <input class="w-auto text-center text-gray-900 bg-white kbd kbd-md" on:keyup={onLangKeyUp} on:keypress={onLangKey} value={langKey} />
            <span class="ml-4 text-white select-none"><kbd class="kbd">Shift</kbd> 또는 <kbd class="kbd">Ctrl</kbd> 키 <kbd class="kbd">+</kbd> 숫자(<kbd class="kbd">0</kbd>~<kbd class="kbd">9</kbd>) 또는 영문(<kbd class="kbd">a</kbd>~<kbd class="kbd">z</kbd>) 조합으로 사용 가능합니다.</span>
          </td>
        </tr>
      </tbody>
    </table>

    <table class="table w-full mb-4 table-zebra table-compact">
      <thead>
        <tr>
          <th colspan="10" class="text-center text-white select-none">언어 설정</th>
        </tr>
      </thead>
      <tbody>
        <tr>
        {#each _langLists as lang }
          <td class="w-3 text-center">
            <input
              type="checkbox"
              disabled={lang.id == 1}
              checked={lang.published}
              on:click={onChangeLangPublished}
              id="langPublished_{lang.id}"
              class="checkbox" />
          </td>
        {/each}
        </tr>
        <tr>
        {#each _langLists as lang }
          <td class="w-3">
            <input
              type="text" name="number" id="langName_{lang.id}"
              class="flex items-center w-full h-8 font-semibold text-center text-gray-700 bg-white outline-none focus:outline-none text-md hover:text-black focus:text-black md:text-basecursor-default"
              maxlength="8"
              value={lang.name}
              disabled={lang.id == 1}
              on:blur={onChangeLangName}
              placeholder={lang.name}>
          </td>
        {/each}
        </tr>
      </tbody>
    </table>

    <table class="table w-full table-zebra table-compact">
      <!-- head -->
      <thead>
        <tr>
          <th class="w-20 text-center text-white select-none">순서</th>
          <th class="w-20 text-center text-white select-none">사용</th>
          <th class="w-20 text-center text-white select-none">키</th>
          <th class="text-center text-white select-none w-36">이미지</th>
          <th id="langTitle" class="text-center text-white select-none w-44">{$lists["languages"][Number(langValue) - 1].name} 음성</th>
          <th class="text-center text-white select-none">메시지</th>
        </tr>
      </thead>
      <tbody>
        {#each _lists as list, index }
        <tr class="h-14">
          <td class="text-center text-white select-none">{list.id}</td>
          <td class="text-center">
            <input
              type="checkbox"
              checked={list.published}
              on:click={onChangePublished}
              id="published_{list.id}"
              class="checkbox" />
          </td>
          <td class="text-center">
            <input
              type="text" name="number" id="hotkey_{index+1}"
              class="flex items-center w-full h-8 font-semibold text-center text-gray-700 bg-white outline-none focus:outline-none text-md hover:text-black focus:text-black md:text-basecursor-default"
              maxlength="2"
              value={list.key}
              on:focus={onHotKeyFocusIn}
              on:blur={onHotKeyFocusOut}
              on:input={onHotKey}
              placeholder={list.key}>
          </td>
          <td class="text-center">
            <span id="imgname_{index + 1}" class="text-white select-none">{list.image}</span>
            <button
              class="h-4 text-white btn btn-xs btn-outline"
              id="img_list_{list.id}"
              on:click={(e) => openDialog('img', e)}>변경</button>
          </td>

          <td class="text-center text-white">
            <span class="inline-flex align-middle">
              <button
                id="play_{index + 1}"
                on:click={onSoundPlay}>
                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 stroke-slate-400 hover:stroke-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </span>
            <span class="inline-flex select-none">
              {langValue}_{list["sound"]}
            </span>
            <span class="inline-flex">
              <button
              class="h-4 text-white btn btn-xs btn-outline"
              id="sound_list_{list.id}"
              on:click={(e) => openDialog('sound', e)}>변경</button>
            </span>
          </td>

          <td class="text-center">
            <input
              type="text" name="message" id="message_{index + 1}"
              class="flex items-center w-full h-8 px-2 text-left text-gray-700 bg-white outline-none fon2-semibold focus:outline-none text-md hover:text-black focus:text-black md:text-basecursor-default"
              value={list.message}
              on:blur={onChangeMessage}
              placeholder={list.message}>
          </td>

        </tr>
        {/each}
      </tbody>
    </table>
  </div>


  <!-- The button to open modal -->
  <label id="modal-open-btn" for="my-modal" class="hidden btn modal-button">open modal</label>

  <!-- Put this part before </body> tag -->
  <input type="checkbox" id="my-modal" class="modal-toggle" />
  <div class="modal">
    <div class="modal-box">
      <h3 class="text-lg font-bold">단축키 충돌</h3>
      <p id="modal-message" class="py-4">이미 존재하는 단축키를 제외하고 설정해주시기 바랍니다.</p>
      <div class="modal-action">
        <label for="my-modal" class="btn">닫기</label>
      </div>
    </div>
  </div>

  <!-- The button to sound modal -->
  <label id="modal-sound-btn" for="sound-modal" class="hidden btn modal-button">open modal</label>

  <!-- Put this part before </body> tag -->
  <input type="checkbox" id="sound-modal" class="modal-toggle" />
  <div class="modal">
    <div class="modal-box">
      <h3 class="text-lg font-bold">사운드 파일 에러</h3>
      <p id="modal-message" class="py-4">사운드 파일이 존재하지 않습니다.</p>
      <div class="modal-action">
        <label for="sound-modal" class="btn">닫기</label>
      </div>
    </div>
  </div>
</div>

<style lang="postcss">

</style>
