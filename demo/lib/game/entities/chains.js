ig.module( 
	'game.entities.chains'
)
.requires(
	'impact.entity'
)
.defines(function() {
    
    EntityChains = ig.Entity.extend({
        
        size: {x:16, y:20},
        animSheet: new ig.AnimationSheet('media/chains.png', 16, 20),
        
        init: function(x, y, settings) {
            this.parent(x, y, settings);
            this.addAnim('idle', 1, [0]);
            this.currentAnim.flip.x = (Math.random() > 0.5);
        },
             
        update: function() {
            this.parent();
        },
                
        /*draw: function() {
            this.parent();
        },*/
        
    });
});