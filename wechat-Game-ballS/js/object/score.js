// score 计分板
import page from './canvas.js'
export default{
  text: '点击屏幕以开始',
  draw: function () {
    page.ctx.fillStyle = 'white';
    page.ctx.font = "24px serif";
    page.ctx.fillText(this.text, 10, 50);
  }
}