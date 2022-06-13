<script>
  import { push } from 'svelte-spa-router';
  setTimeout(function() {
    push('/Main');
  }, 1000);
</script>

<div>
  <div class="hidden min-h-screen bg-slate-700">
    <div class="py-6 text-center">
      <h2 class="py-10 text-3xl font-bold text-white select-none">
        <span class="block">활성화 키를 입력하여 실행해 주세요.</span>
      </h2>
      <div class="py-4 select-none">
        <kbd class="kbd kbd-lg">Shift</kbd> <kbd class="kbd kbd-lg">+</kbd> <kbd class="kbd kbd-lg">1</kbd>
      </div>
    </div>
  </div>
</div>
