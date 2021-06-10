//写経元コード様: http://note.affi-sapo-sv.com/js-15puzzle-step1.php
//MDN Canvas API: https://developer.mozilla.org/ja/docs/Web/API/Canvas_API
//CanvasRenderingContext2D https://developer.mozilla.org/ja/docs/Web/API/CanvasRenderingContext2D
//即時関数の中に書いたのは、グローバルを汚さないため。
//インポート・エクスポートを使ったファイル分割は後で実装する。
//参考: https://qiita.com/koeri3/items/314ac7b9b73fc8c80a2d, https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Statements/import

//最下層: 背景レイヤ
//中層: ピースレイヤ
//最上層: アニメレイヤ

( () => {

	//レイヤのサイズ設定 (オブジェクト)
	const puzzleScreenInfo = {
		size: 500, //キャンバスのサイズ
		frameSize: 20, //ゲーム盤外枠の幅
		pieceNum: 4, //横方向のピースの数
		animeTime: 200, //アニメーションの時間
	}

	/**
     * レイヤー（キャンバス）操作ヘルパーオブジェクト
     * @param canvas
     * @param zindex
     */
	//レイヤ操作ヘルパーオブジェクト
	//アロー関数 let getTriangle = (base, height) => {return base * height / 2};
	//参考: 通常の関数 let getTriangle = function(base, height) => {return base * height / 2};
	//参考: https://qiita.com/may88seiji/items/4a49c7c78b55d75d693b
	const layerCtrl = function(canvas, zindex){
		const context = canvas.getContext("2d");//canvasオブジェクトが返される。参考: https://qiita.com/manten120/items/86c087b937708697acec
		this.getCanvas = () => canvas;
		this.getContext = () => context;

		let beforeIndex = zindex;

		//無名のアロー関数、関数名indexのカッコ省略
		this.setIndex = index => {
			beforeIndex = canvas.style.zIndex;
			canvas.style.zIndex = index;
		};

		this.resetIndex = () => canvas.style.zIndex = beforeIndex;
	};

	//プロトタイプによるメモリ節約
	//参考: https://www.sejuku.net/blog/47722
	
	layerCtrl.prototype = {
		/**
		 * キャンバスサイズをセット
		 * @param w
		 * @param h
		 */
		//オブジェクト内部での短縮メソッド定義: https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Functions/Method_definitions
		setSize(w,h) {
			const canvas = this.getCanvas();
			canvas.setAttribute("width", w);
			canvas.setAttribute("height", h);
		},

		/**
		 * 四角形の描画
		 * @param rect [左座標, 上座標, 幅, 高さ]
		 * @param fillColor 塗りつぶし色 null ... 塗りつぶしなし
		 * @param strokeColor 線色 null ...線なし
		 */
		rect(rect, fillColor, strokeColor = null) {
			const context = this.getContext();
			context.save();
			if (fillColor !== null) {
				context.fillStyle = fillColor;
				context.fillRect(...rect);//[左座標, 上座標, 幅, 高さ]を配列扱いで代入
			}
			if(strokeColor !== null) {
				context.strokeColor = strokeColor;
				context.strokeRect(...rect);
			}
			context.restore();
			return this;
		},

		/**
		 * テキストの描画
		 * @param style テキスト属性のオブジェクト
		 * @param textString 描画する文字列
		 * @param x 描画位置
		 * @param y 描画位置
		 */
		//Object.keys()参考: https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
		//.foreach(アロー関数)参考: https://www.javadrive.jp/javascript/array/index10.html
		text(style, textString, x, y) {
			const context = this.getContext();
			context.save();
			//eはelementのe https://www.javadrive.jp/javascript/array/index10.html
			Object.keys(style).forEach(e => context[e] = style[e]);
			context.storkeText(textString, x, y);
			context.fillText(textString, x, y);
			context.restore();
			return this;
		},

		/**
         * イメージデータの取得
         * @param rect
         * @returns {ImageData}
         */
		getImageData(rect) {
			return this.getContext().getImageData(...rect);
		},

		/**
         * イメージの描画
         * @param image
         * @param x
         * @param y
         * @returns {layerCtrl}
         */
		putImageData(image, x, y) {
			this.getContext().putImageData(image, x, y);
			return this;
		},

		/**
         * キャンバス全面クリア
         */
		clear() {
			const cvs = this.getContext().clearRect(...rect);
			this.getContext().clearRect(0, 0, cvs.width, cvs.height);
		},

		 /**
         * キャンバスクリア
         * @param rect [ 左座標 , 上座標 , 幅 , 高さ ]
         * @returns {layerCtrl}
         */
		clearRect(rect) {
			this.getContext.clearRect(...rect);
			return this;
		},

		/**
         * キャンバスのサイズと表示サイズの比率
         * @returns {number}
         */
		getScale() {
			const canvas = this.getCanvas();
			return canvas.clientWidth / canvas.width;
		}

	}
})();