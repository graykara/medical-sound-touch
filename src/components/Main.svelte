<script>
  import { dataDir, join } from '@tauri-apps/api/path';
  import { convertFileSrc } from '@tauri-apps/api/tauri';
  import { onMount, onDestroy } from "svelte";

  import { langCode, volumeEnable, audio } from '../lib/store';
  import { lists } from '../lib/Lists';

  let obj;

  let possible = false;

  let _lists;
  let _images = [];

  let langValue;
  let volumeValue;

  langCode.subscribe(value => {
    langValue = value;
  });

  volumeEnable.subscribe(value => {
    volumeValue = value;
  });

  onMount(() => {
    obj = $lists["buttons"];

    setTimeout(() => {
      if(obj != undefined) {
        // console.log("## MAIN INIT ##");
        _lists = Object.keys(obj).map((key) => [Number(key), obj[key]][1]);
      }
    }, 1);

    setTimeout(() => {
      // console.log("mount");
      possible = true;
    }, 10);

    setTimeout(() => {
      for(let i = 1; i <= 9; i++) {
        let ext = $lists["buttons"][i - 1]["image"].split('.')[1];
        setImageFile("img_" + i + "." + ext).then(res => {
          let _src = convertFileSrc(res.toString());
          _images.push(_src);
          document.getElementById('img_' + i).setAttribute('src', _src);
        });
      }
    }, 20);
  });

  onDestroy(() => {

  })

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

  const setImageFile = async (fileName) => {
    try {
      const dataPath = await dataDir();
      let res = join(dataPath, 'medical-sound-touch-data', 'images', fileName);
      return res;
    } catch(e) {
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
</script>

<div id="main-contents" class="flex px-8 py-8 bg-sky-100">
{#if possible == true }
  {#each {length: 9} as _, index}
    {#if _lists[index].published}
      <div class="relative select-none">
        <span class="absolute z-20 text-red-900 left-4 top-2">{_lists[index].key}</span>
        <!-- <div id="tooltip_{_lists[index].id}" class="text-white" on:mouseleave={() => handleLeave()} on:mouseover={() => handleOver(index)}> -->
        <div id="tooltip_{_lists[index].id}" class="text-white tooltip tooltip-info tooltip-bottom" data-tip="{_lists[index]["message"]}">
          <div id="btn_{_lists[index].id}" class="z-10 btn-info main_btn" on:click={() => handleClick(_lists[index].id)}>
            <img id="img_{_lists[index].id}" class="object-cover shadow-xl rounded-2xl" src="" alt="{_lists[index].id}" />
          </div>
        </div>
      </div>
    {/if}
  {/each}
{/if}

</div>

<style lang="postcss">
  .main_btn {
    @apply btn btn-outline w-32 h-32 mx-1 p-1 rounded-2xl bg-white;
  }
  .tooltip::before {
    @apply text-white text-2xl max-w-screen-2xl z-50 w-full;
    position: fixed;
    left: 0%;
    top: calc(50% + 4.25em);
    transform: unset;
    background-color: rgba(58,191,248, 1);
  }
</style>
