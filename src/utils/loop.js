export function every(ms, fn) {
  async function tick() {
    try {
      await fn();
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(tick, ms);
    }
  }

  tick();
}
