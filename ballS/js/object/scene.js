// scene 场景
import page from './canvas.js'
export default {
  background: "#424242",
  draw: function () {
    page.ctx.fillStyle = this.background;
    page.ctx.fillRect(0, 0, page.canvas.width, page.canvas.height);
  }
}