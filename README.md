# 十二番目の鐘が鳴る前に

> 壁が内と外を忘れ、出来事が途中を失い、人が二人に増える世界。  
> 誰も異常だと思わない。あなただけが、その綻びを道に変えられる。

2Dドット絵・探索パズルの Web MVP。GitHub Pages で公開できます。

## プレイ

- **移動**: 矢印キー / WASD
- **調べる**: E
- **道具を使う**: スペース（白墨で印、小石で試す）
- **手帳**: J

## ローカル実行

```bash
# Python 3
python -m http.server 8080

# Node.js (npx)
npx serve .
```

ブラウザで http://localhost:8080 を開く。

## GitHub Pages デプロイ

1. リポジトリを GitHub に push
2. **Settings → Pages → Source**: `Deploy from a branch`
3. **Branch**: `main` / `/ (root)`
4. 数分後 `https://<username>.github.io/BrokenWorld/` で公開

`index.html` がルートにあるため追加設定は不要です。

## MVP 内容（45〜60分想定）

| 法則 | 体験 |
|------|------|
| 荷車による壁抜け | 序章の偶然 → 倉庫で再現 |
| 閉じる扉による押し出し | 水車扉で一般化 |
| 終了イベントの先行発火 | 結婚式が「飛んだ」広場 |
| 鐘の瞬間の物品複製 | 鐘楼の籠 |
| 片面壁 | 鐘楼裏 |
| 遅れて起きる足音 | 歩行時の反響 |

## 構成

```
index.html          # エントリ
css/style.css       # UI・ピクセルスケーリング
js/
  main.js           # 起動
  game.js           # ゲームループ・物語進行
  world.js          # マップ・プレイヤー
  maps/village.js   # 鐘の村
  laws/index.js     # 綻び法則
  journal.js        # 手帳
  sprites.js        # ドット絵データ
  renderer.js       # Canvas描画
```

## ライセンス

企画・コードは開発用プロトタイプです。
