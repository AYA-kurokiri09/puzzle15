//写経元コード様: http://note.affi-sapo-sv.com/js-15puzzle-step1.php
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
		this.getContent = () => context;

		let beforeIndex = zindex;

		//無名のアロー関数、関数名indexのカッコ省略
		this.setIndex = index => {
			beforeIndex = canvas.style.zIndex;
			canvas.style.zIndex = index;
		};

		this.resetIndex = () => canvas.style.zIndex = beforeIndex;
	};

})();