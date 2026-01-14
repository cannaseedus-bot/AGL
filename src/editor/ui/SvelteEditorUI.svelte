<script>
  export let state;
  export let renderer;

  $: rendered = renderer.render(state);
</script>

<svg width="100%" height="100%">
  {#each rendered.connections as c}
    <line x1={c.from.x} y1={c.from.y} x2={c.to.x} y2={c.to.y} stroke="#999" />
  {/each}

  {#each rendered.nodes as n}
    <g>
      <rect
        x={n.x - 40}
        y={n.y - 20}
        width="80"
        height="40"
        fill={n.color}
        rx="6"
      />
      <text x={n.x - 30} y={n.y + 4} fill="#fff">{n.label}</text>
    </g>
  {/each}
</svg>
