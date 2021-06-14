//写経元コード様: http://note.affi-sapo-sv.com/js-15puzzle-step1.php
//MDN Canvas API: https://developer.mozilla.org/ja/docs/Web/API/Canvas_API
//CanvasRenderingContext2D https://developer.mozilla.org/ja/docs/Web/API/CanvasRenderingContext2D
//即時関数の中に書いたのは、グローバルを汚さないため。
//インポート・エクスポートを使ったファイル分割は後で実装する。
//参考: https://qiita.com/koeri3/items/314ac7b9b73fc8c80a2d, https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Statements/import

//最下層: 背景レイヤ
//中層: ピースレイヤ
//最上層: アニメレイヤ

//Canvasのキャンバスサイズと表示サイズの違いについて: http://note.affi-sapo-sv.com/js-canvas-size.php

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
		* キャンバスにスタイルをセット
		* @param styleObj 例：{ widt: "100px" , height : "100px" }
		*/
		//TODO: styleObjのwidthを取得できるようにする
		setStyle(styleObj) {
			const canvas = this.getCanvas;
			Object.keys(styleObj).forEach(e => canvas.style[e] = styleObj[e]);
		},

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
			context.storkeText(textString, x, y);//ふちどり
			context.fillText(textString, x, y);//塗りつぶし
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

	};

	/**
	 * キャンバスを作成して配置
	 * @param divId キャンバスを作成するdiv要素のID
	 * @returns {[canvas, canvas]} [背景, パズル]のキャンバス配列
	 */
	const makeSlidePuzzle =function (divId) {

		//div要素取得
		//DOM操作: https://developer.mozilla.org/ja/docs/Learn/JavaScript/Client-side_web_APIs/Manipulating_documents
		const parentDiv = document.getElementById(divId);
		if (parentDiv == null) throw new Error("id:" + divId + "が見つかりません");

		//キャンバスの表示サイズ
		const viewSize = Math.min(parentDiv.clientWidth, parentDiv.clientHeight);

		//キャンバスのスタイル設定
		const style = {
			width: viewSize + "px", height: viewSize + "px",
			top: ((parentDiv.clientHeight - viewSize) / 2).toString() + "px",
			left : ((parentDiv.clientWidth - viewSize) / 2).toString() + "px"
		};

		//キャンバスを3枚作成
		//Array.prototype.map()で与えられた関数を配列のすべての要素に対して呼び出し、その結果からなる新しい配列を生成する
		return [1,2,3].map(zindex => {
			const cv = document.createElement("canvas");
			const layer = new layerCtrl(cv, zindex);
			layer.setSize(puzzleScreenInfo.size, puzzleScreenInfo.size);//setsize(w,h)
			layer.setStyle(style);

			parentDiv.appendChild(cv);//parentDivの子要素キャンバスを生成
			return layer;
		});
	};

	 /**
     * 背景描画用オブジェクト
     * @param layer
	 */
	const backGroundDrawFunc = function (layer) {
		this.getLayer() = () => layer;

		this.frame = null;// 外周 [ 始点x , 始点y , 幅 , 高さ ]
		this.innerFrame = null;// 内周( パズルエリア )

		this.frameColor = "burlywood"; // 外周色
        this.frameLineColor = "dimgray"; // 外周の線色
        this.bottomPlateColor ="tan"; // 底板の色
	};
	backGroundDrawFunc.prototype = {
		/**
         * 背景描画に必要な座標を計算
         */
		init() {
			const {size, frameSize} = {...puzzleScreenInfo};
			this.frame = [0, 0, size, size];
			this.innerFrame = [frameSize, frameSize, size-frameSize*2, size-frameSize*2];
			return this;
		},

		/**
         * init()で計算した情報をもとに背景を描画
         * @param context
		*/
		draw() {
			this.getLayer().clearRect(this.frame)
				.rect(this.frame, this.frameColor, null)
				.rect(this.innerFrame, this.bottomPlateColor, this.frameLineColor);
		}

	};

	/**
	 * DOMの構築が終わり、DOMContentLoadedイベントが発生したタイミングでキャンバス描画処理を行う
	 */
	window.addEventListener("DOMContentLoaded", () => {
		const [backGroundLayer, puzzleLayer, animeLayer] = makeSlidePuzzle("slidepuzzle");
		new backGroundDrawFunc(backGroundLayer).init().draw();
	});

})();