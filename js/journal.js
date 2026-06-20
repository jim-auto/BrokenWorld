export class Journal {
  constructor(listEl) {
    this.listEl = listEl;
    this.observations = [];
    this.laws = new Set();
  }

  addObservation(text) {
    if (this.observations.includes(text)) return false;
    this.observations.push(text);
    this.render();
    return true;
  }

  discoverLaw(id, text) {
    if (this.laws.has(id)) return false;
    this.laws.add(id);
    this.addObservation(text);
    this.render();
    return true;
  }

  hasLaw(id) {
    return this.laws.has(id);
  }

  render() {
    this.listEl.innerHTML = '';
    for (const obs of this.observations) {
      const li = document.createElement('li');
      const isLaw = [...this.laws].some((id) => LAW_TEXTS[id] === obs);
      if (isLaw) li.classList.add('law');
      li.textContent = obs;
      this.listEl.appendChild(li);
    }
    if (this.observations.length === 0) {
      const li = document.createElement('li');
      li.textContent = '（まだ何も記録されていない）';
      this.listEl.appendChild(li);
    }
  }
}

export const LAW_TEXTS = {
  moving_push: '木が進もうとするとき、石はどちら側かを忘れる。',
  closing_door: '閉じる扉は、押される者を向こう側へ送る。',
  event_skip: '終わりの鐘のあとに来れば、始まりは飛ばされる。',
  bell_duplicate: '鐘が鳴る瞬間、籠の中身は二つ残る。',
  one_sided: '一方からだけ固い壁は、風と音だけ先に届く。',
  delayed_echo: '足音は、歩いたあと少し遅れてもう一度響く。',
  early_end_bell: '終わりの鐘を先に鳴らせば、式はすでに終わったことになる。',
  role_transfer: '名札は人より先に、門と役割を通す。',
  crowd_push: '人波の縫い目では、柵が内外を忘れる。',
};

export const LAW_OBSERVATIONS = {
  moving_push_dust: '荷車が動いている間、粉が壁の向こうへ流れた',
  moving_push_cart: '動く荷車に押されると、石壁の向こうへ出た',
  closing_door: '閉じる扉に押されながら壁へ触れると、向こう側へ出た',
  event_skip: '広場へ入ると、式はすでに終わっていた',
  bell_duplicate: '鐘の前後で籠の中身が違った',
  one_sided_smoke: '煙だけが壁を通過している',
  delayed_echo: '足音が遅れてもう一度床を鳴らした',
  early_end_bell: '終わりの鐘を先に鳴らすと、戴冠式は終了後の配置になった',
  role_transfer: '名札を付けた箱が、衛兵の検問を通過した',
  crowd_push: '祭列に押されながら門へ触れると、向こう側へ出た',
};
