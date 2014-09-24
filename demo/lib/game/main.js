ig.module( 
	'game.main' 
)
.requires(
    'impact.game',
	'impact.font',
    'impact.debug.debug',

    'game.levels.main',
    'plugins.tile-shader'
)
.defines(function(){

MyGame = ig.Game.extend({
	
	// Load a font
	font: new ig.Font( 'media/04b03.font.png' ),
    tileShader:null,
    instructions:false,
    currentTileSet:1,
    forceDraw: true,
    torch1: null,
	
	
	init: function() {
		this.tileSet1 = new ig.Image('media/lighttiles1.png');
        this.tileSet2 = new ig.Image('media/lighttiles2.png');
        this.tileSet3 = new ig.Image('media/lighttiles3.png');
        this.loadLevel( LevelMain );
        
        this.tileShader = new TileShader(this.tileSet1);
        this.ambient = 8;
        this.tileShader.ambientLight = this.ambient;
        this.tileShader.losShade = true;
        
        var torches = ig.game.getEntitiesByType(EntityTorch);
        for (var i = 0; i < torches.length; i++) {
            if (i === 0) {
                this.torch1 = torches[i];
                torches[i].lightOptions.outerRadius = 5;
                torches[i].lightOptions.innerRadius = 0;
            }
            this.tileShader.addEntity(torches[i]);
        }
        
        ig.input.initMouse();
        
        ig.input.bind( ig.KEY.L, 'los' );
        ig.input.bind( ig.KEY.A, 'ambient' );
        ig.input.bind( ig.KEY.I, 'inner' );
        ig.input.bind( ig.KEY.O, 'outer' );
        ig.input.bind( ig.KEY.T, 'tileset' );
        ig.input.bind( ig.KEY.F, 'fill' );
        ig.input.bind( ig.KEY.S, 'shade' );
        ig.input.bind( ig.KEY.N, 'ishade' );
        ig.input.bind( ig.KEY.H, 'instructions' );
        
        this.kpTimer = new ig.Timer(0.25);
        this.wasDrawn = false;
	},
	
	update: function() {

        if (this.kpTimer.delta() > 0)
        {
            // weird, sometimes, the shader doesn't initialize right away. so we make sure to force a draw after 0.25s
            if (this.wasDrawn === false) {
                this.wasDrawn = true;
                this.tileShader.forceDrawNextFrame = true;
            }
            
            if( ig.input.state('los') ) {

                this.tileShader.losShade = !this.tileShader.losShade;
                this.forceDraw=true;
                this.kpTimer.reset();
            }

            if( ig.input.state('fill') ) {

                this.tileShader.fillCircle = !this.tileShader.fillCircle;
                this.forceDraw=true;
                this.kpTimer.reset();
            }

            if( ig.input.state('instructions') ) {

                this.instructions = !this.instructions;
                this.kpTimer.reset();
            }

            if( ig.input.state('inner') ) {

                this.torch1.lightOptions.innerRadius++;
                if (this.torch1.lightOptions.innerRadius > this.torch1.lightOptions.outerRadius) this.torch1.lightOptions.innerRadius = 0;
                this.forceDraw=true;
                this.kpTimer.reset();
            }

            if( ig.input.state('shade') ) {

                this.tileShader.shadeCircle = !this.tileShader.shadeCircle;
                this.forceDraw=true;
                this.kpTimer.reset();
            }

            if( ig.input.state('outer') ) {

                this.torch1.lightOptions.outerRadius++;
                if (this.torch1.lightOptions.outerRadius > 10) this.torch1.lightOptions.outerRadius = 0;
                this.forceDraw=true;
                this.kpTimer.reset();
            }

            if( ig.input.state('ishade') ) {

                this.tileShader.innerShade++;
                if (this.tileShader.innerShade > 10) this.tileShader.innerShade = 0;
                this.forceDraw=true;
                this.kpTimer.reset();
            }

            if( ig.input.state('tileset') ) {

                this.currentTileSet++;
                if (this.currentTileSet > 3) this.currentTileSet = 1;
                if (this.currentTileSet === 1) this.tileShader.lightMap.setTileset(this.tileSet1);
                if (this.currentTileSet === 2) this.tileShader.lightMap.setTileset(this.tileSet2);
                if (this.currentTileSet === 3) this.tileShader.lightMap.setTileset(this.tileSet3);
                this.forceDraw=true;
                this.kpTimer.reset();
            }

            if( ig.input.state('ambient') ) {

                this.ambient++;
                if (this.ambient > 10) this.ambient=0;

                this.tileShader.ambientLight=this.ambient;
                this.forceDraw=true;
                this.kpTimer.reset();
            }

        }
        
		this.parent();
		
		// Add your own, additional update code here
	},
	
	draw: function() {
		// Draw all entities and backgroundMaps
		this.parent();
        this.tileShader.draw(this.forceDraw);
		if (this.instructions)
        {
            this.font.draw( 'L:Line Of Sight('+ this.tileShader.losShade.toString()+ '), A:Ambient('+ this.ambient.toString()+')', 2, 2 );
            this.font.draw( 'O:Outer Radius('+ this.torch1.lightOptions.outerRadius.toString()+ '), I:Inner Radius('+ this.torch1.lightOptions.innerRadius.toString()+')', 2, 12 );
            this.font.draw( 'T:Tileset('+this.currentTileSet+'), S:Shade('+ this.tileShader.shadeCircle.toString()+'), F:Fill('+ this.tileShader.fillCircle.toString()+'), N:Inner Shade('+ this.tileShader.innerShade.toString()+')', 2, 24 );
            this.font.draw( 'H:Toggle Help', 2, 36 );
        }
        this.forceDraw = false;
	}
});


// Start the Game with 60fps, a resolution of 320x240, scaled
// up by a factor of 2
ig.main( '#canvas', MyGame, 60, 240, 160, 3 );

});
