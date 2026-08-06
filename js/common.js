(function () {
  "use strict";

  const STORAGE_KEY = "tt_pro_unlocked";

  // ---------- 小工具 ----------
  window.TT = {
    toast(msg, ms) {
      const old = document.querySelector(".toast");
      if (old) old.remove();
      const el = document.createElement("div");
      el.className = "toast";
      el.textContent = msg;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), ms || 2200);
    },

    formatBytes(bytes) {
      if (!bytes || bytes <= 0) return "0 B";
      const units = ["B", "KB", "MB", "GB"];
      const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
      const val = bytes / Math.pow(1024, i);
      return (val >= 100 ? Math.round(val) : val.toFixed(1)) + " " + units[i];
    },

    // 读取文件为 Image
    loadImage(file) {
      return new Promise((resolve, reject) => {
        if (!file || !file.type.startsWith("image/")) {
          reject(new Error("请选择图片文件"));
          return;
        }
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => {
          URL.revokeObjectURL(url);
          reject(new Error("图片读取失败，请换一张试试"));
        };
        img.src = url;
      });
    },

    // canvas 的 cover 模式绘制
    drawCover(ctx, img, x, y, w, h) {
      const ir = img.naturalWidth / img.naturalHeight;
      const cr = w / h;
      let sw, sh, sx = 0, sy = 0;
      if (ir > cr) {
        sh = img.naturalHeight;
        sw = sh * cr;
        sx = (img.naturalWidth - sw) / 2;
      } else {
        sw = img.naturalWidth;
        sh = sw / cr;
        sy = (img.naturalHeight - sh) / 2;
      }
      ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
    },

    // 圆角路径（兼容旧浏览器）
    roundRect(ctx, x, y, w, h, r) {
      const rr = Math.min(r, w / 2, h / 2);
      ctx.beginPath();
      ctx.moveTo(x + rr, y);
      ctx.arcTo(x + w, y, x + w, y + h, rr);
      ctx.arcTo(x + w, y + h, x, y + h, rr);
      ctx.arcTo(x, y + h, x, y, rr);
      ctx.arcTo(x, y, x + w, y, rr);
      ctx.closePath();
    },

    // 从图片提取主色（平均色）与适合的文字颜色
    paletteFromImage(img) {
      const size = 32;
      const c = document.createElement("canvas");
      c.width = c.height = size;
      const ctx = c.getContext("2d");
      ctx.drawImage(img, 0, 0, size, size);
      const data = ctx.getImageData(0, 0, size, size).data;
      let r = 0, g = 0, b = 0, n = 0;
      for (let i = 0; i < data.length; i += 4) {
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
        n++;
      }
      r = Math.round(r / n); g = Math.round(g / n); b = Math.round(b / n);
      const luma = 0.299 * r + 0.587 * g + 0.114 * b;
      return {
        rgb: "rgb(" + r + "," + g + "," + b + ")",
        dark: "rgb(" + Math.round(r * 0.55) + "," + Math.round(g * 0.55) + "," + Math.round(b * 0.55) + ")",
        light: "rgb(" + Math.min(255, Math.round(r + (255 - r) * 0.7)) + "," + Math.min(255, Math.round(g + (255 - g) * 0.7)) + "," + Math.min(255, Math.round(b + (255 - b) * 0.7)) + ")",
        onDark: luma < 140 ? "#FFFFFF" : "#1F2937",
      };
    },

    downloadBlob(blob, filename) {
      const a = document.createElement("a");
      const url = URL.createObjectURL(blob);
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 400);
    },

    canvasToBlob(canvas, type) {
      return new Promise((resolve) => canvas.toBlob(resolve, type || "image/png", 1));
    },

    // 解锁状态
    isPro() {
      try { return localStorage.getItem(STORAGE_KEY) === "1"; } catch (e) { return false; }
    },
    setPro(v) {
      try { localStorage.setItem(STORAGE_KEY, v ? "1" : "0"); } catch (e) {}
    },
  };

  // 注册 PWA Service Worker（支持时才注册）
  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").catch(() => {});
    });
  }
})();
