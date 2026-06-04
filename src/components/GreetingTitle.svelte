<script lang="ts">
  const currentTime = new Date();
  const currentHour = currentTime.getHours();

  let greeting = "";

  if (currentHour >= 5 && currentHour < 12) {
    greeting = "Good morning";
  } else if (currentHour >= 12 && currentHour < 18) {
    greeting = "Good afternoon";
  } else {
    greeting = "Good night";
  }
</script>

<div>
  <h1 class="text-3xl font-bold">{greeting}</h1>
  <p class="text-sm text-emerald-300 mt-1 tracking-wide uppercase">
    1Commerce Audio · Ultra Hi-Res Lossless Playback
  </p>
</div>
